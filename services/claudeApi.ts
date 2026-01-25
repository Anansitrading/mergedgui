/**
 * Claude API Integration Service
 * Handles calls to the Anthropic Claude API for skill execution
 */

import Anthropic from '@anthropic-ai/sdk';
import type { SkillParameters } from '../types/skills';

// =============================================================================
// Types
// =============================================================================

export interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ClaudeResponse {
  id: string;
  content: string;
  model: string;
  stopReason: string | null;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
}

export interface ClaudeApiError {
  code: string;
  message: string;
  retryable: boolean;
  statusCode?: number;
}

export interface ClaudeRequestOptions {
  model: string;
  messages: ClaudeMessage[];
  parameters?: SkillParameters;
  systemPrompt?: string;
}

// =============================================================================
// Configuration
// =============================================================================

const DEFAULT_PARAMETERS: SkillParameters = {
  temperature: 1,
  max_tokens: 4096,
};

export const CLAUDE_MODELS = [
  { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4', description: 'Fast and intelligent' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', description: 'Best for most tasks' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', description: 'Fastest, cost-effective' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus', description: 'Most capable' },
] as const;

// =============================================================================
// Client Management
// =============================================================================

let anthropicClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      dangerouslyAllowBrowser: true,
    });
  }
  return anthropicClient;
}

export function isApiKeyConfigured(): boolean {
  return Boolean(import.meta.env.VITE_ANTHROPIC_API_KEY);
}

// =============================================================================
// API Functions
// =============================================================================

export async function callClaude(options: ClaudeRequestOptions): Promise<ClaudeResponse> {
  const client = getClient();
  const params = { ...DEFAULT_PARAMETERS, ...options.parameters };

  try {
    const response = await client.messages.create({
      model: options.model,
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature,
      top_p: params.top_p,
      top_k: params.top_k,
      stop_sequences: params.stop_sequences,
      system: options.systemPrompt,
      messages: options.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    const textContent = response.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('\n');

    return {
      id: response.id,
      content: textContent,
      model: response.model,
      stopReason: response.stop_reason,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
        totalTokens: response.usage.input_tokens + response.usage.output_tokens,
      },
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

export async function* streamClaude(
  options: ClaudeRequestOptions
): AsyncGenerator<{ type: 'text' | 'done'; content?: string; response?: ClaudeResponse }> {
  const client = getClient();
  const params = { ...DEFAULT_PARAMETERS, ...options.parameters };

  try {
    const stream = client.messages.stream({
      model: options.model,
      max_tokens: params.max_tokens || 4096,
      temperature: params.temperature,
      top_p: params.top_p,
      top_k: params.top_k,
      stop_sequences: params.stop_sequences,
      system: options.systemPrompt,
      messages: options.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        yield { type: 'text', content: event.delta.text };
      }
    }

    const finalMessage = await stream.finalMessage();
    const textContent = finalMessage.content
      .filter(block => block.type === 'text')
      .map(block => (block as { type: 'text'; text: string }).text)
      .join('\n');

    yield {
      type: 'done',
      response: {
        id: finalMessage.id,
        content: textContent,
        model: finalMessage.model,
        stopReason: finalMessage.stop_reason,
        usage: {
          inputTokens: finalMessage.usage.input_tokens,
          outputTokens: finalMessage.usage.output_tokens,
          totalTokens: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
        },
      },
    };
  } catch (error) {
    throw normalizeError(error);
  }
}

// =============================================================================
// Prompt Building
// =============================================================================

export function buildPromptFromTemplate(
  template: string,
  inputs: Record<string, unknown>
): string {
  let result = template;

  for (const [key, value] of Object.entries(inputs)) {
    const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    result = result.replace(placeholder, stringValue);
  }

  return result;
}

export function extractTemplateVariables(template: string): string[] {
  const matches = template.match(/\{\{\s*([^}\s]+)\s*\}\}/g) || [];
  return [...new Set(matches.map(m => m.replace(/\{\{\s*|\s*\}\}/g, '')))];
}

// =============================================================================
// Error Handling
// =============================================================================

function normalizeError(error: unknown): ClaudeApiError {
  if (error instanceof Anthropic.APIError) {
    const isRetryable = error.status === 429 || error.status === 503 || error.status === 500;

    let code = 'API_ERROR';
    let message = error.message;

    if (error.status === 401) {
      code = 'INVALID_API_KEY';
      message = 'Invalid API key. Please check your configuration.';
    } else if (error.status === 429) {
      code = 'RATE_LIMITED';
      message = 'Rate limit exceeded. Please try again later.';
    } else if (error.status === 503) {
      code = 'SERVICE_UNAVAILABLE';
      message = 'Claude API is temporarily unavailable. Please try again.';
    } else if (error.status === 400) {
      code = 'BAD_REQUEST';
      message = error.message || 'Invalid request to Claude API.';
    }

    return { code, message, retryable: isRetryable, statusCode: error.status };
  }

  if (error instanceof Error) {
    return { code: 'UNKNOWN_ERROR', message: error.message, retryable: false };
  }

  return { code: 'UNKNOWN_ERROR', message: 'An unknown error occurred', retryable: false };
}

export function isClaudeApiError(error: unknown): error is ClaudeApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    'retryable' in error
  );
}

// =============================================================================
// Retry Logic
// =============================================================================

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
};

export async function callClaudeWithRetry(
  options: ClaudeRequestOptions,
  retryOptions?: RetryOptions
): Promise<ClaudeResponse> {
  const { maxRetries, baseDelay, maxDelay } = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };

  let lastError: ClaudeApiError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await callClaude(options);
    } catch (error) {
      if (isClaudeApiError(error)) {
        lastError = error;

        if (!error.retryable || attempt >= maxRetries) {
          throw error;
        }

        const delay = Math.min(baseDelay * Math.pow(2, attempt) + Math.random() * 1000, maxDelay);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }

  throw lastError || { code: 'MAX_RETRIES', message: 'Max retries exceeded', retryable: false };
}
