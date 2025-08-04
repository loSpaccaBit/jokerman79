import { useState, useEffect, useCallback, useRef } from 'react';
import { useCasinoMicroservice } from './useCasinoMicroservice';
import { GameStatsData, GameResultStats, UseGameStatsOptions } from './useGameStats';

interface LiveGameResult {
  type: string;
  gameId: string;
  timestamp: string;
  data: any;
  provider?: string;
}

interface UseGameStatsLiveReturn {
  // Statistiche base (da Strapi)
  stats: GameStatsData | null;
  latestResults: any[];
  loading: boolean;
  error: string | null;
  lastUpdate: Date | null;
  computedStats: any;
  
  // Live updates (dal microservizio)
  liveResults: LiveGameResult[];
  connected: boolean;
  subscribedGame: string | null;
  
  // Azioni
  refresh: () => Promise<void>;
  subscribeToLiveUpdates: (provider: string, gameId: string) => void;
  unsubscribeFromLiveUpdates: () => void;
  clearLiveResults: () => void;
  
  // Info stato
  hasData: boolean;
  isEmpty: boolean;
  isStale: boolean;
}

/**
 * Hook che combina statistiche statiche da Strapi con aggiornamenti live dal microservizio casino
 */
export function useGameStatsLive(options: UseGameStatsOptions): UseGameStatsLiveReturn {
  const {
    gameId,
    timeframe = '24h',
    tableId,
    autoRefresh = true,
    refreshInterval = 30000
  } = options;

  // Statistiche base da Strapi
  const [stats, setStats] = useState<GameStatsData | null>(null);
  const [latestResults, setLatestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Live results dal microservizio
  const [liveResults, setLiveResults] = useState<LiveGameResult[]>([]);
  const [subscribedGame, setSubscribedGame] = useState<string | null>(null);
  
  // Microservizio casino hook
  const {
    gameUpdates,
    connected,
    subscribeToGame,
    unsubscribeFromGame,
    error: microserviceError
  } = useCasinoMicroservice();

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
  const maxLiveResults = 20;

  // Fetch statistiche da Strapi
  const fetchStats = useCallback(async () => {
    if (!gameId) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        timeframe
      });
      
      if (tableId) {
        params.append('tableId', tableId);
      }

      const response = await fetch(
        `${strapiUrl}/api/game-results/stats/${gameId}?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GameStatsData = await response.json();
      setStats(data);
      setLastUpdate(new Date());

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Errore fetching game stats:', err);
    } finally {
      setLoading(false);
    }
  }, [gameId, timeframe, tableId, strapiUrl]);

  // Fetch ultimi risultati da Strapi
  const fetchLatestResults = useCallback(async (limit = 10) => {
    if (!gameId) return;

    try {
      const params = new URLSearchParams({
        limit: limit.toString()
      });
      
      if (tableId) {
        params.append('tableId', tableId);
      }

      const response = await fetch(
        `${strapiUrl}/api/game-results/latest/${gameId}?${params}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setLatestResults(data.results);

    } catch (err) {
      console.error('Errore fetching latest results:', err);
    }
  }, [gameId, tableId, strapiUrl]);

  // Refresh completo
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchStats(),
      fetchLatestResults()
    ]);
  }, [fetchStats, fetchLatestResults]);

  // Subscribe agli aggiornamenti live
  const subscribeToLiveUpdates = useCallback((provider: string, gameId: string) => {
    console.log(`🎯 Subscribing to live updates: ${provider}:${gameId}`);
    
    // Unsubscribe da gioco precedente se necessario
    if (subscribedGame) {
      const [prevProvider, prevGameId] = subscribedGame.split(':');
      unsubscribeFromGame(prevGameId);
    }
    
    subscribeToGame(gameId);
    setSubscribedGame(`${provider}:${gameId}`);
    setLiveResults([]); // Clear previous results
  }, [subscribedGame, subscribeToGame, unsubscribeFromGame]);

  // Unsubscribe dagli aggiornamenti live
  const unsubscribeFromLiveUpdates = useCallback(() => {
    if (subscribedGame) {
      const [provider, gameId] = subscribedGame.split(':');
      unsubscribeFromGame(provider, gameId);
      setSubscribedGame(null);
    }
  }, [subscribedGame, unsubscribeFromGame]);

  // Clear risultati live
  const clearLiveResults = useCallback(() => {
    setLiveResults([]);
  }, []);

  // Processa gli aggiornamenti dal microservizio
  useEffect(() => {
    if (gameUpdates.length > 0) {
      const latestUpdate = gameUpdates[0];
      
      // Verifica se l'update è per il gioco corrente
      if (subscribedGame) {
        const [provider, gameId] = subscribedGame.split(':');
        
        if (latestUpdate.gameId === gameId || latestUpdate.gameId === tableId) {
          const liveResult: LiveGameResult = {
            type: latestUpdate.type,
            gameId: latestUpdate.gameId,
            timestamp: latestUpdate.timestamp,
            data: latestUpdate.data,
            provider
          };
          
          setLiveResults(prev => [liveResult, ...prev.slice(0, maxLiveResults - 1)]);
          console.log('🎲 New live result added:', liveResult);
        }
      }
    }
  }, [gameUpdates, subscribedGame, tableId]);

  // Auto-refresh delle statistiche
  useEffect(() => {
    if (!autoRefresh || !gameId) return;

    const interval = setInterval(() => {
      refresh();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, gameId, refreshInterval, refresh]);

  // Initial fetch
  useEffect(() => {
    if (gameId) {
      refresh();
    }
  }, [gameId, timeframe, tableId, refresh]);

  // Auto-subscribe se tableId è presente
  useEffect(() => {
    if (tableId && !subscribedGame) {
      // Prova prima Evolution Gaming (più comune)
      subscribeToLiveUpdates('Evolution Gaming', tableId);
    }
  }, [tableId, subscribedGame, subscribeToLiveUpdates]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromLiveUpdates();
    };
  }, [unsubscribeFromLiveUpdates]);

  // Set error se microservizio ha errori
  useEffect(() => {
    if (microserviceError && !error) {
      setError(`Microservizio: ${microserviceError}`);
    }
  }, [microserviceError, error]);

  // Statistiche calcolate (stesso calcolo di useGameStats)
  const computedStats = stats ? {
    hasData: stats.totalResults > 0,
    
    // Risultato più frequente
    hotResult: stats.stats.mostCommon,
    
    // Risultato meno frequente  
    coldResult: stats.stats.leastCommon,
    
    // Frequenza media
    averageFrequency: stats.totalResults > 0 
      ? (stats.totalResults / Object.keys(stats.stats.frequency).length).toFixed(1)
      : '0',
    
    // Percentuale big wins
    bigWinPercentage: stats.stats.bigWinRate,
    
    // Trend (confronto con periodo precedente) - da implementare
    trend: null,
    
    // Distribuzione per visualizzazione grafica
    distributionData: Object.entries(stats.stats.frequency)
      .map(([result, count]) => ({
        result,
        count,
        percentage: ((count / stats.totalResults) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
  } : null;

  return {
    // Statistiche base (da Strapi)
    stats,
    latestResults,
    loading,
    error,
    lastUpdate,
    computedStats,
    
    // Live updates (dal microservizio)
    liveResults,
    connected,
    subscribedGame,
    
    // Azioni
    refresh,
    subscribeToLiveUpdates,
    unsubscribeFromLiveUpdates,
    clearLiveResults,
    
    // Info stato
    hasData: !!stats && stats.totalResults > 0,
    isEmpty: !!stats && stats.totalResults === 0,
    isStale: lastUpdate ? (Date.now() - lastUpdate.getTime()) > refreshInterval * 2 : true
  };
}