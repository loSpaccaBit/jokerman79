import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface StatCounterProps {
  value: number | string;
  label: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  percentage?: number;
  className?: string;
}

export function StatCounter({
  value,
  label,
  variant = 'default',
  size = 'md',
  icon: Icon,
  trend,
  percentage,
  className
}: StatCounterProps) {
  const sizeClasses = {
    sm: {
      value: 'text-lg',
      label: 'text-xs',
      container: 'p-2'
    },
    md: {
      value: 'text-2xl',
      label: 'text-sm',
      container: 'p-3'
    },
    lg: {
      value: 'text-3xl',
      label: 'text-base',
      container: 'p-4'
    }
  };

  const variantClasses = {
    default: 'text-foreground',
    primary: 'text-primary',
    success: 'text-green-600',
    warning: 'text-orange-600',
    destructive: 'text-red-600'
  };

  const trendClasses = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-muted-foreground'
  };

  return (
    <div
      className={cn(
        'text-center space-y-1 rounded-lg bg-background/50 border border-border/50',
        sizeClasses[size].container,
        className
      )}
    >
      {/* Icon */}
      {Icon && (
        <div className="flex justify-center mb-1">
          <Icon className={cn(
            'h-4 w-4',
            variantClasses[variant]
          )} />
        </div>
      )}

      {/* Value */}
      <div className={cn(
        'font-tanker font-bold leading-none',
        sizeClasses[size].value,
        variantClasses[variant]
      )}>
        {typeof value === 'number' ? value.toLocaleString('it-IT') : value}
      </div>

      {/* Label */}
      <div className={cn(
        'text-muted-foreground leading-tight font-satoshi',
        sizeClasses[size].label
      )}>
        {label}
      </div>

      {/* Percentage/Trend */}
      {(percentage !== undefined || trend) && (
        <div className={cn(
          'text-xs leading-none',
          trend ? trendClasses[trend] : 'text-muted-foreground'
        )}>
          {percentage !== undefined && `${percentage}%`}
          {trend === 'up' && '↗'}
          {trend === 'down' && '↘'}
          {trend === 'neutral' && '→'}
        </div>
      )}
    </div>
  );
}