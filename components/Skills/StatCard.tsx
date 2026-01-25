/**
 * StatCard Component
 * Displays a single statistic with icon and optional trend indicator
 * Task 3_5: Analytics & Polish
 */

import { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
  };
  description?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  description,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card border border-border rounded-lg p-4',
        'hover:border-primary/30 transition-colors',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-sm">
          {trend.direction === 'up' && (
            <TrendingUp size={14} className="text-green-500" />
          )}
          {trend.direction === 'down' && (
            <TrendingDown size={14} className="text-red-500" />
          )}
          {trend.direction === 'neutral' && (
            <Minus size={14} className="text-muted-foreground" />
          )}
          <span
            className={cn(
              trend.direction === 'up' && 'text-green-500',
              trend.direction === 'down' && 'text-red-500',
              trend.direction === 'neutral' && 'text-muted-foreground'
            )}
          >
            {trend.value}
          </span>
          <span className="text-muted-foreground">vs last period</span>
        </div>
      )}
    </div>
  );
}
