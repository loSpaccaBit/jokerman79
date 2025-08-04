import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Activity, Wifi, WifiOff } from 'lucide-react';

export interface LiveIndicatorProps {
  status: 'live' | 'paused' | 'offline' | 'connecting';
  variant?: 'default' | 'minimal' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  showPulse?: boolean;
  className?: string;
  lastUpdate?: Date;
}

export function LiveIndicator({
  status,
  variant = 'default',
  size = 'md',
  showIcon = true,
  showPulse = true,
  className,
  lastUpdate
}: LiveIndicatorProps) {
  const statusConfig = {
    live: {
      label: 'Live',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      badgeVariant: 'default' as const,
      icon: Activity,
      pulse: true
    },
    paused: {
      label: 'In Pausa',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600',
      badgeVariant: 'secondary' as const,
      icon: Activity,
      pulse: false
    },
    offline: {
      label: 'Offline',
      color: 'bg-red-500',
      textColor: 'text-red-600',
      badgeVariant: 'destructive' as const,
      icon: WifiOff,
      pulse: false
    },
    connecting: {
      label: 'Connessione...',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      badgeVariant: 'secondary' as const,
      icon: Wifi,
      pulse: true
    }
  };

  const config = statusConfig[status];
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: {
      badge: 'text-xs px-1.5 py-0.5',
      icon: 'h-3 w-3',
      dot: 'h-2 w-2'
    },
    md: {
      badge: 'text-xs px-2 py-1',
      icon: 'h-4 w-4',
      dot: 'h-3 w-3'
    },
    lg: {
      badge: 'text-sm px-3 py-1.5',
      icon: 'h-5 w-5',
      dot: 'h-4 w-4'
    }
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <div
          className={cn(
            'rounded-full',
            config.color,
            sizeClasses[size].dot,
            showPulse && config.pulse && 'animate-pulse'
          )}
        />
        <span className={cn('text-xs font-medium', config.textColor)}>
          {config.label}
        </span>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className={cn('flex flex-col items-center gap-1 text-center', className)}>
        <div className="flex items-center gap-2">
          {showIcon && (
            <IconComponent
              className={cn(
                sizeClasses[size].icon,
                config.textColor,
                showPulse && config.pulse && 'animate-pulse'
              )}
            />
          )}
          <Badge 
            variant={config.badgeVariant}
            className={cn(
              sizeClasses[size].badge,
              showPulse && config.pulse && 'animate-pulse'
            )}
          >
            {config.label}
          </Badge>
        </div>
        {lastUpdate && (
          <div className="text-xs text-muted-foreground">
            Ultimo: {lastUpdate.toLocaleTimeString('it-IT', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <Badge
      variant={config.badgeVariant}
      className={cn(
        'flex items-center gap-1',
        sizeClasses[size].badge,
        showPulse && config.pulse && 'animate-pulse',
        className
      )}
    >
      {showIcon && (
        <IconComponent className={sizeClasses[size].icon} />
      )}
      {config.label}
    </Badge>
  );
}