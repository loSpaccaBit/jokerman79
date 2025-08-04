import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';

interface CurrentGameStatsProps {
  latestResult?: string | number;
  roundId?: string;
  timeSinceLastResult?: number; // seconds
  trend?: 'up' | 'down' | 'neutral';
  multiplier?: number;
  isSpecial?: boolean;
  className?: string;
}

export function CurrentGameStats({
  latestResult,
  roundId,
  timeSinceLastResult,
  trend,
  multiplier,
  isSpecial = false,
  className
}: CurrentGameStatsProps) {
  const formatTimeAgo = (seconds?: number) => {
    if (!seconds) return '--';
    if (seconds < 60) return `${seconds}s fa`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m fa`;
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getResultDisplay = () => {
    if (latestResult === undefined || latestResult === null) {
      return {
        value: '--',
        className: 'text-muted-foreground'
      };
    }

    const resultStr = String(latestResult);
    
    // Roulette number colors
    if (/^\d+$/.test(resultStr)) {
      const num = parseInt(resultStr);
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      
      if (num === 0) {
        return {
          value: resultStr,
          className: 'roulette-green px-3 py-1 rounded-lg'
        };
      } else if (redNumbers.includes(num)) {
        return {
          value: resultStr,
          className: 'roulette-red px-3 py-1 rounded-lg'
        };
      } else {
        return {
          value: resultStr,
          className: 'roulette-black px-3 py-1 rounded-lg'
        };
      }
    }

    // Special results
    if (isSpecial) {
      return {
        value: resultStr,
        className: 'special-event px-3 py-1 rounded-lg'
      };
    }

    return {
      value: resultStr,
      className: 'text-foreground bg-muted px-3 py-1 rounded-lg'
    };
  };

  const resultDisplay = getResultDisplay();

  return (
    <Card className={cn('border-primary/20', className)}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Latest Result - Hero Display */}
          <div className="text-center space-y-2">
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Ultimo Risultato
            </div>
            
            <div className="flex items-center justify-center gap-3">
              <div className={cn(
                'text-4xl md:text-5xl font-tanker font-bold transition-all duration-300',
                resultDisplay.className
              )}>
                {resultDisplay.value}
              </div>
              
              {multiplier && multiplier > 1 && (
                <div className="flex items-center gap-1 text-primary">
                  <Zap className="h-5 w-5" />
                  <span className="text-xl font-bold">{multiplier}x</span>
                </div>
              )}
            </div>

            {isSpecial && (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                ⭐ EVENTO SPECIALE
              </Badge>
            )}
          </div>

          {/* Meta Information */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/50">
            {/* Round ID */}
            {roundId && (
              <div className="text-center space-y-1">
                <div className="text-xs text-muted-foreground uppercase tracking-wide">
                  Round ID
                </div>
                <div className="font-mono text-sm text-foreground">
                  {roundId}
                </div>
              </div>
            )}

            {/* Time Since Last Result */}
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Aggiornato
              </div>
              <div className="font-medium text-sm text-foreground">
                {formatTimeAgo(timeSinceLastResult)}
              </div>
            </div>

            {/* Trend */}
            <div className="text-center space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Trend
              </div>
              <div className="flex items-center justify-center">
                {getTrendIcon()}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}