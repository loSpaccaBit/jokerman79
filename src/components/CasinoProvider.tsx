'use client';

import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { 
  CasinoClient, 
  useCasinoClient,
  CasinoClientConfig,
  Provider,
  Game,
  GameResult
} from '@/lib/casino-live-results-client-mock';

interface CasinoContextType {
  client: CasinoClient;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  authenticate: (clientId?: string, clientSecret?: string) => Promise<void>;
  disconnect: () => void;
}

const CasinoContext = createContext<CasinoContextType | undefined>(undefined);

interface CasinoProviderProps {
  children: ReactNode;
  config?: Partial<CasinoClientConfig>;
}

export function CasinoProvider({ children, config = {} }: CasinoProviderProps) {
  const defaultConfig: CasinoClientConfig = {
    baseUrl: process.env.NEXT_PUBLIC_CASINO_API_URL || 'http://localhost:3001',
    timeout: 10000,
    ...config
  };

  const casino = useCasinoClient(defaultConfig);

  // Auto-authentication on mount
  useEffect(() => {
    const autoAuth = async () => {
      if (!casino.isAuthenticated && !casino.loading) {
        try {
          await casino.authenticate(
            process.env.CASINO_CLIENT_ID || 'nextjs-jokerman79',
            process.env.CASINO_CLIENT_SECRET || 'jokerman79-secret-key-change-in-production'
          );
        } catch (error) {
          console.error('Auto-authentication failed:', error);
        }
      }
    };

    autoAuth();
  }, [casino.isAuthenticated, casino.loading, casino.authenticate]);

  return (
    <CasinoContext.Provider value={casino}>
      {children}
    </CasinoContext.Provider>
  );
}

export function useCasino() {
  const context = useContext(CasinoContext);
  if (!context) {
    throw new Error('useCasino must be used within CasinoProvider');
  }
  return context;
}

// Hook personalizzato per status con refresh automatico
export function useCasinoStatus() {
  const { client } = useCasino();
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  const refreshStatus = React.useCallback(async () => {
    setLoading(true);
    try {
      const health = await client.getHealth();
      setStatus(health);
    } catch (error) {
      console.error('Failed to get status:', error);
    } finally {
      setLoading(false);
    }
  }, [client]);

  React.useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000); // Refresh ogni 30s
    return () => clearInterval(interval);
  }, [refreshStatus]);

  return { status, loading, refresh: refreshStatus };
}

// Hook per gestire i provider
export function useCasinoProviders() {
  const { client } = useCasino();
  const [providers, setProviders] = React.useState<Provider[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadProviders = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const providerList = await client.getProviders();
      setProviders(providerList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  }, [client]);

  React.useEffect(() => {
    loadProviders();
  }, [loadProviders]);

  return {
    providers,
    loading,
    error,
    reload: loadProviders
  };
}

// Hook per gestire i giochi
export function useCasinoGames(provider?: string, filters?: { type?: string; status?: string; search?: string }) {
  const { client } = useCasino();
  const [games, setGames] = React.useState<Game[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const loadGames = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      let gameList: Game[];
      if (provider) {
        gameList = await client.getGamesByProvider(provider);
      } else {
        gameList = await client.getAllGames(filters);
      }
      setGames(gameList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load games');
    } finally {
      setLoading(false);
    }
  }, [client, provider, filters]);

  React.useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    games,
    loading,
    error,
    reload: loadGames
  };
}

// Hook per i risultati live
export function useLiveGameResults(provider: string, gameId: string) {
  const { client } = useCasino();
  const [results, setResults] = React.useState<GameResult[]>([]);
  const [connected, setConnected] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cleanup: (() => void) | undefined;

    const subscribe = async () => {
      try {
        setError(null);
        const wsClient = await client.subscribeToGame(
          provider,
          gameId,
          (result: GameResult) => {
            setResults(prev => [result, ...prev.slice(0, 19)]); // Mantieni solo ultimi 20
          }
        );

        wsClient.on('connected', () => setConnected(true));
        wsClient.on('disconnected', () => setConnected(false));
        wsClient.on('error', (err: { message: string }) => setError(err.message));

        cleanup = () => {
          client.unsubscribeFromGame(provider);
          setConnected(false);
        };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to subscribe');
      }
    };

    if (provider && gameId) {
      subscribe();
    }

    return cleanup;
  }, [client, provider, gameId]);

  return {
    results,
    connected,
    error,
    clearResults: () => setResults([])
  };
}
