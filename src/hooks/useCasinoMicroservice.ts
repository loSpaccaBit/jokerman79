import { useState, useEffect, useCallback, useRef } from 'react';

// Singleton WebSocket connection manager
class CasinoWebSocketManager {
  private static instance: CasinoWebSocketManager;
  private ws: WebSocket | null = null;
  private baseUrl: string = '';
  private connected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private subscribers: Set<(data: any) => void> = new Set();
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private initialized: boolean = false;
  private activeSubscriptions: Set<string> = new Set(); // Track active game subscriptions
  private pendingApiCalls: Map<string, Promise<any>> = new Map(); // Track pending API calls
  private cachedProviders: any[] = []; // Cache providers data
  private loadingStates: Map<string, boolean> = new Map(); // Track loading states
  private loadingListeners: Set<(states: Map<string, boolean>) => void> = new Set();

  private constructor() {}

  static getInstance(): CasinoWebSocketManager {
    if (!CasinoWebSocketManager.instance) {
      CasinoWebSocketManager.instance = new CasinoWebSocketManager();
    }
    return CasinoWebSocketManager.instance;
  }

  setBaseUrl(url: string) {
    if (this.baseUrl !== url) {
      this.baseUrl = url;
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        console.log('🔄 [Singleton] Base URL changed, reconnecting...');
        this.disconnect();
      }
    }
  }

  connect(baseUrl?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (baseUrl) {
        this.setBaseUrl(baseUrl);
      }
      
      if (!this.baseUrl) {
        reject(new Error('No base URL provided'));
        return;
      }
      
      // Check if we're in the browser
      if (typeof window === 'undefined' || typeof WebSocket === 'undefined') {
        console.warn('⚠️ WebSocket not available (SSR or browser does not support)');
        reject(new Error('WebSocket not available'));
        return;
      }

      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('⚠️ WebSocket already connected, reusing connection');
        resolve();
        return;
      }

      if (this.ws?.readyState === WebSocket.CONNECTING) {
        console.log('⚠️ WebSocket already connecting, waiting...');
        const checkConnection = () => {
          if (this.ws?.readyState === WebSocket.OPEN) {
            resolve();
          } else if (this.ws?.readyState === WebSocket.CLOSED) {
            reject(new Error('Connection failed'));
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
        return;
      }

      try {
        const wsUrl = this.baseUrl.replace('http', 'ws') + '/ws';
        console.log('🔌 [Singleton] Connecting to Casino Microservice WebSocket:', wsUrl);
        
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('✅ [Singleton] WebSocket connected to Casino Microservice');
          this.connected = true;
          this.reconnectAttempts = 0;
          this.notifyConnectionListeners(true);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            let messageData = event.data;
            if (messageData instanceof Blob) {
              console.warn('Received Blob message, converting to text');
              return;
            } else if (messageData instanceof ArrayBuffer) {
              messageData = new TextDecoder('utf8').decode(messageData);
            }
            
            const data = JSON.parse(messageData);
            console.log('📨 [Singleton] WebSocket message received:', data);

            // Notify all subscribers
            this.subscribers.forEach(callback => {
              try {
                callback(data);
              } catch (error) {
                console.error('Error in subscriber callback:', error);
              }
            });
          } catch (error) {
            console.error('❌ Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 [Singleton] WebSocket connection closed:', event.code, event.reason);
          this.connected = false;
          this.notifyConnectionListeners(false);
          
          // Auto-reconnect with exponential backoff
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            console.log(`🔄 [Singleton] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
            
            this.reconnectTimeout = setTimeout(() => {
              this.reconnectAttempts++;
              this.connect().catch(console.error);
            }, delay);
          }
        };

        this.ws.onerror = (error) => {
          console.error('❌ [Singleton] WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        console.error('❌ Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  disconnect() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.connected = false;
    this.notifyConnectionListeners(false);
  }

  subscribe(callback: (data: any) => void) {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  addConnectionListener(callback: (connected: boolean) => void) {
    this.connectionListeners.add(callback);
    // Immediately notify of current status
    callback(this.connected);
    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  private notifyConnectionListeners(connected: boolean) {
    this.connectionListeners.forEach(callback => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener callback:', error);
      }
    });
  }

  send(data: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
      return true;
    }
    console.warn('⚠️ [Singleton] WebSocket not connected, cannot send:', data);
    return false;
  }

  isConnected(): boolean {
    return this.connected && this.ws?.readyState === WebSocket.OPEN;
  }

  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  async initializeIfNeeded(baseUrl: string): Promise<void> {
    if (this.initialized) {
      console.log('⚠️ [Singleton] Already initialized, skipping');
      return;
    }

    console.log('🎰 [Singleton] Initializing for the first time...');
    this.setLoadingState('initialization', true);
    this.initialized = true;
    
    try {
      await this.connect(baseUrl);
      console.log('✅ [Singleton] Successfully initialized');
    } catch (error) {
      console.error('❌ [Singleton] Failed to initialize:', error);
      this.initialized = false; // Reset on error
      throw error;
    } finally {
      this.setLoadingState('initialization', false);
    }
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  subscribeToGame(provider: string, gameId: string): boolean {
    const subscriptionKey = `${provider}:${gameId}`;
    
    if (this.activeSubscriptions.has(subscriptionKey)) {
      console.log(`⚠️ [Singleton] Already subscribed to ${subscriptionKey}, skipping duplicate`);
      return true; // Already subscribed
    }

    if (!this.isConnected()) {
      console.warn('⚠️ [Singleton] WebSocket not connected, cannot subscribe');
      return false;
    }

    console.log(`🎯 [Singleton] Subscribing to ${provider} game: ${gameId}`);
    const success = this.send({
      type: 'subscribe_game',
      provider,
      gameId
    });

    if (success) {
      this.activeSubscriptions.add(subscriptionKey);
      console.log(`✅ [Singleton] Added subscription: ${subscriptionKey} (total: ${this.activeSubscriptions.size})`);
    }

    return success;
  }

  unsubscribeFromGame(provider: string, gameId: string): boolean {
    const subscriptionKey = `${provider}:${gameId}`;
    
    if (!this.activeSubscriptions.has(subscriptionKey)) {
      console.log(`⚠️ [Singleton] Not subscribed to ${subscriptionKey}, skipping`);
      return true; // Not subscribed anyway
    }

    if (!this.isConnected()) {
      console.warn('⚠️ [Singleton] WebSocket not connected, cannot unsubscribe');
      return false;
    }

    console.log(`🎯 [Singleton] Unsubscribing from ${provider} game: ${gameId}`);
    const success = this.send({
      type: 'unsubscribe_game',
      provider,
      gameId
    });

    if (success) {
      this.activeSubscriptions.delete(subscriptionKey);
      console.log(`✅ [Singleton] Removed subscription: ${subscriptionKey} (total: ${this.activeSubscriptions.size})`);
    }

    return success;
  }

  getActiveSubscriptions(): string[] {
    return Array.from(this.activeSubscriptions);
  }

  async fetchProviders(baseUrl: string): Promise<any[]> {
    const cacheKey = 'providers';
    
    // Return cached data if available
    if (this.cachedProviders.length > 0) {
      console.log('📦 [Singleton] Returning cached providers');
      return this.cachedProviders;
    }

    // Check if there's already a pending request
    if (this.pendingApiCalls.has(cacheKey)) {
      console.log('⏳ [Singleton] Providers request already pending, waiting...');
      return this.pendingApiCalls.get(cacheKey)!;
    }

    console.log('🌐 [Singleton] Fetching providers from API...');
    this.setLoadingState('providers', true);
    
    // Create the promise and store it
    const promise = this.performFetchProviders(baseUrl);
    this.pendingApiCalls.set(cacheKey, promise);

    try {
      const result = await promise;
      this.cachedProviders = result;
      return result;
    } catch (error) {
      throw error;
    } finally {
      // Remove from pending requests
      this.pendingApiCalls.delete(cacheKey);
      this.setLoadingState('providers', false);
    }
  }

  private async performFetchProviders(baseUrl: string): Promise<any[]> {
    try {
      const response = await fetch(`${baseUrl}/api/providers`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.providers || [];
    } catch (error) {
      console.error('❌ [Singleton] Failed to fetch providers:', error);
      throw error;
    }
  }

  getCachedProviders(): any[] {
    return this.cachedProviders;
  }

  private setLoadingState(key: string, loading: boolean) {
    this.loadingStates.set(key, loading);
    this.notifyLoadingListeners();
  }

  private notifyLoadingListeners() {
    this.loadingListeners.forEach(callback => {
      try {
        callback(new Map(this.loadingStates));
      } catch (error) {
        console.error('Error in loading listener callback:', error);
      }
    });
  }

  addLoadingListener(callback: (states: Map<string, boolean>) => void) {
    this.loadingListeners.add(callback);
    // Immediately notify of current state
    callback(new Map(this.loadingStates));
    return () => {
      this.loadingListeners.delete(callback);
    };
  }

  isLoading(key?: string): boolean {
    if (key) {
      return this.loadingStates.get(key) || false;
    }
    // Return true if any operation is loading
    return Array.from(this.loadingStates.values()).some(loading => loading);
  }

  getLoadingStates(): Map<string, boolean> {
    return new Map(this.loadingStates);
  }
}

interface Provider {
  name: string;
  status: 'connected' | 'disconnected';
  gameCount: number;
}

interface Game {
  id: string;
  name: string;
  provider: string;
  gameType: string;
  vertical: 'live' | 'rng' | 'slots';
  status: 'open' | 'closed';
  playerCount: number;
  language?: string;
  providerData?: any;
}

interface GameUpdate {
  type: string;
  gameId: string;
  timestamp: string;
  data: any;
}

interface CasinoMicroserviceHookReturn {
  // State
  providers: Provider[];
  games: Game[];
  gameUpdates: GameUpdate[];
  liveResults: GameUpdate[]; // Alias for gameUpdates for compatibility
  connected: boolean;
  loading: boolean;
  globalLoading: boolean; // Overall loading state
  loadingStates: Map<string, boolean>; // Detailed loading states
  error: string | null;
  
  // Actions
  fetchProviders: () => Promise<void>;
  fetchGames: (providerName?: string) => Promise<void>;
  subscribeToGame: (gameId: string, roomId?: string) => Promise<void>; // Updated signature for compatibility
  unsubscribeFromGame: (gameId: string) => void; // Updated signature for compatibility
  getGameDetails: (provider: string, gameId: string) => Promise<Game | null>;
  checkHealth: () => Promise<boolean>;
  clearResults: () => void; // Added for compatibility
  
  // Loading utilities
  isLoading: (key?: string) => boolean;
}

interface UseCasinoMicroserviceOptions {
  baseUrl?: string;
  autoConnect?: boolean;
  enableWebSocket?: boolean; // Added for compatibility
  maxUpdates?: number;
}

/**
 * Hook per integrare il Casino Microservice
 * Connette Next.js al microservizio via REST API + WebSocket
 */
export function useCasinoMicroservice(
  options: UseCasinoMicroserviceOptions = {}
): CasinoMicroserviceHookReturn {
  const {
    baseUrl = process.env.NEXT_PUBLIC_CASINO_MICROSERVICE_URL || 'http://localhost:4000',
    autoConnect = true,
    enableWebSocket = true, // For compatibility
    maxUpdates = 50
  } = options;

  // State
  const [providers, setProviders] = useState<Provider[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [gameUpdates, setGameUpdates] = useState<GameUpdate[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [globalLoading, setGlobalLoading] = useState(true); // Global loading state
  const [loadingStates, setLoadingStates] = useState<Map<string, boolean>>(new Map());

  // Refs
  const wsManager = useRef<CasinoWebSocketManager>(CasinoWebSocketManager.getInstance());

  // WebSocket connection via singleton manager
  const connectWebSocket = useCallback(async () => {
    console.log('🎰 [Hook] Attempting to initialize with baseUrl:', baseUrl);
    try {
      await wsManager.current.initializeIfNeeded(baseUrl);
      console.log('🎰 [Hook] Initialized via singleton manager');
    } catch (error) {
      console.error('❌ [Hook] Failed to initialize via singleton manager:', error);
      setError('Failed to establish WebSocket connection');
    }
  }, [baseUrl]);

  // Message handler for this hook instance
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connection':
        console.log('🎰 Connected to providers:', data.providers);
        break;

      case 'games_list':
      case 'all_games':
        if (data.games) {
          if (Array.isArray(data.games)) {
            setGames(data.games);
          } else {
            // data.games is an object with provider names as keys
            const allGames = Object.values(data.games).flat() as Game[];
            setGames(allGames);
          }
        }
        break;

      case 'game_update':
        const update: GameUpdate = {
          type: data.data?.type || data.type,
          gameId: data.gameId,
          timestamp: data.timestamp,
          data: data.data
        };
        
        setGameUpdates(prev => [update, ...prev.slice(0, maxUpdates - 1)]);
        break;

      case 'subscription_success':
        console.log(`✅ Subscribed to ${data.provider} game: ${data.gameId}`);
        break;

      case 'unsubscription_success':
        console.log(`✅ Unsubscribed from ${data.provider} game: ${data.gameId}`);
        break;

      case 'error':
        console.error('❌ WebSocket error from server:', data.message);
        setError(data.message);
        break;

      default:
        console.log('🤷 Unknown WebSocket message type:', data.type);
    }
  }, [maxUpdates]);

  // Fetch providers via REST API
  const fetchProviders = useCallback(async () => {
    try {
      setError(null);
      const providers = await wsManager.current.fetchProviders(baseUrl);
      setProviders(providers);
    } catch (error) {
      console.error('❌ Failed to fetch providers:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch providers');
    }
  }, [baseUrl]);

  // Fetch games via REST API
  const fetchGames = useCallback(async (providerName?: string) => {
    setLoading(true);
    try {
      setError(null);
      
      let url = `${baseUrl}/api/providers`;
      if (providerName) {
        url += `/${encodeURIComponent(providerName)}/games`;
      }
      
      if (!providerName) {
        // Request all games via WebSocket
        if (wsManager.current.isConnected()) {
          wsManager.current.send({
            type: 'get_games'
          });
        }
        return;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setGames(data.games || []);
    } catch (error) {
      console.error('❌ Failed to fetch games:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch games');
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Subscribe to game updates via WebSocket - Updated for compatibility
  const subscribeToGame = useCallback(async (gameId: string, roomId?: string): Promise<void> => {
    // Auto-detect provider based on gameId format
    let provider = 'pragmatic'; // Default to pragmatic
    
    // Evolution game IDs are typically longer strings with letters/hyphens
    // Examples: "crazy-time", "lightning-roulette", "monopoly-live"
    if (gameId.includes('-') || (gameId.length > 6 && /[a-zA-Z]/.test(gameId))) {
      provider = 'evolution';
    }
    // Pragmatic game IDs are typically numeric: "1101", "68", etc.
    else if (/^\d+$/.test(gameId)) {
      provider = 'pragmatic';
    }
    
    const success = wsManager.current.subscribeToGame(provider, gameId);

    if (!success) {
      const error = 'Failed to subscribe to game';
      setError(error);
      throw new Error(error);
    }
  }, []);

  // Unsubscribe from game updates - Updated for compatibility
  const unsubscribeFromGame = useCallback((gameId: string) => {
    // Auto-detect provider based on gameId format
    let provider = 'pragmatic'; // Default to pragmatic
    
    // Evolution game IDs are typically longer strings with letters/hyphens
    if (gameId.includes('-') || (gameId.length > 6 && /[a-zA-Z]/.test(gameId))) {
      provider = 'evolution';
    }
    // Pragmatic game IDs are typically numeric: "1101", "68", etc.
    else if (/^\d+$/.test(gameId)) {
      provider = 'pragmatic';
    }
    
    wsManager.current.unsubscribeFromGame(provider, gameId);
  }, []);

  // Clear results function for compatibility
  const clearResults = useCallback(() => {
    setGameUpdates([]);
  }, []);

  // Get game details via REST API
  const getGameDetails = useCallback(async (provider: string, gameId: string): Promise<Game | null> => {
    try {
      setError(null);
      const response = await fetch(`${baseUrl}/api/providers/${encodeURIComponent(provider)}/games/${encodeURIComponent(gameId)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.game || null;
    } catch (error) {
      console.error('❌ Failed to fetch game details:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch game details');
      return null;
    }
  }, [baseUrl]);

  // Health check
  const checkHealth = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch(`${baseUrl}/health`);
      return response.ok;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return false;
    }
  }, [baseUrl]);

  // Setup WebSocket listeners and auto-connect
  useEffect(() => {
    const hookId = Math.random().toString(36).substr(2, 9);
    console.log(`🎰 [Hook ${hookId}] useEffect called`);
    
    if (!autoConnect || !enableWebSocket || typeof window === 'undefined') {
      console.log('⚠️ Auto-connect disabled or not in browser');
      return;
    }

    console.log(`🎰 [Instance] Setting up casino microservice hook (subscribers: ${wsManager.current.getSubscriberCount()})`);
    console.log(`🎰 [Instance] Hook options:`, { baseUrl, autoConnect, enableWebSocket });

    // Subscribe to WebSocket messages
    const unsubscribeFromMessages = wsManager.current.subscribe(handleWebSocketMessage);
    console.log('📡 [Instance] Subscribed to WebSocket messages');
    
    // Subscribe to connection status changes
    const unsubscribeFromConnection = wsManager.current.addConnectionListener(setConnected);
    console.log('📡 [Instance] Subscribed to connection status changes');

    // Subscribe to loading state changes
    const unsubscribeFromLoading = wsManager.current.addLoadingListener((states) => {
      setLoadingStates(states);
      const isAnyLoading = Array.from(states.values()).some(loading => loading);
      setGlobalLoading(isAnyLoading);
      console.log('📊 [Instance] Loading states updated:', Object.fromEntries(states));
    });
    console.log('📡 [Instance] Subscribed to loading state changes');

    // Delay connection to ensure we're fully hydrated
    const timeoutId = setTimeout(() => {
      console.log('⏰ [Instance] Starting delayed connection...');
      connectWebSocket().then(() => {
        console.log('🎰 [Instance] WebSocket connection established');
        
        // Separate timeout for providers to avoid blocking WebSocket
        setTimeout(() => {
          console.log('🌐 [Instance] Fetching providers after WebSocket connection...');
          fetchProviders().catch(err => {
            console.error('❌ [Instance] Failed to fetch providers on mount:', err);
          });
        }, 500);
      }).catch(error => {
        console.error('Failed to auto-connect:', error);
        setError('Failed to initialize casino microservice connection');
      });
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      unsubscribeFromMessages();
      unsubscribeFromConnection();
      unsubscribeFromLoading();
      console.log(`🧹 [Instance] Cleaning up casino microservice hook (remaining subscribers: ${wsManager.current.getSubscriberCount() - 1})`);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once

  return {
    // State
    providers,
    games,
    gameUpdates,
    liveResults: gameUpdates, // Alias for compatibility
    connected,
    loading,
    globalLoading, // Overall loading state
    loadingStates, // Detailed loading states
    error,
    
    // Actions
    fetchProviders,
    fetchGames,
    subscribeToGame,
    unsubscribeFromGame,
    getGameDetails,
    checkHealth,
    clearResults,
    
    // Loading utilities
    isLoading: (key?: string) => wsManager.current.isLoading(key)
  };
}