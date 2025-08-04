import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ProcessedGameResult, GameType } from '@/types/live-games';
import { StatsGrid, type StatItem } from '../molecules';
import { AnimatedSection } from '@/components/animations/AnimatedSection';
import { TrendingUp, BarChart3, PieChart, Target } from 'lucide-react';

export interface AnalyticsSectionProps {
  results: ProcessedGameResult[];
  gameType: GameType;
  className?: string;
  variant?: 'detailed' | 'compact' | 'dashboard';
  showDistribution?: boolean;
  showTrends?: boolean;
  showPerformance?: boolean;
  customAnalytics?: StatItem[];
}

export function AnalyticsSection({
  results,
  gameType,
  className,
  variant = 'detailed',
  showDistribution = true,
  showTrends = true,
  showPerformance = true,
  customAnalytics = []
}: AnalyticsSectionProps) {
  // Calculate basic statistics
  const totalResults = results.length;
  const specialEvents = results.filter(r => r.bonus || r.special).length;
  const averageMultiplier = results
    .filter(r => r.multiplier && r.multiplier > 1)
    .reduce((acc, r) => acc + (r.multiplier || 1), 0) / 
    Math.max(results.filter(r => r.multiplier && r.multiplier > 1).length, 1);

  // Game-specific analytics
  const getGameSpecificStats = (): StatItem[] => {
    if (gameType.includes('ROULETTE')) {
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const reds = results.filter(r => {
        const num = parseInt(String(r.result));
        return !isNaN(num) && redNumbers.includes(num);
      }).length;
      const blacks = results.filter(r => {
        const num = parseInt(String(r.result));
        return !isNaN(num) && num !== 0 && !redNumbers.includes(num);
      }).length;
      const zeros = results.filter(r => String(r.result) === '0').length;

      return [
        { key: 'red', value: reds, label: 'Rosso', variant: 'destructive', percentage: Math.round((reds / totalResults) * 100) },
        { key: 'black', value: blacks, label: 'Nero', variant: 'default', percentage: Math.round((blacks / totalResults) * 100) },
        { key: 'zero', value: zeros, label: 'Zero', variant: 'success', percentage: Math.round((zeros / totalResults) * 100) }
      ];
    }

    if (gameType.includes('CARD') || gameType === 'BLACKJACK' || gameType === 'BACCARAT') {
      const playerWins = results.filter(r => String(r.result).toUpperCase().includes('PLAYER')).length;
      const dealerWins = results.filter(r => String(r.result).toUpperCase().includes('DEALER')).length;
      const bankerWins = results.filter(r => String(r.result).toUpperCase().includes('BANKER')).length;
      const ties = results.filter(r => String(r.result).toUpperCase().includes('TIE')).length;

      return [
        ...(playerWins > 0 ? [{ key: 'player', value: playerWins, label: 'Player', variant: 'primary' as const }] : []),
        ...(dealerWins > 0 ? [{ key: 'dealer', value: dealerWins, label: 'Dealer', variant: 'destructive' as const }] : []),
        ...(bankerWins > 0 ? [{ key: 'banker', value: bankerWins, label: 'Banker', variant: 'success' as const }] : []),
        ...(ties > 0 ? [{ key: 'tie', value: ties, label: 'Tie', variant: 'warning' as const }] : [])
      ];
    }

    if (gameType.includes('TIME') || gameType.includes('WHEEL')) {
      const numberResults = results.filter(r => ['1', '2', '5', '10'].includes(String(r.result))).length;
      const bonusResults = results.filter(r => r.bonus || r.special).length;

      return [
        { key: 'numbers', value: numberResults, label: 'Numeri', variant: 'primary', percentage: Math.round((numberResults / totalResults) * 100) },
        { key: 'bonus', value: bonusResults, label: 'Bonus', variant: 'success', percentage: Math.round((bonusResults / totalResults) * 100) }
      ];
    }

    return [];
  };

  const gameSpecificStats = getGameSpecificStats();

  // General statistics
  const generalStats: StatItem[] = [
    { key: 'total', value: totalResults, label: 'Totale Risultati', icon: Target, variant: 'default' },
    { key: 'special', value: specialEvents, label: 'Eventi Speciali', icon: TrendingUp, variant: 'primary', 
      percentage: Math.round((specialEvents / Math.max(totalResults, 1)) * 100) },
    ...(averageMultiplier > 1 ? [{ 
      key: 'avgMultiplier', 
      value: averageMultiplier.toFixed(1), 
      label: 'Molt. Medio', 
      variant: 'success' as const 
    }] : [])
  ];

  // Performance metrics
  const getPerformanceStats = (): StatItem[] => {
    const last10 = results.slice(0, 10);
    const specialInLast10 = last10.filter(r => r.bonus || r.special).length;
    const recentActivity = Math.round((specialInLast10 / Math.max(last10.length, 1)) * 100);

    return [
      { key: 'recent', value: `${recentActivity}%`, label: 'Attività Recente', variant: 'primary', trend: recentActivity > 20 ? 'up' : 'down' },
      { key: 'frequency', value: Math.round(totalResults / Math.max(1, (Date.now() - new Date(results[results.length - 1]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60))), label: 'Freq/Ora', variant: 'default' }
    ];
  };

  const performanceStats = getPerformanceStats();

  if (variant === 'compact') {
    return (
      <AnimatedSection delay={0.3} className={className}>
        <StatsGrid
          title="Statistiche Rapide"
          stats={[...generalStats.slice(0, 3), ...gameSpecificStats.slice(0, 3)]}
          columns={3}
          size="sm"
          variant="default"
          headerIcon={BarChart3}
        />
      </AnimatedSection>
    );
  }

  if (variant === 'dashboard') {
    return (
      <AnimatedSection delay={0.3} className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
        {/* General Stats */}
        <StatsGrid
          title="Panoramica Generale"
          stats={generalStats}
          columns={2}
          size="md"
          variant="default"
          headerIcon={BarChart3}
        />

        {/* Game Specific */}
        {gameSpecificStats.length > 0 && (
          <StatsGrid
            title="Distribuzione Risultati"
            stats={gameSpecificStats}
            columns={2}
            size="md"
            variant="default"
            headerIcon={PieChart}
          />
        )}

        {/* Performance */}
        {showPerformance && (
          <div className="lg:col-span-2">
            <StatsGrid
              title="Performance"
              stats={[...performanceStats, ...customAnalytics]}
              columns={4}
              size="sm"
              variant="default"
              headerIcon={TrendingUp}
            />
          </div>
        )}
      </AnimatedSection>
    );
  }

  // Detailed variant (default) - Following Jokerman79 section pattern
  return (
    <AnimatedSection delay={0.3} className={cn('space-y-6', className)}>
      {/* Main Analytics Header - Following homepage pattern */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-tanker font-bold mb-4 text-muted-foreground leading-tight">
          Analisi Statistica
        </h2>
        <p className="text-base md:text-lg text-muted-foreground">
          Panoramica dettagliata delle performance e distribuzione dei risultati
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* General Statistics */}
        <StatsGrid
          title="Statistiche Generali"
          stats={generalStats}
          columns={2}
          size="md"
          variant="default"
          headerIcon={BarChart3}
        />

        {/* Game-Specific Statistics */}
        {gameSpecificStats.length > 0 && showDistribution && (
          <StatsGrid
            title="Distribuzione Risultati"
            stats={gameSpecificStats}
            columns={2}
            size="md"
            variant="default"
            headerIcon={PieChart}
          />
        )}
      </div>

      {/* Performance Metrics */}
      {showPerformance && (performanceStats.length > 0 || customAnalytics.length > 0) && (
        <StatsGrid
          title="Metriche Performance"
          stats={[...performanceStats, ...customAnalytics]}
          columns={4}
          size="sm"
          variant="default"
          headerIcon={TrendingUp}
        />
      )}

      {/* Trends Section */}
      {showTrends && totalResults > 5 && (
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="font-tanker text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Andamento Recente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="text-2xl font-tanker font-bold text-primary">
                  {results.slice(0, 5).filter(r => r.bonus || r.special).length}
                </div>
                <div className="text-sm text-muted-foreground">Speciali (Ultimi 5)</div>
              </div>
              
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="text-2xl font-tanker font-bold text-foreground">
                  {results.slice(0, 10).filter(r => r.bonus || r.special).length}
                </div>
                <div className="text-sm text-muted-foreground">Speciali (Ultimi 10)</div>
              </div>
              
              <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                <div className="text-2xl font-tanker font-bold text-muted-foreground">
                  {Math.round((specialEvents / Math.max(totalResults, 1)) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">% Totale Speciali</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </AnimatedSection>
  );
}