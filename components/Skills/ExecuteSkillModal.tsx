/**
 * ExecuteSkillModal Component
 * Modal for executing skills with dynamic input forms and result display
 */

import React, { useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Sparkles,
  AlertCircle,
  Cpu,
  Thermometer,
  FileText,
} from 'lucide-react';
import type { Skill } from '../../types/skills';
import { useSkillExecution } from '../../hooks/useSkillExecution';
import { DynamicInputForm } from './DynamicInputForm';
import { ExecutionResult } from './ExecutionResult';
import { cn } from '../../utils/cn';

interface ExecuteSkillModalProps {
  skill: Skill;
  isOpen: boolean;
  onClose: () => void;
  onExecutionComplete?: () => void;
}

export function ExecuteSkillModal({
  skill,
  isOpen,
  onClose,
  onExecutionComplete,
}: ExecuteSkillModalProps) {
  const {
    status,
    result,
    streamedContent,
    inputs,
    inputErrors,
    updateInput,
    execute,
    reset,
    isExecuting,
    canExecute,
    hasResult,
  } = useSkillExecution({
    skill,
    onSuccess: () => {
      onExecutionComplete?.();
    },
  });

  // Reset when modal opens with new skill
  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, skill.id, reset]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isExecuting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isExecuting, onClose]);

  const handleExecute = useCallback(async () => {
    await execute(true); // Use streaming by default
  }, [execute]);

  const handleRetry = useCallback(async () => {
    reset();
    await execute(true);
  }, [reset, execute]);

  if (!isOpen) return null;

  const showResult = hasResult || status === 'running';
  const showInputForm = !showResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="bg-card border border-border rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Execute Skill
              </h3>
              <p className="text-sm text-muted-foreground">{skill.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExecuting}
            className={cn(
              'p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors',
              isExecuting && 'opacity-50 cursor-not-allowed'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Skill info bar */}
        <div className="flex items-center gap-4 px-4 py-2 bg-muted/30 border-b border-border text-xs text-muted-foreground shrink-0">
          <div className="flex items-center gap-1.5">
            <Cpu size={12} />
            <span>{formatModelName(skill.model)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Thermometer size={12} />
            <span>Temp: {skill.parameters.temperature}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText size={12} />
            <span>Max: {skill.parameters.max_tokens?.toLocaleString()} tokens</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Inactive skill warning */}
          {!skill.isActive && (
            <div className="flex items-start gap-3 p-3 mb-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-400">Skill is Inactive</p>
                <p className="text-xs text-amber-400/80 mt-1">
                  This skill is currently inactive. Activate it from the skill settings to enable execution.
                </p>
              </div>
            </div>
          )}

          {/* Input form */}
          {showInputForm && (
            <div className="space-y-4">
              {skill.description && (
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              )}

              <DynamicInputForm
                schema={skill.inputSchema || []}
                values={inputs}
                onChange={(newInputs) => {
                  Object.entries(newInputs).forEach(([key, value]) => {
                    updateInput(key, value);
                  });
                }}
                errors={inputErrors}
                disabled={isExecuting}
              />
            </div>
          )}

          {/* Execution result */}
          {showResult && (
            <ExecutionResult
              status={status === 'idle' ? 'completed' : status}
              output={result?.output || streamedContent}
              error={result?.error}
              usage={result?.usage}
              durationMs={result?.durationMs}
              costCents={result?.costCents}
              outputFormat={skill.outputFormat}
              isStreaming={status === 'running'}
              onRetry={handleRetry}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border bg-muted/20 shrink-0">
          <div className="text-xs text-muted-foreground">
            {showResult && result?.status === 'completed' && (
              <button
                onClick={reset}
                className="text-primary hover:underline"
              >
                Run again with different inputs
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isExecuting}
              className={cn(
                'px-4 py-2 bg-secondary hover:bg-muted border border-border rounded-lg text-sm font-medium text-foreground transition-colors',
                isExecuting && 'opacity-50 cursor-not-allowed'
              )}
            >
              {hasResult ? 'Close' : 'Cancel'}
            </button>

            {!hasResult && (
              <button
                onClick={handleExecute}
                disabled={!canExecute || isExecuting}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg text-sm font-medium transition-colors shadow-lg shadow-primary/20',
                  (!canExecute || isExecuting) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Execute
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatModelName(model: string): string {
  const modelNames: Record<string, string> = {
    'claude-sonnet-4-20250514': 'Sonnet 4',
    'claude-3-5-sonnet-20241022': 'Sonnet 3.5',
    'claude-3-5-haiku-20241022': 'Haiku 3.5',
    'claude-3-opus-20240229': 'Opus 3',
  };
  return modelNames[model] || model;
}

export default ExecuteSkillModal;
