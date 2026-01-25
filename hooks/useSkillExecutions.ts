// useSkillExecutions Hook - Fetches execution history for a skill
// Task 2_4: Skill Detail & Edit

import { useState, useCallback } from 'react';
import type { SkillExecution, ExecutionStatus } from '../types/skills';

interface UseSkillExecutionsReturn {
  executions: SkillExecution[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  fetchExecutions: (skillId: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearExecutions: () => void;
}

// Mock execution data for development
const MOCK_EXECUTIONS: Record<string, SkillExecution[]> = {
  '1': [
    {
      id: 'exec-1-1',
      skillId: '1',
      userId: 'user-1',
      executionType: 'manual',
      input: { content: 'Sample document text...' },
      output: 'This document discusses...',
      tokensUsed: 1250,
      promptTokens: 450,
      completionTokens: 800,
      durationMs: 2340,
      costCents: 2,
      status: 'completed' as ExecutionStatus,
      executedAt: new Date('2025-01-24T10:30:00'),
      completedAt: new Date('2025-01-24T10:30:02'),
    },
    {
      id: 'exec-1-2',
      skillId: '1',
      userId: 'user-1',
      executionType: 'manual',
      input: { content: 'Another document...' },
      output: 'Summary of the document...',
      tokensUsed: 980,
      promptTokens: 380,
      completionTokens: 600,
      durationMs: 1890,
      costCents: 1,
      status: 'completed' as ExecutionStatus,
      executedAt: new Date('2025-01-23T14:15:00'),
      completedAt: new Date('2025-01-23T14:15:02'),
    },
    {
      id: 'exec-1-3',
      skillId: '1',
      userId: 'user-1',
      executionType: 'habit',
      referenceId: 'habit-1',
      status: 'failed' as ExecutionStatus,
      errorMessage: 'Rate limit exceeded',
      errorCode: 'RATE_LIMITED',
      executedAt: new Date('2025-01-22T09:00:00'),
    },
  ],
  '2': [
    {
      id: 'exec-2-1',
      skillId: '2',
      userId: 'user-1',
      executionType: 'manual',
      input: { language: 'typescript', code: 'function hello() {}' },
      output: 'The code looks good...',
      tokensUsed: 2100,
      promptTokens: 600,
      completionTokens: 1500,
      durationMs: 3450,
      costCents: 3,
      status: 'completed' as ExecutionStatus,
      executedAt: new Date('2025-01-24T16:45:00'),
      completedAt: new Date('2025-01-24T16:45:03'),
    },
  ],
};

const DEFAULT_PAGE_SIZE = 10;

export function useSkillExecutions(): UseSkillExecutionsReturn {
  const [executions, setExecutions] = useState<SkillExecution[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [currentSkillId, setCurrentSkillId] = useState<string | null>(null);

  const fetchExecutions = useCallback(async (skillId: string) => {
    setIsLoading(true);
    setError(null);
    setCurrentSkillId(skillId);

    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/skill-executions?skillId=${skillId}&limit=${DEFAULT_PAGE_SIZE}`);
      // const data = await response.json();
      // setExecutions(data.executions);
      // setHasMore(data.hasMore);

      await new Promise(resolve => setTimeout(resolve, 300));
      const mockData = MOCK_EXECUTIONS[skillId] || [];
      setExecutions(mockData);
      setHasMore(mockData.length >= DEFAULT_PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch executions');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async () => {
    if (!currentSkillId || isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Replace with actual API call with offset
      await new Promise(resolve => setTimeout(resolve, 300));
      setHasMore(false); // Mock: no more data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more executions');
    } finally {
      setIsLoading(false);
    }
  }, [currentSkillId, isLoading, hasMore]);

  const clearExecutions = useCallback(() => {
    setExecutions([]);
    setCurrentSkillId(null);
    setHasMore(false);
    setError(null);
  }, []);

  return {
    executions,
    isLoading,
    error,
    hasMore,
    fetchExecutions,
    loadMore,
    clearExecutions,
  };
}

export default useSkillExecutions;
