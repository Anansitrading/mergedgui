// Skills Domain Types & Interfaces
// Types for Skills, Habits, Reflexes, and Execution tracking

// =============================================================================
// Enums & Union Types
// =============================================================================

/** Skill category for organization */
export type SkillCategory =
  | 'analysis'
  | 'generation'
  | 'transformation'
  | 'communication'
  | 'automation'
  | 'custom';

/** Output format for skill results */
export type SkillOutputFormat = 'markdown' | 'json' | 'text' | 'html' | 'code';

/** Execution status for tracking skill runs */
export type ExecutionStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

/** How the skill was triggered */
export type ExecutionType = 'manual' | 'habit' | 'reflex' | 'api';

/** Trigger types for reflexes */
export type ReflexTriggerType =
  | 'webhook'
  | 'email'
  | 'file_change'
  | 'api_call'
  | 'schedule'
  | 'event';

// =============================================================================
// Core Interfaces
// =============================================================================

/** AI model parameters for skill execution */
export interface SkillParameters {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  stop_sequences?: string[];
}

/** Input variable schema for skill prompts */
export interface InputSchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default?: unknown;
}

/** Main Skill entity - core AI capability */
export interface Skill {
  id: string;
  userId: string;

  // Basic info
  name: string;
  description?: string;
  category: SkillCategory;

  // AI Configuration
  promptTemplate: string;
  model: string;
  parameters: SkillParameters;

  // Input/Output configuration
  inputSchema?: InputSchemaField[];
  outputFormat: SkillOutputFormat;

  // Status
  isActive: boolean;
  isPublic?: boolean;

  // Usage stats
  executionCount: number;
  starCount?: number;
  rating?: number; // Average rating 0-5
  ratingCount?: number; // Number of ratings
  lastExecutedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/** Habit entity - scheduled execution of skills */
export interface Habit {
  id: string;
  skillId: string;
  userId: string;

  // Schedule configuration
  scheduleCron: string;
  scheduleDescription?: string;
  timezone: string;

  // Execution tracking
  lastRunAt?: Date;
  nextRunAt?: Date;
  runCount: number;

  // Status
  isActive: boolean;

  // Configuration for execution
  config: Record<string, unknown>;

  // Error tracking
  consecutiveFailures: number;
  lastErrorMessage?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/** Webhook trigger configuration */
export interface WebhookTriggerConfig {
  url: string;
  secret?: string;
  method: 'POST' | 'GET';
}

/** Email trigger configuration */
export interface EmailTriggerConfig {
  fromAddress?: string;
  subjectPattern?: string;
  bodyPattern?: string;
}

/** File change trigger configuration */
export interface FileChangeTriggerConfig {
  paths: string[];
  events: ('create' | 'modify' | 'delete')[];
}

/** API call trigger configuration */
export interface ApiCallTriggerConfig {
  endpoint: string;
  method: string;
}

/** Event trigger configuration */
export interface EventTriggerConfig {
  eventName: string;
  source?: string;
}

/** Union type for all trigger configurations */
export type TriggerConfig =
  | WebhookTriggerConfig
  | EmailTriggerConfig
  | FileChangeTriggerConfig
  | ApiCallTriggerConfig
  | EventTriggerConfig;

/** Reflex conditions for filtering triggers */
export interface ReflexConditions {
  expression?: string;
  matchAll?: boolean;
  filters?: {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
    value: string;
  }[];
}

/** Reflex entity - event-triggered execution of skills */
export interface Reflex {
  id: string;
  skillId: string;
  userId: string;

  // Trigger configuration
  triggerType: ReflexTriggerType;
  triggerConfig: TriggerConfig;

  // Conditions for execution
  conditions?: ReflexConditions;

  // Status
  isActive: boolean;

  // Usage stats
  triggerCount: number;
  lastTriggeredAt?: Date;

  // Error tracking
  consecutiveFailures: number;
  lastErrorMessage?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

/** Skill execution record */
export interface SkillExecution {
  id: string;
  skillId?: string;
  userId: string;

  // Execution context
  executionType: ExecutionType;
  referenceId?: string; // habit_id or reflex_id if applicable

  // Input/Output
  input?: Record<string, unknown>;
  output?: string;

  // Usage metrics
  tokensUsed?: number;
  promptTokens?: number;
  completionTokens?: number;
  durationMs?: number;

  // Cost tracking (in cents)
  costCents?: number;

  // Status
  status: ExecutionStatus;
  errorMessage?: string;
  errorCode?: string;

  // Timestamps
  executedAt: Date;
  completedAt?: Date;
}

// =============================================================================
// Extended Types with Relations
// =============================================================================

/** Skill with all related data */
export interface SkillWithRelations extends Skill {
  habits: Habit[];
  reflexes: Reflex[];
  recentExecutions: SkillExecution[];
}

/** Habit with skill details */
export interface HabitWithSkill extends Habit {
  skill: Skill;
}

/** Reflex with skill details */
export interface ReflexWithSkill extends Reflex {
  skill: Skill;
}

/** Execution with skill details */
export interface ExecutionWithSkill extends SkillExecution {
  skill?: Skill;
}

// =============================================================================
// API Request/Response Types
// =============================================================================

/** Request to create a new skill */
export interface CreateSkillRequest {
  name: string;
  description?: string;
  category?: SkillCategory;
  promptTemplate: string;
  model?: string;
  parameters?: SkillParameters;
  inputSchema?: InputSchemaField[];
  outputFormat?: SkillOutputFormat;
  isActive?: boolean;
}

/** Request to update a skill */
export interface UpdateSkillRequest {
  name?: string;
  description?: string;
  category?: SkillCategory;
  promptTemplate?: string;
  model?: string;
  parameters?: SkillParameters;
  inputSchema?: InputSchemaField[];
  outputFormat?: SkillOutputFormat;
  isActive?: boolean;
}

/** Request to create a new habit */
export interface CreateHabitRequest {
  skillId: string;
  scheduleCron: string;
  scheduleDescription?: string;
  timezone?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

/** Request to update a habit */
export interface UpdateHabitRequest {
  scheduleCron?: string;
  scheduleDescription?: string;
  timezone?: string;
  config?: Record<string, unknown>;
  isActive?: boolean;
}

/** Request to create a new reflex */
export interface CreateReflexRequest {
  skillId: string;
  triggerType: ReflexTriggerType;
  triggerConfig: TriggerConfig;
  conditions?: ReflexConditions;
  isActive?: boolean;
}

/** Request to update a reflex */
export interface UpdateReflexRequest {
  triggerConfig?: TriggerConfig;
  conditions?: ReflexConditions;
  isActive?: boolean;
}

/** Request to execute a skill */
export interface ExecuteSkillRequest {
  skillId: string;
  input?: Record<string, unknown>;
  executionType?: ExecutionType;
  referenceId?: string;
}

/** Response from skill execution */
export interface ExecuteSkillResponse {
  executionId: string;
  status: ExecutionStatus;
  output?: string;
  tokensUsed?: number;
  durationMs?: number;
  error?: string;
}

/** Paginated list response */
export interface PaginatedSkillsResponse {
  skills: Skill[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

/** Skill statistics */
export interface SkillStats {
  totalSkills: number;
  activeSkills: number;
  totalExecutions: number;
  totalTokensUsed: number;
  totalCostCents: number;
  executionsByStatus: Record<ExecutionStatus, number>;
  executionsByType: Record<ExecutionType, number>;
  topSkillsByUsage: { skillId: string; name: string; count: number }[];
}

/** Execution filter options */
export interface ExecutionFilters {
  skillId?: string;
  status?: ExecutionStatus;
  executionType?: ExecutionType;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

// =============================================================================
// API Error Type
// =============================================================================

/** API error structure for skills operations */
export interface SkillsApiError {
  code: string;
  message: string;
  field?: string;
  details?: Record<string, unknown>;
}

// =============================================================================
// Form Types
// =============================================================================

/** Form state for creating/editing skills */
export interface SkillFormData {
  name: string;
  description: string;
  category: SkillCategory;
  promptTemplate: string;
  model: string;
  temperature: number;
  maxTokens: number;
  inputSchema: InputSchemaField[];
  outputFormat: SkillOutputFormat;
  isActive: boolean;
}

/** Form state for creating/editing habits */
export interface HabitFormData {
  skillId: string;
  scheduleCron: string;
  scheduleDescription: string;
  timezone: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

/** Form state for creating/editing reflexes */
export interface ReflexFormData {
  skillId: string;
  triggerType: ReflexTriggerType;
  triggerConfig: TriggerConfig;
  conditions: ReflexConditions;
  isActive: boolean;
}

// =============================================================================
// Validation Types
// =============================================================================

/** Validation result for skill form */
export interface SkillValidation {
  isValid: boolean;
  errors: {
    name?: string;
    promptTemplate?: string;
    model?: string;
    parameters?: string;
  };
}

/** Cron expression validation result */
export interface CronValidation {
  isValid: boolean;
  error?: string;
  nextRuns?: Date[];
}
