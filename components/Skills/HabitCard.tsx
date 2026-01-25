/**
 * HabitCard Component
 * Displays a habit with schedule, status, and actions
 */

import { useState } from 'react';
import {
  Clock,
  Calendar,
  Play,
  Pause,
  MoreVertical,
  Pencil,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatNextRun, formatLastRun, cronToDescription } from '../../lib/cron';
import type { Habit } from '../../types/skills';

// =============================================================================
// Types
// =============================================================================

interface HabitCardProps {
  habit: Habit;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
  onToggle: (habit: Habit) => Promise<void>;
  onRunNow: (habit: Habit) => Promise<void>;
  onResetErrors: (habit: Habit) => Promise<void>;
}

// =============================================================================
// Component
// =============================================================================

export function HabitCard({
  habit,
  onEdit,
  onDelete,
  onToggle,
  onRunNow,
  onResetErrors,
}: HabitCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const hasErrors = habit.consecutiveFailures > 0;
  const description = habit.scheduleDescription || cronToDescription(habit.scheduleCron);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await onToggle(habit);
    } finally {
      setIsToggling(false);
    }
  };

  const handleRunNow = async () => {
    setIsRunning(true);
    try {
      await onRunNow(habit);
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetErrors = async () => {
    setIsResetting(true);
    try {
      await onResetErrors(habit);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      className={cn(
        'relative bg-secondary/50 border rounded-lg p-4 transition-all',
        habit.isActive ? 'border-border' : 'border-border/50 opacity-75',
        hasErrors && 'border-destructive/50 bg-destructive/5'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Status Indicator */}
          <div
            className={cn(
              'flex-shrink-0 p-2 rounded-lg',
              habit.isActive
                ? hasErrors
                  ? 'bg-destructive/10'
                  : 'bg-primary/10'
                : 'bg-muted'
            )}
          >
            {hasErrors ? (
              <AlertTriangle
                size={18}
                className="text-destructive"
              />
            ) : habit.isActive ? (
              <Clock size={18} className="text-primary" />
            ) : (
              <Pause size={18} className="text-muted-foreground" />
            )}
          </div>

          {/* Schedule Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-foreground truncate">
              {description}
            </h4>
            <div className="flex items-center gap-3 mt-1">
              {habit.isActive && habit.nextRunAt && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar size={12} />
                  Next: {formatNextRun(new Date(habit.nextRunAt))}
                </span>
              )}
              {!habit.isActive && (
                <span className="text-xs text-muted-foreground">Paused</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <MoreVertical size={16} />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div className="absolute right-0 top-8 z-20 w-44 bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    onEdit(habit);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                >
                  <Pencil size={14} />
                  Edit Schedule
                </button>
                <button
                  onClick={() => {
                    handleRunNow();
                    setShowMenu(false);
                  }}
                  disabled={isRunning || !habit.isActive}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                >
                  {isRunning ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Play size={14} />
                  )}
                  Run Now
                </button>
                {hasErrors && (
                  <button
                    onClick={() => {
                      handleResetErrors();
                      setShowMenu(false);
                    }}
                    disabled={isResetting}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-primary hover:bg-muted transition-colors disabled:opacity-50"
                  >
                    {isResetting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RefreshCw size={14} />
                    )}
                    Reset Errors
                  </button>
                )}
                <div className="border-t border-border" />
                <button
                  onClick={() => {
                    onDelete(habit);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete Habit
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {hasErrors && habit.lastErrorMessage && (
        <div className="mt-3 p-2 bg-destructive/10 border border-destructive/20 rounded-md">
          <p className="text-xs text-destructive">
            {habit.consecutiveFailures} consecutive failure{habit.consecutiveFailures > 1 ? 's' : ''}: {habit.lastErrorMessage}
          </p>
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {/* Run Count */}
          <span className="flex items-center gap-1">
            <CheckCircle size={12} />
            {habit.runCount} run{habit.runCount !== 1 ? 's' : ''}
          </span>

          {/* Last Run */}
          {habit.lastRunAt && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Last: {formatLastRun(new Date(habit.lastRunAt))}
            </span>
          )}

          {/* Timezone */}
          <span className="hidden sm:inline text-muted-foreground/70">
            {habit.timezone}
          </span>
        </div>

        {/* Toggle Button */}
        <button
          onClick={handleToggle}
          disabled={isToggling}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
            habit.isActive
              ? 'text-muted-foreground hover:text-foreground hover:bg-muted'
              : 'text-primary hover:bg-primary/10'
          )}
        >
          {isToggling ? (
            <Loader2 size={12} className="animate-spin" />
          ) : habit.isActive ? (
            <Pause size={12} />
          ) : (
            <Play size={12} />
          )}
          {habit.isActive ? 'Pause' : 'Resume'}
        </button>
      </div>
    </div>
  );
}

export default HabitCard;
