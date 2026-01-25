/**
 * Skills API Service
 * Handles all API calls for Skills CRUD operations and execution
 */

import type {
  Skill,
  SkillWithRelations,
  CreateSkillRequest,
  UpdateSkillRequest,
  ExecuteSkillRequest,
  ExecuteSkillResponse,
  PaginatedSkillsResponse,
  SkillStats,
  SkillsApiError,
  SkillCategory,
  SkillOutputFormat,
  ExecutionStatus,
  SkillExecution,
} from '../types/skills';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = '/api';
const MOCK_DELAY_MS = 500;

// Helper to simulate API delay
const delay = (ms: number = MOCK_DELAY_MS) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to generate UUIDs
const generateId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// =============================================================================
// Mock Data Store (for development)
// =============================================================================

const mockSkills: Map<string, Skill> = new Map();

// Initialize with sample data
function initializeMockData() {
  const sampleSkills: Skill[] = [
    {
      id: 'skill-001',
      userId: 'user-001',
      name: 'Code Review Assistant',
      description: 'Analyzes code for potential issues, best practices, and improvements',
      category: 'analysis',
      promptTemplate: `You are a code review assistant. Analyze the following code and provide feedback on:
1. Code quality and best practices
2. Potential bugs or issues
3. Performance considerations
4. Suggested improvements

Code to review:
{{code}}

Language: {{language}}`,
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.7, max_tokens: 4096 },
      inputSchema: [
        { name: 'code', type: 'string', description: 'The code to review', required: true },
        { name: 'language', type: 'string', description: 'Programming language', required: false, default: 'auto-detect' },
      ],
      outputFormat: 'markdown',
      isActive: true,
      executionCount: 42,
      lastExecutedAt: new Date('2026-01-24'),
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-24'),
    },
    {
      id: 'skill-002',
      userId: 'user-001',
      name: 'Documentation Generator',
      description: 'Generates comprehensive documentation for code modules',
      category: 'generation',
      promptTemplate: `Generate comprehensive documentation for the following code module.
Include:
- Overview and purpose
- Function/method documentation
- Usage examples
- Parameter descriptions

Code:
{{code}}`,
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.5, max_tokens: 8192 },
      inputSchema: [
        { name: 'code', type: 'string', description: 'The code to document', required: true },
      ],
      outputFormat: 'markdown',
      isActive: true,
      executionCount: 15,
      lastExecutedAt: new Date('2026-01-23'),
      createdAt: new Date('2026-01-12'),
      updatedAt: new Date('2026-01-23'),
    },
    {
      id: 'skill-003',
      userId: 'user-001',
      name: 'SQL Query Builder',
      description: 'Converts natural language to SQL queries',
      category: 'transformation',
      promptTemplate: `Convert the following natural language request into a SQL query.
Database schema:
{{schema}}

Request: {{request}}

Return only the SQL query without explanation.`,
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.2, max_tokens: 2048 },
      inputSchema: [
        { name: 'schema', type: 'string', description: 'Database schema description', required: true },
        { name: 'request', type: 'string', description: 'Natural language query request', required: true },
      ],
      outputFormat: 'code',
      isActive: true,
      executionCount: 28,
      lastExecutedAt: new Date('2026-01-24'),
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-24'),
    },
    {
      id: 'skill-004',
      userId: 'user-001',
      name: 'Daily Standup Summary',
      description: 'Generates a summary of recent commits and activity',
      category: 'communication',
      promptTemplate: `Generate a daily standup summary based on the following activity:

Recent commits:
{{commits}}

Open PRs:
{{pull_requests}}

Create a brief summary suitable for a standup meeting.`,
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.7, max_tokens: 1024 },
      inputSchema: [
        { name: 'commits', type: 'string', description: 'Recent commit messages', required: true },
        { name: 'pull_requests', type: 'string', description: 'Open pull request titles', required: false },
      ],
      outputFormat: 'text',
      isActive: false,
      executionCount: 5,
      lastExecutedAt: new Date('2026-01-20'),
      createdAt: new Date('2026-01-18'),
      updatedAt: new Date('2026-01-20'),
    },
  ];

  sampleSkills.forEach(skill => mockSkills.set(skill.id, skill));
}

initializeMockData();

// =============================================================================
// Helper Functions
// =============================================================================

function createApiError(code: string, message: string, field?: string): SkillsApiError {
  return { code, message, field };
}

export function isSkillsApiError(error: unknown): error is SkillsApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// =============================================================================
// Skills CRUD Operations
// =============================================================================

/**
 * GET /api/skills - List all skills with optional filtering
 */
export async function listSkills(options?: {
  category?: SkillCategory;
  isActive?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
}): Promise<PaginatedSkillsResponse> {
  await delay();

  let skills = Array.from(mockSkills.values());

  // Apply filters
  if (options?.category) {
    skills = skills.filter(s => s.category === options.category);
  }
  if (options?.isActive !== undefined) {
    skills = skills.filter(s => s.isActive === options.isActive);
  }
  if (options?.search) {
    const search = options.search.toLowerCase();
    skills = skills.filter(
      s =>
        s.name.toLowerCase().includes(search) ||
        s.description?.toLowerCase().includes(search)
    );
  }

  // Sort by most recently updated
  skills.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

  // Pagination
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const total = skills.length;
  const start = (page - 1) * pageSize;
  const paginatedSkills = skills.slice(start, start + pageSize);

  return {
    skills: paginatedSkills,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

/**
 * GET /api/skills/:id - Get skill details
 */
export async function getSkill(skillId: string): Promise<Skill> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  return skill;
}

/**
 * GET /api/skills/:id/full - Get skill with all relations
 */
export async function getSkillWithRelations(skillId: string): Promise<SkillWithRelations> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  // In a real implementation, this would fetch related habits, reflexes, and executions
  return {
    ...skill,
    habits: [],
    reflexes: [],
    recentExecutions: [],
  };
}

/**
 * POST /api/skills - Create a new skill
 */
export async function createSkill(request: CreateSkillRequest): Promise<Skill> {
  await delay();

  // Validate name uniqueness
  const existingSkill = Array.from(mockSkills.values()).find(
    s => s.name.toLowerCase() === request.name.toLowerCase()
  );
  if (existingSkill) {
    throw createApiError('SKILL_NAME_EXISTS', `A skill with name "${request.name}" already exists`, 'name');
  }

  const now = new Date();
  const skill: Skill = {
    id: generateId(),
    userId: 'current-user', // Would come from auth context
    name: request.name,
    description: request.description,
    category: request.category || 'custom',
    promptTemplate: request.promptTemplate,
    model: request.model || 'claude-3-5-sonnet-20241022',
    parameters: request.parameters || { temperature: 1, max_tokens: 4096 },
    inputSchema: request.inputSchema,
    outputFormat: request.outputFormat || 'markdown',
    isActive: request.isActive ?? true,
    executionCount: 0,
    createdAt: now,
    updatedAt: now,
  };

  mockSkills.set(skill.id, skill);
  return skill;
}

/**
 * PUT /api/skills/:id - Update an existing skill
 */
export async function updateSkill(skillId: string, updates: UpdateSkillRequest): Promise<Skill> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  // Validate name uniqueness if name is being changed
  if (updates.name && updates.name.toLowerCase() !== skill.name.toLowerCase()) {
    const existingSkill = Array.from(mockSkills.values()).find(
      s => s.name.toLowerCase() === updates.name!.toLowerCase() && s.id !== skillId
    );
    if (existingSkill) {
      throw createApiError('SKILL_NAME_EXISTS', `A skill with name "${updates.name}" already exists`, 'name');
    }
  }

  const updatedSkill: Skill = {
    ...skill,
    ...updates,
    updatedAt: new Date(),
  };

  mockSkills.set(skillId, updatedSkill);
  return updatedSkill;
}

/**
 * DELETE /api/skills/:id - Delete a skill
 */
export async function deleteSkill(skillId: string): Promise<{ success: boolean }> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  mockSkills.delete(skillId);
  return { success: true };
}

/**
 * POST /api/skills/:id/duplicate - Duplicate a skill
 */
export async function duplicateSkill(skillId: string, newName?: string): Promise<Skill> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  const name = newName || `${skill.name} (Copy)`;

  // Check name uniqueness
  const existingSkill = Array.from(mockSkills.values()).find(
    s => s.name.toLowerCase() === name.toLowerCase()
  );
  if (existingSkill) {
    throw createApiError('SKILL_NAME_EXISTS', `A skill with name "${name}" already exists`, 'name');
  }

  const now = new Date();
  const duplicatedSkill: Skill = {
    ...skill,
    id: generateId(),
    name,
    executionCount: 0,
    lastExecutedAt: undefined,
    createdAt: now,
    updatedAt: now,
  };

  mockSkills.set(duplicatedSkill.id, duplicatedSkill);
  return duplicatedSkill;
}

// =============================================================================
// Skill Execution
// =============================================================================

/**
 * POST /api/skills/:id/execute - Execute a skill
 */
export async function executeSkill(request: ExecuteSkillRequest): Promise<ExecuteSkillResponse> {
  await delay(1500); // Longer delay to simulate AI processing

  const skill = mockSkills.get(request.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${request.skillId} not found`);
  }

  if (!skill.isActive) {
    throw createApiError('SKILL_INACTIVE', 'Cannot execute an inactive skill');
  }

  // Simulate execution
  const executionId = generateId();
  const startTime = Date.now();

  // Mock output based on skill
  const mockOutput = `## Analysis Results

This is a mock execution output for the skill "${skill.name}".

### Input Received
\`\`\`json
${JSON.stringify(request.input || {}, null, 2)}
\`\`\`

### Summary
The skill has been executed successfully with the provided input.

*Generated at: ${new Date().toISOString()}*`;

  const durationMs = Date.now() - startTime + 800; // Add mock processing time
  const tokensUsed = Math.floor(mockOutput.length * 0.25) + Math.floor(Math.random() * 500);

  // Update skill stats
  skill.executionCount += 1;
  skill.lastExecutedAt = new Date();
  skill.updatedAt = new Date();
  mockSkills.set(skill.id, skill);

  return {
    executionId,
    status: 'completed',
    output: mockOutput,
    tokensUsed,
    durationMs,
  };
}

/**
 * POST /api/skills/:id/test - Test a skill without saving execution
 */
export async function testSkill(
  skillId: string,
  input?: Record<string, unknown>
): Promise<ExecuteSkillResponse> {
  await delay(1000);

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  // Simulate test execution (doesn't count towards stats)
  const testOutput = `## Test Execution

**Skill:** ${skill.name}
**Model:** ${skill.model}
**Output Format:** ${skill.outputFormat}

### Prompt Preview
\`\`\`
${skill.promptTemplate.substring(0, 200)}...
\`\`\`

### Input Variables
\`\`\`json
${JSON.stringify(input || {}, null, 2)}
\`\`\`

### Status
✅ Test completed successfully. The skill is properly configured.`;

  return {
    executionId: `test-${generateId()}`,
    status: 'completed',
    output: testOutput,
    tokensUsed: 150,
    durationMs: 500,
  };
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * GET /api/skills/stats - Get skill usage statistics
 */
export async function getSkillStats(): Promise<SkillStats> {
  await delay();

  const skills = Array.from(mockSkills.values());
  const totalExecutions = skills.reduce((sum, s) => sum + s.executionCount, 0);

  // Mock execution stats
  const executionsByStatus: Record<ExecutionStatus, number> = {
    pending: 2,
    running: 1,
    completed: totalExecutions - 8,
    failed: 4,
    cancelled: 1,
  };

  const executionsByType = {
    manual: Math.floor(totalExecutions * 0.6),
    habit: Math.floor(totalExecutions * 0.25),
    reflex: Math.floor(totalExecutions * 0.1),
    api: Math.floor(totalExecutions * 0.05),
  };

  const topSkillsByUsage = skills
    .sort((a, b) => b.executionCount - a.executionCount)
    .slice(0, 5)
    .map(s => ({
      skillId: s.id,
      name: s.name,
      count: s.executionCount,
    }));

  return {
    totalSkills: skills.length,
    activeSkills: skills.filter(s => s.isActive).length,
    totalExecutions,
    totalTokensUsed: totalExecutions * 850, // Mock average tokens per execution
    totalCostCents: Math.floor(totalExecutions * 2.5), // Mock cost
    executionsByStatus,
    executionsByType,
    topSkillsByUsage,
  };
}

/**
 * GET /api/skills/:id/executions - Get execution history for a skill
 */
export async function getSkillExecutions(
  skillId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ executions: SkillExecution[]; total: number }> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  // Generate mock execution history
  const total = skill.executionCount;
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  const executions: SkillExecution[] = [];
  const executionCount = Math.min(limit, total - offset);

  for (let i = 0; i < executionCount; i++) {
    const isCompleted = Math.random() > 0.1;
    const executedAt = new Date(Date.now() - (offset + i) * 3600000); // 1 hour apart

    executions.push({
      id: `exec-${skillId}-${offset + i}`,
      skillId,
      userId: 'user-001',
      executionType: ['manual', 'habit', 'reflex', 'api'][Math.floor(Math.random() * 4)] as SkillExecution['executionType'],
      input: { sample: 'input' },
      output: isCompleted ? 'Sample output...' : undefined,
      tokensUsed: isCompleted ? Math.floor(Math.random() * 2000) + 500 : undefined,
      promptTokens: isCompleted ? Math.floor(Math.random() * 500) + 100 : undefined,
      completionTokens: isCompleted ? Math.floor(Math.random() * 1500) + 400 : undefined,
      durationMs: isCompleted ? Math.floor(Math.random() * 3000) + 500 : undefined,
      costCents: isCompleted ? Math.floor(Math.random() * 10) + 1 : undefined,
      status: isCompleted ? 'completed' : 'failed',
      errorMessage: isCompleted ? undefined : 'Mock error for demonstration',
      executedAt,
      completedAt: isCompleted ? new Date(executedAt.getTime() + 2000) : undefined,
    });
  }

  return { executions, total };
}

// =============================================================================
// Bulk Operations
// =============================================================================

/**
 * POST /api/skills/bulk/activate - Activate multiple skills
 */
export async function bulkActivateSkills(skillIds: string[]): Promise<{ success: boolean; count: number }> {
  await delay();

  let count = 0;
  for (const id of skillIds) {
    const skill = mockSkills.get(id);
    if (skill) {
      skill.isActive = true;
      skill.updatedAt = new Date();
      mockSkills.set(id, skill);
      count++;
    }
  }

  return { success: true, count };
}

/**
 * POST /api/skills/bulk/deactivate - Deactivate multiple skills
 */
export async function bulkDeactivateSkills(skillIds: string[]): Promise<{ success: boolean; count: number }> {
  await delay();

  let count = 0;
  for (const id of skillIds) {
    const skill = mockSkills.get(id);
    if (skill) {
      skill.isActive = false;
      skill.updatedAt = new Date();
      mockSkills.set(id, skill);
      count++;
    }
  }

  return { success: true, count };
}

/**
 * DELETE /api/skills/bulk - Delete multiple skills
 */
export async function bulkDeleteSkills(skillIds: string[]): Promise<{ success: boolean; count: number }> {
  await delay();

  let count = 0;
  for (const id of skillIds) {
    if (mockSkills.has(id)) {
      mockSkills.delete(id);
      count++;
    }
  }

  return { success: true, count };
}

// =============================================================================
// Export/Import
// =============================================================================

/**
 * GET /api/skills/:id/export - Export a skill as JSON
 */
export async function exportSkill(skillId: string): Promise<{
  skill: Omit<Skill, 'id' | 'userId' | 'executionCount' | 'lastExecutedAt' | 'createdAt' | 'updatedAt'>;
  version: string;
}> {
  await delay();

  const skill = mockSkills.get(skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${skillId} not found`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id, userId, executionCount, lastExecutedAt, createdAt, updatedAt, ...exportData } = skill;

  return {
    skill: exportData,
    version: '1.0',
  };
}

/**
 * POST /api/skills/import - Import a skill from JSON
 */
export async function importSkill(data: {
  skill: Omit<Skill, 'id' | 'userId' | 'executionCount' | 'lastExecutedAt' | 'createdAt' | 'updatedAt'>;
  version: string;
}): Promise<Skill> {
  await delay();

  // Generate a unique name if needed
  let name = data.skill.name;
  let counter = 1;
  while (Array.from(mockSkills.values()).find(s => s.name.toLowerCase() === name.toLowerCase())) {
    name = `${data.skill.name} (${counter})`;
    counter++;
  }

  const now = new Date();
  const skill: Skill = {
    id: generateId(),
    userId: 'current-user',
    ...data.skill,
    name,
    executionCount: 0,
    lastExecutedAt: undefined,
    createdAt: now,
    updatedAt: now,
  };

  mockSkills.set(skill.id, skill);
  return skill;
}
