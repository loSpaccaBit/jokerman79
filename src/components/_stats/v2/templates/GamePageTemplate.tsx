import React from 'react';
import { cn } from '@/lib/utils';
import { ProcessedGameResult, GameType } from '@/types/live-games';
import { LiveStatsHeader, ResultsSection, AnalyticsSection } from '../organisms';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

export interface GamePageTemplateProps {
  gameType: GameType;
  results: ProcessedGameResult[];
  gameStats?: {
    isTableOpen?: boolean;
    playerCount?: number;
    totalUpdates?: number;
    lastUpdate?: Date;
    specialEvents?: number;
    isLive?: boolean;
  };
  className?: string;
  layout?: 'default' | 'hero' | 'minimal' | 'dashboard';
  showAnalytics?: boolean;
  customTitle?: string;
  children?: React.ReactNode;
}

export function GamePageTemplate({
  gameType,
  results,
  gameStats = {},
  className,
  layout = 'default',
  showAnalytics = true,
  customTitle,
  children
}: GamePageTemplateProps) {
  const {
    isTableOpen = true,
    playerCount,
    totalUpdates = results.length,
    lastUpdate = results[0] ? new Date(results[0].timestamp) : undefined,
    specialEvents = results.filter(r => r.bonus || r.special).length,
    isLive = true
  } = gameStats;

  if (layout === 'minimal') {
    return (
      <div className={cn('p-6 space-y-6', className)} role="main">
        <LiveStatsHeader
          gameType={gameType}
          isTableOpen={isTableOpen}
          playerCount={playerCount}
          totalUpdates={totalUpdates}
          lastUpdate={lastUpdate}
          specialEvents={specialEvents}
          isLive={isLive}
          variant="minimal"
          customTitle={customTitle}
        />

        {results.length > 0 ? (
          <ResultsSection
            results={results}
            variant="cards"
            maxResults={12}
            showLatestHighlight={false}
            showPatternHistory={false}
            gridColumns={4}
            resultCardVariant="compact"
          />
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun risultato disponibile al momento</p>
          </div>
        )}

        {children}
      </div>
    );
  }

  if (layout === 'hero') {
    return (
      <div className={cn('p-6 space-y-6', className)} role="main">
        {/* Hero Header - Following Jokerman79 homepage pattern */}
        <LiveStatsHeader
          gameType={gameType}
          isTableOpen={isTableOpen}
          playerCount={playerCount}
          totalUpdates={totalUpdates}
          lastUpdate={lastUpdate}
          specialEvents={specialEvents}
          isLive={isLive}
          variant="hero"
          customTitle={customTitle}
        />

        {/* Main Content */}
        {results.length > 0 ? (
          <>
            <ResultsSection
              results={results}
              variant="mixed"
              maxResults={20}
              showLatestHighlight={true}
              showPatternHistory={true}
              gridColumns={5}
              resultCardVariant="detailed"
            />

            {showAnalytics && (
              <AnalyticsSection
                results={results}
                gameType={gameType}
                variant="detailed"
                showDistribution={true}
                showTrends={true}
                showPerformance={true}
              />
            )}
          </>
        ) : (
          <AnimatedSection delay={0.2}>
            <div className="text-center py-16">
              <div className="text-6xl mb-4 opacity-20">🎯</div>
              <h3 className="font-tanker text-2xl text-muted-foreground mb-2">
                Nessun risultato disponibile
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                I risultati live per questo gioco appariranno qui non appena saranno disponibili.
              </p>
            </div>
          </AnimatedSection>
        )}

        {children}
      </div>
    );
  }

  if (layout === 'dashboard') {
    return (
      <div className={cn('p-6 space-y-6', className)} role="main">
        <LiveStatsHeader
          gameType={gameType}
          isTableOpen={isTableOpen}
          playerCount={playerCount}
          totalUpdates={totalUpdates}
          lastUpdate={lastUpdate}
          specialEvents={specialEvents}
          isLive={isLive}
          variant="default"
          showQuickStats={false}
          customTitle={customTitle}
        />

        {results.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Main Results Column */}
            <div className="xl:col-span-2 space-y-6">
              <ResultsSection
                results={results}
                variant="timeline"
                maxResults={15}
                showLatestHighlight={false}
                showPatternHistory={false}
              />
            </div>

            {/* Analytics Sidebar */}
            <div className="space-y-6">
              {showAnalytics && (
                <AnalyticsSection
                  results={results}
                  gameType={gameType}
                  variant="compact"
                  showDistribution={true}
                  showTrends={false}
                  showPerformance={false}
                />
              )}
              
              {/* Recent Pattern */}
              <ResultsSection
                results={results}
                variant="cards"
                maxResults={6}
                title="Risultati Recenti"
                showLatestHighlight={false}
                showPatternHistory={false}
                gridColumns={2}
                resultCardVariant="compact"
              />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Nessun risultato disponibile al momento</p>
          </div>
        )}

        {children}
      </div>
    );
  }

  // Default layout - Following Jokerman79 main content pattern
  return (
    <main className={cn('p-6 space-y-6', className)} role="main">
      {/* Header Section */}
      <LiveStatsHeader
        gameType={gameType}
        isTableOpen={isTableOpen}
        playerCount={playerCount}
        totalUpdates={totalUpdates}
        lastUpdate={lastUpdate}
        specialEvents={specialEvents}
        isLive={isLive}
        variant="default"
        customTitle={customTitle}
      />

      {/* Main Results Section */}
      {results.length > 0 ? (
        <>
          <ResultsSection
            results={results}
            variant="grid"
            maxResults={20}
            showLatestHighlight={true}
            showPatternHistory={true}
            gridColumns={4}
            resultCardVariant="compact"
          />

          {/* Analytics Section */}
          {showAnalytics && (
            <AnalyticsSection
              results={results}
              gameType={gameType}
              variant="detailed"
              showDistribution={true}
              showTrends={true}
              showPerformance={true}
            />
          )}
        </>
      ) : (
        <AnimatedSection delay={0.2}>
          {/* Empty State - Following Jokerman79 pattern */}
          <div className="text-center py-16 space-y-6">
            <div className="text-6xl mb-4 opacity-20">🎯</div>
            <div className="space-y-4">
              <h3 className="font-tanker text-2xl text-muted-foreground">
                Nessun risultato disponibile
              </h3>
              <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                I risultati live per questo gioco appariranno qui non appena saranno disponibili.
                <br />
                Assicurati che il tavolo sia attivo e connesso.
              </p>
            </div>
          </div>
        </AnimatedSection>
      )}

      {/* Custom Children Content */}
      {children}
    </main>
  );
}