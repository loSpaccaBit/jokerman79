import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { BarChart3, TrendingUp, Target, Zap } from 'lucide-react';
import { ProcessedGameResult } from '@/types/live-games';

interface HistoricalStatsGridProps {
  results: ProcessedGameResult[];
  className?: string;
}

export function HistoricalStatsGrid({ results, className }: HistoricalStatsGridProps) {
  const recentResults = results.slice(0, 20);
  const totalResults = results.length;
  
  // Calculate statistics
  const specialEvents = results.filter(r => r.bonus || r.special).length;
  const averageMultiplier = results
    .filter(r => r.multiplier && r.multiplier > 1)
    .reduce((acc, r) => acc + (r.multiplier || 1), 0) / 
    Math.max(results.filter(r => r.multiplier && r.multiplier > 1).length, 1);

  // Hot/Cold analysis for numbers
  const numberFrequency = results.reduce((acc, result) => {
    const num = String(result.result);
    if (/^\d+$/.test(num)) {
      acc[num] = (acc[num] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const sortedNumbers = Object.entries(numberFrequency)
    .sort(([,a], [,b]) => b - a);
  
  const hotNumbers = sortedNumbers.slice(0, 3);
  const coldNumbers = sortedNumbers.slice(-3).reverse();

  const getResultDisplay = (result: ProcessedGameResult) => {
    const resultStr = String(result.result);
    
    // Roulette colors
    if (/^\d+$/.test(resultStr)) {
      const num = parseInt(resultStr);
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      
      if (num === 0) return 'bg-green-600 text-white';
      if (redNumbers.includes(num)) return 'bg-red-600 text-white';
      return 'bg-gray-800 text-white';
    }
    
    if (result.bonus || result.special) {
      return 'bg-gradient-to-r from-primary to-yellow-500 text-white';
    }
    
    return 'bg-muted text-foreground';
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-tanker font-bold text-foreground">
              {totalResults}
            </div>
            <div className="text-sm text-muted-foreground">Risultati</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-tanker font-bold text-primary">
              {specialEvents}
            </div>
            <div className="text-sm text-muted-foreground">Eventi Speciali</div>
            <div className="text-xs text-muted-foreground">
              {Math.round((specialEvents / Math.max(totalResults, 1)) * 100)}%
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-tanker font-bold text-green-600">
              {averageMultiplier > 1 ? averageMultiplier.toFixed(1) : '--'}
            </div>
            <div className="text-sm text-muted-foreground">Mult. Medio</div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-tanker font-bold text-blue-600">
              {Math.round((specialEvents / Math.max(totalResults, 1)) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Hit Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Results Pattern */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-tanker text-base flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            Risultati Recenti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-20 gap-2">
            {recentResults.map((result, index) => (
              <div
                key={result.id}
                className={cn(
                  'aspect-square flex items-center justify-center rounded-lg text-xs font-bold transition-transform hover:scale-110 cursor-pointer',
                  getResultDisplay(result),
                  index === 0 && 'ring-2 ring-primary ring-offset-1'
                )}
                title={`${result.result} - ${new Date(result.timestamp).toLocaleTimeString()}`}
              >
                {String(result.result).length > 3 
                  ? String(result.result).substring(0, 2) + '...'
                  : result.result
                }
                {result.multiplier && result.multiplier > 1 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center">
                    <Zap className="h-2 w-2 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hot/Cold Analysis */}
      {sortedNumbers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Hot Numbers */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-tanker text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-red-500" />
                Numeri Caldi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hotNumbers.map(([number, count], index) => (
                  <div key={number} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {number}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((count / totalResults) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cold Numbers */}
          <Card className="border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="font-tanker text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-500" />
                Numeri Freddi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {coldNumbers.map(([number, count], index) => (
                  <div key={number} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="w-8 h-8 flex items-center justify-center">
                        {number}
                      </Badge>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-muted-foreground">{count}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round((count / totalResults) * 100)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}