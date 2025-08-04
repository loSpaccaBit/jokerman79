'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  Activity
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useMultiProviderCasino } from '@/hooks/useMultiProviderCasino';
import { casinoMicroserviceConfig } from '@/config/casino-microservice';

interface GameStatsComponentProps {
  gameId: string;
  tableId?: string;
  gameType?: string;
  tableIds?: string[];
  provider?: 'pragmatic' | 'evolution' | 'auto';
  className?: string;
  showDebugInfo?: boolean;
}

export function GameStatsComponent({ 
  gameId, 
  tableId,
  gameType,
  tableIds,
  provider = 'auto',
  className = '',
  showDebugInfo = false
}: GameStatsComponentProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>(provider === 'auto' ? 'evolution' : provider);
  const [gameDetails, setGameDetails] = useState<any>(null);
  
  // Multi-Provider Casino integration
  const {
    currentProvider,
    connectionStatus,
    games,
    selectedGame,
    liveResults,
    loading,
    error,
    isConnected,
    hasApiKey,
    switchProvider,
    selectGame,
    filterGames,
    forceReconnect,
    getProviderInfo,
    getAvailableProviders,
    isHealthy,
    gameCount,
    featuredGames,
    openGames
  } = useMultiProviderCasino({
    apiKey: process.env.NEXT_PUBLIC_CASINO_API_KEY,
    autoConnect: true,
    maxResults: 20,
    debug: showDebugInfo
  });

  // Auto-detect and switch provider based on gameId
  useEffect(() => {
    if (provider === 'auto') {
      // Auto-detect provider based on gameId
      if (gameId === '1101' || gameId.startsWith('1')) {
        // Pragmatic Play games typically start with 1xxx
        if (currentProvider !== 'pragmatic') {
          switchProvider('pragmatic');
          setSelectedProvider('pragmatic');
        }
      } else {
        // Default to Evolution Gaming
        if (currentProvider !== 'evolution') {
          switchProvider('evolution');
          setSelectedProvider('evolution');
        }
      }
    } else if (provider !== 'auto') {
      // Use specified provider
      const targetProvider = provider as 'evolution' | 'pragmatic';
      if (currentProvider !== targetProvider) {
        switchProvider(targetProvider);
        setSelectedProvider(targetProvider);
      }
    }
  }, [provider, gameId, currentProvider, switchProvider]);

  // Select game when gameId changes
  useEffect(() => {
    if (gameId && games.length > 0) {
      const success = selectGame(gameId);
      if (success) {
        const game = games.find(g => g.id === gameId);
        setGameDetails(game);
      }
    }
  }, [gameId, games, selectGame]);

  // Status icon basato sullo stato connessione sicura
  const getStatusIcon = () => {
    if (!hasApiKey) {
      return <AlertCircle className="w-4 h-4 text-orange-500" />;
    } else if (isHealthy && !error) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    } else if (error) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else if (loading) {
      return <RefreshCw className="w-4 h-4 text-yellow-500 animate-spin" />;
    } else {
      return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  // Status badge colore
  const getStatusBadgeVariant = () => {
    if (!hasApiKey) return 'secondary' as const;
    if (isHealthy && !error) return 'default' as const;
    if (error) return 'destructive' as const;
    if (loading) return 'secondary' as const;
    return 'outline' as const;
  };

  // Status text
  const getStatusText = () => {
    if (!hasApiKey) return 'API key mancante';
    if (isHealthy && !error) return `${currentProvider} connesso`;
    if (error) {
      if (error.includes('Unauthorized')) return 'API key non valida';
      if (error.includes('CORS')) return 'errore CORS';
      return 'errore connessione';
    }
    if (loading) return 'caricamento...';
    if (connectionStatus === 'connecting') return 'connessione...';
    return 'disconnesso';
  };

  // Refresh manual
  const refreshLiveData = async () => {
    console.log('🔄 Refresh dati live per gioco:', gameId, 'provider:', currentProvider);
    
    // Force reconnect
    await forceReconnect();
    
    // Re-select game
    if (gameId) {
      selectGame(gameId);
    }
  };

  // Provider name display
  const getProviderName = () => {
    const providerInfo = getProviderInfo();
    return providerInfo?.name || currentProvider;
  };

  // Format live result for display
  const formatLiveResult = (result: any) => {
    if (!result.data) return null;
    
    // For roulette games
    if (gameType?.includes('roulette')) {
      return {
        number: result.data.number || result.data.result,
        color: result.data.color,
        timestamp: result.timestamp
      };
    }
    
    // For Dragon Tiger
    if (gameType === 'dragon-tiger') {
      return {
        winner: result.data.winner,
        dragonCard: result.data.dragonCard,
        tigerCard: result.data.tigerCard,
        timestamp: result.timestamp
      };
    }
    
    // Generic format
    return {
      value: result.data.result || result.data.value || result.data,
      timestamp: result.timestamp
    };
  };

  // Get result color for roulette
  const getResultColor = (result: any) => {
    if (result.color) {
      switch (result.color) {
        case 'red': return 'bg-red-500 text-white';
        case 'black': return 'bg-black text-white';
        case 'green': return 'bg-green-500 text-white';
        default: return 'bg-blue-500 text-white';
      }
    }
    return 'bg-blue-500 text-white';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header con informazioni microservizio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStatusIcon()}
              <span>{getProviderName()} - {gameDetails?.name || gameId}</span>
              <Badge variant={getStatusBadgeVariant()} className="text-xs">
                {getStatusText()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {isConnected && (
                <Activity className="w-3 h-3 text-green-500" />
              )}
              <Button 
                onClick={refreshLiveData} 
                variant="outline" 
                size="sm"
                className="h-6 px-2 text-xs"
                disabled={loading}
              >
                <RefreshCw className={`w-3 h-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Aggiorna
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {showDebugInfo && (
            <div className="text-xs text-gray-500 space-y-1">
              <span>Provider: {currentProvider}</span>
              <span>Giochi: {gameCount}</span>
              <span>Gioco selezionato: {selectedGame?.name || 'Nessuno'}</span>
              <span>Tavolo: {tableId || selectedGame?.tableId || 'N/A'}</span>
              <span>Tipo: {gameType || selectedGame?.gameType || 'N/A'}</span>
              <span>Risultati live: {liveResults.length}</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Errore microservizio: {error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risultati recenti dal microservizio */}
      <Card>
        <CardHeader>
          <CardTitle>Risultati Live dal Casino</CardTitle>
        </CardHeader>
        <CardContent>
          {liveResults.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              {loading || !isConnected ? 'In attesa di risultati live...' : 'Nessun risultato disponibile'}
            </p>
          ) : (
            <div className="space-y-3">
              {/* Grid risultati recenti */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
                {liveResults.slice(0, 20).map((result, index) => {
                  const formatted = formatLiveResult(result);
                  if (!formatted) return null;
                  
                  return (
                    <div
                      key={index}
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        formatted.number !== undefined 
                          ? getResultColor(formatted)
                          : 'bg-blue-500 text-white'
                      }`}
                      title={`${new Date(result.timestamp).toLocaleTimeString()}`}
                    >
                      {formatted.number || formatted.value || '?'}
                    </div>
                  );
                })}
              </div>
              
              {/* Lista dettagliata ultimi 5 risultati */}
              <div className="border-t pt-3">
                <h4 className="text-sm font-medium mb-2">Ultimi risultati dettagliati:</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {liveResults.slice(0, 5).map((result, index) => {
                    const formatted = formatLiveResult(result);
                    return (
                      <div key={index} className="flex justify-between items-center text-xs p-2 bg-gray-50 rounded">
                        <span className="font-mono">
                          {new Date(result.timestamp).toLocaleTimeString()}
                        </span>
                        <span className="font-semibold">
                          {JSON.stringify(formatted || result.data)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistiche per Dragon Tiger */}
      {gameType === 'dragon-tiger' && liveResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dragon Tiger Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {(() => {
                const dragonWins = liveResults.filter(r => {
                  const formatted = formatLiveResult(r);
                  return formatted?.winner === 'dragon';
                }).length;
                
                const tigerWins = liveResults.filter(r => {
                  const formatted = formatLiveResult(r);
                  return formatted?.winner === 'tiger';
                }).length;
                
                const ties = liveResults.filter(r => {
                  const formatted = formatLiveResult(r);
                  return formatted?.winner === 'tie';
                }).length;
                
                return (
                  <>
                    <div>
                      <div className="text-2xl font-bold text-red-600">{dragonWins}</div>
                      <div className="text-xs text-gray-500">Dragon</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-600">{ties}</div>
                      <div className="text-xs text-gray-500">Tie</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{tigerWins}</div>
                      <div className="text-xs text-gray-500">Tiger</div>
                    </div>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
