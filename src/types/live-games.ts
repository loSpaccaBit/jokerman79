// Game type definitions for optimized rendering
export type GameProvider = 'evolution' | 'pragmatic';

export type GameType = 
  | 'ROULETTE' 
  | 'LIGHTNING_ROULETTE'
  | 'DRAGONTIGER' 
  | 'SWEETBONANZA'
  | 'BLACKJACK'
  | 'BACCARAT' 
  | 'CRAZYTIME'
  | 'FUNKYTIME'
  | 'MEGAWHEEL'
  | 'ANDARBAHAR'
  | 'MONOPOLY_LIVE'
  | 'DREAM_CATCHER';

export type GameCategory = 
  | 'table-games' 
  | 'card-games' 
  | 'game-shows' 
  | 'wheel-games'
  | 'specialty-games';

// Base game result interface
export interface BaseGameResult {
  id: string;
  gameId: string;
  tableId?: string;
  timestamp: string;
  provider: GameProvider;
  gameType: GameType;
}

// Pragmatic Play specific results
export interface PragmaticGameResult extends BaseGameResult {
  provider: 'pragmatic';
  result: string | number;
  winner?: string;
  // Sweet Bonanza specific
  sugarbomb?: boolean;
  sbmul?: number[];
  multiplier?: number;
  payout?: number[];
  // Roulette specific  
  color?: 'red' | 'black' | 'green';
  // General
  rc?: number;
}

// Evolution Gaming specific results
export interface EvolutionGameResult extends BaseGameResult {
  provider: 'evolution';
  messageType: string;
  result?: string | number;
  outcome?: string;
  // Game show specific
  bonus?: boolean;
  multiplier?: number;
  payout?: number;
  // Player data
  players?: number;
  tableOpen?: boolean;
  // Nested data structure
  data?: any;
}

// Unified result interface for rendering
export interface ProcessedGameResult {
  id: string;
  gameId: string;
  gameType: GameType;
  provider: GameProvider;
  result: string | number;
  timestamp: string;
  // Optional metadata
  special?: boolean;
  multiplier?: number;
  bonus?: boolean;
  color?: string;
  payout?: string;
  players?: number;
  // Rendering hints
  displayVariant: 'number' | 'card' | 'wheel' | 'bonus' | 'special';
  category: GameCategory;
}

// Game configuration for rendering optimization
export interface GameRenderConfig {
  gameType: GameType;
  provider: GameProvider;
  category: GameCategory;
  // UI configuration
  resultsPerPage: number;
  showMultipliers: boolean;
  showSpecialEffects: boolean;
  showPlayerCount: boolean;
  // Layout hints
  gridColumns: 1 | 2 | 3 | 4;
  cardSize: 'small' | 'medium' | 'large';
  // Update frequency
  updateInterval: number;
  maxResults: number;
}

// Provider-specific data processors
export interface GameDataProcessor {
  provider: GameProvider;
  processUpdate: (rawData: any) => ProcessedGameResult[];
  extractStats: (rawData: any) => GameStats;
  detectGameType: (gameId: string, rawData?: any) => GameType;
}

// Game statistics interface
export interface GameStats {
  totalUpdates: number;
  playerCount: number;
  tableOpen: boolean;
  lastResult?: ProcessedGameResult;
  // Game-specific stats
  hotNumbers?: number[];
  coldNumbers?: number[];
  streaks?: { type: string; count: number }[];
  specialEventCount?: number;
}

// Render component mapping
export type GameRenderComponent = 
  | 'RouletteRenderer'
  | 'DragonTigerRenderer' 
  | 'SweetBonanzaRenderer'
  | 'CardGameRenderer'
  | 'WheelGameRenderer'
  | 'GameShowRenderer'
  | 'GenericRenderer';

export interface GameRenderMapping {
  [key: string]: {
    component: GameRenderComponent;
    config: GameRenderConfig;
  };
}