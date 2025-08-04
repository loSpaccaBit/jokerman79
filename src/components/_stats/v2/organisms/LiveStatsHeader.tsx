import React from 'react';
import { cn } from '@/lib/utils';
import { GameType } from '@/types/live-games';
import { GameHeader, QuickStats } from '../molecules';
import { AnimatedSection } from '@/components/animations/AnimatedSection';

export interface LiveStatsHeaderProps {
  gameType: GameType;
  isTableOpen?: boolean;
  playerCount?: number;
  totalUpdates?: number;
  lastUpdate?: Date;
  specialEvents?: number;
  isLive?: boolean;
  className?: string;
  variant?: 'default' | 'hero' | 'minimal';
  showQuickStats?: boolean;
  customTitle?: string;
}

export function LiveStatsHeader({
  gameType,
  isTableOpen = true,
  playerCount,
  totalUpdates = 0,
  lastUpdate,
  specialEvents,
  isLive = true,
  className,
  variant = 'default',
  showQuickStats = true,
  customTitle
}: LiveStatsHeaderProps) {
  if (variant === 'minimal') {
    return (
      <AnimatedSection className={className}>
        <div className="space-y-4">
          <GameHeader
            gameType={gameType}
            isTableOpen={isTableOpen}
            playerCount={playerCount}
            totalUpdates={totalUpdates}
            lastUpdate={lastUpdate}
            variant="compact"
            customTitle={customTitle}
          />
        </div>
      </AnimatedSection>
    );
  }

  if (variant === 'hero') {
    return (
      <AnimatedSection className={className}>
        <div className="space-y-6">
          {/* Hero Header - Following Jokerman79 homepage pattern */}
          <header className="flex flex-col gap-6 md:gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-4 md:space-y-6">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-tanker font-bold leading-tight">
                {customTitle || `${gameType.replace('_', ' ')} Live`}
              </h1>
              
              <p className="text-base md:text-lg lg:text-xl text-muted-foreground leading-relaxed md:leading-loose max-w-4xl">
                Statistiche e risultati in tempo reale
                <br className="hidden md:block" />
                {totalUpdates > 0 && `${totalUpdates} aggiornamenti registrati`}
              </p>
            </div>

            {/* Game Type Avatar - Similar to home avatar pattern */}
            <div className="hidden lg:flex justify-end flex-shrink-0">
              <div className="w-auto h-64 flex items-center justify-center bg-primary/5 rounded-2xl p-8">
                {/* Placeholder for game-specific illustration */}
                <div className="text-6xl opacity-50">
                  🎯
                </div>
              </div>
            </div>
          </header>

          {/* Quick Stats */}
          {showQuickStats && (
            <QuickStats
              totalResults={totalUpdates}
              playerCount={playerCount}
              lastUpdate={lastUpdate}
              isLive={isLive && isTableOpen}
              specialEvents={specialEvents}
              variant="horizontal"
              size="md"
              showLiveIndicator={true}
            />
          )}
        </div>
      </AnimatedSection>
    );
  }

  // Default variant - Following Jokerman79 card patterns
  return (
    <AnimatedSection className={className}>
      <div className="space-y-6">
        <GameHeader
          gameType={gameType}
          isTableOpen={isTableOpen}
          playerCount={playerCount}
          totalUpdates={totalUpdates}
          lastUpdate={lastUpdate}
          variant="default"
          customTitle={customTitle}
        />

        {showQuickStats && (
          <QuickStats
            totalResults={totalUpdates}
            playerCount={playerCount}
            lastUpdate={lastUpdate}
            isLive={isLive && isTableOpen}
            specialEvents={specialEvents}
            variant="grid"
            size="sm"
            showLiveIndicator={false} // Already shown in GameHeader
          />
        )}
      </div>
    </AnimatedSection>
  );
}