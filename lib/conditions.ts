// Condition Evaluation Engine for Reflexes
// Task 3_2: Reflexes Implementation
//
// Evaluates conditions against incoming payloads to determine if a reflex should trigger.
// Supports: equals, contains, startsWith, endsWith, regex, gt, lt, gte, lte, and, or, not

import type { ReflexConditions } from '../types/skills';

// =============================================================================
// Types
// =============================================================================

export type ConditionOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'startsWith'
  | 'endsWith'
  | 'regex'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'exists'
  | 'not_exists'
  | 'in'
  | 'not_in';

export interface ConditionFilter {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | string[];
}

export interface ConditionGroup {
  logic: 'and' | 'or';
  conditions: (ConditionFilter | ConditionGroup)[];
}

export interface EvaluationResult {
  matched: boolean;
  details: {
    field: string;
    operator: string;
    expected: unknown;
    actual: unknown;
    result: boolean;
  }[];
  error?: string;
}

// =============================================================================
// Configuration
// =============================================================================

const MAX_EVALUATION_DEPTH = 10;
const MAX_CONDITIONS_COUNT = 50;
const EXPRESSION_TIMEOUT_MS = 100;

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Safely get a nested property from an object using dot notation
 * e.g., getNestedValue(obj, 'user.address.city')
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || typeof obj !== 'object') return undefined;

  const keys = path.split('.');
  let current: unknown = obj;

  for (const key of keys) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;

    // Handle array indices
    const arrayMatch = key.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      const [, arrayKey, indexStr] = arrayMatch;
      const arr = (current as Record<string, unknown>)[arrayKey];
      if (!Array.isArray(arr)) return undefined;
      const index = parseInt(indexStr, 10);
      current = arr[index];
    } else {
      current = (current as Record<string, unknown>)[key];
    }
  }

  return current;
}

/**
 * Convert a value to string for comparison
 */
function toString(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

/**
 * Convert a value to number for comparison
 */
function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

// =============================================================================
// Operator Implementations
// =============================================================================

const operators: Record<ConditionOperator, (actual: unknown, expected: unknown) => boolean> = {
  equals: (actual, expected) => {
    if (actual === expected) return true;
    // Loose comparison for different types
    return toString(actual).toLowerCase() === toString(expected).toLowerCase();
  },

  not_equals: (actual, expected) => {
    return !operators.equals(actual, expected);
  },

  contains: (actual, expected) => {
    const actualStr = toString(actual).toLowerCase();
    const expectedStr = toString(expected).toLowerCase();
    return actualStr.includes(expectedStr);
  },

  not_contains: (actual, expected) => {
    return !operators.contains(actual, expected);
  },

  startsWith: (actual, expected) => {
    const actualStr = toString(actual);
    const expectedStr = toString(expected);
    return actualStr.startsWith(expectedStr);
  },

  endsWith: (actual, expected) => {
    const actualStr = toString(actual);
    const expectedStr = toString(expected);
    return actualStr.endsWith(expectedStr);
  },

  regex: (actual, expected) => {
    try {
      const actualStr = toString(actual);
      const pattern = toString(expected);
      // Limit regex complexity to prevent ReDoS
      if (pattern.length > 200) return false;
      const regex = new RegExp(pattern, 'i');
      return regex.test(actualStr);
    } catch {
      return false;
    }
  },

  gt: (actual, expected) => {
    const actualNum = toNumber(actual);
    const expectedNum = toNumber(expected);
    if (actualNum === null || expectedNum === null) return false;
    return actualNum > expectedNum;
  },

  gte: (actual, expected) => {
    const actualNum = toNumber(actual);
    const expectedNum = toNumber(expected);
    if (actualNum === null || expectedNum === null) return false;
    return actualNum >= expectedNum;
  },

  lt: (actual, expected) => {
    const actualNum = toNumber(actual);
    const expectedNum = toNumber(expected);
    if (actualNum === null || expectedNum === null) return false;
    return actualNum < expectedNum;
  },

  lte: (actual, expected) => {
    const actualNum = toNumber(actual);
    const expectedNum = toNumber(expected);
    if (actualNum === null || expectedNum === null) return false;
    return actualNum <= expectedNum;
  },

  exists: (actual) => {
    return actual !== null && actual !== undefined;
  },

  not_exists: (actual) => {
    return actual === null || actual === undefined;
  },

  in: (actual, expected) => {
    if (!Array.isArray(expected)) return false;
    const actualStr = toString(actual).toLowerCase();
    return expected.some(item => toString(item).toLowerCase() === actualStr);
  },

  not_in: (actual, expected) => {
    return !operators.in(actual, expected);
  },
};

// =============================================================================
// Evaluation Functions
// =============================================================================

/**
 * Evaluate a single condition filter against a payload
 */
export function evaluateFilter(
  filter: ConditionFilter,
  payload: Record<string, unknown>
): { matched: boolean; actual: unknown } {
  const actual = getNestedValue(payload, filter.field);
  const operatorFn = operators[filter.operator];

  if (!operatorFn) {
    console.warn(`Unknown operator: ${filter.operator}`);
    return { matched: false, actual };
  }

  const matched = operatorFn(actual, filter.value);
  return { matched, actual };
}

/**
 * Evaluate a condition group (with AND/OR logic) against a payload
 */
export function evaluateGroup(
  group: ConditionGroup,
  payload: Record<string, unknown>,
  depth = 0
): boolean {
  // Prevent infinite recursion
  if (depth > MAX_EVALUATION_DEPTH) {
    console.warn('Max evaluation depth exceeded');
    return false;
  }

  const results = group.conditions.map(condition => {
    if ('logic' in condition) {
      // Nested group
      return evaluateGroup(condition, payload, depth + 1);
    } else {
      // Filter
      return evaluateFilter(condition, payload).matched;
    }
  });

  if (group.logic === 'and') {
    return results.every(Boolean);
  } else {
    return results.some(Boolean);
  }
}

/**
 * Evaluate reflex conditions against a payload
 * This is the main entry point for condition evaluation
 */
export function evaluateConditions(
  conditions: ReflexConditions,
  payload: Record<string, unknown>
): EvaluationResult {
  const details: EvaluationResult['details'] = [];
  let matched = true;

  // Check condition count limit
  const filterCount = conditions.filters?.length || 0;
  if (filterCount > MAX_CONDITIONS_COUNT) {
    return {
      matched: false,
      details: [],
      error: `Too many conditions: ${filterCount} (max: ${MAX_CONDITIONS_COUNT})`,
    };
  }

  // Evaluate expression (simple JavaScript-like expression)
  if (conditions.expression) {
    try {
      const expressionResult = evaluateExpression(conditions.expression, payload);
      details.push({
        field: 'expression',
        operator: 'eval',
        expected: conditions.expression,
        actual: expressionResult,
        result: Boolean(expressionResult),
      });
      if (!expressionResult) {
        matched = false;
      }
    } catch (err) {
      return {
        matched: false,
        details,
        error: `Expression error: ${err instanceof Error ? err.message : 'Unknown error'}`,
      };
    }
  }

  // Evaluate filters
  if (conditions.filters && conditions.filters.length > 0) {
    const filterResults = conditions.filters.map(filter => {
      const result = evaluateFilter(
        {
          field: filter.field,
          operator: filter.operator as ConditionOperator,
          value: filter.value,
        },
        payload
      );

      details.push({
        field: filter.field,
        operator: filter.operator,
        expected: filter.value,
        actual: result.actual,
        result: result.matched,
      });

      return result.matched;
    });

    // Apply matchAll logic
    const filtersMatched = conditions.matchAll
      ? filterResults.every(Boolean)
      : filterResults.some(Boolean);

    if (!filtersMatched) {
      matched = false;
    }
  }

  return { matched, details };
}

/**
 * Evaluate a simple expression against a payload
 * Supports: field comparisons, arithmetic, and basic logic
 *
 * Examples:
 *   "data.count > 10"
 *   "user.role == 'admin'"
 *   "file.size < 50000"
 */
export function evaluateExpression(
  expression: string,
  payload: Record<string, unknown>
): boolean {
  // Security: Limit expression length
  if (expression.length > 500) {
    throw new Error('Expression too long');
  }

  // Parse simple comparison expressions
  // Format: field operator value
  const comparisonMatch = expression.match(
    /^([a-zA-Z_][\w.[\]]*)\s*(==|!=|>=|<=|>|<)\s*(.+)$/
  );

  if (comparisonMatch) {
    const [, field, op, valueStr] = comparisonMatch;
    const actual = getNestedValue(payload, field.trim());
    let expected: unknown = valueStr.trim();

    // Parse value
    if (expected === 'true') expected = true;
    else if (expected === 'false') expected = false;
    else if (expected === 'null') expected = null;
    else if (/^['"].*['"]$/.test(expected as string)) {
      expected = (expected as string).slice(1, -1);
    } else if (/^-?\d+(\.\d+)?$/.test(expected as string)) {
      expected = parseFloat(expected as string);
    }

    switch (op) {
      case '==':
        return operators.equals(actual, expected);
      case '!=':
        return operators.not_equals(actual, expected);
      case '>':
        return operators.gt(actual, expected);
      case '>=':
        return operators.gte(actual, expected);
      case '<':
        return operators.lt(actual, expected);
      case '<=':
        return operators.lte(actual, expected);
    }
  }

  // Parse existence check
  // Format: field (truthy check)
  const existsMatch = expression.match(/^!?([a-zA-Z_][\w.[\]]*)$/);
  if (existsMatch) {
    const isNegated = expression.startsWith('!');
    const field = existsMatch[1];
    const value = getNestedValue(payload, field);
    const exists = value !== null && value !== undefined && value !== '' && value !== false;
    return isNegated ? !exists : exists;
  }

  // Unsupported expression format
  throw new Error(`Unsupported expression format: ${expression}`);
}

// =============================================================================
// Validation Functions
// =============================================================================

/**
 * Validate condition filter syntax
 */
export function validateFilter(filter: ConditionFilter): { valid: boolean; error?: string } {
  if (!filter.field || typeof filter.field !== 'string') {
    return { valid: false, error: 'Field name is required' };
  }

  if (!filter.operator || !(filter.operator in operators)) {
    return { valid: false, error: `Invalid operator: ${filter.operator}` };
  }

  // Value is required for most operators
  const noValueOperators: ConditionOperator[] = ['exists', 'not_exists'];
  if (!noValueOperators.includes(filter.operator) && filter.value === undefined) {
    return { valid: false, error: 'Value is required for this operator' };
  }

  // Validate array operators
  const arrayOperators: ConditionOperator[] = ['in', 'not_in'];
  if (arrayOperators.includes(filter.operator) && !Array.isArray(filter.value)) {
    return { valid: false, error: 'Value must be an array for this operator' };
  }

  return { valid: true };
}

/**
 * Validate reflex conditions
 */
export function validateConditions(conditions: ReflexConditions): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (conditions.expression) {
    try {
      // Try to validate expression syntax
      evaluateExpression(conditions.expression, {});
    } catch (err) {
      // Some errors are expected with empty payload, but syntax errors should be caught
      if (err instanceof Error && !err.message.includes('Unsupported')) {
        errors.push(`Expression error: ${err.message}`);
      }
    }
  }

  if (conditions.filters) {
    if (!Array.isArray(conditions.filters)) {
      errors.push('Filters must be an array');
    } else if (conditions.filters.length > MAX_CONDITIONS_COUNT) {
      errors.push(`Too many filters: ${conditions.filters.length} (max: ${MAX_CONDITIONS_COUNT})`);
    } else {
      conditions.filters.forEach((filter, index) => {
        const result = validateFilter({
          field: filter.field,
          operator: filter.operator as ConditionOperator,
          value: filter.value,
        });
        if (!result.valid) {
          errors.push(`Filter ${index + 1}: ${result.error}`);
        }
      });
    }
  }

  return { valid: errors.length === 0, errors };
}

// =============================================================================
// Helper Exports
// =============================================================================

/**
 * Get available operators with descriptions
 */
export function getAvailableOperators(): { value: ConditionOperator; label: string; description: string }[] {
  return [
    { value: 'equals', label: 'Equals', description: 'Value matches exactly' },
    { value: 'not_equals', label: 'Not Equals', description: 'Value does not match' },
    { value: 'contains', label: 'Contains', description: 'Value contains substring' },
    { value: 'not_contains', label: 'Not Contains', description: 'Value does not contain substring' },
    { value: 'startsWith', label: 'Starts With', description: 'Value starts with string' },
    { value: 'endsWith', label: 'Ends With', description: 'Value ends with string' },
    { value: 'regex', label: 'Regex', description: 'Value matches regular expression' },
    { value: 'gt', label: 'Greater Than', description: 'Number is greater than value' },
    { value: 'gte', label: 'Greater or Equal', description: 'Number is greater than or equal to value' },
    { value: 'lt', label: 'Less Than', description: 'Number is less than value' },
    { value: 'lte', label: 'Less or Equal', description: 'Number is less than or equal to value' },
    { value: 'exists', label: 'Exists', description: 'Field has a value' },
    { value: 'not_exists', label: 'Not Exists', description: 'Field does not have a value' },
    { value: 'in', label: 'In List', description: 'Value is in the list' },
    { value: 'not_in', label: 'Not In List', description: 'Value is not in the list' },
  ];
}
