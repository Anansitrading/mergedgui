// useReflexes Hook - Data fetching and state management for Reflexes
// Task 3_2: Reflexes Implementation

import { useState, useEffect, useCallback, useMemo } from 'react';
import type {
  Reflex,
  ReflexWithSkill,
  CreateReflexRequest,
  UpdateReflexRequest,
  ReflexTriggerType,
  TriggerConfig,
  ReflexConditions,
} from '../types/skills';
import {
  listReflexes,
  createReflex,
  updateReflex,
  deleteReflex,
  activateReflex,
  deactivateReflex,
  testReflex,
  resetReflexErrors,
  regenerateWebhookSecret,
  getWebhookInfo,
  isReflexesApiError,
} from '../services/reflexesApi';

// =============================================================================
// Types
// =============================================================================

interface UseReflexesOptions {
  skillId?: string;
  triggerType?: ReflexTriggerType;
  isActive?: boolean;
  autoFetch?: boolean;
}

interface UseReflexesReturn {
  reflexes: ReflexWithSkill[];
  loading: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;

  // CRUD operations
  create: (data: CreateReflexRequest) => Promise<Reflex & { webhookUrl?: string }>;
  update: (reflexId: string, data: UpdateReflexRequest) => Promise<Reflex>;
  remove: (reflexId: string) => Promise<void>;

  // Control operations
  activate: (reflexId: string) => Promise<Reflex>;
  deactivate: (reflexId: string) => Promise<Reflex>;
  toggle: (reflexId: string, isActive: boolean) => Promise<Reflex>;
  test: (reflexId: string, payload?: Record<string, unknown>) => Promise<TestResult>;
  resetErrors: (reflexId: string) => Promise<Reflex>;
  regenerateSecret: (reflexId: string) => Promise<{ secret: string }>;

  // Utilities
  refetch: () => Promise<void>;
  getWebhook: (reflexId: string) => Promise<WebhookInfo>;
  clearError: () => void;
}

interface TestResult {
  success: boolean;
  conditionsMatch: boolean;
  executionResult?: {
    output: string;
    tokensUsed: number;
    durationMs: number;
  };
  error?: string;
}

interface WebhookInfo {
  url: string;
  secret: string;
  method: string;
  samplePayload: Record<string, unknown>;
}

// =============================================================================
// Trigger Type Colors & Labels
// =============================================================================

export const TRIGGER_TYPE_CONFIG: Record<
  ReflexTriggerType,
  { label: string; color: { bg: string; text: string }; description: string }
> = {
  webhook: {
    label: 'Webhook',
    color: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
    description: 'Triggered via HTTP webhook URL',
  },
  email: {
    label: 'Email',
    color: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
    description: 'Triggered when matching email is received',
  },
  file_change: {
    label: 'File Change',
    color: { bg: 'bg-green-500/10', text: 'text-green-400' },
    description: 'Triggered when files are modified',
  },
  api_call: {
    label: 'API Call',
    color: { bg: 'bg-orange-500/10', text: 'text-orange-400' },
    description: 'Triggered by API endpoint calls',
  },
  schedule: {
    label: 'Schedule',
    color: { bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
    description: 'Triggered on a schedule (use Habits)',
  },
  event: {
    label: 'Event',
    color: { bg: 'bg-cyan-500/10', text: 'text-cyan-400' },
    description: 'Triggered by system or integration events',
  },
};

// =============================================================================
// Hook Implementation
// =============================================================================

export function useReflexes(options: UseReflexesOptions = {}): UseReflexesReturn {
  const { skillId, triggerType, isActive, autoFetch = true } = options;

  const [reflexes, setReflexes] = useState<ReflexWithSkill[]>([]);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  // Fetch reflexes
  const fetchReflexes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await listReflexes({
        skillId,
        triggerType,
        isActive,
      });

      setReflexes(response.reflexes);
      setTotal(response.total);
      setHasMore(response.hasMore);
    } catch (err) {
      const message = isReflexesApiError(err)
        ? err.message
        : err instanceof Error
          ? err.message
          : 'Failed to fetch reflexes';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [skillId, triggerType, isActive]);

  // Auto-fetch on mount and when options change
  useEffect(() => {
    if (autoFetch) {
      fetchReflexes();
    }
  }, [fetchReflexes, autoFetch]);

  // Create reflex
  const create = useCallback(
    async (data: CreateReflexRequest): Promise<Reflex & { webhookUrl?: string }> => {
      try {
        const newReflex = await createReflex(data);
        await fetchReflexes(); // Refresh list
        return newReflex;
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to create reflex';
        setError(message);
        throw err;
      }
    },
    [fetchReflexes]
  );

  // Update reflex
  const update = useCallback(
    async (reflexId: string, data: UpdateReflexRequest): Promise<Reflex> => {
      try {
        const updatedReflex = await updateReflex(reflexId, data);
        setReflexes((prev) =>
          prev.map((r) =>
            r.id === reflexId ? { ...r, ...updatedReflex } : r
          )
        );
        return updatedReflex;
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to update reflex';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Delete reflex
  const remove = useCallback(
    async (reflexId: string): Promise<void> => {
      try {
        await deleteReflex(reflexId);
        setReflexes((prev) => prev.filter((r) => r.id !== reflexId));
        setTotal((prev) => prev - 1);
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to delete reflex';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Activate reflex
  const activate = useCallback(
    async (reflexId: string): Promise<Reflex> => {
      try {
        const updatedReflex = await activateReflex(reflexId);
        setReflexes((prev) =>
          prev.map((r) =>
            r.id === reflexId ? { ...r, ...updatedReflex } : r
          )
        );
        return updatedReflex;
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to activate reflex';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Deactivate reflex
  const deactivate = useCallback(
    async (reflexId: string): Promise<Reflex> => {
      try {
        const updatedReflex = await deactivateReflex(reflexId);
        setReflexes((prev) =>
          prev.map((r) =>
            r.id === reflexId ? { ...r, ...updatedReflex } : r
          )
        );
        return updatedReflex;
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to deactivate reflex';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Toggle active state
  const toggle = useCallback(
    async (reflexId: string, active: boolean): Promise<Reflex> => {
      return active ? activate(reflexId) : deactivate(reflexId);
    },
    [activate, deactivate]
  );

  // Test reflex
  const test = useCallback(
    async (
      reflexId: string,
      payload?: Record<string, unknown>
    ): Promise<TestResult> => {
      try {
        return await testReflex(reflexId, payload);
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to test reflex';
        throw new Error(message);
      }
    },
    []
  );

  // Reset errors
  const resetErrors = useCallback(
    async (reflexId: string): Promise<Reflex> => {
      try {
        const updatedReflex = await resetReflexErrors(reflexId);
        setReflexes((prev) =>
          prev.map((r) =>
            r.id === reflexId ? { ...r, ...updatedReflex } : r
          )
        );
        return updatedReflex;
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to reset errors';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Regenerate webhook secret
  const regenerateSecret = useCallback(
    async (reflexId: string): Promise<{ secret: string }> => {
      try {
        return await regenerateWebhookSecret(reflexId);
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to regenerate secret';
        setError(message);
        throw err;
      }
    },
    []
  );

  // Get webhook info
  const getWebhook = useCallback(
    async (reflexId: string): Promise<WebhookInfo> => {
      try {
        return await getWebhookInfo(reflexId);
      } catch (err) {
        const message = isReflexesApiError(err)
          ? err.message
          : err instanceof Error
            ? err.message
            : 'Failed to get webhook info';
        throw new Error(message);
      }
    },
    []
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    reflexes,
    loading,
    error,
    total,
    hasMore,
    create,
    update,
    remove,
    activate,
    deactivate,
    toggle,
    test,
    resetErrors,
    regenerateSecret,
    refetch: fetchReflexes,
    getWebhook,
    clearError,
  };
}

// =============================================================================
// Utility Exports
// =============================================================================

/**
 * Helper to format a trigger type for display
 */
export function formatTriggerType(type: ReflexTriggerType): string {
  return TRIGGER_TYPE_CONFIG[type]?.label || type;
}

/**
 * Helper to get trigger config summary for display
 */
export function getTriggerConfigSummary(
  type: ReflexTriggerType,
  config: TriggerConfig
): string {
  switch (type) {
    case 'webhook':
      return 'url' in config ? config.url : 'Webhook endpoint';
    case 'email':
      return 'fromAddress' in config && config.fromAddress
        ? `From: ${config.fromAddress}`
        : 'Email trigger';
    case 'file_change':
      return 'paths' in config && config.paths
        ? config.paths.slice(0, 2).join(', ') + (config.paths.length > 2 ? '...' : '')
        : 'File patterns';
    case 'api_call':
      return 'endpoint' in config ? config.endpoint : 'API endpoint';
    case 'event':
      return 'eventName' in config ? config.eventName : 'Event listener';
    case 'schedule':
      return 'Use Habits for scheduled triggers';
    default:
      return 'Trigger';
  }
}

/**
 * Helper to summarize conditions for display
 */
export function getConditionsSummary(conditions?: ReflexConditions): string {
  if (!conditions) return 'No conditions';

  const parts: string[] = [];

  if (conditions.expression) {
    parts.push(`Expression: ${conditions.expression}`);
  }

  if (conditions.filters && conditions.filters.length > 0) {
    const filterCount = conditions.filters.length;
    const matchType = conditions.matchAll ? 'all' : 'any';
    parts.push(`${filterCount} filter${filterCount > 1 ? 's' : ''} (match ${matchType})`);
  }

  return parts.length > 0 ? parts.join(', ') : 'No conditions';
}
