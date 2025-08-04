/**
 * Configurazione per i microservizi casino integrati
 * API Gateway su porta 3100, WebSocket Gateway su porta 3003
 */

export const casinoMicroserviceConfig = {
  // URLs del nuovo microservizio unificato
  apiGateway: process.env.NEXT_PUBLIC_CASINO_MICROSERVICE_URL || 'http://localhost:4000',
  websocketGateway: process.env.NEXT_PUBLIC_CASINO_MICROSERVICE_URL?.replace('http', 'ws') || 'ws://localhost:4000',
  
  // API endpoints
  endpoints: {
    // Auth service endpoints
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      refresh: '/api/auth/refresh',
      me: '/api/auth/me',
      apiKeys: '/api/auth/api-keys'
    },
    // Games service endpoints  
    games: {
      public: '/api/games/public',
      categories: '/api/games/categories',
      providers: '/api/games/providers',
      launch: '/api/games/launch',
      byProvider: (providerId: string) => `/api/games/provider/${providerId}`,
      details: (gameId: string) => `/api/games/${gameId}`
    },
    // WebSocket endpoints
    websocket: {
      status: '/api/websocket/status',
      rooms: '/api/websocket/rooms'
    }
  },
  
  // Credenziali per autenticazione
  auth: {
    clientId: process.env.NEXT_PUBLIC_CASINO_CLIENT_ID || 'nextjs-client',
    clientSecret: process.env.NEXT_PUBLIC_CASINO_CLIENT_SECRET || 'your-secret-key-change-in-production',
    apiKey: process.env.NEXT_PUBLIC_CASINO_API_KEY || ''
  },
  
  // Configurazioni WebSocket
  websocket: {
    autoReconnect: true,
    reconnectDelay: 3000,
    maxReconnectAttempts: 10,
    pingInterval: 30000,
    transports: ['websocket', 'polling']
  },
  
  // Provider supportati con configurazioni specifiche
  providers: {
    evolution: {
      id: 'evolution',
      name: 'Evolution Gaming',
      endpoint: '/evolution',
      supported: true,
      gameTypes: ['live-roulette', 'live-blackjack', 'live-baccarat', 'live-poker', 'game-shows'],
      features: ['live-dealer', 'mobile-optimized', 'hd-streaming']
    },
    pragmatic: {
      id: 'pragmatic',
      name: 'Pragmatic Play',
      endpoint: '/pragmatic', 
      supported: true,
      gameTypes: ['live-roulette', 'live-blackjack', 'live-baccarat', 'live-casino-holdem'],
      features: ['live-dealer', 'multi-language', 'mobile-friendly']
    }
  },
  
  // API configuration
  api: {
    timeout: 10000,
    retries: 3,
    retryDelay: 1000,
    rateLimits: {
      public: 100, // requests per minute
      authenticated: 1000,
      gameLaunch: 50
    }
  },
  
  // Game categories mapping
  gameCategories: {
    'live-roulette': 'Live Roulette',
    'live-blackjack': 'Live Blackjack', 
    'live-baccarat': 'Live Baccarat',
    'live-poker': 'Live Poker',
    'game-shows': 'Game Shows',
    'live-casino-holdem': 'Live Casino Hold\'em'
  },
  
  // Game types mapping (mantenuto per compatibilità)
  gameTypes: {
    'roulette': 'Roulette',
    'lightning-roulette': 'Lightning Roulette',
    'blackjack': 'Blackjack',
    'baccarat': 'Baccarat',
    'dragon-tiger': 'Dragon Tiger',
    'wheel-of-fortune': 'Wheel of Fortune',
    'crazy-time': 'Crazy Time',
    'monopoly-live': 'Monopoly Live',
    'dream-catcher': 'Dream Catcher'
  },
  
  // WebSocket event types
  wsEvents: {
    // Client to server
    GAME_JOIN: 'game:join',
    GAME_LEAVE: 'game:leave', 
    GAME_SUBSCRIBE: 'game:subscribe',
    GAME_UNSUBSCRIBE: 'game:unsubscribe',
    GAME_ACTION: 'game:action',
    // Server to client
    GAME_STATE: 'game:state',
    GAME_RESULT: 'game:result',
    PLAYER_JOINED: 'game:player_joined',
    PLAYER_LEFT: 'game:player_left',
    ERROR: 'error',
    CONNECTED: 'connected',
    DISCONNECTED: 'disconnected'
  },
  
  // Debug settings
  debug: process.env.NODE_ENV === 'development',
  logLevel: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
} as const;

export type CasinoMicroserviceConfig = typeof casinoMicroserviceConfig;
