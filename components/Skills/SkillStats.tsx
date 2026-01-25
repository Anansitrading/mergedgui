/**
 * SkillStats Component
 * Displays execution statistics dashboard with charts
 * Task 3_5: Analytics & Polish
 */

import { useMemo } from 'react';
import {
  Play,
  CheckCircle,
  Zap,
  Clock,
  DollarSign,
  RefreshCw,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useSkillStats } from '../../hooks/useSkillStats';
import { StatCard } from './StatCard';
import { cn } from '../../utils/cn';
import type { StatsPeriod } from '../../services/statsApi';

interface SkillStatsProps {
  skillId?: string;
  className?: string;
}

const PERIOD_OPTIONS: { value: StatsPeriod; label: string }[] = [
  { value: '7d', label: '7 days' },
  { value: '30d', label: '30 days' },
  { value: '90d', label: '90 days' },
];

const CHART_COLORS = {
  primary: 'hsl(var(--primary))',
  success: 'hsl(142.1 76.2% 36.3%)',
  warning: 'hsl(47.9 95.8% 53.1%)',
  error: 'hsl(var(--destructive))',
  muted: 'hsl(var(--muted-foreground))',
};

const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#6366f1'];

export function SkillStats({ skillId, className }: SkillStatsProps) {
  const { stats, loading, error, period, setPeriod, refetch } = useSkillStats({
    skillId,
    period: '30d',
  });

  // Format chart data for area chart
  const chartData = useMemo(() => {
    if (!stats?.executionsOverTime) return [];

    return stats.executionsOverTime.map((d) => ({
      date: new Date(d.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
      executions: d.count,
      success: d.successCount,
      failures: d.failureCount,
    }));
  }, [stats?.executionsOverTime]);

  // Format data for execution type pie chart
  const typeChartData = useMemo(() => {
    if (!stats?.executionsByType) return [];

    return Object.entries(stats.executionsByType)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      }));
  }, [stats?.executionsByType]);

  const formatCost = (cents: number) => {
    if (cents >= 100) {
      return `$${(cents / 100).toFixed(2)}`;
    }
    return `${cents}¢`;
  };

  const formatDuration = (ms: number) => {
    if (ms >= 1000) {
      return `${(ms / 1000).toFixed(1)}s`;
    }
    return `${ms}ms`;
  };

  if (error) {
    return (
      <div className={cn('bg-card border border-border rounded-lg p-6', className)}>
        <div className="flex flex-col items-center justify-center text-center py-8">
          <p className="text-destructive mb-2">Failed to load statistics</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={refetch}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header with period selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {skillId ? 'Skill Analytics' : 'Overall Analytics'}
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
            aria-label="Refresh statistics"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <div className="flex items-center bg-muted rounded-lg p-1">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => setPeriod(option.value)}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                  period === option.value
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Runs"
          value={loading ? '...' : (stats?.overview.totalRuns ?? 0).toLocaleString()}
          icon={<Play size={20} />}
        />
        <StatCard
          label="Success Rate"
          value={loading ? '...' : `${stats?.overview.successRate ?? 0}%`}
          icon={<CheckCircle size={20} />}
        />
        <StatCard
          label="Avg Tokens"
          value={loading ? '...' : (stats?.overview.avgTokens ?? 0).toLocaleString()}
          icon={<Zap size={20} />}
        />
        <StatCard
          label="Avg Duration"
          value={loading ? '...' : formatDuration(stats?.overview.avgDurationMs ?? 0)}
          icon={<Clock size={20} />}
        />
      </div>

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executions over time chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Executions Over Time
          </h4>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorExecutions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.success} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={CHART_COLORS.success} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={{ stroke: 'hsl(var(--border))' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                    width={30}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="executions"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    fill="url(#colorExecutions)"
                    name="Total"
                  />
                  <Area
                    type="monotone"
                    dataKey="success"
                    stroke={CHART_COLORS.success}
                    strokeWidth={2}
                    fill="url(#colorSuccess)"
                    name="Success"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Execution by type pie chart */}
        <div className="bg-card border border-border rounded-lg p-4">
          <h4 className="text-sm font-medium text-foreground mb-4">
            Executions by Type
          </h4>
          <div className="h-64">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <RefreshCw size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {typeChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {typeChartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cost summary */}
      {stats?.overview.totalCostCents !== undefined && (
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-xl font-semibold text-foreground">
                  {formatCost(stats.overview.totalCostCents)}
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Last {period === '7d' ? '7 days' : period === '30d' ? '30 days' : '90 days'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
