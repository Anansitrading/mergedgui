/**
 * Reflexes API Service
 * Handles all API calls for Reflexes (event-triggered skill executions) CRUD operations
 */

import type {
  Reflex,
  ReflexWithSkill,
  CreateReflexRequest,
  UpdateReflexRequest,
  SkillsApiError,
  Skill,
  SkillExecution,
  ReflexTriggerType,
  TriggerConfig,
  WebhookTriggerConfig,
} from '../types/skills';

// =============================================================================
// Configuration
// =============================================================================

const MOCK_DELAY_MS = 500;

// Helper to simulate API delay
const delay = (ms: number = MOCK_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate UUIDs
const generateId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// =============================================================================
// Mock Data Store (for development)
// =============================================================================

const mockReflexes: Map<string, Reflex> = new Map();

// Reference to skills for relation lookups (would come from database in production)
const mockSkillsRef: Map<string, Skill> = new Map();

// Initialize with sample data
function initializeMockData() {
  // Sample skill references
  const sampleSkills: Skill[] = [
    {
      id: 'skill-001',
      userId: 'user-001',
      name: 'Code Review Assistant',
      description: 'Analyzes code for potential issues',
      category: 'analysis',
      promptTemplate: 'Review this code...',
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.7, max_tokens: 4096 },
      outputFormat: 'markdown',
      isActive: true,
      executionCount: 42,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-24'),
    },
    {
      id: 'skill-002',
      userId: 'user-001',
      name: 'Documentation Generator',
      description: 'Generates documentation',
      category: 'generation',
      promptTemplate: 'Generate docs...',
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.5, max_tokens: 8192 },
      outputFormat: 'markdown',
      isActive: true,
      executionCount: 15,
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-23'),
    },
  ];
  sampleSkills.forEach(skill => mockSkillsRef.set(skill.id, skill));

  const sampleReflexes: Reflex[] = [
    {
      id: 'reflex-001',
      skillId: 'skill-001',
      userId: 'user-001',
      triggerType: 'webhook',
      triggerConfig: {
        url: '/api/webhooks/github/pr-opened',
        secret: 'whsec_***',
        method: 'POST',
      } as WebhookTriggerConfig,
      conditions: {
        matchAll: true,
        filters: [
          { field: 'action', operator: 'equals', value: 'opened' },
          { field: 'pull_request.base.ref', operator: 'equals', value: 'main' },
        ],
      },
      isActive: true,
      triggerCount: 23,
      lastTriggeredAt: new Date('2026-01-24T14:30:00'),
      consecutiveFailures: 0,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-24'),
    },
    {
      id: 'reflex-002',
      skillId: 'skill-002',
      userId: 'user-001',
      triggerType: 'file_change',
      triggerConfig: {
        paths: ['src/**/*.ts', 'src/**/*.tsx'],
        events: ['create', 'modify'],
      },
      conditions: {
        expression: 'file.size < 50000',
      },
      isActive: true,
      triggerCount: 8,
      lastTriggeredAt: new Date('2026-01-23T16:45:00'),
      consecutiveFailures: 0,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-23'),
    },
    {
      id: 'reflex-003',
      skillId: 'skill-001',
      userId: 'user-001',
      triggerType: 'event',
      triggerConfig: {
        eventName: 'deployment.completed',
        source: 'vercel',
      },
      conditions: {
        filters: [
          { field: 'environment', operator: 'equals', value: 'production' },
        ],
      },
      isActive: false,
      triggerCount: 2,
      lastTriggeredAt: new Date('2026-01-20T12:00:00'),
      consecutiveFailures: 3,
      lastErrorMessage: 'Rate limit exceeded',
      createdAt: new Date('2026-01-18'),
      updatedAt: new Date('2026-01-20'),
    },
  ];

  sampleReflexes.forEach(reflex => mockReflexes.set(reflex.id, reflex));
}

initializeMockData();

// =============================================================================
// Helper Functions
// =============================================================================

function createApiError(code: string, message: string, field?: string): SkillsApiError {
  return { code, message, field };
}

export function isReflexesApiError(error: unknown): error is SkillsApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// Validate trigger configuration
function validateTriggerConfig(
  triggerType: ReflexTriggerType,
  config: TriggerConfig
): { isValid: boolean; error?: string } {
  switch (triggerType) {
    case 'webhook':
      if (!('url' in config) || !config.url) {
        return { isValid: false, error: 'Webhook URL is required' };
      }
      break;
    case 'email':
      // Email triggers don't require specific config
      break;
    case 'file_change':
      if (!('paths' in config) || !config.paths || config.paths.length === 0) {
        return { isValid: false, error: 'At least one file path pattern is required' };
      }
      break;
    case 'api_call':
      if (!('endpoint' in config) || !config.endpoint) {
        return { isValid: false, error: 'API endpoint is required' };
      }
      break;
    case 'event':
      if (!('eventName' in config) || !config.eventName) {
        return { isValid: false, error: 'Event name is required' };
      }
      break;
    case 'schedule':
      // Schedule triggers are handled by habits, not reflexes
      return { isValid: false, error: 'Use Habits for scheduled triggers' };
  }
  return { isValid: true };
}

// Generate webhook URL for a reflex
function generateWebhookUrl(reflexId: string): string {
  return `https://api.kijko.nl/webhooks/reflex/${reflexId}`;
}

// Generate webhook secret
function generateWebhookSecret(): string {
  return `whsec_${generateId().replace(/-/g, '')}`;
}

// =============================================================================
// Reflexes CRUD Operations
// =============================================================================

/**
 * GET /api/reflexes - List all reflexes with optional filtering
 */
export async function listReflexes(options?: {
  skillId?: string;
  triggerType?: ReflexTriggerType;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{
  reflexes: ReflexWithSkill[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  await delay();

  let reflexes = Array.from(mockReflexes.values());

  // Apply filters
  if (options?.skillId) {
    reflexes = reflexes.filter(r => r.skillId === options.skillId);
  }
  if (options?.triggerType) {
    reflexes = reflexes.filter(r => r.triggerType === options.triggerType);
  }
  if (options?.isActive !== undefined) {
    reflexes = reflexes.filter(r => r.isActive === options.isActive);
  }

  // Sort by last triggered (most recent first)
  reflexes.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (!a.lastTriggeredAt) return 1;
    if (!b.lastTriggeredAt) return -1;
    return b.lastTriggeredAt.getTime() - a.lastTriggeredAt.getTime();
  });

  // Pagination
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const total = reflexes.length;
  const start = (page - 1) * pageSize;
  const paginatedReflexes = reflexes.slice(start, start + pageSize);

  // Attach skill information
  const reflexesWithSkill: ReflexWithSkill[] = paginatedReflexes.map(reflex => ({
    ...reflex,
    skill: mockSkillsRef.get(reflex.skillId) || {
      id: reflex.skillId,
      userId: reflex.userId,
      name: 'Unknown Skill',
      category: 'custom',
      promptTemplate: '',
      model: 'claude-3-5-sonnet-20241022',
      parameters: {},
      outputFormat: 'markdown',
      isActive: false,
      executionCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  }));

  return {
    reflexes: reflexesWithSkill,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

/**
 * GET /api/reflexes/:id - Get reflex details
 */
export async function getReflex(reflexId: string): Promise<Reflex> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  return reflex;
}

/**
 * GET /api/reflexes/:id/full - Get reflex with skill details
 */
export async function getReflexWithSkill(reflexId: string): Promise<ReflexWithSkill> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  const skill = mockSkillsRef.get(reflex.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Associated skill not found`);
  }

  return { ...reflex, skill };
}

/**
 * POST /api/reflexes - Create a new reflex
 */
export async function createReflex(request: CreateReflexRequest): Promise<Reflex & { webhookUrl?: string }> {
  await delay();

  // Validate skill exists
  const skill = mockSkillsRef.get(request.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${request.skillId} not found`, 'skillId');
  }

  // Validate trigger configuration
  const configValidation = validateTriggerConfig(request.triggerType, request.triggerConfig);
  if (!configValidation.isValid) {
    throw createApiError('INVALID_TRIGGER_CONFIG', configValidation.error || 'Invalid trigger configuration', 'triggerConfig');
  }

  const now = new Date();
  const reflexId = generateId();

  // For webhook triggers, generate a URL and secret
  let triggerConfig = request.triggerConfig;
  let webhookUrl: string | undefined;

  if (request.triggerType === 'webhook') {
    webhookUrl = generateWebhookUrl(reflexId);
    triggerConfig = {
      ...triggerConfig,
      url: webhookUrl,
      secret: generateWebhookSecret(),
    } as WebhookTriggerConfig;
  }

  const reflex: Reflex = {
    id: reflexId,
    skillId: request.skillId,
    userId: 'current-user', // Would come from auth context
    triggerType: request.triggerType,
    triggerConfig,
    conditions: request.conditions,
    isActive: request.isActive ?? true,
    triggerCount: 0,
    consecutiveFailures: 0,
    createdAt: now,
    updatedAt: now,
  };

  mockReflexes.set(reflex.id, reflex);
  return { ...reflex, webhookUrl };
}

/**
 * PUT /api/reflexes/:id - Update an existing reflex
 */
export async function updateReflex(reflexId: string, updates: UpdateReflexRequest): Promise<Reflex> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  // Validate trigger configuration if being updated
  if (updates.triggerConfig) {
    const configValidation = validateTriggerConfig(reflex.triggerType, updates.triggerConfig);
    if (!configValidation.isValid) {
      throw createApiError('INVALID_TRIGGER_CONFIG', configValidation.error || 'Invalid trigger configuration', 'triggerConfig');
    }
  }

  const updatedReflex: Reflex = {
    ...reflex,
    ...updates,
    updatedAt: new Date(),
  };

  mockReflexes.set(reflexId, updatedReflex);
  return updatedReflex;
}

/**
 * DELETE /api/reflexes/:id - Delete a reflex
 */
export async function deleteReflex(reflexId: string): Promise<{ success: boolean }> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  mockReflexes.delete(reflexId);
  return { success: true };
}

// =============================================================================
// Reflex Control Operations
// =============================================================================

/**
 * POST /api/reflexes/:id/activate - Activate a reflex
 */
export async function activateReflex(reflexId: string): Promise<Reflex> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  // Check if associated skill is active
  const skill = mockSkillsRef.get(reflex.skillId);
  if (skill && !skill.isActive) {
    throw createApiError('SKILL_INACTIVE', 'Cannot activate reflex: associated skill is inactive');
  }

  const updatedReflex: Reflex = {
    ...reflex,
    isActive: true,
    consecutiveFailures: 0,
    lastErrorMessage: undefined,
    updatedAt: new Date(),
  };

  mockReflexes.set(reflexId, updatedReflex);
  return updatedReflex;
}

/**
 * POST /api/reflexes/:id/deactivate - Deactivate a reflex
 */
export async function deactivateReflex(reflexId: string): Promise<Reflex> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  const updatedReflex: Reflex = {
    ...reflex,
    isActive: false,
    updatedAt: new Date(),
  };

  mockReflexes.set(reflexId, updatedReflex);
  return updatedReflex;
}

/**
 * POST /api/reflexes/:id/test - Test a reflex with sample data
 */
export async function testReflex(
  reflexId: string,
  samplePayload?: Record<string, unknown>
): Promise<{
  success: boolean;
  conditionsMatch: boolean;
  executionResult?: {
    output: string;
    tokensUsed: number;
    durationMs: number;
  };
  error?: string;
}> {
  await delay(1000);

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  const skill = mockSkillsRef.get(reflex.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Associated skill not found`);
  }

  // Simulate condition checking
  const conditionsMatch = Math.random() > 0.2; // 80% match rate for testing

  if (!conditionsMatch) {
    return {
      success: true,
      conditionsMatch: false,
      error: 'Test payload did not match reflex conditions',
    };
  }

  // Simulate execution
  return {
    success: true,
    conditionsMatch: true,
    executionResult: {
      output: `Test execution for reflex "${reflex.triggerType}" completed successfully.\n\nPayload received:\n\`\`\`json\n${JSON.stringify(samplePayload || {}, null, 2)}\n\`\`\``,
      tokensUsed: 250,
      durationMs: 800,
    },
  };
}

/**
 * POST /api/reflexes/:id/reset-errors - Reset error state and reactivate
 */
export async function resetReflexErrors(reflexId: string): Promise<Reflex> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  const updatedReflex: Reflex = {
    ...reflex,
    consecutiveFailures: 0,
    lastErrorMessage: undefined,
    isActive: true,
    updatedAt: new Date(),
  };

  mockReflexes.set(reflexId, updatedReflex);
  return updatedReflex;
}

/**
 * POST /api/reflexes/:id/regenerate-secret - Regenerate webhook secret
 */
export async function regenerateWebhookSecret(reflexId: string): Promise<{ secret: string }> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  if (reflex.triggerType !== 'webhook') {
    throw createApiError('NOT_WEBHOOK', 'Can only regenerate secret for webhook triggers');
  }

  const newSecret = generateWebhookSecret();
  const updatedConfig = {
    ...reflex.triggerConfig,
    secret: newSecret,
  } as WebhookTriggerConfig;

  const updatedReflex: Reflex = {
    ...reflex,
    triggerConfig: updatedConfig,
    updatedAt: new Date(),
  };

  mockReflexes.set(reflexId, updatedReflex);
  return { secret: newSecret };
}

// =============================================================================
// Reflex Execution History
// =============================================================================

/**
 * GET /api/reflexes/:id/executions - Get execution history for a reflex
 */
export async function getReflexExecutions(
  reflexId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ executions: SkillExecution[]; total: number }> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  // Generate mock execution history based on trigger count
  const total = reflex.triggerCount;
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  const executions: SkillExecution[] = [];
  const executionCount = Math.min(limit, total - offset);

  for (let i = 0; i < executionCount; i++) {
    const isCompleted = i < total - reflex.consecutiveFailures;
    const executedAt = new Date(Date.now() - (offset + i) * 7200000); // 2 hours apart

    executions.push({
      id: `exec-reflex-${reflexId}-${offset + i}`,
      skillId: reflex.skillId,
      userId: reflex.userId,
      executionType: 'reflex',
      referenceId: reflexId,
      input: { trigger: reflex.triggerType, payload: { sample: 'data' } },
      output: isCompleted ? 'Triggered execution completed successfully.' : undefined,
      tokensUsed: isCompleted ? Math.floor(Math.random() * 800) + 150 : undefined,
      durationMs: isCompleted ? Math.floor(Math.random() * 1500) + 200 : undefined,
      status: isCompleted ? 'completed' : 'failed',
      errorMessage: isCompleted ? undefined : reflex.lastErrorMessage || 'Trigger execution failed',
      executedAt,
      completedAt: isCompleted ? new Date(executedAt.getTime() + 1000) : undefined,
    });
  }

  return { executions, total };
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * GET /api/reflexes/stats - Get reflex statistics
 */
export async function getReflexStats(): Promise<{
  totalReflexes: number;
  activeReflexes: number;
  totalTriggers: number;
  failedReflexes: number;
  triggersByType: Record<ReflexTriggerType, number>;
  recentTriggers: { reflexId: string; skillName: string; triggeredAt: Date; triggerType: ReflexTriggerType }[];
}> {
  await delay();

  const reflexes = Array.from(mockReflexes.values());

  const activeReflexes = reflexes.filter(r => r.isActive);
  const failedReflexes = reflexes.filter(r => r.consecutiveFailures > 0);

  // Count by trigger type
  const triggersByType: Record<ReflexTriggerType, number> = {
    webhook: 0,
    email: 0,
    file_change: 0,
    api_call: 0,
    schedule: 0,
    event: 0,
  };
  reflexes.forEach(r => {
    triggersByType[r.triggerType]++;
  });

  // Recent triggers
  const recentTriggers = reflexes
    .filter(r => r.lastTriggeredAt)
    .sort((a, b) => (b.lastTriggeredAt?.getTime() || 0) - (a.lastTriggeredAt?.getTime() || 0))
    .slice(0, 5)
    .map(r => ({
      reflexId: r.id,
      skillName: mockSkillsRef.get(r.skillId)?.name || 'Unknown Skill',
      triggeredAt: r.lastTriggeredAt!,
      triggerType: r.triggerType,
    }));

  return {
    totalReflexes: reflexes.length,
    activeReflexes: activeReflexes.length,
    totalTriggers: reflexes.reduce((sum, r) => sum + r.triggerCount, 0),
    failedReflexes: failedReflexes.length,
    triggersByType,
    recentTriggers,
  };
}

// =============================================================================
// Webhook Utilities
// =============================================================================

/**
 * GET /api/reflexes/:id/webhook-info - Get webhook information for a reflex
 */
export async function getWebhookInfo(reflexId: string): Promise<{
  url: string;
  secret: string;
  method: string;
  samplePayload: Record<string, unknown>;
}> {
  await delay();

  const reflex = mockReflexes.get(reflexId);
  if (!reflex) {
    throw createApiError('REFLEX_NOT_FOUND', `Reflex with ID ${reflexId} not found`);
  }

  if (reflex.triggerType !== 'webhook') {
    throw createApiError('NOT_WEBHOOK', 'This reflex is not a webhook trigger');
  }

  const config = reflex.triggerConfig as WebhookTriggerConfig;

  return {
    url: config.url,
    secret: config.secret || '',
    method: config.method || 'POST',
    samplePayload: {
      event: 'example_event',
      timestamp: new Date().toISOString(),
      data: {
        id: '123',
        action: 'created',
      },
    },
  };
}
