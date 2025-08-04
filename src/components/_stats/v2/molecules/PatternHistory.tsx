import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProcessedGameResult } from '@/types/live-games';
import { ResultDisplay } from '../atoms';
import { TrendingUp } from 'lucide-react';

export interface PatternHistoryProps {
  results: ProcessedGameResult[];
  maxResults?: number;
  variant?: 'timeline' | 'compact' | 'detailed';
  className?: string;
  title?: string;
  showTitle?: boolean;
  getPatternColor?: (result: ProcessedGameResult) => string;
  getPatternIcon?: (result: ProcessedGameResult) => string;
}

export function PatternHistory({
  results,
  maxResults = 20,
  variant = 'timeline',
  className,
  title = 'Pattern Recenti',
  showTitle = true,
  getPatternColor,
  getPatternIcon
}: PatternHistoryProps) {
  const displayResults = results.slice(0, maxResults);

  const getDefaultPatternColor = (result: ProcessedGameResult): string => {
    if (result.bonus || result.special) return 'bg-primary text-primary-foreground';
    
    const resultStr = String(result.result).toUpperCase();
    
    // Default color mapping for common game types
    if (['1', '2', '5', '10'].includes(resultStr)) {
      const colors = {
        '1': 'bg-blue-600 text-white',
        '2': 'bg-green-600 text-white',
        '5': 'bg-orange-600 text-white',
        '10': 'bg-red-600 text-white'
      };
      return colors[resultStr as keyof typeof colors] || 'bg-muted text-muted-foreground';
    }
    
    return 'bg-muted text-muted-foreground';
  };

  const getDefaultPatternIcon = (result: ProcessedGameResult): string => {
    if (result.bonus) return '⭐';
    if (result.special) return '✨';
    return String(result.result);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex flex-wrap gap-1', className)}>
        {displayResults.map((result, index) => {
          const isLatest = index === 0;
          const color = getPatternColor?.(result) || getDefaultPatternColor(result);
          const icon = getPatternIcon?.(result) || getDefaultPatternIcon(result);
          
          return (
            <div
              key={result.id}
              className={cn(
                'w-8 h-8 text-xs font-bold flex items-center justify-center rounded-lg transition-all duration-200',
                color,
                isLatest && 'ring-2 ring-primary ring-offset-1 scale-110'
              )}
              title={`${result.result} - ${new Date(result.timestamp).toLocaleTimeString()}`}
            >
              {icon}
            </div>
          );
        })}
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <Card className={cn('border-primary/20', className)}>
        {showTitle && (
          <CardHeader className="pb-3">
            <CardTitle className="font-tanker text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              {title}
            </CardTitle>
          </CardHeader>
        )}
        
        <CardContent>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
            {displayResults.map((result, index) => (
              <ResultDisplay
                key={result.id}
                result={result.result}
                size="md"
                variant={index === 0 ? 'highlighted' : 'default'}
                multiplier={result.multiplier}
                isLatest={index === 0}
                timestamp={new Date(result.timestamp)}
                showIcon={result.bonus || result.special}
                icon={result.bonus ? '⭐' : result.special ? '✨' : undefined}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Timeline variant (default)
  return (
    <Card className={cn('border-primary/20', className)}>
      {showTitle && (
        <CardHeader className="pb-3">
          <CardTitle className="font-tanker text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            {title}
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
          
          {/* Timeline items */}
          <div className="space-y-4">
            {displayResults.map((result, index) => {
              const isLatest = index === 0;
              
              return (
                <div key={result.id} className="relative flex items-center gap-4">
                  {/* Timeline dot */}
                  <div className={cn(
                    'relative z-10 w-8 h-8 rounded-full border-2 bg-background flex items-center justify-center',
                    isLatest ? 'border-primary bg-primary/10' : 'border-border'
                  )}>
                    <div className={cn(
                      'w-3 h-3 rounded-full',
                      isLatest ? 'bg-primary animate-pulse' : 'bg-muted-foreground'
                    )} />
                  </div>
                  
                  {/* Result content */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <ResultDisplay
                      result={result.result}
                      size="sm"
                      variant={isLatest ? 'highlighted' : 'default'}
                      multiplier={result.multiplier}
                      showIcon={result.bonus || result.special}
                      icon={result.bonus ? '⭐' : result.special ? '✨' : undefined}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          Risultato: {result.result}
                        </span>
                        {(result.bonus || result.special) && (
                          <span className="text-xs text-primary font-medium">
                            {result.bonus ? 'BONUS' : 'SPECIAL'}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleString('it-IT', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}