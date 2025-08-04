import { useState, useEffect, useCallback } from 'react';

export interface GameResultStats {
  frequency: Record<string, number>;
  mostCommon: { result: string; count: number } | null;
  leastCommon: { result: string; count: number } | null;
  totalExtractions: number;
  averageMultiplier: number;
  bigWins: number;
  bigWinRate: string;
  resultDistribution: Record<string, number>;
}

export interface GameStatsData {
  gameId: string;
  timeframe: string;
  tableId?: string;
  period: {
    start: string;
    end: string;
  };
  totalResults: number;
  stats: GameResultStats;
  results: any[]; // Ultimi 10 risultati per preview
}

export interface LatestResultsData {
  gameId: string;
  tableId?: string;
  count: number;
  results: any[];
}

export interface UseGameStatsOptions {
  gameId: string;
  timeframe?: '1h' | '6h' | '12h' | '24h' | '7d';
  tableId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number; // in millisecondi
}

export function useGameStats(options: UseGameStatsOptions) {
  const {
    gameId,
    timeframe = '24h',
    tableId,
    autoRefresh = true,
    refreshInterval = 30000 // 30 secondi
  } = options;

  const [stats, setStats] = useState<GameStatsData | null>(null);
  const [latestResults, setLatestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

  // Fetch statistiche temporali
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

  // Fetch ultimi risultati
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

      const data: LatestResultsData = await response.json();
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

  // Auto-refresh
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

  // Statistiche calcolate
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
    // Dati base
    stats,
    latestResults,
    loading,
    error,
    lastUpdate,
    
    // Statistiche calcolate
    computedStats,
    
    // Azioni
    refresh,
    fetchStats,
    fetchLatestResults,
    
    // Info stato
    hasData: !!stats && stats.totalResults > 0,
    isEmpty: !!stats && stats.totalResults === 0,
    isStale: lastUpdate ? (Date.now() - lastUpdate.getTime()) > refreshInterval * 2 : true
  };
}
