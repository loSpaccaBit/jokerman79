import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export interface ResultDisplayProps {
  result: string | number;
  variant?: 'default' | 'highlighted' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  icon?: string;
  className?: string;
  multiplier?: number;
  isLatest?: boolean;
  timestamp?: Date;
}

export function ResultDisplay({
  result,
  variant = 'default',
  size = 'md',
  showIcon = false,
  icon,
  className,
  multiplier,
  isLatest = false,
  timestamp
}: ResultDisplayProps) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-base'
  };

  const variantClasses = {
    default: 'bg-background border-border text-foreground',
    highlighted: 'bg-primary/10 border-primary/30 text-primary ring-1 ring-primary/20',
    muted: 'bg-muted border-muted-foreground/20 text-muted-foreground'
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-lg border font-medium transition-all duration-200',
        sizeClasses[size],
        variantClasses[variant],
        isLatest && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-10',
        className
      )}
      title={timestamp ? `${result} - ${timestamp.toLocaleTimeString('it-IT')}` : String(result)}
    >
      {/* Icon if provided */}
      {showIcon && icon && (
        <div className="absolute -top-1 -left-1 text-xs">
          {icon}
        </div>
      )}

      {/* Main result */}
      <div className="font-tanker font-bold leading-none">
        {result}
      </div>

      {/* Multiplier indicator */}
      {multiplier && multiplier > 1 && (
        <div className="absolute -top-1 -right-1">
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-bold text-primary-foreground">
            {multiplier}x
          </div>
        </div>
      )}

      {/* Latest indicator */}
      {isLatest && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <Badge variant="secondary" className="text-[8px] px-1 py-0 animate-pulse">
            Live
          </Badge>
        </div>
      )}
    </div>
  );
}