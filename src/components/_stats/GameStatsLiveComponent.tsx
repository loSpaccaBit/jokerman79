import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Clock, 
  Target,
  Zap,
  RefreshCw,
  Activity,
  WifiOff,
  Trash2,
  Play,
  Square
} from 'lucide-react';
import { useGameStatsLive } from '@/hooks/useGameStatsLive';
import { UseGameStatsOptions } from '@/hooks/useGameStats';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface GameStatsLiveComponentProps extends UseGameStatsOptions {
  className?: string;
  provider?: string; // Provider per live updates (default: 'Evolution Gaming')
}

export function GameStatsLiveComponent({ 
  gameId, 
  timeframe = '24h',
  tableId,
  autoRefresh = true,
  refreshInterval = 30000,
  className,
  provider = 'Evolution Gaming'
}: GameStatsLiveComponentProps) {
  const {
    // Statistiche base
    stats,
    latestResults,
    loading,
    error,
    lastUpdate,
    computedStats,
    
    // Live updates
    liveResults,
    connected,
    subscribedGame,
    
    // Azioni
    refresh,
    subscribeToLiveUpdates,
    unsubscribeFromLiveUpdates,
    clearLiveResults,
    
    // Info stato
    hasData,
    isEmpty,
    isStale
  } = useGameStatsLive({
    gameId,
    timeframe,
    tableId,
    autoRefresh,
    refreshInterval
  });

  const handleToggleLiveUpdates = () => {
    if (subscribedGame) {
      unsubscribeFromLiveUpdates();
    } else if (tableId) {
      subscribeToLiveUpdates(provider, tableId);
    }
  };

  const formatLiveResult = (result: any) => {
    try {
      const { data } = result;
      
      if (data.results && Array.isArray(data.results)) {
        return {
          type: 'Risultati',
          value: data.results.slice(-5).join(', '),
          icon: '🎲'
        };
      }
      
      if (data.winningNumber !== undefined) {
        return {
          type: 'Numero Vincente',
          value: data.winningNumber.toString(),
          icon: '🎯'
        };
      }
      
      if (data.winner) {
        return {
          type: 'Vincitore',
          value: data.winner,
          icon: '🏆'
        };
      }
      
      if (data.type && data.type.endsWith('ResultsUpdated')) {
        return {
          type: 'Risultato Aggiornato',
          value: 'Nuovi dati ricevuti',
          icon: '⚡'
        };
      }
      
      return {
        type: 'Update',
        value: 'Dati ricevuti',
        icon: '📡'
      };
    } catch (error) {
      return {
        type: 'Errore',
        value: 'Impossibile elaborare',
        icon: '❌'
      };
    }
  };

  if (loading && !stats) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Caricamento statistiche...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-destructive mb-4">❌</div>
          <p className="text-muted-foreground mb-4">Errore nel caricamento delle statistiche</p>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <Button onClick={refresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Riprova
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">Nessun risultato nel periodo</h3>
          <p className="text-muted-foreground mb-4">
            Non ci sono risultati estratti nelle ultime {timeframe === '1h' ? '1 ora' : 
            timeframe === '6h' ? '6 ore' : timeframe === '12h' ? '12 ore' : 
            timeframe === '24h' ? '24 ore' : '7 giorni'}
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={refresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Aggiorna
            </Button>
            {tableId && (
              <Button onClick={handleToggleLiveUpdates} variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Attiva Live
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!hasData || !stats || !computedStats) {
    return null;
  }

  const timeframeLabels = {
    '1h': '1 Ora',
    '6h': '6 Ore', 
    '12h': '12 Ore',
    '24h': '24 Ore',
    '7d': '7 Giorni'
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header con controlli */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            📊 Statistiche Live
          </h3>
          <p className="text-sm text-muted-foreground">
            {stats.totalResults} risultati negli ultimi {timeframeLabels[timeframe]}
            {tableId && ` • Tavolo ${tableId}`}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Live status */}
          <Badge variant={connected ? 'default' : 'secondary'} className="text-xs">
            <Activity className={`h-3 w-3 mr-1 ${connected ? 'text-green-500' : 'text-gray-500'}`} />
            {connected ? 'Live' : 'Offline'}
          </Badge>
          
          {isStale && (
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              Dati non recenti
            </Badge>
          )}
          
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Aggiornato: {lastUpdate.toLocaleTimeString('it-IT')}
            </span>
          )}
          
          {/* Live controls */}
          {tableId && (
            <Button 
              onClick={handleToggleLiveUpdates} 
              variant="outline" 
              size="sm"
              className={subscribedGame ? 'bg-green-50 border-green-200' : ''}
            >
              {subscribedGame ? (
                <>
                  <Square className="h-4 w-4 mr-2" />
                  Stop Live
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Live
                </>
              )}
            </Button>
          )}
          
          <Button 
            onClick={refresh} 
            variant="outline" 
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Aggiorna
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Panoramica</TabsTrigger>
          <TabsTrigger value="frequency">Frequenze</TabsTrigger>
          <TabsTrigger value="recent">Ultimi Risultati</TabsTrigger>
          <TabsTrigger value="live">
            Live Updates {liveResults.length > 0 && `(${liveResults.length})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Statistiche principali */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {stats.totalResults}
                </div>
                <div className="text-sm text-muted-foreground">Estrazioni Totali</div>
              </CardContent>
            </Card>

            {computedStats.hotResult && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {computedStats.hotResult.result}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Più Frequente ({computedStats.hotResult.count}x)
                  </div>
                </CardContent>
              </Card>
            )}

            {stats.stats.averageMultiplier > 0 && (
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.stats.averageMultiplier}x
                  </div>
                  <div className="text-sm text-muted-foreground">Moltiplicatore Medio</div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600 flex items-center justify-center gap-1">
                  <Activity className={`h-5 w-5 ${connected ? 'text-green-500' : 'text-gray-500'}`} />
                  {liveResults.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Updates Live
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Hot & Cold Results */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {computedStats.hotResult && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    🔥 Risultato Più Caldo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-green-600">
                        {computedStats.hotResult.result}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {computedStats.hotResult.count} volte estratto
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      {((computedStats.hotResult.count / stats.totalResults) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {computedStats.coldResult && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-blue-600" />
                    🧊 Risultato Più Freddo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">
                        {computedStats.coldResult.result}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {computedStats.coldResult.count} volte estratto
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      {((computedStats.coldResult.count / stats.totalResults) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="frequency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">📊 Distribuzione Frequenze</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {computedStats.distributionData.slice(0, 10).map((item: any, index: number) => (
                <div key={item.result} className="flex items-center gap-3">
                  <div className="w-12 text-center">
                    <Badge variant={index === 0 ? "default" : "outline"}>
                      {item.result}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <Progress 
                      value={parseFloat(item.percentage)} 
                      className="h-2"
                    />
                  </div>
                  <div className="w-16 text-right text-sm">
                    {item.count}x ({item.percentage}%)
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">🕐 Ultimi 10 Risultati</CardTitle>
            </CardHeader>
            <CardContent>
              {latestResults.length > 0 ? (
                <div className="space-y-2">
                  {latestResults.map((result, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{result.result}</Badge>
                        {result.multiplier && result.multiplier > 1 && (
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                            ⚡ x{result.multiplier}
                          </Badge>
                        )}
                        {result.winner && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            🏆 {result.winner}
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(result.extractedAt).toLocaleString('it-IT', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-4">
                  Nessun risultato recente disponibile
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className={`h-5 w-5 ${connected ? 'text-green-500' : 'text-red-500'}`} />
                  <span>Aggiornamenti Live</span>
                  {connected ? (
                    <Badge className="bg-green-500">Connesso</Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-red-500 text-white">
                      <WifiOff className="h-3 w-3 mr-1" />
                      Disconnesso
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  {liveResults.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearLiveResults}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
              {subscribedGame && (
                <p className="text-sm text-muted-foreground">
                  Ascoltando: {subscribedGame}
                </p>
              )}
            </CardHeader>
            <CardContent>
              {!connected && (
                <div className="text-center py-8 text-muted-foreground">
                  <WifiOff className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">WebSocket Disconnesso</h3>
                  <p className="text-sm mb-4">
                    Clicca "Start Live" per connetterti ai risultati in tempo reale
                  </p>
                  {tableId && (
                    <Button onClick={handleToggleLiveUpdates} variant="outline">
                      <Play className="h-4 w-4 mr-2" />
                      Start Live Updates
                    </Button>
                  )}
                </div>
              )}

              {connected && liveResults.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">In Attesa di Risultati</h3>
                  <p className="text-sm">
                    Connesso e in ascolto per nuovi risultati live...
                  </p>
                </div>
              )}

              {liveResults.length > 0 && (
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {liveResults.map((result, index) => {
                      const formatted = formatLiveResult(result);
                      const timeAgo = formatDistanceToNow(new Date(result.timestamp), {
                        addSuffix: true,
                        locale: it
                      });

                      return (
                        <Card key={index} className="bg-muted/50">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{formatted.icon}</span>
                                <Badge variant="outline">{result.provider}</Badge>
                                <Badge variant="secondary">{formatted.type}</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">{timeAgo}</span>
                            </div>
                            
                            <div className="font-medium mb-2">
                              {formatted.value}
                            </div>
                            
                            <details className="text-xs">
                              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                                Dettagli tecnici
                              </summary>
                              <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}