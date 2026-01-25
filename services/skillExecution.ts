/**
 * Skill Execution Service
 * Orchestrates skill execution, connecting Claude API with execution logging
 */

import type { Skill, SkillExecution, ExecutionStatus } from '../types/skills';
import {
  callClaude,
  streamClaude,
  callClaudeWithRetry,
  buildPromptFromTemplate,
  isClaudeApiError,
  type ClaudeResponse,
  type ClaudeApiError,
} from './claudeApi';

// =============================================================================
// Types
// =============================================================================

export interface ExecuteSkillOptions {
  skill: Skill;
  inputs: Record<string, unknown>;
  useStreaming?: boolean;
  onStreamChunk?: (chunk: string) => void;
  onStatusChange?: (status: ExecutionStatus) => void;
}

export interface ExecutionResult {
  executionId: string;
  status: ExecutionStatus;
  output?: string;
  error?: string;
  usage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  durationMs: number;
  costCents?: number;
}

export interface ExecutionProgress {
  status: ExecutionStatus;
  streamedContent: string;
  startedAt: Date;
}

// =============================================================================
// Configuration
// =============================================================================

// Cost per 1M tokens (approximate, varies by model)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-20250514': { input: 3, output: 15 },
  'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
  'claude-3-5-haiku-20241022': { input: 0.25, output: 1.25 },
  'claude-3-opus-20240229': { input: 15, output: 75 },
};

const generateId = () => crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// =============================================================================
// Cost Calculation
// =============================================================================

function calculateCostCents(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const costs = TOKEN_COSTS[model] || TOKEN_COSTS['claude-3-5-sonnet-20241022'];
  const inputCost = (inputTokens / 1_000_000) * costs.input;
  const outputCost = (outputTokens / 1_000_000) * costs.output;
  return Math.round((inputCost + outputCost) * 100); // Convert to cents
}

// =============================================================================
// Execution Functions
// =============================================================================

/**
 * Execute a skill with the given inputs
 * Supports both streaming and non-streaming modes
 */
export async function executeSkill(options: ExecuteSkillOptions): Promise<ExecutionResult> {
  const { skill, inputs, useStreaming = false, onStreamChunk, onStatusChange } = options;

  const executionId = generateId();
  const startTime = Date.now();

  // Build the prompt from template
  const prompt = buildPromptFromTemplate(skill.promptTemplate, inputs);

  // Notify status change
  onStatusChange?.('running');

  try {
    let response: ClaudeResponse;

    if (useStreaming && onStreamChunk) {
      // Streaming execution
      let streamedContent = '';

      const stream = streamClaude({
        model: skill.model,
        messages: [{ role: 'user', content: prompt }],
        parameters: skill.parameters,
      });

      for await (const event of stream) {
        if (event.type === 'text' && event.content) {
          streamedContent += event.content;
          onStreamChunk(event.content);
        } else if (event.type === 'done' && event.response) {
          response = event.response;
        }
      }

      response = response!;
    } else {
      // Non-streaming execution with retry
      response = await callClaudeWithRetry({
        model: skill.model,
        messages: [{ role: 'user', content: prompt }],
        parameters: skill.parameters,
      });
    }

    const durationMs = Date.now() - startTime;
    const costCents = calculateCostCents(
      skill.model,
      response.usage.inputTokens,
      response.usage.outputTokens
    );

    onStatusChange?.('completed');

    return {
      executionId,
      status: 'completed',
      output: response.content,
      usage: response.usage,
      durationMs,
      costCents,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    onStatusChange?.('failed');

    const errorMessage = isClaudeApiError(error)
      ? error.message
      : error instanceof Error
        ? error.message
        : 'Unknown error occurred';

    return {
      executionId,
      status: 'failed',
      error: errorMessage,
      durationMs,
    };
  }
}

/**
 * Execute a skill and log the execution to the database
 * This is the main entry point for production use
 */
export async function executeAndLogSkill(
  options: ExecuteSkillOptions
): Promise<ExecutionResult> {
  const result = await executeSkill(options);

  // Log execution to database (mock for now)
  const execution: SkillExecution = {
    id: result.executionId,
    skillId: options.skill.id,
    userId: options.skill.userId,
    executionType: 'manual',
    input: options.inputs,
    output: result.output,
    tokensUsed: result.usage?.totalTokens,
    promptTokens: result.usage?.inputTokens,
    completionTokens: result.usage?.outputTokens,
    durationMs: result.durationMs,
    costCents: result.costCents,
    status: result.status,
    errorMessage: result.error,
    executedAt: new Date(),
    completedAt: result.status === 'completed' ? new Date() : undefined,
  };

  // In production, this would call the executions API
  console.log('Skill execution logged:', execution);

  return result;
}

/**
 * Test a skill without logging the execution
 * Useful for previewing skill behavior
 */
export async function testSkill(
  skill: Skill,
  inputs: Record<string, unknown>
): Promise<ExecutionResult> {
  return executeSkill({
    skill,
    inputs,
    useStreaming: false,
  });
}

/**
 * Validate skill inputs against the schema
 */
export function validateInputs(
  skill: Skill,
  inputs: Record<string, unknown>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!skill.inputSchema) {
    return { valid: true, errors: {} };
  }

  for (const field of skill.inputSchema) {
    const value = inputs[field.name];

    // Check required fields
    if (field.required && (value === undefined || value === null || value === '')) {
      errors[field.name] = `${field.name} is required`;
      continue;
    }

    // Skip validation if value is empty and not required
    if (value === undefined || value === null || value === '') {
      continue;
    }

    // Type validation
    switch (field.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors[field.name] = `${field.name} must be a string`;
        }
        break;
      case 'number':
        if (typeof value !== 'number' || isNaN(value)) {
          errors[field.name] = `${field.name} must be a number`;
        }
        break;
      case 'boolean':
        if (typeof value !== 'boolean') {
          errors[field.name] = `${field.name} must be a boolean`;
        }
        break;
      case 'array':
        if (!Array.isArray(value)) {
          errors[field.name] = `${field.name} must be an array`;
        }
        break;
      case 'object':
        if (typeof value !== 'object' || Array.isArray(value)) {
          errors[field.name] = `${field.name} must be an object`;
        }
        break;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Get default values for skill inputs based on schema
 */
export function getDefaultInputs(skill: Skill): Record<string, unknown> {
  const defaults: Record<string, unknown> = {};

  if (!skill.inputSchema) {
    return defaults;
  }

  for (const field of skill.inputSchema) {
    if (field.default !== undefined) {
      defaults[field.name] = field.default;
    } else {
      // Set type-appropriate empty defaults
      switch (field.type) {
        case 'string':
          defaults[field.name] = '';
          break;
        case 'number':
          defaults[field.name] = 0;
          break;
        case 'boolean':
          defaults[field.name] = false;
          break;
        case 'array':
          defaults[field.name] = [];
          break;
        case 'object':
          defaults[field.name] = {};
          break;
      }
    }
  }

  return defaults;
}

// =============================================================================
// Mock Execution (for development without API key)
// =============================================================================

const MOCK_DELAY_MS = 1500;

/**
 * Mock skill execution for development
 * Simulates API behavior without calling Claude
 */
export async function mockExecuteSkill(
  options: ExecuteSkillOptions
): Promise<ExecutionResult> {
  const { skill, inputs, useStreaming, onStreamChunk, onStatusChange } = options;

  const executionId = generateId();
  const startTime = Date.now();

  onStatusChange?.('running');

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, MOCK_DELAY_MS));

  // Generate mock output based on skill
  const mockOutput = generateMockOutput(skill, inputs);

  if (useStreaming && onStreamChunk) {
    // Simulate streaming by sending chunks
    const words = mockOutput.split(' ');
    for (const word of words) {
      onStreamChunk(word + ' ');
      await new Promise(resolve => setTimeout(resolve, 50));
    }
  }

  const durationMs = Date.now() - startTime;
  const mockTokens = {
    inputTokens: Math.floor(JSON.stringify(inputs).length * 0.25) + 100,
    outputTokens: Math.floor(mockOutput.length * 0.25),
    totalTokens: 0,
  };
  mockTokens.totalTokens = mockTokens.inputTokens + mockTokens.outputTokens;

  onStatusChange?.('completed');

  return {
    executionId,
    status: 'completed',
    output: mockOutput,
    usage: mockTokens,
    durationMs,
    costCents: calculateCostCents(skill.model, mockTokens.inputTokens, mockTokens.outputTokens),
  };
}

function generateMockOutput(skill: Skill, inputs: Record<string, unknown>): string {
  const inputSummary = Object.entries(inputs)
    .map(([key, value]) => `- **${key}**: ${typeof value === 'string' ? value.substring(0, 100) : JSON.stringify(value)}`)
    .join('\n');

  return `## ${skill.name} - Execution Result

This is a **mock execution** for development purposes.

### Input Summary
${inputSummary || '_No inputs provided_'}

### Analysis
The skill "${skill.name}" was executed successfully with the provided inputs. In production, this would contain the actual AI-generated response based on the prompt template.

### Output Format
This result is formatted as **${skill.outputFormat}** as configured in the skill settings.

### Model Information
- Model: \`${skill.model}\`
- Temperature: ${skill.parameters.temperature}
- Max Tokens: ${skill.parameters.max_tokens}

---
*Generated at ${new Date().toISOString()}*`;
}
