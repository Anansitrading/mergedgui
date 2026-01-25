/**
 * Habits API Service
 * Handles all API calls for Habits (scheduled skill executions) CRUD operations
 */

import type {
  Habit,
  HabitWithSkill,
  CreateHabitRequest,
  UpdateHabitRequest,
  SkillsApiError,
  Skill,
  SkillExecution,
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

const mockHabits: Map<string, Habit> = new Map();

// Reference to skills for relation lookups (would come from database in production)
const mockSkillsRef: Map<string, Skill> = new Map();

// Initialize with sample data
function initializeMockData() {
  // Sample skill references
  const sampleSkill: Skill = {
    id: 'skill-004',
    userId: 'user-001',
    name: 'Daily Standup Summary',
    description: 'Generates a summary of recent commits and activity',
    category: 'communication',
    promptTemplate: 'Generate standup summary...',
    model: 'claude-3-5-sonnet-20241022',
    parameters: { temperature: 0.7, max_tokens: 1024 },
    outputFormat: 'text',
    isActive: true,
    executionCount: 5,
    createdAt: new Date('2026-01-18'),
    updatedAt: new Date('2026-01-20'),
  };
  mockSkillsRef.set(sampleSkill.id, sampleSkill);

  const sampleHabits: Habit[] = [
    {
      id: 'habit-001',
      skillId: 'skill-004',
      userId: 'user-001',
      scheduleCron: '0 9 * * 1-5',
      scheduleDescription: 'Every weekday at 9:00 AM',
      timezone: 'America/New_York',
      lastRunAt: new Date('2026-01-24T09:00:00'),
      nextRunAt: new Date('2026-01-27T09:00:00'),
      runCount: 15,
      isActive: true,
      config: {
        commits: 'auto-fetch',
        pull_requests: 'auto-fetch',
      },
      consecutiveFailures: 0,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-24'),
    },
    {
      id: 'habit-002',
      skillId: 'skill-004',
      userId: 'user-001',
      scheduleCron: '0 18 * * 5',
      scheduleDescription: 'Every Friday at 6:00 PM',
      timezone: 'America/New_York',
      lastRunAt: new Date('2026-01-17T18:00:00'),
      nextRunAt: new Date('2026-01-24T18:00:00'),
      runCount: 3,
      isActive: true,
      config: {
        commits: 'weekly-summary',
        include_stats: true,
      },
      consecutiveFailures: 0,
      createdAt: new Date('2026-01-10'),
      updatedAt: new Date('2026-01-17'),
    },
    {
      id: 'habit-003',
      skillId: 'skill-004',
      userId: 'user-001',
      scheduleCron: '0 0 1 * *',
      scheduleDescription: 'First day of every month',
      timezone: 'UTC',
      lastRunAt: new Date('2026-01-01T00:00:00'),
      nextRunAt: new Date('2026-02-01T00:00:00'),
      runCount: 1,
      isActive: false,
      config: {
        report_type: 'monthly',
      },
      consecutiveFailures: 2,
      lastErrorMessage: 'Skill execution timeout',
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
    },
  ];

  sampleHabits.forEach(habit => mockHabits.set(habit.id, habit));
}

initializeMockData();

// =============================================================================
// Helper Functions
// =============================================================================

function createApiError(code: string, message: string, field?: string): SkillsApiError {
  return { code, message, field };
}

export function isHabitsApiError(error: unknown): error is SkillsApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error
  );
}

// Calculate next run time from cron expression (simplified mock)
function calculateNextRun(cron: string, timezone: string): Date {
  // In production, use a proper cron parser like `cron-parser`
  const now = new Date();
  const parts = cron.split(' ');

  // Simple parsing for common patterns
  if (parts[4] === '1-5') {
    // Weekday schedule
    const nextWeekday = new Date(now);
    while (nextWeekday.getDay() === 0 || nextWeekday.getDay() === 6) {
      nextWeekday.setDate(nextWeekday.getDate() + 1);
    }
    nextWeekday.setHours(parseInt(parts[1]), parseInt(parts[0]), 0, 0);
    if (nextWeekday <= now) {
      nextWeekday.setDate(nextWeekday.getDate() + 1);
      while (nextWeekday.getDay() === 0 || nextWeekday.getDay() === 6) {
        nextWeekday.setDate(nextWeekday.getDate() + 1);
      }
    }
    return nextWeekday;
  }

  // Default: next day at specified time
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(parseInt(parts[1]) || 0, parseInt(parts[0]) || 0, 0, 0);
  return next;
}

// Validate cron expression (simplified)
function validateCron(cron: string): { isValid: boolean; error?: string } {
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) {
    return { isValid: false, error: 'Cron expression must have exactly 5 parts' };
  }
  // Basic validation - in production use a proper cron parser
  return { isValid: true };
}

// =============================================================================
// Habits CRUD Operations
// =============================================================================

/**
 * GET /api/habits - List all habits with optional filtering
 */
export async function listHabits(options?: {
  skillId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}): Promise<{
  habits: HabitWithSkill[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}> {
  await delay();

  let habits = Array.from(mockHabits.values());

  // Apply filters
  if (options?.skillId) {
    habits = habits.filter(h => h.skillId === options.skillId);
  }
  if (options?.isActive !== undefined) {
    habits = habits.filter(h => h.isActive === options.isActive);
  }

  // Sort by next run time (active habits first, then by next run)
  habits.sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    if (!a.nextRunAt) return 1;
    if (!b.nextRunAt) return -1;
    return a.nextRunAt.getTime() - b.nextRunAt.getTime();
  });

  // Pagination
  const page = options?.page || 1;
  const pageSize = options?.pageSize || 20;
  const total = habits.length;
  const start = (page - 1) * pageSize;
  const paginatedHabits = habits.slice(start, start + pageSize);

  // Attach skill information
  const habitsWithSkill: HabitWithSkill[] = paginatedHabits.map(habit => ({
    ...habit,
    skill: mockSkillsRef.get(habit.skillId) || {
      id: habit.skillId,
      userId: habit.userId,
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
    habits: habitsWithSkill,
    total,
    page,
    pageSize,
    hasMore: start + pageSize < total,
  };
}

/**
 * GET /api/habits/:id - Get habit details
 */
export async function getHabit(habitId: string): Promise<Habit> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  return habit;
}

/**
 * GET /api/habits/:id/full - Get habit with skill details
 */
export async function getHabitWithSkill(habitId: string): Promise<HabitWithSkill> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  const skill = mockSkillsRef.get(habit.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Associated skill not found`);
  }

  return { ...habit, skill };
}

/**
 * POST /api/habits - Create a new habit
 */
export async function createHabit(request: CreateHabitRequest): Promise<Habit> {
  await delay();

  // Validate cron expression
  const cronValidation = validateCron(request.scheduleCron);
  if (!cronValidation.isValid) {
    throw createApiError('INVALID_CRON', cronValidation.error || 'Invalid cron expression', 'scheduleCron');
  }

  // Validate skill exists (in production, this would be a database check)
  const skill = mockSkillsRef.get(request.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Skill with ID ${request.skillId} not found`, 'skillId');
  }

  const timezone = request.timezone || 'UTC';
  const now = new Date();

  const habit: Habit = {
    id: generateId(),
    skillId: request.skillId,
    userId: 'current-user', // Would come from auth context
    scheduleCron: request.scheduleCron,
    scheduleDescription: request.scheduleDescription,
    timezone,
    lastRunAt: undefined,
    nextRunAt: calculateNextRun(request.scheduleCron, timezone),
    runCount: 0,
    isActive: request.isActive ?? true,
    config: request.config || {},
    consecutiveFailures: 0,
    createdAt: now,
    updatedAt: now,
  };

  mockHabits.set(habit.id, habit);
  return habit;
}

/**
 * PUT /api/habits/:id - Update an existing habit
 */
export async function updateHabit(habitId: string, updates: UpdateHabitRequest): Promise<Habit> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  // Validate cron if being updated
  if (updates.scheduleCron) {
    const cronValidation = validateCron(updates.scheduleCron);
    if (!cronValidation.isValid) {
      throw createApiError('INVALID_CRON', cronValidation.error || 'Invalid cron expression', 'scheduleCron');
    }
  }

  const timezone = updates.timezone || habit.timezone;
  const cron = updates.scheduleCron || habit.scheduleCron;

  const updatedHabit: Habit = {
    ...habit,
    ...updates,
    // Recalculate next run if schedule changed
    nextRunAt: updates.scheduleCron ? calculateNextRun(cron, timezone) : habit.nextRunAt,
    updatedAt: new Date(),
  };

  mockHabits.set(habitId, updatedHabit);
  return updatedHabit;
}

/**
 * DELETE /api/habits/:id - Delete a habit
 */
export async function deleteHabit(habitId: string): Promise<{ success: boolean }> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  mockHabits.delete(habitId);
  return { success: true };
}

// =============================================================================
// Habit Control Operations
// =============================================================================

/**
 * POST /api/habits/:id/activate - Activate a habit
 */
export async function activateHabit(habitId: string): Promise<Habit> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  const updatedHabit: Habit = {
    ...habit,
    isActive: true,
    nextRunAt: calculateNextRun(habit.scheduleCron, habit.timezone),
    consecutiveFailures: 0,
    lastErrorMessage: undefined,
    updatedAt: new Date(),
  };

  mockHabits.set(habitId, updatedHabit);
  return updatedHabit;
}

/**
 * POST /api/habits/:id/deactivate - Deactivate a habit
 */
export async function deactivateHabit(habitId: string): Promise<Habit> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  const updatedHabit: Habit = {
    ...habit,
    isActive: false,
    nextRunAt: undefined,
    updatedAt: new Date(),
  };

  mockHabits.set(habitId, updatedHabit);
  return updatedHabit;
}

/**
 * POST /api/habits/:id/run-now - Trigger immediate execution of a habit
 */
export async function runHabitNow(habitId: string): Promise<{
  executionId: string;
  status: 'queued' | 'running';
  message: string;
}> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  const skill = mockSkillsRef.get(habit.skillId);
  if (!skill) {
    throw createApiError('SKILL_NOT_FOUND', `Associated skill not found`);
  }

  if (!skill.isActive) {
    throw createApiError('SKILL_INACTIVE', 'Cannot run habit: associated skill is inactive');
  }

  // In production, this would queue the execution
  return {
    executionId: generateId(),
    status: 'queued',
    message: `Habit "${habit.scheduleDescription || habit.scheduleCron}" queued for immediate execution`,
  };
}

/**
 * POST /api/habits/:id/reset-errors - Reset error state and reactivate
 */
export async function resetHabitErrors(habitId: string): Promise<Habit> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  const updatedHabit: Habit = {
    ...habit,
    consecutiveFailures: 0,
    lastErrorMessage: undefined,
    isActive: true,
    nextRunAt: calculateNextRun(habit.scheduleCron, habit.timezone),
    updatedAt: new Date(),
  };

  mockHabits.set(habitId, updatedHabit);
  return updatedHabit;
}

// =============================================================================
// Habit Execution History
// =============================================================================

/**
 * GET /api/habits/:id/executions - Get execution history for a habit
 */
export async function getHabitExecutions(
  habitId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ executions: SkillExecution[]; total: number }> {
  await delay();

  const habit = mockHabits.get(habitId);
  if (!habit) {
    throw createApiError('HABIT_NOT_FOUND', `Habit with ID ${habitId} not found`);
  }

  // Generate mock execution history based on run count
  const total = habit.runCount;
  const limit = options?.limit || 10;
  const offset = options?.offset || 0;

  const executions: SkillExecution[] = [];
  const executionCount = Math.min(limit, total - offset);

  for (let i = 0; i < executionCount; i++) {
    const isCompleted = i < total - habit.consecutiveFailures;
    const executedAt = new Date(Date.now() - (offset + i) * 86400000); // 1 day apart

    executions.push({
      id: `exec-habit-${habitId}-${offset + i}`,
      skillId: habit.skillId,
      userId: habit.userId,
      executionType: 'habit',
      referenceId: habitId,
      input: habit.config,
      output: isCompleted ? 'Scheduled execution completed successfully.' : undefined,
      tokensUsed: isCompleted ? Math.floor(Math.random() * 1000) + 200 : undefined,
      durationMs: isCompleted ? Math.floor(Math.random() * 2000) + 300 : undefined,
      status: isCompleted ? 'completed' : 'failed',
      errorMessage: isCompleted ? undefined : habit.lastErrorMessage || 'Execution failed',
      executedAt,
      completedAt: isCompleted ? new Date(executedAt.getTime() + 1500) : undefined,
    });
  }

  return { executions, total };
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * GET /api/habits/stats - Get habit statistics
 */
export async function getHabitStats(): Promise<{
  totalHabits: number;
  activeHabits: number;
  totalRuns: number;
  failedHabits: number;
  upcomingRuns: { habitId: string; skillName: string; nextRunAt: Date }[];
}> {
  await delay();

  const habits = Array.from(mockHabits.values());

  const activeHabits = habits.filter(h => h.isActive);
  const failedHabits = habits.filter(h => h.consecutiveFailures > 0);

  const upcomingRuns = activeHabits
    .filter(h => h.nextRunAt)
    .sort((a, b) => (a.nextRunAt?.getTime() || 0) - (b.nextRunAt?.getTime() || 0))
    .slice(0, 5)
    .map(h => ({
      habitId: h.id,
      skillName: mockSkillsRef.get(h.skillId)?.name || 'Unknown Skill',
      nextRunAt: h.nextRunAt!,
    }));

  return {
    totalHabits: habits.length,
    activeHabits: activeHabits.length,
    totalRuns: habits.reduce((sum, h) => sum + h.runCount, 0),
    failedHabits: failedHabits.length,
    upcomingRuns,
  };
}

// =============================================================================
// Cron Validation
// =============================================================================

/**
 * POST /api/habits/validate-cron - Validate a cron expression
 */
export async function validateCronExpression(cron: string): Promise<{
  isValid: boolean;
  error?: string;
  description?: string;
  nextRuns?: Date[];
}> {
  await delay(200);

  const validation = validateCron(cron);
  if (!validation.isValid) {
    return { isValid: false, error: validation.error };
  }

  // Generate next 5 run times
  const nextRuns: Date[] = [];
  let current = new Date();
  for (let i = 0; i < 5; i++) {
    current = calculateNextRun(cron, 'UTC');
    nextRuns.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  // Simple description generation
  let description = 'Custom schedule';
  const parts = cron.split(' ');
  if (parts[4] === '1-5') description = 'Every weekday';
  if (parts[2] === '1' && parts[3] === '*') description = 'Monthly on the 1st';
  if (parts[4] === '0') description = 'Every Sunday';

  return {
    isValid: true,
    description,
    nextRuns,
  };
}
