import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { StatCounter, LiveIndicator } from '../atoms';
import { Users, TrendingUp, Clock, Activity } from 'lucide-react';

export interface QuickStatsProps {
  totalResults: number;
  playerCount?: number;
  lastUpdate?: Date;
  isLive?: boolean;
  specialEvents?: number;
  variant?: 'horizontal' | 'vertical' | 'grid';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showLiveIndicator?: boolean;
}

export function QuickStats({
  totalResults,
  playerCount,
  lastUpdate,
  isLive = false,
  specialEvents,
  variant = 'horizontal',
  size = 'sm',
  className,
  showLiveIndicator = true
}: QuickStatsProps) {
  const stats = [
    {
      key: 'total',
      value: totalResults,
      label: 'Risultati',
      icon: TrendingUp,
      variant: 'default' as const
    },
    ...(playerCount !== undefined ? [{
      key: 'players',
      value: playerCount,
      label: 'Giocatori',
      icon: Users,
      variant: 'primary' as const
    }] : []),
    ...(specialEvents !== undefined ? [{
      key: 'special',
      value: specialEvents,
      label: 'Eventi Speciali',
      icon: Activity,
      variant: 'success' as const
    }] : [])
  ];

  const layoutClasses = {
    horizontal: 'flex items-center justify-between gap-4 flex-wrap',
    vertical: 'flex flex-col gap-3',
    grid: 'grid grid-cols-2 md:grid-cols-4 gap-3'
  };

  return (
    <Card className={cn('border-primary/20 bg-background/50', className)}>
      <CardContent className="p-4">
        <div className={cn(
          layoutClasses[variant],
          variant === 'horizontal' && 'min-h-[60px]'
        )}>
          {/* Live Indicator */}
          {showLiveIndicator && (
            <div className={cn(
              variant === 'horizontal' && 'order-first',
              variant === 'vertical' && 'self-start',
              variant === 'grid' && 'col-span-full justify-self-start'
            )}>
              <LiveIndicator
                status={isLive ? 'live' : 'offline'}
                variant="detailed"
                size={size}
                lastUpdate={lastUpdate}
              />
            </div>
          )}

          {/* Stats */}
          {stats.map((stat) => (
            <StatCounter
              key={stat.key}
              value={stat.value}
              label={stat.label}
              variant={stat.variant}
              size={size}
              icon={stat.icon}
            />
          ))}

          {/* Last Update Time (if not in live indicator) */}
          {!showLiveIndicator && lastUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {lastUpdate.toLocaleTimeString('it-IT', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}