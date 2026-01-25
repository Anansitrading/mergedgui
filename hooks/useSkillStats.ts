/**
 * useSkillStats Hook
 * Fetches and manages skill execution statistics for analytics dashboard
 * Task 3_5: Analytics & Polish
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSkillStats,
  getAggregatedStats,
  type SkillStatsResponse,
  type StatsPeriod,
} from '../services/statsApi';

interface UseSkillStatsOptions {
  skillId?: string;
  period?: StatsPeriod;
  autoFetch?: boolean;
}

interface UseSkillStatsReturn {
  stats: SkillStatsResponse | null;
  loading: boolean;
  error: string | null;
  period: StatsPeriod;
  setPeriod: (period: StatsPeriod) => void;
  refetch: () => Promise<void>;
}

export function useSkillStats({
  skillId,
  period: initialPeriod = '30d',
  autoFetch = true,
}: UseSkillStatsOptions = {}): UseSkillStatsReturn {
  const [stats, setStats] = useState<SkillStatsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<StatsPeriod>(initialPeriod);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = skillId
        ? await getSkillStats(skillId, period)
        : await getAggregatedStats(period);

      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  }, [skillId, period]);

  useEffect(() => {
    if (autoFetch) {
      fetchStats();
    }
  }, [autoFetch, fetchStats]);

  return {
    stats,
    loading,
    error,
    period,
    setPeriod,
    refetch: fetchStats,
  };
}
