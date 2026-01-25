// SkillHistoryTab Component - Displays execution history for a skill
// Task 2_4: Skill Detail & Edit

import { useEffect } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Coins,
  Zap,
  Calendar,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSkillExecutions } from '../../hooks/useSkillExecutions';
import type { SkillExecution, ExecutionStatus, ExecutionType } from '../../types/skills';

interface SkillHistoryTabProps {
  skillId: string;
}

const STATUS_CONFIG: Record<
  ExecutionStatus,
  { icon: typeof CheckCircle; color: string; bg: string }
> = {
  completed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
  failed: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
  running: { icon: Loader2, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  pending: { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  cancelled: { icon: XCircle, color: 'text-gray-400', bg: 'bg-gray-500/10' },
};

const EXECUTION_TYPE_LABELS: Record<ExecutionType, string> = {
  manual: 'Manual',
  habit: 'Habit',
  reflex: 'Reflex',
  api: 'API',
};

export function SkillHistoryTab({ skillId }: SkillHistoryTabProps) {
  const { executions, isLoading, error, hasMore, fetchExecutions, loadMore } =
    useSkillExecutions();

  useEffect(() => {
    fetchExecutions(skillId);
  }, [skillId, fetchExecutions]);

  if (isLoading && executions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="text-destructive mb-3" size={32} />
        <p className="text-destructive font-medium mb-1">Failed to load history</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => fetchExecutions(skillId)}
          className="mt-4 px-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  if (executions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Clock className="text-muted-foreground mb-3" size={32} />
        <p className="text-foreground font-medium mb-1">No execution history</p>
        <p className="text-sm text-muted-foreground">
          Run this skill to see execution history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {executions.length} execution{executions.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Execution List */}
      <div className="space-y-3">
        {executions.map((execution) => (
          <ExecutionRow key={execution.id} execution={execution} />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={cn(
              'flex items-center gap-2 px-4 py-2',
              'text-sm text-muted-foreground hover:text-foreground',
              'hover:bg-muted rounded-lg transition-colors',
              'disabled:opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <ExternalLink size={14} />
            )}
            Load more
          </button>
        </div>
      )}
    </div>
  );
}

// Execution Row Component
function ExecutionRow({ execution }: { execution: SkillExecution }) {
  const statusConfig = STATUS_CONFIG[execution.status];
  const StatusIcon = statusConfig.icon;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDuration = (ms: number | undefined) => {
    if (!ms) return '-';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTokens = (tokens: number | undefined) => {
    if (!tokens) return '-';
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}k`;
    return tokens.toString();
  };

  return (
    <div className="bg-secondary/50 border border-border rounded-lg p-4">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn('p-1.5 rounded-md', statusConfig.bg)}>
            <StatusIcon
              size={16}
              className={cn(
                statusConfig.color,
                execution.status === 'running' && 'animate-spin'
              )}
            />
          </div>
          <div>
            <span className="text-sm font-medium text-foreground capitalize">
              {execution.status}
            </span>
            <span className="mx-2 text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">
              {EXECUTION_TYPE_LABELS[execution.executionType]}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar size={12} />
          {formatDate(execution.executedAt)}
        </div>
      </div>

      {/* Error Message */}
      {execution.status === 'failed' && execution.errorMessage && (
        <div className="mb-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-xs text-destructive">{execution.errorMessage}</p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock size={12} />
          <span>{formatDuration(execution.durationMs)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap size={12} />
          <span>{formatTokens(execution.tokensUsed)} tokens</span>
        </div>
        {execution.costCents !== undefined && execution.costCents > 0 && (
          <div className="flex items-center gap-1.5">
            <Coins size={12} />
            <span>${(execution.costCents / 100).toFixed(3)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
