import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';

export interface TimeBadgeProps {
  timestamp: Date;
  variant?: 'default' | 'relative' | 'absolute' | 'detailed';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
  locale?: string;
  relative?: boolean;
}

export function TimeBadge({
  timestamp,
  variant = 'default',
  size = 'md',
  showIcon = true,
  className,
  locale = 'it-IT',
  relative = false
}: TimeBadgeProps) {
  const sizeClasses = {
    sm: {
      badge: 'text-xs px-1.5 py-0.5',
      icon: 'h-3 w-3'
    },
    md: {
      badge: 'text-xs px-2 py-1',
      icon: 'h-4 w-4'
    },
    lg: {
      badge: 'text-sm px-3 py-1.5',
      icon: 'h-5 w-5'
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return `${diffSecs}s fa`;
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    return `${diffDays}g fa`;
  };

  const getTimeDisplay = (): string => {
    switch (variant) {
      case 'relative':
        return getRelativeTime(timestamp);
      case 'absolute':
        return timestamp.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      case 'detailed':
        return timestamp.toLocaleString(locale, {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      default:
        return relative ? getRelativeTime(timestamp) : timestamp.toLocaleTimeString(locale, {
          hour: '2-digit',
          minute: '2-digit'
        });
    }
  };

  const isRecent = (): boolean => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    return diffMs < 30000; // 30 secondi
  };

  return (
    <Badge
      variant={isRecent() ? "default" : "secondary"}
      className={cn(
        'flex items-center gap-1 font-mono',
        sizeClasses[size].badge,
        isRecent() && 'bg-primary/10 text-primary border-primary/30',
        className
      )}
      title={timestamp.toLocaleString(locale)}
    >
      {showIcon && (
        <Clock className={cn(
          sizeClasses[size].icon,
          isRecent() && 'animate-pulse'
        )} />
      )}
      {getTimeDisplay()}
    </Badge>
  );
}