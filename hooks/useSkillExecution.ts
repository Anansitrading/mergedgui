/**
 * useSkillExecution Hook
 * Manages skill execution state and actions
 */

import { useState, useCallback, useRef } from 'react';
import type { Skill, ExecutionStatus } from '../types/skills';
import {
  executeSkill,
  mockExecuteSkill,
  validateInputs,
  getDefaultInputs,
  type ExecutionResult,
} from '../services/skillExecution';
import { isApiKeyConfigured } from '../services/claudeApi';

interface UseSkillExecutionOptions {
  skill: Skill;
  useMock?: boolean;
  onSuccess?: (result: ExecutionResult) => void;
  onError?: (error: string) => void;
}

interface UseSkillExecutionReturn {
  // State
  status: ExecutionStatus | 'idle';
  result: ExecutionResult | null;
  streamedContent: string;
  inputs: Record<string, unknown>;
  inputErrors: Record<string, string>;

  // Actions
  setInputs: (inputs: Record<string, unknown>) => void;
  updateInput: (name: string, value: unknown) => void;
  execute: (useStreaming?: boolean) => Promise<void>;
  reset: () => void;

  // Computed
  isExecuting: boolean;
  canExecute: boolean;
  hasResult: boolean;
}

export function useSkillExecution(options: UseSkillExecutionOptions): UseSkillExecutionReturn {
  const { skill, useMock, onSuccess, onError } = options;

  // Determine if we should use mock execution
  const shouldUseMock = useMock ?? !isApiKeyConfigured();

  // State
  const [status, setStatus] = useState<ExecutionStatus | 'idle'>('idle');
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [streamedContent, setStreamedContent] = useState('');
  const [inputs, setInputsState] = useState<Record<string, unknown>>(() => getDefaultInputs(skill));
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);

  // Set inputs with validation
  const setInputs = useCallback((newInputs: Record<string, unknown>) => {
    setInputsState(newInputs);
    // Clear errors when inputs change
    setInputErrors({});
  }, []);

  // Update single input
  const updateInput = useCallback((name: string, value: unknown) => {
    setInputsState(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific error when input changes
    setInputErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }, []);

  // Execute skill
  const execute = useCallback(async (useStreaming = false) => {
    // Validate inputs
    const validation = validateInputs(skill, inputs);
    if (!validation.valid) {
      setInputErrors(validation.errors);
      return;
    }

    // Reset state
    setStatus('running');
    setResult(null);
    setStreamedContent('');
    setInputErrors({});

    // Create abort controller
    abortControllerRef.current = new AbortController();

    try {
      const executeFn = shouldUseMock ? mockExecuteSkill : executeSkill;

      const executionResult = await executeFn({
        skill,
        inputs,
        useStreaming,
        onStreamChunk: (chunk) => {
          setStreamedContent(prev => prev + chunk);
        },
        onStatusChange: (newStatus) => {
          setStatus(newStatus);
        },
      });

      setResult(executionResult);

      if (executionResult.status === 'completed') {
        onSuccess?.(executionResult);
      } else if (executionResult.status === 'failed') {
        onError?.(executionResult.error || 'Execution failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setStatus('failed');
      setResult({
        executionId: '',
        status: 'failed',
        error: errorMessage,
        durationMs: 0,
      });
      onError?.(errorMessage);
    }
  }, [skill, inputs, shouldUseMock, onSuccess, onError]);

  // Reset state
  const reset = useCallback(() => {
    // Abort any ongoing execution
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setStatus('idle');
    setResult(null);
    setStreamedContent('');
    setInputErrors({});
    setInputsState(getDefaultInputs(skill));
  }, [skill]);

  // Computed values
  const isExecuting = status === 'pending' || status === 'running';
  const hasResult = result !== null && (result.status === 'completed' || result.status === 'failed');

  // Check if can execute
  const canExecute = !isExecuting && skill.isActive;

  return {
    // State
    status,
    result,
    streamedContent,
    inputs,
    inputErrors,

    // Actions
    setInputs,
    updateInput,
    execute,
    reset,

    // Computed
    isExecuting,
    canExecute,
    hasResult,
  };
}

export default useSkillExecution;
