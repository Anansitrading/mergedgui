/**
 * CronBuilder Component
 * Visual cron expression builder with presets and custom configuration
 */

import { useState, useEffect, useMemo } from 'react';
import { Clock, Calendar, CalendarDays, ChevronDown, Check, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';
import {
  CRON_PRESETS,
  parseCron,
  buildCron,
  validateCron,
  cronToDescription,
  getNextRuns,
  formatNextRun,
  type CronParts,
} from '../../lib/cron';

// =============================================================================
// Types
// =============================================================================

type ScheduleMode = 'preset' | 'custom';
type Frequency = 'hourly' | 'daily' | 'weekly' | 'monthly';

interface CronBuilderProps {
  value: string;
  onChange: (cron: string, description: string) => void;
  error?: string;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const HOURS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`,
}));

const MINUTES = [0, 15, 30, 45].map(m => ({
  value: m,
  label: m.toString().padStart(2, '0'),
}));

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

const DAYS_OF_MONTH = Array.from({ length: 31 }, (_, i) => ({
  value: i + 1,
  label: `${i + 1}${getDaySuffix(i + 1)}`,
}));

function getDaySuffix(day: number): string {
  if (day >= 11 && day <= 13) return 'th';
  switch (day % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

// =============================================================================
// Component
// =============================================================================

export function CronBuilder({ value, onChange, error, disabled }: CronBuilderProps) {
  // Determine if current value matches a preset
  const matchingPreset = useMemo(() =>
    CRON_PRESETS.find(p => p.cron === value),
    [value]
  );

  // State
  const [mode, setMode] = useState<ScheduleMode>(matchingPreset ? 'preset' : 'custom');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(matchingPreset?.id || null);
  const [showPresetDropdown, setShowPresetDropdown] = useState(false);

  // Custom schedule state
  const [frequency, setFrequency] = useState<Frequency>('daily');
  const [hour, setHour] = useState(9);
  const [minute, setMinute] = useState(0);
  const [selectedDaysOfWeek, setSelectedDaysOfWeek] = useState<number[]>([1, 2, 3, 4, 5]); // Mon-Fri
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState(1);

  // Parse current value to populate custom fields
  useEffect(() => {
    if (value && !matchingPreset) {
      const parts = parseCron(value);
      if (parts) {
        // Set minute and hour
        setMinute(parseInt(parts.minute) || 0);
        setHour(parseInt(parts.hour) || 9);

        // Determine frequency
        if (parts.dayOfMonth !== '*' && parts.dayOfWeek === '*') {
          setFrequency('monthly');
          setSelectedDayOfMonth(parseInt(parts.dayOfMonth) || 1);
        } else if (parts.dayOfWeek !== '*') {
          setFrequency('weekly');
          // Parse day of week (could be range like 1-5 or list like 1,3,5)
          if (parts.dayOfWeek.includes('-')) {
            const [start, end] = parts.dayOfWeek.split('-').map(Number);
            setSelectedDaysOfWeek(Array.from({ length: end - start + 1 }, (_, i) => start + i));
          } else if (parts.dayOfWeek.includes(',')) {
            setSelectedDaysOfWeek(parts.dayOfWeek.split(',').map(Number));
          } else {
            setSelectedDaysOfWeek([parseInt(parts.dayOfWeek)]);
          }
        } else if (parts.hour === '*') {
          setFrequency('hourly');
        } else {
          setFrequency('daily');
        }
      }
    }
  }, [value, matchingPreset]);

  // Build cron from custom settings
  const buildCustomCron = (): string => {
    const parts: CronParts = {
      minute: minute.toString(),
      hour: hour.toString(),
      dayOfMonth: '*',
      month: '*',
      dayOfWeek: '*',
    };

    switch (frequency) {
      case 'hourly':
        parts.hour = '*';
        break;
      case 'daily':
        // Already set to defaults
        break;
      case 'weekly':
        if (selectedDaysOfWeek.length === 0) {
          parts.dayOfWeek = '1'; // Default to Monday
        } else if (selectedDaysOfWeek.length === 7) {
          // All days selected = daily
        } else {
          const sorted = [...selectedDaysOfWeek].sort((a, b) => a - b);
          // Check if consecutive
          const isConsecutive = sorted.every((day, i) =>
            i === 0 || day === sorted[i - 1] + 1
          );
          parts.dayOfWeek = isConsecutive && sorted.length > 1
            ? `${sorted[0]}-${sorted[sorted.length - 1]}`
            : sorted.join(',');
        }
        break;
      case 'monthly':
        parts.dayOfMonth = selectedDayOfMonth.toString();
        break;
    }

    return buildCron(parts);
  };

  // Handle preset selection
  const handlePresetSelect = (presetId: string) => {
    const preset = CRON_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPreset(presetId);
      onChange(preset.cron, preset.description);
      setShowPresetDropdown(false);
    }
  };

  // Handle custom schedule change
  const handleCustomChange = () => {
    const newCron = buildCustomCron();
    const description = cronToDescription(newCron);
    onChange(newCron, description);
  };

  // Apply custom changes when custom settings change
  useEffect(() => {
    if (mode === 'custom') {
      handleCustomChange();
    }
  }, [mode, frequency, hour, minute, selectedDaysOfWeek, selectedDayOfMonth]);

  // Toggle day of week
  const toggleDayOfWeek = (day: number) => {
    setSelectedDaysOfWeek(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  // Validation
  const validation = validateCron(value);
  const nextRuns = validation.isValid ? getNextRuns(value, 3) : [];
  const description = validation.isValid ? cronToDescription(value) : '';

  return (
    <div className={cn('space-y-4', disabled && 'opacity-50 pointer-events-none')}>
      {/* Mode Selector */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            setMode('preset');
            if (selectedPreset) {
              const preset = CRON_PRESETS.find(p => p.id === selectedPreset);
              if (preset) onChange(preset.cron, preset.description);
            }
          }}
          className={cn(
            'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors',
            mode === 'preset'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/50'
          )}
        >
          Use Preset
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('custom');
            handleCustomChange();
          }}
          className={cn(
            'flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border transition-colors',
            mode === 'custom'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-secondary text-muted-foreground border-border hover:text-foreground hover:border-primary/50'
          )}
        >
          Custom Schedule
        </button>
      </div>

      {/* Preset Selection */}
      {mode === 'preset' && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowPresetDropdown(!showPresetDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 bg-secondary border border-border rounded-lg text-left hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar size={18} className="text-primary" />
              <div>
                <span className="text-sm font-medium text-foreground">
                  {matchingPreset?.label || 'Select a schedule'}
                </span>
                {matchingPreset && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {matchingPreset.description}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown
              size={16}
              className={cn(
                'text-muted-foreground transition-transform',
                showPresetDropdown && 'rotate-180'
              )}
            />
          </button>

          {showPresetDropdown && (
            <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-64 overflow-y-auto">
              {CRON_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handlePresetSelect(preset.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors',
                    preset.id === selectedPreset && 'bg-primary/10'
                  )}
                >
                  <div>
                    <span className="text-sm font-medium text-foreground">{preset.label}</span>
                    <p className="text-xs text-muted-foreground">{preset.description}</p>
                  </div>
                  {preset.id === selectedPreset && (
                    <Check size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Schedule Builder */}
      {mode === 'custom' && (
        <div className="space-y-4">
          {/* Frequency Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Frequency</label>
            <div className="grid grid-cols-4 gap-2">
              {(['hourly', 'daily', 'weekly', 'monthly'] as Frequency[]).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setFrequency(freq)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-lg border transition-colors capitalize',
                    frequency === freq
                      ? 'bg-primary/10 text-primary border-primary'
                      : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                  )}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Time Selection (not for hourly) */}
          {frequency !== 'hourly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <div className="flex gap-2">
                <select
                  value={hour}
                  onChange={(e) => setHour(parseInt(e.target.value))}
                  className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {HOURS.map(h => (
                    <option key={h.value} value={h.value}>{h.label}</option>
                  ))}
                </select>
                <span className="flex items-center text-muted-foreground">:</span>
                <select
                  value={minute}
                  onChange={(e) => setMinute(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {MINUTES.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Day of Week Selection (for weekly) */}
          {frequency === 'weekly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Days of the Week</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleDayOfWeek(day.value)}
                    className={cn(
                      'px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors',
                      selectedDaysOfWeek.includes(day.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary text-muted-foreground border-border hover:text-foreground'
                    )}
                  >
                    {day.short}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek([1, 2, 3, 4, 5])}
                  className="text-xs text-primary hover:underline"
                >
                  Weekdays
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek([0, 6])}
                  className="text-xs text-primary hover:underline"
                >
                  Weekends
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedDaysOfWeek([0, 1, 2, 3, 4, 5, 6])}
                  className="text-xs text-primary hover:underline"
                >
                  Every day
                </button>
              </div>
            </div>
          )}

          {/* Day of Month Selection (for monthly) */}
          {frequency === 'monthly' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Day of Month</label>
              <select
                value={selectedDayOfMonth}
                onChange={(e) => setSelectedDayOfMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                {DAYS_OF_MONTH.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Schedule Preview */}
      <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-3">
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Schedule Preview</span>
        </div>

        {validation.isValid ? (
          <>
            <p className="text-sm text-foreground">{description}</p>

            {nextRuns.length > 0 && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Next runs:</p>
                <div className="flex flex-wrap gap-2">
                  {nextRuns.map((run, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded text-xs text-muted-foreground"
                    >
                      <CalendarDays size={12} />
                      {formatNextRun(run)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground font-mono">{value}</p>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle size={14} />
            <span className="text-sm">{error || validation.error || 'Invalid cron expression'}</span>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export default CronBuilder;
