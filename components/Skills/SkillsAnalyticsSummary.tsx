import { Zap, Play, TrendingUp, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import type { Skill } from '../../types/skills';

interface SkillsAnalyticsSummaryProps {
  skills: Skill[];
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

function StatCard({ label, value, icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trendUp ? 'text-green-500' : 'text-muted-foreground'
            )}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}

export function SkillsAnalyticsSummary({ skills }: SkillsAnalyticsSummaryProps) {
  // Calculate stats
  const totalSkills = skills.length;
  const activeSkills = skills.filter(s => s.isActive).length;
  const totalRuns = skills.reduce((sum, s) => sum + s.executionCount, 0);

  // Find most used skill
  const mostUsed = skills.reduce(
    (max, s) => (s.executionCount > (max?.executionCount || 0) ? s : max),
    null as Skill | null
  );

  // Format large numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        label="Total Skills"
        value={totalSkills}
        icon={<Zap size={16} />}
      />
      <StatCard
        label="Active Skills"
        value={activeSkills}
        icon={<TrendingUp size={16} />}
        trend={totalSkills > 0 ? `${Math.round((activeSkills / totalSkills) * 100)}%` : undefined}
        trendUp={activeSkills > 0}
      />
      <StatCard
        label="Total Runs"
        value={formatNumber(totalRuns)}
        icon={<Play size={16} />}
        trend={totalRuns > 0 ? 'This month' : undefined}
      />
      <StatCard
        label="Most Used"
        value={mostUsed?.name || 'N/A'}
        icon={<Clock size={16} />}
        trend={mostUsed ? `${formatNumber(mostUsed.executionCount)} runs` : undefined}
      />
    </div>
  );
}
