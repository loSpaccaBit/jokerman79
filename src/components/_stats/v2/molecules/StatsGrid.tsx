import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatCounter, type StatCounterProps } from '../atoms';
import { LucideIcon } from 'lucide-react';

export interface StatItem {
  key: string;
  value: number | string;
  label: string;
  variant?: StatCounterProps['variant'];
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
}

export interface StatsGridProps {
  title?: string;
  stats: StatItem[];
  columns?: 2 | 3 | 4 | 6;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
  showHeader?: boolean;
  headerIcon?: LucideIcon;
}

export function StatsGrid({
  title = 'Statistiche',
  stats,
  columns = 3,
  size = 'md',
  variant = 'default',
  className,
  showHeader = true,
  headerIcon: HeaderIcon
}: StatsGridProps) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    6: 'grid-cols-3 md:grid-cols-6'
  };

  const variantClasses = {
    default: 'gap-4',
    compact: 'gap-2',
    detailed: 'gap-6'
  };

  if (variant === 'compact') {
    return (
      <div className={cn(
        'grid gap-2',
        gridClasses[columns],
        className
      )}>
        {stats.map((stat) => (
          <StatCounter
            key={stat.key}
            value={stat.value}
            label={stat.label}
            variant={stat.variant}
            size={size}
            icon={stat.icon}
            trend={stat.trend}
            percentage={stat.percentage}
          />
        ))}
      </div>
    );
  }

  return (
    <Card className={cn('border-primary/20', className)}>
      {showHeader && (
        <CardHeader className="pb-3">
          <CardTitle className="font-tanker text-base flex items-center gap-2">
            {HeaderIcon && <HeaderIcon className="h-4 w-4 text-primary" />}
            {title}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <div className={cn(
          'grid',
          gridClasses[columns],
          variantClasses[variant]
        )}>
          {stats.map((stat) => (
            <StatCounter
              key={stat.key}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
              size={size}
              icon={stat.icon}
              trend={stat.trend}
              percentage={stat.percentage}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}