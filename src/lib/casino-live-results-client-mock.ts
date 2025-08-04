/**
 * Mock del modulo casino-live-results-client per sviluppo/produzione
 * Questo mock sostituisce il microservizio casino quando non è disponibile
 */

export interface Provider {
  id: string;
  name: string;
  logo?: string;
  isActive: boolean;
  games: Game[];
}

export interface Game {
  id: string;
  name: string;
  providerId: string;
  type: 'live' | 'slot' | 'table';
  isActive: boolean;
  thumbnail?: string;
  url?: string;
}

export interface GameResult {
  id: string;
  gameId: string;
  timestamp: number;
  result: any;
  metadata?: any;
}

export interface CasinoClientConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
}

export class CasinoClient {
  private config: CasinoClientConfig;
  private connected: boolean = false;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: CasinoClientConfig = {}) {
    this.config = {
      baseUrl: 'http://localhost:3001',
      timeout: 5000,
      ...config
    };
  }

  async connect(): Promise<void> {
    console.log('[CasinoClient Mock] Simulating connection...');
    return new Promise((resolve) => {
      setTimeout(() => {
        this.connected = true;
        this.emit('connected');
        resolve();
      }, 1000);
    });
  }

  async authenticate(apiKey?: string): Promise<void> {
    console.log('[CasinoClient Mock] Simulating authentication...');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('[CasinoClient Mock] Authentication successful');
        resolve();
      }, 500);
    });
  }

  async disconnect(): Promise<void> {
    console.log('[CasinoClient Mock] Disconnecting...');
    this.connected = false;
    this.emit('disconnected');
  }

  async disconnectAll(): Promise<void> {
    console.log('[CasinoClient Mock] Disconnecting all...');
    this.unsubscribeAll();
    await this.disconnect();
  }

  isConnected(): boolean {
    return this.connected;
  }

  async getHealth(): Promise<{ status: string; timestamp: number }> {
    console.log('[CasinoClient Mock] Health check...');
    return {
      status: 'healthy',
      timestamp: Date.now()
    };
  }

  async getProviders(): Promise<Provider[]> {
    console.log('[CasinoClient Mock] Getting providers...');
    return [
      {
        id: 'evolution',
        name: 'Evolution Gaming',
        logo: '/providers/evolution.png',
        isActive: true,
        games: [
          {
            id: 'live-blackjack',
            name: 'Live Blackjack',
            providerId: 'evolution',
            type: 'live',
            isActive: true,
            thumbnail: '/games/blackjack.jpg'
          },
          {
            id: 'live-roulette',
            name: 'Live Roulette',
            providerId: 'evolution',
            type: 'live',
            isActive: true,
            thumbnail: '/games/roulette.jpg'
          }
        ]
      },
      {
        id: 'pragmatic',
        name: 'Pragmatic Play',
        logo: '/providers/pragmatic.png',
        isActive: true,
        games: [
          {
            id: 'sweet-bonanza',
            name: 'Sweet Bonanza',
            providerId: 'pragmatic',
            type: 'slot',
            isActive: true,
            thumbnail: '/games/sweet-bonanza.jpg'
          }
        ]
      }
    ];
  }

  async getGames(providerId?: string): Promise<Game[]> {
    console.log(`[CasinoClient Mock] Getting games for provider: ${providerId || 'all'}`);
    const providers = await this.getProviders();
    
    if (providerId) {
      const provider = providers.find(p => p.id === providerId);
      return provider ? provider.games : [];
    }
    
    return providers.flatMap(p => p.games);
  }

  async getGamesByProvider(providerId: string): Promise<Game[]> {
    console.log(`[CasinoClient Mock] Getting games by provider: ${providerId}`);
    return this.getGames(providerId);
  }

  async getGame(providerId: string, gameId: string): Promise<Game | null> {
    console.log(`[CasinoClient Mock] Getting game: ${gameId} from provider: ${providerId}`);
    const games = await this.getGames(providerId);
    return games.find(game => game.id === gameId) || null;
  }

  async getAllGames(filters?: any): Promise<Game[]> {
    console.log('[CasinoClient Mock] Getting all games with filters:', filters);
    return this.getGames();
  }

  async getResults(gameId: string, limit?: number): Promise<GameResult[]> {
    console.log(`[CasinoClient Mock] Getting results for game: ${gameId}`);
    const mockResults: GameResult[] = [];
    const resultLimit = limit || 10;
    
    for (let i = 0; i < resultLimit; i++) {
      mockResults.push({
        id: `result-${gameId}-${i}`,
        gameId,
        timestamp: Date.now() - (i * 60000), // Results every minute
        result: {
          winner: Math.random() > 0.5 ? 'player' : 'banker',
          cards: ['A♠', 'K♦'],
          total: Math.floor(Math.random() * 21) + 1
        }
      });
    }
    
    return mockResults;
  }

  subscribeToGame(providerId: string, gameId: string, callback: (result: GameResult) => void): void {
    console.log(`[CasinoClient Mock] Subscribing to game: ${gameId} from provider: ${providerId}`);
    
    // Simulate real-time results every 30 seconds
    const interval = setInterval(() => {
      if (!this.connected) {
        clearInterval(interval);
        return;
      }
      
      const mockResult: GameResult = {
        id: `live-result-${gameId}-${Date.now()}`,
        gameId,
        timestamp: Date.now(),
        result: {
          winner: Math.random() > 0.5 ? 'player' : 'banker',
          cards: ['A♠', 'K♦'],
          total: Math.floor(Math.random() * 21) + 1
        }
      };
      
      callback(mockResult);
    }, 30000);

    // Store interval for cleanup
    const subscriptionKey = `game-${providerId}-${gameId}`;
    if (!this.eventListeners.has(subscriptionKey)) {
      this.eventListeners.set(subscriptionKey, []);
    }
    this.eventListeners.get(subscriptionKey)?.push(() => clearInterval(interval));
  }

  unsubscribeFromGame(providerId: string, gameId: string): void {
    console.log(`[CasinoClient Mock] Unsubscribing from game: ${gameId} from provider: ${providerId}`);
    const subscriptionKey = `game-${providerId}-${gameId}`;
    const listeners = this.eventListeners.get(subscriptionKey);
    if (listeners) {
      listeners.forEach(cleanup => cleanup());
      this.eventListeners.delete(subscriptionKey);
    }
  }

  unsubscribeAll(): void {
    console.log('[CasinoClient Mock] Unsubscribing from all games');
    this.eventListeners.forEach((listeners) => {
      listeners.forEach(cleanup => cleanup());
    });
    this.eventListeners.clear();
  }

  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function): void {
    if (!callback) {
      this.eventListeners.delete(event);
      return;
    }
    
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }
}

// Export default per compatibilità
export default CasinoClient;

// Hook mock per useCasinoClient
export function useCasinoClient(config: CasinoClientConfig = {}) {
  const client = new CasinoClient(config);
  
  return {
    client,
    isConnected: () => client.isConnected(),
    connect: () => client.connect(),
    disconnect: () => client.disconnect(),
    authenticate: (apiKey?: string) => client.authenticate(apiKey),
    getProviders: () => client.getProviders(),
    getGames: (providerId?: string) => client.getGames(providerId),
    subscribeToGame: (providerId: string, gameId: string, callback: (result: GameResult) => void) => 
      client.subscribeToGame(providerId, gameId, callback),
    unsubscribeFromGame: (providerId: string, gameId: string) => 
      client.unsubscribeFromGame(providerId, gameId),
    unsubscribeAll: () => client.unsubscribeAll()
  };
}
