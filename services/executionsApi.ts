/**
 * Executions API Service
 * Handles all API calls for Skill Execution history and logging
 */

import type {
  SkillExecution,
  ExecutionWithSkill,
  ExecutionFilters,
  ExecutionStatus,
  ExecutionType,
  SkillsApiError,
  Skill,
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

const mockExecutions: Map<string, SkillExecution> = new Map();

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
    {
      id: 'skill-003',
      userId: 'user-001',
      name: 'SQL Query Builder',
      description: 'Converts natural language to SQL',
      category: 'transformation',
      promptTemplate: 'Convert to SQL...',
      model: 'claude-3-5-sonnet-20241022',
      parameters: { temperature: 0.2, max_tokens: 2048 },
      outputFormat: 'code',
      isActive: true,
      executionCount: 28,
      createdAt: new Date('2026-01-15'),
      updatedAt: new Date('2026-01-24'),
    },
  ];
  sampleSkills.forEach(skill => mockSkillsRef.set(skill.id, skill));

  // Generate sample executions
  const executionTypes: ExecutionType[] = ['manual', 'habit', 'reflex', 'api'];
  const statuses: ExecutionStatus[] = ['completed', 'completed', 'completed', 'failed', 'completed'];

  let execId = 0;
  const skillIds = ['skill-001', 'skill-002', 'skill-003'];

  // Generate 50 sample executions over the past 30 days
  for (let i = 0; i < 50; i++) {
    const skillId = skillIds[Math.floor(Math.random() * skillIds.length)];
    const executionType = executionTypes[Math.floor(Math.random() * executionTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const daysAgo = Math.floor(Math.random() * 30);
    const hoursAgo = Math.floor(Math.random() * 24);
    const executedAt = new Date(Date.now() - daysAgo * 86400000 - hoursAgo * 3600000);

    const isCompleted = status === 'completed';
    const durationMs = isCompleted ? Math.floor(Math.random() * 3000) + 500 : undefined;
    const promptTokens = isCompleted ? Math.floor(Math.random() * 500) + 100 : undefined;
    const completionTokens = isCompleted ? Math.floor(Math.random() * 1500) + 200 : undefined;
    const tokensUsed = promptTokens && completionTokens ? promptTokens + completionTokens : undefined;
    const costCents = tokensUsed ? Math.floor(tokensUsed * 0.003) : undefined;

    const execution: SkillExecution = {
      id: `exec-${String(execId++).padStart(4, '0')}`,
      skillId,
      userId: 'user-001',
      executionType,
      referenceId: executionType !== 'manual' ? `${executionType}-ref-${i}` : undefined,
      input: { sample: 'input', index: i },
      output: isCompleted ? `Sample output for execution ${i}...` : undefined,
      tokensUsed,
      promptTokens,
      completionTokens,
      durationMs,
      costCents,
      status,
      errorMessage: isCompleted ? undefined : 'Sample error message for failed execution',
      errorCode: isCompleted ? undefined : 'EXECUTION_FAILED',
      executedAt,
      completedAt: isCompleted ? new Date(executedAt.getTime() + (durationMs || 1000)) : undefined,
    };

    mockExecutions.set(execution.id, execution);
  }
}

initializeMockData();

// =============================================================================
// Helper Functions
// =============================================================================

function createApiError(code: string, message: string, field?: string): SkillsApiError {
  return { code, message, field };
}

export function isExecutionsApiError(error: unknown): error is SkillsApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// =============================================================================
// Executions Query Operations
// =============================================================================

/**
 * GET /api/executions - List all executions with filtering
 */
export async function listExecutions(filters?: ExecutionFilters): Promise<{
  executions: ExecutionWithSkill[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  await delay();

  let executions = Array.from(mockExecutions.values());

  // Apply filters
  if (filters?.skillId) {
    executions = executions.filter(e => e.skillId === filters.skillId);
  }
  if (filters?.status) {
    executions = executions.filter(e => e.status === filters.status);
  }
  if (filters?.executionType) {
    executions = executions.filter(e => e.executionType === filters.executionType);
  }
  if (filters?.startDate) {
    executions = executions.filter(e => e.executedAt >= filters.startDate!);
  }
  if (filters?.endDate) {
    executions = executions.filter(e => e.executedAt <= filters.endDate!);
  }

  // Sort by execution time (most recent first)
  executions.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

  // Pagination
  const limit = filters?.limit || 20;
  const offset = filters?.offset || 0;
  const total = executions.length;
  const paginatedExecutions = executions.slice(offset, offset + limit);

  // Attach skill information
  const executionsWithSkill: ExecutionWithSkill[] = paginatedExecutions.map(exec => ({
    ...exec,
    skill: exec.skillId ? mockSkillsRef.get(exec.skillId) : undefined,
  }));

  return {
    executions: executionsWithSkill,
    total,
    page: Math.floor(offset / limit) + 1,
    pageSize: limit,
    hasMore: offset + limit < total,
  };
}

/**
 * GET /api/executions/:id - Get execution details
 */
export async function getExecution(executionId: string): Promise<SkillExecution> {
  await delay();

  const execution = mockExecutions.get(executionId);
  if (!execution) {
    throw createApiError('EXECUTION_NOT_FOUND', `Execution with ID ${executionId} not found`);
  }

  return execution;
}

/**
 * GET /api/executions/:id/full - Get execution with skill details
 */
export async function getExecutionWithSkill(executionId: string): Promise<ExecutionWithSkill> {
  await delay();

  const execution = mockExecutions.get(executionId);
  if (!execution) {
    throw createApiError('EXECUTION_NOT_FOUND', `Execution with ID ${executionId} not found`);
  }

  return {
    ...execution,
    skill: execution.skillId ? mockSkillsRef.get(execution.skillId) : undefined,
  };
}

/**
 * GET /api/executions/recent - Get most recent executions
 */
export async function getRecentExecutions(limit: number = 10): Promise<ExecutionWithSkill[]> {
  await delay();

  const executions = Array.from(mockExecutions.values())
    .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime())
    .slice(0, limit);

  return executions.map(exec => ({
    ...exec,
    skill: exec.skillId ? mockSkillsRef.get(exec.skillId) : undefined,
  }));
}

/**
 * GET /api/executions/running - Get currently running executions
 */
export async function getRunningExecutions(): Promise<ExecutionWithSkill[]> {
  await delay();

  const runningExecutions = Array.from(mockExecutions.values())
    .filter(e => e.status === 'running' || e.status === 'pending')
    .sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

  return runningExecutions.map(exec => ({
    ...exec,
    skill: exec.skillId ? mockSkillsRef.get(exec.skillId) : undefined,
  }));
}

// =============================================================================
// Execution Management
// =============================================================================

/**
 * POST /api/executions/:id/cancel - Cancel a running execution
 */
export async function cancelExecution(executionId: string): Promise<{ success: boolean }> {
  await delay();

  const execution = mockExecutions.get(executionId);
  if (!execution) {
    throw createApiError('EXECUTION_NOT_FOUND', `Execution with ID ${executionId} not found`);
  }

  if (execution.status !== 'running' && execution.status !== 'pending') {
    throw createApiError('CANNOT_CANCEL', `Cannot cancel execution with status "${execution.status}"`);
  }

  const updatedExecution: SkillExecution = {
    ...execution,
    status: 'cancelled',
    errorMessage: 'Cancelled by user',
    completedAt: new Date(),
  };

  mockExecutions.set(executionId, updatedExecution);
  return { success: true };
}

/**
 * POST /api/executions/:id/retry - Retry a failed execution
 */
export async function retryExecution(executionId: string): Promise<{
  newExecutionId: string;
  status: 'pending' | 'running';
}> {
  await delay();

  const execution = mockExecutions.get(executionId);
  if (!execution) {
    throw createApiError('EXECUTION_NOT_FOUND', `Execution with ID ${executionId} not found`);
  }

  if (execution.status !== 'failed' && execution.status !== 'cancelled') {
    throw createApiError('CANNOT_RETRY', `Cannot retry execution with status "${execution.status}"`);
  }

  // Create a new execution based on the original
  const newExecution: SkillExecution = {
    id: generateId(),
    skillId: execution.skillId,
    userId: execution.userId,
    executionType: execution.executionType,
    referenceId: execution.referenceId,
    input: execution.input,
    status: 'pending',
    executedAt: new Date(),
  };

  mockExecutions.set(newExecution.id, newExecution);

  return {
    newExecutionId: newExecution.id,
    status: 'pending',
  };
}

// =============================================================================
// Statistics & Analytics
// =============================================================================

/**
 * GET /api/executions/stats - Get execution statistics
 */
export async function getExecutionStats(options?: {
  startDate?: Date;
  endDate?: Date;
  skillId?: string;
}): Promise<{
  totalExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  cancelledExecutions: number;
  totalTokensUsed: number;
  totalCostCents: number;
  averageDurationMs: number;
  executionsByType: Record<ExecutionType, number>;
  executionsByStatus: Record<ExecutionStatus, number>;
  dailyExecutions: { date: string; count: number; tokens: number }[];
}> {
  await delay();

  let executions = Array.from(mockExecutions.values());

  // Apply filters
  if (options?.startDate) {
    executions = executions.filter(e => e.executedAt >= options.startDate!);
  }
  if (options?.endDate) {
    executions = executions.filter(e => e.executedAt <= options.endDate!);
  }
  if (options?.skillId) {
    executions = executions.filter(e => e.skillId === options.skillId);
  }

  // Calculate statistics
  const totalExecutions = executions.length;
  const successfulExecutions = executions.filter(e => e.status === 'completed').length;
  const failedExecutions = executions.filter(e => e.status === 'failed').length;
  const cancelledExecutions = executions.filter(e => e.status === 'cancelled').length;

  const completedExecutions = executions.filter(e => e.status === 'completed');
  const totalTokensUsed = completedExecutions.reduce((sum, e) => sum + (e.tokensUsed || 0), 0);
  const totalCostCents = completedExecutions.reduce((sum, e) => sum + (e.costCents || 0), 0);
  const totalDuration = completedExecutions.reduce((sum, e) => sum + (e.durationMs || 0), 0);
  const averageDurationMs = completedExecutions.length > 0 ? Math.floor(totalDuration / completedExecutions.length) : 0;

  // Count by type
  const executionsByType: Record<ExecutionType, number> = {
    manual: 0,
    habit: 0,
    reflex: 0,
    api: 0,
  };
  executions.forEach(e => {
    executionsByType[e.executionType]++;
  });

  // Count by status
  const executionsByStatus: Record<ExecutionStatus, number> = {
    pending: 0,
    running: 0,
    completed: 0,
    failed: 0,
    cancelled: 0,
  };
  executions.forEach(e => {
    executionsByStatus[e.status]++;
  });

  // Daily breakdown (last 14 days)
  const dailyMap = new Map<string, { count: number; tokens: number }>();
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, { count: 0, tokens: 0 });
  }

  executions.forEach(e => {
    const dateStr = e.executedAt.toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      const day = dailyMap.get(dateStr)!;
      day.count++;
      day.tokens += e.tokensUsed || 0;
    }
  });

  const dailyExecutions = Array.from(dailyMap.entries())
    .map(([date, data]) => ({ date, ...data }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalExecutions,
    successfulExecutions,
    failedExecutions,
    cancelledExecutions,
    totalTokensUsed,
    totalCostCents,
    averageDurationMs,
    executionsByType,
    executionsByStatus,
    dailyExecutions,
  };
}

/**
 * GET /api/executions/cost-breakdown - Get cost breakdown by skill
 */
export async function getCostBreakdown(options?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<{
  totalCostCents: number;
  costBySkill: { skillId: string; skillName: string; costCents: number; executionCount: number }[];
  costByType: Record<ExecutionType, number>;
  costByDay: { date: string; costCents: number }[];
}> {
  await delay();

  let executions = Array.from(mockExecutions.values())
    .filter(e => e.status === 'completed');

  // Apply filters
  if (options?.startDate) {
    executions = executions.filter(e => e.executedAt >= options.startDate!);
  }
  if (options?.endDate) {
    executions = executions.filter(e => e.executedAt <= options.endDate!);
  }

  const totalCostCents = executions.reduce((sum, e) => sum + (e.costCents || 0), 0);

  // Cost by skill
  const skillCostMap = new Map<string, { costCents: number; count: number }>();
  executions.forEach(e => {
    if (e.skillId) {
      const existing = skillCostMap.get(e.skillId) || { costCents: 0, count: 0 };
      existing.costCents += e.costCents || 0;
      existing.count++;
      skillCostMap.set(e.skillId, existing);
    }
  });

  const costBySkill = Array.from(skillCostMap.entries())
    .map(([skillId, data]) => ({
      skillId,
      skillName: mockSkillsRef.get(skillId)?.name || 'Unknown Skill',
      costCents: data.costCents,
      executionCount: data.count,
    }))
    .sort((a, b) => b.costCents - a.costCents);

  // Cost by type
  const costByType: Record<ExecutionType, number> = {
    manual: 0,
    habit: 0,
    reflex: 0,
    api: 0,
  };
  executions.forEach(e => {
    costByType[e.executionType] += e.costCents || 0;
  });

  // Cost by day (last 30 days)
  const dailyMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    dailyMap.set(dateStr, 0);
  }

  executions.forEach(e => {
    const dateStr = e.executedAt.toISOString().split('T')[0];
    if (dailyMap.has(dateStr)) {
      dailyMap.set(dateStr, (dailyMap.get(dateStr) || 0) + (e.costCents || 0));
    }
  });

  const costByDay = Array.from(dailyMap.entries())
    .map(([date, costCents]) => ({ date, costCents }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCostCents,
    costBySkill,
    costByType,
    costByDay,
  };
}

/**
 * GET /api/executions/performance - Get performance metrics
 */
export async function getPerformanceMetrics(skillId?: string): Promise<{
  averageDurationMs: number;
  p50DurationMs: number;
  p90DurationMs: number;
  p99DurationMs: number;
  successRate: number;
  durationByHour: { hour: number; avgDurationMs: number }[];
}> {
  await delay();

  let executions = Array.from(mockExecutions.values())
    .filter(e => e.status === 'completed' && e.durationMs);

  if (skillId) {
    executions = executions.filter(e => e.skillId === skillId);
  }

  if (executions.length === 0) {
    return {
      averageDurationMs: 0,
      p50DurationMs: 0,
      p90DurationMs: 0,
      p99DurationMs: 0,
      successRate: 0,
      durationByHour: [],
    };
  }

  // Sort by duration for percentile calculations
  const durations = executions.map(e => e.durationMs!).sort((a, b) => a - b);

  const averageDurationMs = Math.floor(durations.reduce((sum, d) => sum + d, 0) / durations.length);
  const p50DurationMs = durations[Math.floor(durations.length * 0.5)];
  const p90DurationMs = durations[Math.floor(durations.length * 0.9)];
  const p99DurationMs = durations[Math.floor(durations.length * 0.99)];

  // Success rate
  const allExecutions = Array.from(mockExecutions.values())
    .filter(e => skillId ? e.skillId === skillId : true)
    .filter(e => e.status === 'completed' || e.status === 'failed');
  const successRate = allExecutions.length > 0
    ? Math.round((allExecutions.filter(e => e.status === 'completed').length / allExecutions.length) * 100)
    : 0;

  // Duration by hour
  const hourlyMap = new Map<number, number[]>();
  for (let i = 0; i < 24; i++) {
    hourlyMap.set(i, []);
  }

  executions.forEach(e => {
    const hour = e.executedAt.getHours();
    hourlyMap.get(hour)?.push(e.durationMs!);
  });

  const durationByHour = Array.from(hourlyMap.entries())
    .map(([hour, durations]) => ({
      hour,
      avgDurationMs: durations.length > 0
        ? Math.floor(durations.reduce((sum, d) => sum + d, 0) / durations.length)
        : 0,
    }));

  return {
    averageDurationMs,
    p50DurationMs,
    p90DurationMs,
    p99DurationMs,
    successRate,
    durationByHour,
  };
}

// =============================================================================
// Export & Cleanup
// =============================================================================

/**
 * GET /api/executions/export - Export executions to CSV/JSON
 */
export async function exportExecutions(
  filters?: ExecutionFilters,
  format: 'csv' | 'json' = 'json'
): Promise<{ data: string; filename: string }> {
  await delay();

  const { executions } = await listExecutions({ ...filters, limit: 10000, offset: 0 });

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `executions-${timestamp}.${format}`;

  if (format === 'json') {
    return {
      data: JSON.stringify(executions, null, 2),
      filename,
    };
  }

  // CSV format
  const headers = [
    'id', 'skillId', 'skillName', 'executionType', 'status',
    'tokensUsed', 'durationMs', 'costCents', 'executedAt', 'completedAt'
  ];
  const rows = executions.map(e => [
    e.id,
    e.skillId || '',
    e.skill?.name || '',
    e.executionType,
    e.status,
    e.tokensUsed || '',
    e.durationMs || '',
    e.costCents || '',
    e.executedAt.toISOString(),
    e.completedAt?.toISOString() || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  return {
    data: csvContent,
    filename,
  };
}

/**
 * DELETE /api/executions/cleanup - Clean up old executions
 */
export async function cleanupOldExecutions(olderThanDays: number = 90): Promise<{
  deletedCount: number;
  freedSpaceMb: number;
}> {
  await delay();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

  let deletedCount = 0;
  let freedBytes = 0;

  Array.from(mockExecutions.entries()).forEach(([id, execution]) => {
    if (execution.executedAt < cutoffDate) {
      // Estimate storage freed
      freedBytes += JSON.stringify(execution).length;
      mockExecutions.delete(id);
      deletedCount++;
    }
  });

  return {
    deletedCount,
    freedSpaceMb: Math.round((freedBytes / 1024 / 1024) * 100) / 100,
  };
}
