/**
 * Cron Expression Utilities
 * Handles parsing, validation, description generation, and next run calculation
 * Cron format: minute hour day-of-month month day-of-week
 */

import type { CronValidation } from '../types/skills';

// =============================================================================
// Types
// =============================================================================

export interface CronParts {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
}

export interface CronPreset {
  id: string;
  label: string;
  description: string;
  cron: string;
}

// =============================================================================
// Constants
// =============================================================================

const MINUTE_RANGE = { min: 0, max: 59 };
const HOUR_RANGE = { min: 0, max: 23 };
const DAY_OF_MONTH_RANGE = { min: 1, max: 31 };
const MONTH_RANGE = { min: 1, max: 12 };
const DAY_OF_WEEK_RANGE = { min: 0, max: 6 };

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CRON_PRESETS: CronPreset[] = [
  { id: 'daily-9am', label: 'Daily at 9:00 AM', description: 'Every day at 9:00 AM', cron: '0 9 * * *' },
  { id: 'daily-6pm', label: 'Daily at 6:00 PM', description: 'Every day at 6:00 PM', cron: '0 18 * * *' },
  { id: 'weekdays-9am', label: 'Weekdays at 9:00 AM', description: 'Monday to Friday at 9:00 AM', cron: '0 9 * * 1-5' },
  { id: 'weekdays-6pm', label: 'Weekdays at 6:00 PM', description: 'Monday to Friday at 6:00 PM', cron: '0 18 * * 1-5' },
  { id: 'weekly-monday', label: 'Weekly on Monday', description: 'Every Monday at 9:00 AM', cron: '0 9 * * 1' },
  { id: 'weekly-friday', label: 'Weekly on Friday', description: 'Every Friday at 6:00 PM', cron: '0 18 * * 5' },
  { id: 'monthly-1st', label: 'Monthly on 1st', description: 'First day of every month at 9:00 AM', cron: '0 9 1 * *' },
  { id: 'monthly-15th', label: 'Monthly on 15th', description: '15th of every month at 9:00 AM', cron: '0 9 15 * *' },
  { id: 'hourly', label: 'Every hour', description: 'At the start of every hour', cron: '0 * * * *' },
  { id: 'every-30-min', label: 'Every 30 minutes', description: 'Every 30 minutes', cron: '*/30 * * * *' },
];

// =============================================================================
// Parsing Functions
// =============================================================================

/**
 * Parse cron expression into parts
 */
export function parseCron(cron: string): CronParts | null {
  const trimmed = cron.trim();
  const parts = trimmed.split(/\s+/);

  if (parts.length !== 5) {
    return null;
  }

  return {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4],
  };
}

/**
 * Build cron expression from parts
 */
export function buildCron(parts: CronParts): string {
  return `${parts.minute} ${parts.hour} ${parts.dayOfMonth} ${parts.month} ${parts.dayOfWeek}`;
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate a single cron field value
 */
function validateField(value: string, range: { min: number; max: number }): boolean {
  // Wildcard
  if (value === '*') return true;

  // Step values (e.g., */5, 1-10/2)
  if (value.includes('/')) {
    const [rangeOrWildcard, step] = value.split('/');
    const stepNum = parseInt(step, 10);
    if (isNaN(stepNum) || stepNum < 1) return false;

    if (rangeOrWildcard === '*') return true;

    // Validate range before step
    return validateField(rangeOrWildcard, range);
  }

  // Range (e.g., 1-5)
  if (value.includes('-')) {
    const [start, end] = value.split('-');
    const startNum = parseInt(start, 10);
    const endNum = parseInt(end, 10);

    if (isNaN(startNum) || isNaN(endNum)) return false;
    if (startNum < range.min || startNum > range.max) return false;
    if (endNum < range.min || endNum > range.max) return false;
    if (startNum > endNum) return false;

    return true;
  }

  // List (e.g., 1,3,5)
  if (value.includes(',')) {
    const items = value.split(',');
    return items.every(item => validateField(item.trim(), range));
  }

  // Single value
  const num = parseInt(value, 10);
  if (isNaN(num)) return false;
  return num >= range.min && num <= range.max;
}

/**
 * Validate a complete cron expression
 */
export function validateCron(cron: string): CronValidation {
  const parts = parseCron(cron);

  if (!parts) {
    return {
      isValid: false,
      error: 'Cron expression must have exactly 5 parts (minute hour day month weekday)',
    };
  }

  // Validate each field
  if (!validateField(parts.minute, MINUTE_RANGE)) {
    return { isValid: false, error: 'Invalid minute value (0-59)' };
  }
  if (!validateField(parts.hour, HOUR_RANGE)) {
    return { isValid: false, error: 'Invalid hour value (0-23)' };
  }
  if (!validateField(parts.dayOfMonth, DAY_OF_MONTH_RANGE)) {
    return { isValid: false, error: 'Invalid day of month value (1-31)' };
  }
  if (!validateField(parts.month, MONTH_RANGE)) {
    return { isValid: false, error: 'Invalid month value (1-12)' };
  }
  if (!validateField(parts.dayOfWeek, DAY_OF_WEEK_RANGE)) {
    return { isValid: false, error: 'Invalid day of week value (0-6)' };
  }

  // Get next runs for preview
  const nextRuns = getNextRuns(cron, 5);

  return {
    isValid: true,
    nextRuns,
  };
}

// =============================================================================
// Description Functions
// =============================================================================

/**
 * Format time in 12-hour format
 */
function formatTime(hour: number, minute: number): string {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

/**
 * Parse field to get list of values
 */
function parseFieldToValues(value: string, range: { min: number; max: number }): number[] {
  if (value === '*') {
    return Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i);
  }

  if (value.includes('/')) {
    const [rangeOrWildcard, step] = value.split('/');
    const stepNum = parseInt(step, 10);
    const baseValues = rangeOrWildcard === '*'
      ? Array.from({ length: range.max - range.min + 1 }, (_, i) => range.min + i)
      : parseFieldToValues(rangeOrWildcard, range);

    return baseValues.filter((_, i) => i % stepNum === 0);
  }

  if (value.includes('-')) {
    const [start, end] = value.split('-').map(v => parseInt(v, 10));
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  if (value.includes(',')) {
    return value.split(',').flatMap(item => parseFieldToValues(item.trim(), range));
  }

  return [parseInt(value, 10)];
}

/**
 * Generate human-readable description from cron expression
 */
export function cronToDescription(cron: string): string {
  const parts = parseCron(cron);
  if (!parts) return 'Invalid cron expression';

  const minutes = parseFieldToValues(parts.minute, MINUTE_RANGE);
  const hours = parseFieldToValues(parts.hour, HOUR_RANGE);
  const daysOfMonth = parseFieldToValues(parts.dayOfMonth, DAY_OF_MONTH_RANGE);
  const months = parseFieldToValues(parts.month, MONTH_RANGE);
  const daysOfWeek = parseFieldToValues(parts.dayOfWeek, DAY_OF_WEEK_RANGE);

  const isEveryMinute = parts.minute === '*';
  const isEveryHour = parts.hour === '*';
  const isEveryDay = parts.dayOfMonth === '*' && parts.dayOfWeek === '*';
  const isEveryMonth = parts.month === '*';
  const isEveryWeekday = parts.dayOfWeek === '*';

  // Build description parts
  const descParts: string[] = [];

  // Time description
  if (isEveryMinute && isEveryHour) {
    descParts.push('Every minute');
  } else if (isEveryMinute) {
    descParts.push(`Every minute during hour${hours.length > 1 ? 's' : ''} ${hours.join(', ')}`);
  } else if (parts.minute.includes('/')) {
    const step = parts.minute.split('/')[1];
    if (isEveryHour) {
      descParts.push(`Every ${step} minutes`);
    } else {
      descParts.push(`Every ${step} minutes during hour${hours.length > 1 ? 's' : ''} ${hours.join(', ')}`);
    }
  } else if (isEveryHour) {
    descParts.push(`At minute ${minutes[0]} of every hour`);
  } else if (hours.length === 1 && minutes.length === 1) {
    descParts.push(`At ${formatTime(hours[0], minutes[0])}`);
  } else {
    descParts.push(`At ${formatTime(hours[0], minutes[0])}`);
  }

  // Day of week description
  if (!isEveryWeekday) {
    if (daysOfWeek.length === 5 &&
        daysOfWeek.includes(1) && daysOfWeek.includes(2) &&
        daysOfWeek.includes(3) && daysOfWeek.includes(4) &&
        daysOfWeek.includes(5)) {
      descParts.push('on weekdays');
    } else if (daysOfWeek.length === 2 && daysOfWeek.includes(0) && daysOfWeek.includes(6)) {
      descParts.push('on weekends');
    } else if (daysOfWeek.length === 1) {
      descParts.push(`on ${DAY_NAMES[daysOfWeek[0]]}`);
    } else {
      descParts.push(`on ${daysOfWeek.map(d => DAY_NAMES_SHORT[d]).join(', ')}`);
    }
  }

  // Day of month description (only if weekday is *)
  if (isEveryWeekday && !isEveryDay) {
    if (daysOfMonth.length === 1) {
      const day = daysOfMonth[0];
      const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
      descParts.push(`on the ${day}${suffix}`);
    } else if (daysOfMonth.length < 5) {
      descParts.push(`on days ${daysOfMonth.join(', ')}`);
    }
  }

  // Month description
  if (!isEveryMonth) {
    if (months.length === 1) {
      descParts.push(`in ${MONTH_NAMES[months[0] - 1]}`);
    } else {
      descParts.push(`in ${months.map(m => MONTH_NAMES[m - 1]).join(', ')}`);
    }
  }

  return descParts.join(' ');
}

// =============================================================================
// Next Run Calculation
// =============================================================================

/**
 * Check if a value matches a cron field
 */
function matchesCronField(value: number, field: string, range: { min: number; max: number }): boolean {
  if (field === '*') return true;

  if (field.includes('/')) {
    const [rangeOrWildcard, step] = field.split('/');
    const stepNum = parseInt(step, 10);

    if (rangeOrWildcard === '*') {
      return (value - range.min) % stepNum === 0;
    }

    const values = parseFieldToValues(rangeOrWildcard, range);
    const matchingValues = values.filter((_, i) => i % stepNum === 0);
    return matchingValues.includes(value);
  }

  const allowedValues = parseFieldToValues(field, range);
  return allowedValues.includes(value);
}

/**
 * Get the next run time for a cron expression
 */
export function getNextRun(cron: string, after: Date = new Date()): Date | null {
  const parts = parseCron(cron);
  if (!parts) return null;

  // Start from the next minute
  const next = new Date(after);
  next.setSeconds(0);
  next.setMilliseconds(0);
  next.setMinutes(next.getMinutes() + 1);

  // Limit search to 1 year
  const maxDate = new Date(after);
  maxDate.setFullYear(maxDate.getFullYear() + 1);

  while (next < maxDate) {
    const minute = next.getMinutes();
    const hour = next.getHours();
    const dayOfMonth = next.getDate();
    const month = next.getMonth() + 1;
    const dayOfWeek = next.getDay();

    // Check if all fields match
    const minuteMatch = matchesCronField(minute, parts.minute, MINUTE_RANGE);
    const hourMatch = matchesCronField(hour, parts.hour, HOUR_RANGE);
    const dayOfMonthMatch = matchesCronField(dayOfMonth, parts.dayOfMonth, DAY_OF_MONTH_RANGE);
    const monthMatch = matchesCronField(month, parts.month, MONTH_RANGE);
    const dayOfWeekMatch = matchesCronField(dayOfWeek, parts.dayOfWeek, DAY_OF_WEEK_RANGE);

    // Day matching: either day of month OR day of week (unless both are *)
    const dayMatch =
      (parts.dayOfMonth === '*' && parts.dayOfWeek === '*') ? true :
      (parts.dayOfMonth !== '*' && parts.dayOfWeek === '*') ? dayOfMonthMatch :
      (parts.dayOfMonth === '*' && parts.dayOfWeek !== '*') ? dayOfWeekMatch :
      (dayOfMonthMatch || dayOfWeekMatch);

    if (minuteMatch && hourMatch && dayMatch && monthMatch) {
      return next;
    }

    // Increment based on what didn't match
    if (!monthMatch) {
      // Jump to next month
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setHours(0);
      next.setMinutes(0);
    } else if (!dayMatch) {
      // Jump to next day
      next.setDate(next.getDate() + 1);
      next.setHours(0);
      next.setMinutes(0);
    } else if (!hourMatch) {
      // Jump to next hour
      next.setHours(next.getHours() + 1);
      next.setMinutes(0);
    } else {
      // Increment minute
      next.setMinutes(next.getMinutes() + 1);
    }
  }

  return null;
}

/**
 * Get the next N run times for a cron expression
 */
export function getNextRuns(cron: string, count: number = 5, after: Date = new Date()): Date[] {
  const runs: Date[] = [];
  let current = after;

  for (let i = 0; i < count; i++) {
    const nextRun = getNextRun(cron, current);
    if (!nextRun) break;
    runs.push(nextRun);
    current = nextRun;
  }

  return runs;
}

// =============================================================================
// Formatting Functions
// =============================================================================

/**
 * Format date for display
 */
export function formatNextRun(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.round(diff / (60 * 1000));
    return `in ${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `in ${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    return `in ${days} day${days !== 1 ? 's' : ''}`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Format relative time since last run
 */
export function formatLastRun(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.round(diff / (60 * 1000));
    if (minutes < 1) return 'just now';
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.round(diff / (60 * 60 * 1000));
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.round(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
