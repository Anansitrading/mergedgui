/**
 * HabitConfigModal Component
 * Modal for creating and editing habit schedules
 */

import { useState, useEffect, useRef } from 'react';
import { X, Loader2, Clock, Globe } from 'lucide-react';
import { cn } from '../../utils/cn';
import { CronBuilder } from './CronBuilder';
import { timezoneData, detectUserTimezone, getTimezone } from '../../lib/timezones';
import { cronToDescription, validateCron } from '../../lib/cron';
import type { Habit, CreateHabitRequest, UpdateHabitRequest } from '../../types/skills';

// =============================================================================
// Types
// =============================================================================

interface HabitConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  skillId: string;
  existingHabit?: Habit;
  onSubmit: (
    request: CreateHabitRequest | UpdateHabitRequest,
    habitId?: string
  ) => Promise<void>;
}

// =============================================================================
// Component
// =============================================================================

export function HabitConfigModal({
  isOpen,
  onClose,
  skillId,
  existingHabit,
  onSubmit,
}: HabitConfigModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [scheduleCron, setScheduleCron] = useState(existingHabit?.scheduleCron || '0 9 * * 1-5');
  const [scheduleDescription, setScheduleDescription] = useState(
    existingHabit?.scheduleDescription || ''
  );
  const [timezone, setTimezone] = useState(
    existingHabit?.timezone || detectUserTimezone()
  );
  const [isActive, setIsActive] = useState(existingHabit?.isActive ?? true);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTimezoneDropdown, setShowTimezoneDropdown] = useState(false);
  const [timezoneSearch, setTimezoneSearch] = useState('');

  // Reset form when modal opens/closes or habit changes
  useEffect(() => {
    if (isOpen) {
      setScheduleCron(existingHabit?.scheduleCron || '0 9 * * 1-5');
      setScheduleDescription(existingHabit?.scheduleDescription || '');
      setTimezone(existingHabit?.timezone || detectUserTimezone());
      setIsActive(existingHabit?.isActive ?? true);
      setError(null);
    }
  }, [isOpen, existingHabit]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle cron change from builder
  const handleCronChange = (cron: string, description: string) => {
    setScheduleCron(cron);
    setScheduleDescription(description);
    setError(null);
  };

  // Filter timezones
  const filteredTimezones = timezoneData
    .map(group => ({
      ...group,
      timezones: group.timezones.filter(
        tz =>
          tz.label.toLowerCase().includes(timezoneSearch.toLowerCase()) ||
          tz.value.toLowerCase().includes(timezoneSearch.toLowerCase())
      ),
    }))
    .filter(group => group.timezones.length > 0);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate cron
    const validation = validateCron(scheduleCron);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid schedule');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (existingHabit) {
        // Update existing habit
        const updates: UpdateHabitRequest = {
          scheduleCron,
          scheduleDescription: scheduleDescription || cronToDescription(scheduleCron),
          timezone,
          isActive,
        };
        await onSubmit(updates, existingHabit.id);
      } else {
        // Create new habit
        const request: CreateHabitRequest = {
          skillId,
          scheduleCron,
          scheduleDescription: scheduleDescription || cronToDescription(scheduleCron),
          timezone,
          isActive,
          config: {},
        };
        await onSubmit(request);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const selectedTimezone = getTimezone(timezone);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="habit-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden',
          'bg-card border border-border rounded-xl shadow-2xl',
          'flex flex-col',
          'animate-in fade-in-0 zoom-in-95 duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Clock size={18} className="text-primary" />
            </div>
            <h2
              id="habit-modal-title"
              className="text-lg font-semibold text-foreground"
            >
              {existingHabit ? 'Edit Habit' : 'Create Habit'}
            </h2>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Schedule Builder */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Schedule</label>
              <CronBuilder
                value={scheduleCron}
                onChange={handleCronChange}
                disabled={isSubmitting}
              />
            </div>

            {/* Timezone Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Timezone</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowTimezoneDropdown(!showTimezoneDropdown)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg text-left hover:border-primary/50 transition-colors disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium text-foreground">
                        {selectedTimezone?.label || timezone}
                      </span>
                      {selectedTimezone && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({selectedTimezone.offset})
                        </span>
                      )}
                    </div>
                  </div>
                </button>

                {showTimezoneDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowTimezoneDropdown(false)}
                    />
                    <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-hidden">
                      {/* Search */}
                      <div className="p-2 border-b border-border">
                        <input
                          type="text"
                          value={timezoneSearch}
                          onChange={(e) => setTimezoneSearch(e.target.value)}
                          placeholder="Search timezones..."
                          className="w-full px-3 py-2 bg-secondary border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                          autoFocus
                        />
                      </div>

                      {/* Timezone List */}
                      <div className="max-h-48 overflow-y-auto">
                        {filteredTimezones.map(group => (
                          <div key={group.region}>
                            <div className="px-3 py-2 bg-muted/50 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              {group.region}
                            </div>
                            {group.timezones.map(tz => (
                              <button
                                key={tz.value}
                                type="button"
                                onClick={() => {
                                  setTimezone(tz.value);
                                  setShowTimezoneDropdown(false);
                                  setTimezoneSearch('');
                                }}
                                className={cn(
                                  'w-full flex items-center justify-between px-4 py-2 text-left hover:bg-muted/50 transition-colors',
                                  tz.value === timezone && 'bg-primary/10'
                                )}
                              >
                                <span className="text-sm text-foreground">{tz.label}</span>
                                <span className="text-xs text-muted-foreground">{tz.offset}</span>
                              </button>
                            ))}
                          </div>
                        ))}
                        {filteredTimezones.length === 0 && (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            No timezones found
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <label className="text-sm font-medium text-foreground">Active</label>
                <p className="text-xs text-muted-foreground">
                  Enable scheduled execution for this habit
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                disabled={isSubmitting}
                className={cn(
                  'relative inline-flex w-11 h-6 shrink-0 cursor-pointer rounded-full',
                  'transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  isActive ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'pointer-events-none inline-block h-4 w-4 transform rounded-full',
                    'bg-white shadow-lg transition-transform duration-200',
                    isActive ? 'translate-x-6' : 'translate-x-1',
                    'mt-1'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {existingHabit ? 'Save Changes' : 'Create Habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default HabitConfigModal;
