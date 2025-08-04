import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Activity, Users, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveGameHeaderProps {
  gameId: string;
  gameName?: string;
  gameType?: string;
  isLive: boolean;
  playerCount?: number;
  lastUpdate?: Date;
  className?: string;
}

export function LiveGameHeader({
  gameId,
  gameName,
  gameType,
  isLive,
  playerCount,
  lastUpdate,
  className
}: LiveGameHeaderProps) {
  const getGameTypeDisplay = (type?: string) => {
    if (!type) return 'Live Casino';
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/stats">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Torna alle Stats</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </Link>

        {/* Live Status Badge */}
        <Badge
          variant={isLive ? "default" : "secondary"}
          className={cn(
            "gap-1 text-sm px-3 py-1",
            isLive ? "status-live live-pulse" : "status-offline"
          )}
        >
          <div className={cn(
            "w-2 h-2 rounded-full",
            isLive ? "bg-white" : "bg-muted-foreground"
          )} />
          {isLive ? 'Live' : 'Offline'}
        </Badge>
      </div>

      {/* Game Info Card - Minimal Design */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-background">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Game Title */}
            <div className="space-y-1">
              <h1 className="text-2xl md:text-3xl font-tanker font-bold text-foreground">
                {gameName || `Gioco ${gameId}`}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline" className="text-xs">
                  {getGameTypeDisplay(gameType)}
                </Badge>
                <span>•</span>
                <span className="font-mono">ID: {gameId}</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm">
              {playerCount !== undefined && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{playerCount}</span>
                  <span className="hidden sm:inline">players</span>
                </div>
              )}

              {lastUpdate && (
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">
                    {lastUpdate.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              )}

              {isLive && (
                <div className="flex items-center gap-1 text-green-600">
                  <Activity className="h-4 w-4 animate-pulse" />
                  <span className="font-medium hidden sm:inline">Active</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}