import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProcessedGameResult } from '@/types/live-games';
import { 
  ResultDisplay, 
  TimeBadge, 
  LiveIndicator,
  type ResultDisplayProps 
} from '../atoms';

export interface ResultCardProps {
  result: ProcessedGameResult;
  variant?: 'compact' | 'detailed' | 'hero';
  isLatest?: boolean;
  showTime?: boolean;
  showLiveIndicator?: boolean;
  className?: string;
  resultDisplayProps?: Partial<ResultDisplayProps>;
}

export function ResultCard({
  result,
  variant = 'compact',
  isLatest = false,
  showTime = true,
  showLiveIndicator = false,
  className,
  resultDisplayProps = {}
}: ResultCardProps) {
  const variantClasses = {
    compact: 'p-3',
    detailed: 'p-4',
    hero: 'p-6'
  };

  const resultSize = {
    compact: 'md' as const,
    detailed: 'lg' as const,
    hero: 'lg' as const
  };

  return (
    <Card
      className={cn(
        'border-primary/20 transition-all duration-200',
        isLatest && 'bg-gradient-to-r from-primary/5 to-background ring-1 ring-primary/20',
        variant === 'hero' && 'bg-gradient-to-br from-primary/10 via-background to-primary/5',
        className
      )}
    >
      <CardContent className={variantClasses[variant]}>
        {variant === 'hero' ? (
          // Hero layout - centered with large display
          <div className="flex flex-col items-center space-y-4">
            {showLiveIndicator && isLatest && (
              <LiveIndicator 
                status="live" 
                variant="detailed" 
                lastUpdate={new Date(result.timestamp)}
              />
            )}
            
            <ResultDisplay
              result={result.result}
              size={resultSize[variant]}
              variant={isLatest ? 'highlighted' : 'default'}
              multiplier={result.multiplier}
              isLatest={isLatest}
              timestamp={new Date(result.timestamp)}
              {...resultDisplayProps}
            />

            {(result.bonus || result.special) && (
              <div className="text-center">
                <div className="text-sm font-tanker text-primary">
                  {result.bonus ? 'BONUS' : 'SPECIAL'}
                </div>
                {result.multiplier && (
                  <div className="text-xs text-muted-foreground">
                    Moltiplicatore {result.multiplier}x
                  </div>
                )}
              </div>
            )}

            {showTime && (
              <TimeBadge 
                timestamp={new Date(result.timestamp)}
                variant="detailed"
                size="md"
              />
            )}
          </div>
        ) : (
          // Compact/Detailed layout - flexible
          <div className={cn(
            'flex items-center justify-between',
            variant === 'detailed' && 'flex-col space-y-3'
          )}>
            <div className={cn(
              'flex items-center gap-3',
              variant === 'detailed' && 'w-full justify-center'
            )}>
              <ResultDisplay
                result={result.result}
                size={resultSize[variant]}
                variant={isLatest ? 'highlighted' : 'default'}
                multiplier={result.multiplier}
                isLatest={isLatest}
                timestamp={new Date(result.timestamp)}
                {...resultDisplayProps}
              />

              {variant === 'detailed' && (result.bonus || result.special) && (
                <div className="text-center">
                  <div className="text-xs font-tanker text-primary">
                    {result.bonus ? 'BONUS' : 'SPECIAL'}
                  </div>
                </div>
              )}
            </div>

            <div className={cn(
              'flex items-center gap-2',
              variant === 'detailed' && 'w-full justify-center'
            )}>
              {showLiveIndicator && isLatest && (
                <LiveIndicator status="live" variant="minimal" size="sm" />
              )}
              
              {showTime && (
                <TimeBadge 
                  timestamp={new Date(result.timestamp)}
                  variant={variant === 'compact' ? 'default' : 'relative'}
                  size="sm"
                  showIcon={variant === 'detailed'}
                />
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}