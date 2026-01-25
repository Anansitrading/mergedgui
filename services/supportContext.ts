/**
 * Support Context Service
 * Task 3_4: Support Chat AI Integration
 *
 * Fetches user context for personalized AI support responses
 */

import { listSkills, getSkillStats } from './skillsApi';
import { listHabits } from './habitsApi';
import { listReflexes } from './reflexesApi';
import { listExecutions } from './executionsApi';
import type { SupportContext } from '../lib/supportPrompt';

/**
 * Fetch user context for support chat personalization
 * Aggregates data from various services to provide context to the AI
 */
export async function getUserSupportContext(): Promise<SupportContext> {
  try {
    // Fetch all data in parallel for performance
    const [
      skillsResponse,
      skillStats,
      habitsResponse,
      reflexesResponse,
      executionsResponse,
    ] = await Promise.all([
      listSkills({ pageSize: 1 }).catch(() => ({ total: 0 })),
      getSkillStats().catch(() => null),
      listHabits().catch(() => ({ habits: [] })),
      listReflexes().catch(() => ({ reflexes: [] })),
      listExecutions({ limit: 5 }).catch(() => ({ executions: [] })),
    ]);

    // Format recent activity from executions
    const recentActivity = formatRecentActivity(executionsResponse.executions || []);

    return {
      projectCount: skillStats?.totalSkills || 0, // Using skills as a proxy for project activity
      skillsCount: skillsResponse.total || skillStats?.activeSkills || 0,
      habitsCount: habitsResponse.habits?.length || 0,
      reflexesCount: reflexesResponse.reflexes?.length || 0,
      recentActivity,
    };
  } catch (error) {
    console.error('Error fetching support context:', error);
    // Return default context on error
    return {
      projectCount: 0,
      skillsCount: 0,
      habitsCount: 0,
      reflexesCount: 0,
      recentActivity: [],
    };
  }
}

/**
 * Format recent executions into human-readable activity strings
 */
function formatRecentActivity(executions: Array<{
  id: string;
  skillId?: string;
  status: string;
  executedAt: Date;
  executionType?: string;
  skill?: { name: string };
}>): string[] {
  if (!executions || executions.length === 0) {
    return [];
  }

  return executions.slice(0, 5).map(exec => {
    const timeAgo = formatTimeAgo(exec.executedAt);
    const type = exec.executionType || 'manual';
    const status = exec.status === 'completed' ? 'completed' : exec.status;
    const skillName = exec.skill?.name ? `"${exec.skill.name}"` : 'Skill';
    return `${skillName} execution (${type}) ${status} ${timeAgo}`;
  });
}

/**
 * Format a date as a relative time string
 */
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return then.toLocaleDateString();
}

/**
 * Cached context with TTL for performance
 */
let cachedContext: SupportContext | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache

/**
 * Get user context with caching
 * Prevents excessive API calls when sending multiple messages
 */
export async function getCachedUserSupportContext(): Promise<SupportContext> {
  const now = Date.now();

  if (cachedContext && (now - cacheTimestamp) < CACHE_TTL_MS) {
    return cachedContext;
  }

  cachedContext = await getUserSupportContext();
  cacheTimestamp = now;

  return cachedContext;
}

/**
 * Clear the context cache (useful when user data changes)
 */
export function clearSupportContextCache(): void {
  cachedContext = null;
  cacheTimestamp = 0;
}
