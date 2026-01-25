/**
 * Stats API Service
 * Handles skill execution statistics aggregation for analytics dashboard
 * Task 3_5: Analytics & Polish
 */

import type {
  ExecutionStatus,
  ExecutionType,
} from '../types/skills';

// =============================================================================
// Types
// =============================================================================

export interface SkillStatsOverview {
  totalRuns: number;
  successRate: number;
  avgTokens: number;
  avgDurationMs: number;
  totalCostCents: number;
}

export interface DailyExecution {
  date: string;
  count: number;
  successCount: number;
  failureCount: number;
  tokens: number;
  costCents: number;
}

export interface SkillStatsResponse {
  overview: SkillStatsOverview;
  executionsOverTime: DailyExecution[];
  executionsByType: Record<ExecutionType, number>;
  executionsByStatus: Record<ExecutionStatus, number>;
}

export type StatsPeriod = '7d' | '30d' | '90d';

// =============================================================================
// Configuration
// =============================================================================

const MOCK_DELAY_MS = 400;

const delay = (ms: number = MOCK_DELAY_MS) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// =============================================================================
// Mock Data Generation
// =============================================================================

function generateMockDailyData(days: number): DailyExecution[] {
  const data: DailyExecution[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    // Generate realistic-looking data with some variation
    const baseCount = Math.floor(Math.random() * 15) + 5;
    const successRate = 0.75 + Math.random() * 0.2; // 75-95% success rate
    const successCount = Math.floor(baseCount * successRate);
    const failureCount = baseCount - successCount;
    const avgTokensPerRun = Math.floor(Math.random() * 400) + 300;
    const tokens = baseCount * avgTokensPerRun;
    const costCents = Math.floor(tokens * 0.003);

    data.push({
      date: dateStr,
      count: baseCount,
      successCount,
      failureCount,
      tokens,
      costCents,
    });
  }

  return data;
}

function calculateOverviewFromDaily(daily: DailyExecution[]): SkillStatsOverview {
  const totalRuns = daily.reduce((sum, d) => sum + d.count, 0);
  const totalSuccess = daily.reduce((sum, d) => sum + d.successCount, 0);
  const totalTokens = daily.reduce((sum, d) => sum + d.tokens, 0);
  const totalCostCents = daily.reduce((sum, d) => sum + d.costCents, 0);

  return {
    totalRuns,
    successRate: totalRuns > 0 ? Math.round((totalSuccess / totalRuns) * 100) : 0,
    avgTokens: totalRuns > 0 ? Math.round(totalTokens / totalRuns) : 0,
    avgDurationMs: totalRuns > 0 ? Math.floor(Math.random() * 1000) + 800 : 0, // Mock average duration
    totalCostCents,
  };
}

// =============================================================================
// API Functions
// =============================================================================

/**
 * Get skill statistics for a specific skill
 */
export async function getSkillStats(
  skillId: string,
  period: StatsPeriod = '30d'
): Promise<SkillStatsResponse> {
  await delay();

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const executionsOverTime = generateMockDailyData(days);
  const overview = calculateOverviewFromDaily(executionsOverTime);

  // Generate execution breakdown by type
  const executionsByType: Record<ExecutionType, number> = {
    manual: Math.floor(overview.totalRuns * 0.4),
    habit: Math.floor(overview.totalRuns * 0.35),
    reflex: Math.floor(overview.totalRuns * 0.2),
    api: Math.floor(overview.totalRuns * 0.05),
  };

  // Generate execution breakdown by status
  const failedCount = Math.floor(overview.totalRuns * (1 - overview.successRate / 100));
  const executionsByStatus: Record<ExecutionStatus, number> = {
    completed: overview.totalRuns - failedCount,
    failed: failedCount,
    pending: 0,
    running: 0,
    cancelled: Math.floor(failedCount * 0.1),
  };

  return {
    overview,
    executionsOverTime,
    executionsByType,
    executionsByStatus,
  };
}

/**
 * Get aggregated statistics for all skills
 */
export async function getAggregatedStats(
  period: StatsPeriod = '30d'
): Promise<SkillStatsResponse & { skillBreakdown: { skillId: string; name: string; runs: number }[] }> {
  await delay();

  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
  const executionsOverTime = generateMockDailyData(days);

  // Multiply by a factor for aggregated stats
  const aggregatedDaily = executionsOverTime.map((d) => ({
    ...d,
    count: d.count * 3,
    successCount: d.successCount * 3,
    failureCount: d.failureCount * 3,
    tokens: d.tokens * 3,
    costCents: d.costCents * 3,
  }));

  const overview = calculateOverviewFromDaily(aggregatedDaily);

  const executionsByType: Record<ExecutionType, number> = {
    manual: Math.floor(overview.totalRuns * 0.35),
    habit: Math.floor(overview.totalRuns * 0.4),
    reflex: Math.floor(overview.totalRuns * 0.18),
    api: Math.floor(overview.totalRuns * 0.07),
  };

  const failedCount = Math.floor(overview.totalRuns * (1 - overview.successRate / 100));
  const executionsByStatus: Record<ExecutionStatus, number> = {
    completed: overview.totalRuns - failedCount,
    failed: failedCount,
    pending: 0,
    running: 0,
    cancelled: Math.floor(failedCount * 0.1),
  };

  // Mock skill breakdown
  const skillBreakdown = [
    { skillId: 'skill-001', name: 'Code Review Assistant', runs: Math.floor(overview.totalRuns * 0.35) },
    { skillId: 'skill-002', name: 'Documentation Generator', runs: Math.floor(overview.totalRuns * 0.25) },
    { skillId: 'skill-003', name: 'SQL Query Builder', runs: Math.floor(overview.totalRuns * 0.2) },
    { skillId: 'skill-004', name: 'Email Composer', runs: Math.floor(overview.totalRuns * 0.12) },
    { skillId: 'skill-005', name: 'Data Analyzer', runs: Math.floor(overview.totalRuns * 0.08) },
  ];

  return {
    overview,
    executionsOverTime: aggregatedDaily,
    executionsByType,
    executionsByStatus,
    skillBreakdown,
  };
}

/**
 * Get performance percentiles for a skill
 */
export async function getPerformancePercentiles(
  skillId?: string
): Promise<{
  p50DurationMs: number;
  p90DurationMs: number;
  p99DurationMs: number;
  avgDurationMs: number;
}> {
  await delay();

  // Generate realistic performance data
  const baseDuration = 800 + Math.random() * 400;

  return {
    avgDurationMs: Math.floor(baseDuration),
    p50DurationMs: Math.floor(baseDuration * 0.9),
    p90DurationMs: Math.floor(baseDuration * 1.5),
    p99DurationMs: Math.floor(baseDuration * 2.2),
  };
}

/**
 * Get cost projection for upcoming period
 */
export async function getCostProjection(
  daysAhead: number = 30
): Promise<{
  projectedCostCents: number;
  projectedRuns: number;
  averageDailyCost: number;
}> {
  await delay();

  const avgDailyRuns = Math.floor(Math.random() * 20) + 10;
  const avgTokensPerRun = Math.floor(Math.random() * 200) + 400;
  const costPerToken = 0.003;

  const projectedRuns = avgDailyRuns * daysAhead;
  const projectedCostCents = Math.floor(projectedRuns * avgTokensPerRun * costPerToken);
  const averageDailyCost = Math.floor(projectedCostCents / daysAhead);

  return {
    projectedCostCents,
    projectedRuns,
    averageDailyCost,
  };
}
