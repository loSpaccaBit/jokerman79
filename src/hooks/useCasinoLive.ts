import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CasinoClient, 
  CasinoClientConfig,
  Provider,
  Game,
  GameResult
} from '@/lib/casino-live-results-client-mock';

interface UseCasinoLiveOptions {
  baseUrl?: string;
  autoConnect?: boolean;
  maxResults?: number;
}

/**
 * Hook legacy per compatibilità con il vecchio sistema
 * Ora utilizza la nuova libreria casino-live-results-client
 */
export function useCasinoLive(options: UseCasinoLiveOptions = {}) {
  const { 
    baseUrl = process.env.NEXT_PUBLIC_CASINO_API_URL || 'http://localhost:3001',
    autoConnect = true,
    maxResults = 20 
  } = options;

  const [providers, setProviders] = useState<Provider[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [liveResults, setLiveResults] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<CasinoClient | null>(null);
  const currentSubscription = useRef<string | null>(null);

  // Inizializza client
  useEffect(() => {
    const config: CasinoClientConfig = {
      baseUrl,
      timeout: 10000
    };

    clientRef.current = new CasinoClient(config);

    // Auto-authenticate
    if (autoConnect) {
      const authenticate = async () => {
        try {
          setError(null);
          await clientRef.current!.authenticate(
            process.env.NEXT_PUBLIC_CASINO_CLIENT_ID || 'nextjs-client',
            process.env.NEXT_PUBLIC_CASINO_CLIENT_SECRET || 'your-secret-key-change-in-production'
          );
          setConnected(true);
          setAuthenticated(true);
        } catch (err) {
          console.error('Authentication failed:', err);
          setError(err instanceof Error ? err.message : 'Authentication failed');
          setAuthenticated(false);
        }
      };
      authenticate();
    }

    return () => {
      if (clientRef.current) {
        clientRef.current.disconnectAll();
      }
    };
  }, [baseUrl, autoConnect]);

  // Fetch providers
  const fetchProviders = useCallback(async () => {
    if (!clientRef.current || !authenticated) {
      console.log('Cannot fetch providers: client not ready or not authenticated');
      return;
    }
    
    try {
      setError(null);
      const providerList = await clientRef.current.getProviders();
      setProviders(providerList);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch providers');
    }
  }, [authenticated]);

  // Auto-fetch providers when authenticated
  useEffect(() => {
    if (authenticated) {
      fetchProviders();
    }
  }, [authenticated, fetchProviders]);

  // Fetch games for provider
  const fetchGames = useCallback(async (providerId: string, filters: Record<string, any> = {}) => {
    if (!clientRef.current || !authenticated) {
      console.log('Cannot fetch games: client not ready or not authenticated');
      return;
    }
    
    setLoading(true);
    try {
      setError(null);
      const gameList = await clientRef.current.getGamesByProvider(providerId);
      setGames(gameList);
    } catch (error) {
      console.error('Failed to fetch games:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  // Get game details
  const getGameDetails = useCallback(async (providerId: string, gameId: string) => {
    if (!clientRef.current) return null;
    
    try {
      setError(null);
      const game = await clientRef.current.getGame(providerId, gameId);
      return game;
    } catch (error) {
      console.error('Failed to fetch game details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch game details');
      return null;
    }
  }, []);

  // Subscribe to game live results
  const subscribeToGame = useCallback(async (providerId: string, gameId: string) => {
    if (!clientRef.current) return;

    // Cleanup previous subscription
    if (currentSubscription.current) {
      clientRef.current.unsubscribeFromGame(currentSubscription.current);
    }

    // Clear previous results
    setLiveResults([]);
    setError(null);

    try {
      // Subscribe to new game
      await clientRef.current.subscribeToGame(
        providerId,
        gameId,
        (result: GameResult) => {
          setLiveResults(prev => [result, ...prev.slice(0, maxResults - 1)]);
        }
      );

      currentSubscription.current = providerId;
    } catch (error) {
      console.error('Failed to subscribe to game:', error);
      setError(error instanceof Error ? error.message : 'Failed to subscribe');
    }
  }, [maxResults]);

  // Disconnect
  const disconnect = useCallback(() => {
    if (clientRef.current && currentSubscription.current) {
      clientRef.current.unsubscribeFromGame(currentSubscription.current);
      currentSubscription.current = null;
      setConnected(false);
    }
  }, []);

  // Health check
  const checkHealth = useCallback(async () => {
    if (!clientRef.current) return false;
    
    try {
      await clientRef.current.getHealth();
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }, []);

  return {
    // State
    providers,
    games,
    liveResults,
    loading,
    connected,
    error,
    
    // Actions
    fetchProviders,
    fetchGames,
    getGameDetails,
    subscribeToGame,
    disconnect,
    checkHealth
  };
}
