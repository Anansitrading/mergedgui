/**
 * SkillHabitsTab Component - Manages scheduled habits for a skill
 * Task 3_1: Habits Implementation
 */

import { useEffect, useState, useCallback } from 'react';
import { Clock, Plus, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { cn } from '../../utils/cn';
import { HabitCard } from './HabitCard';
import { HabitConfigModal } from './HabitConfigModal';
import { useHabits } from '../../hooks/useHabits';
import type { Habit, CreateHabitRequest, UpdateHabitRequest } from '../../types/skills';

// =============================================================================
// Types
// =============================================================================

interface SkillHabitsTabProps {
  skillId: string;
}

// =============================================================================
// Delete Confirmation Dialog
// =============================================================================

interface DeleteHabitDialogProps {
  habit: Habit | null;
  isOpen: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteHabitDialog({
  habit,
  isOpen,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteHabitDialogProps) {
  if (!isOpen || !habit) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isDeleting ? undefined : onClose}
      />
      <div className="relative z-10 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 animate-in fade-in-0 zoom-in-95">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Delete Habit
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Are you sure you want to delete this scheduled habit? This action cannot be undone.
        </p>
        <p className="text-sm text-foreground bg-muted/50 px-3 py-2 rounded-lg mb-6">
          {habit.scheduleDescription || habit.scheduleCron}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {isDeleting && <Loader2 size={14} className="animate-spin" />}
            Delete Habit
          </button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// Main Component
// =============================================================================

export function SkillHabitsTab({ skillId }: SkillHabitsTabProps) {
  const {
    habits,
    isLoading,
    error,
    fetchHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    runNow,
    resetErrors,
    clearError,
  } = useHabits();

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);
  const [isDeletingHabit, setIsDeletingHabit] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch habits on mount
  useEffect(() => {
    fetchHabits(skillId);
  }, [skillId, fetchHabits]);

  // Show toast
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Handle create/update
  const handleSubmit = useCallback(
    async (request: CreateHabitRequest | UpdateHabitRequest, habitId?: string) => {
      if (habitId) {
        await updateHabit(habitId, request as UpdateHabitRequest);
        showToast('Habit updated successfully', 'success');
      } else {
        await createHabit(request as CreateHabitRequest);
        showToast('Habit created successfully', 'success');
      }
    },
    [createHabit, updateHabit, showToast]
  );

  // Handle delete
  const handleDelete = useCallback(async () => {
    if (!deletingHabit) return;

    setIsDeletingHabit(true);
    try {
      await deleteHabit(deletingHabit.id);
      setDeletingHabit(null);
      showToast('Habit deleted successfully', 'success');
    } catch {
      showToast('Failed to delete habit', 'error');
    } finally {
      setIsDeletingHabit(false);
    }
  }, [deletingHabit, deleteHabit, showToast]);

  // Handle toggle
  const handleToggle = useCallback(
    async (habit: Habit) => {
      await toggleHabit(habit);
      showToast(
        habit.isActive ? 'Habit paused' : 'Habit resumed',
        'success'
      );
    },
    [toggleHabit, showToast]
  );

  // Handle run now
  const handleRunNow = useCallback(
    async (habit: Habit) => {
      const result = await runNow(habit.id);
      showToast(result.message, 'success');
    },
    [runNow, showToast]
  );

  // Handle reset errors
  const handleResetErrors = useCallback(
    async (habit: Habit) => {
      await resetErrors(habit.id);
      showToast('Habit errors reset successfully', 'success');
    },
    [resetErrors, showToast]
  );

  // Loading state
  if (isLoading && habits.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  // Error state
  if (error && habits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="text-destructive mb-3" size={32} />
        <p className="text-destructive font-medium mb-1">Failed to load habits</p>
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          onClick={() => {
            clearError();
            fetchHabits(skillId);
          }}
          className="mt-4 px-4 py-2 text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Try again
        </button>
      </div>
    );
  }

  // Active and paused habits
  const activeHabits = habits.filter(h => h.isActive);
  const pausedHabits = habits.filter(h => !h.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-foreground">
            Scheduled Habits
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {habits.length === 0
              ? 'Set up automatic scheduled execution for this skill'
              : `${activeHabits.length} active habit${activeHabits.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg transition-colors"
        >
          <Plus size={14} />
          Add Habit
        </button>
      </div>

      {/* Empty State */}
      {habits.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-border rounded-lg">
          <div className="p-4 bg-muted/50 rounded-xl border border-border mb-4">
            <Clock size={32} className="text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">
            No habits configured
          </h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm">
            Create a habit to automatically run this skill on a schedule.
            Set up daily, weekly, or custom cron schedules.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
          >
            <Plus size={16} />
            Create Your First Habit
          </button>
        </div>
      )}

      {/* Active Habits */}
      {activeHabits.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-primary" />
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Active ({activeHabits.length})
            </h4>
          </div>
          <div className="space-y-2">
            {activeHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={setEditingHabit}
                onDelete={setDeletingHabit}
                onToggle={handleToggle}
                onRunNow={handleRunNow}
                onResetErrors={handleResetErrors}
              />
            ))}
          </div>
        </div>
      )}

      {/* Paused Habits */}
      {pausedHabits.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Paused ({pausedHabits.length})
          </h4>
          <div className="space-y-2">
            {pausedHabits.map(habit => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onEdit={setEditingHabit}
                onDelete={setDeletingHabit}
                onToggle={handleToggle}
                onRunNow={handleRunNow}
                onResetErrors={handleResetErrors}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={cn(
            'fixed bottom-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-bottom-4',
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : 'bg-destructive text-destructive-foreground'
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      <HabitConfigModal
        isOpen={showCreateModal || !!editingHabit}
        onClose={() => {
          setShowCreateModal(false);
          setEditingHabit(null);
        }}
        skillId={skillId}
        existingHabit={editingHabit || undefined}
        onSubmit={handleSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteHabitDialog
        habit={deletingHabit}
        isOpen={!!deletingHabit}
        isDeleting={isDeletingHabit}
        onClose={() => setDeletingHabit(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export default SkillHabitsTab;
