import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { GameType } from '@/types/live-games';
import { GameTypeIcon, LiveIndicator } from '../atoms';
import { Separator } from '@/components/ui/separator';

export interface GameHeaderProps {
  gameType: GameType;
  isTableOpen?: boolean;
  playerCount?: number;
  totalUpdates?: number;
  lastUpdate?: Date;
  className?: string;
  variant?: 'default' | 'compact' | 'hero';
  showAvatar?: boolean;
  customTitle?: string;
}

export function GameHeader({
  gameType,
  isTableOpen = true,
  playerCount,
  totalUpdates,
  lastUpdate,
  className,
  variant = 'default',
  showAvatar = false,
  customTitle
}: GameHeaderProps) {
  const getGameTypeDisplay = (type: GameType): string => {
    const typeMap: Record<GameType, string> = {
      'ROULETTE': 'Roulette',
      'LIGHTNING_ROULETTE': 'Lightning Roulette',
      'DRAGONTIGER': 'Dragon Tiger',
      'SWEETBONANZA': 'Sweet Bonanza',
      'BLACKJACK': 'Blackjack',
      'BACCARAT': 'Baccarat',
      'CRAZYTIME': 'Crazy Time',
      'FUNKYTIME': 'Funky Time',
      'MEGAWHEEL': 'Mega Wheel',
      'ANDARBAHAR': 'Andar Bahar',
      'MONOPOLY_LIVE': 'Monopoly Live',
      'DREAM_CATCHER': 'Dream Catcher'
    };
    return typeMap[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getStatusVariant = () => {
    if (!isTableOpen) return 'destructive';
    if (playerCount && playerCount > 50) return 'default';
    return 'secondary';
  };

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center justify-between gap-4 p-4 bg-background/50 rounded-lg border border-primary/20', className)}>
        <div className="flex items-center gap-3">
          <GameTypeIcon gameType={gameType} size="md" variant="filled" />
          <div>
            <h2 className="font-tanker text-lg text-foreground">
              {customTitle || getGameTypeDisplay(gameType)}
            </h2>
            {totalUpdates && (
              <p className="text-sm text-muted-foreground">
                {totalUpdates} aggiornamenti
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <LiveIndicator
            status={isTableOpen ? 'live' : 'offline'}
            variant="minimal"
            size="sm"
          />
          <Badge variant={getStatusVariant()}>
            {isTableOpen ? 'Aperto' : 'Chiuso'}
          </Badge>
        </div>
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <Card className={cn('border-primary/20 bg-gradient-to-r from-primary/5 to-background', className)}>
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            {/* Left side - Game info */}
            <div className="flex items-center gap-6">
              {showAvatar && (
                <div className="hidden md:flex justify-center">
                  {/* Placeholder for game avatar image */}
                  <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center">
                    <GameTypeIcon gameType={gameType} size="xl" />
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <GameTypeIcon gameType={gameType} size="lg" variant="outlined" />
                  <h1 className="text-3xl md:text-4xl font-tanker font-bold">
                    {customTitle || getGameTypeDisplay(gameType)}
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">
                  Risultati Live • {totalUpdates || 0} aggiornamenti
                </p>
              </div>
            </div>

            {/* Right side - Status */}
            <div className="flex flex-col items-start md:items-end gap-3">
              <Badge variant={getStatusVariant()} className="text-sm px-4 py-2">
                {isTableOpen ? 'Tavolo Aperto' : 'Tavolo Chiuso'}
              </Badge>
              
              <LiveIndicator
                status={isTableOpen ? 'live' : 'offline'}
                variant="detailed"
                size="md"
                lastUpdate={lastUpdate}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <Card className={cn('border-primary/20 bg-gradient-to-r from-primary/5 to-background', className)}>
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <GameTypeIcon gameType={gameType} size="lg" variant="filled" />
            <div>
              <CardTitle className="font-tanker text-xl text-foreground">
                {customTitle || getGameTypeDisplay(gameType)}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Risultati Live • {totalUpdates || 0} aggiornamenti
              </p>
            </div>
          </div>

          <Badge variant={getStatusVariant()} className="w-fit">
            {isTableOpen ? 'Tavolo Aperto' : 'Tavolo Chiuso'}
          </Badge>
        </div>
      </CardHeader>

      {/* Stats Row */}
      {(playerCount !== undefined || lastUpdate) && (
        <>
          <Separator className="mx-6" />
          <CardContent className="pt-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                {playerCount !== undefined && (
                  <div className="text-center">
                    <div className="text-lg font-tanker font-bold text-foreground">
                      {playerCount}
                    </div>
                    <div className="text-xs text-muted-foreground">Giocatori</div>
                  </div>
                )}
              </div>

              <LiveIndicator
                status={isTableOpen ? 'live' : 'offline'}
                variant="detailed"
                size="sm"
                lastUpdate={lastUpdate}
              />
            </div>
          </CardContent>
        </>
      )}
    </Card>
  );
}