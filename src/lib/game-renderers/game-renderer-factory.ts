import { 
  GameType, 
  GameProvider, 
  GameRenderConfig, 
  GameRenderComponent,
  GameRenderMapping,
  GameCategory 
} from '@/types/live-games';

// Game render configurations optimized per type
export const gameRenderConfigs: Record<string, GameRenderConfig> = {
  // Roulette games
  'ROULETTE': {
    gameType: 'ROULETTE',
    provider: 'evolution',
    category: 'table-games',
    resultsPerPage: 20,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 4,
    cardSize: 'small',
    updateInterval: 5000,
    maxResults: 50
  },
  'LIGHTNING_ROULETTE': {
    gameType: 'LIGHTNING_ROULETTE',
    provider: 'evolution',
    category: 'table-games',
    resultsPerPage: 15,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 3,
    cardSize: 'medium',
    updateInterval: 3000,
    maxResults: 40
  },

  // Card games
  'DRAGONTIGER': {
    gameType: 'DRAGONTIGER',
    provider: 'pragmatic',
    category: 'card-games',
    resultsPerPage: 12,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'large',
    updateInterval: 2000,
    maxResults: 30
  },
  'BLACKJACK': {
    gameType: 'BLACKJACK',
    provider: 'evolution',
    category: 'card-games',
    resultsPerPage: 10,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 1,
    cardSize: 'large',
    updateInterval: 8000,
    maxResults: 25
  },
  'BACCARAT': {
    gameType: 'BACCARAT',
    provider: 'evolution',
    category: 'card-games',
    resultsPerPage: 15,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 3,
    cardSize: 'medium',
    updateInterval: 4000,
    maxResults: 35
  },

  // Game shows
  'SWEETBONANZA': {
    gameType: 'SWEETBONANZA',
    provider: 'pragmatic',
    category: 'game-shows',
    resultsPerPage: 8,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'large',
    updateInterval: 10000,
    maxResults: 20
  },
  'CRAZYTIME': {
    gameType: 'CRAZYTIME',
    provider: 'evolution',
    category: 'game-shows',
    resultsPerPage: 10,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'large',
    updateInterval: 8000,
    maxResults: 25
  },
  'FUNKYTIME': {
    gameType: 'FUNKYTIME',
    provider: 'evolution',
    category: 'game-shows',
    resultsPerPage: 10,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'large',
    updateInterval: 8000,
    maxResults: 25
  },
  'MONOPOLY_LIVE': {
    gameType: 'MONOPOLY_LIVE',
    provider: 'evolution',
    category: 'game-shows',
    resultsPerPage: 8,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'large',
    updateInterval: 12000,
    maxResults: 20
  },

  // Wheel games
  'MEGAWHEEL': {
    gameType: 'MEGAWHEEL',
    provider: 'evolution',
    category: 'wheel-games',
    resultsPerPage: 12,
    showMultipliers: true,
    showSpecialEffects: true,
    showPlayerCount: true,
    gridColumns: 3,
    cardSize: 'medium',
    updateInterval: 6000,
    maxResults: 30
  },
  'DREAM_CATCHER': {
    gameType: 'DREAM_CATCHER',
    provider: 'evolution',
    category: 'wheel-games',
    resultsPerPage: 15,
    showMultipliers: true,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 4,
    cardSize: 'small',
    updateInterval: 5000,
    maxResults: 40
  },

  // Specialty games
  'ANDARBAHAR': {
    gameType: 'ANDARBAHAR',
    provider: 'evolution',
    category: 'specialty-games',
    resultsPerPage: 10,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'medium',
    updateInterval: 3000,
    maxResults: 25
  }
};

// Component mapping based on game type and category
export const gameRenderMapping: GameRenderMapping = {
  'ROULETTE': {
    component: 'RouletteRenderer',
    config: gameRenderConfigs.ROULETTE
  },
  'LIGHTNING_ROULETTE': {
    component: 'RouletteRenderer',
    config: gameRenderConfigs.LIGHTNING_ROULETTE
  },
  'DRAGONTIGER': {
    component: 'DragonTigerRenderer',
    config: gameRenderConfigs.DRAGONTIGER
  },
  'BLACKJACK': {
    component: 'CardGameRenderer',
    config: gameRenderConfigs.BLACKJACK
  },
  'BACCARAT': {
    component: 'CardGameRenderer',
    config: gameRenderConfigs.BACCARAT
  },
  'SWEETBONANZA': {
    component: 'SweetBonanzaRenderer',
    config: gameRenderConfigs.SWEETBONANZA
  },
  'CRAZYTIME': {
    component: 'GameShowRenderer',
    config: gameRenderConfigs.CRAZYTIME
  },
  'FUNKYTIME': {
    component: 'GameShowRenderer',
    config: gameRenderConfigs.FUNKYTIME
  },
  'MONOPOLY_LIVE': {
    component: 'GameShowRenderer',
    config: gameRenderConfigs.MONOPOLY_LIVE
  },
  'MEGAWHEEL': {
    component: 'WheelGameRenderer',
    config: gameRenderConfigs.MEGAWHEEL
  },
  'DREAM_CATCHER': {
    component: 'WheelGameRenderer',
    config: gameRenderConfigs.DREAM_CATCHER
  },
  'ANDARBAHAR': {
    component: 'GenericRenderer',
    config: gameRenderConfigs.ANDARBAHAR
  }
};

// Factory function to get render configuration
export function getGameRenderConfig(gameType: GameType): GameRenderConfig {
  return gameRenderConfigs[gameType] || {
    gameType,
    provider: 'evolution',
    category: 'table-games',
    resultsPerPage: 10,
    showMultipliers: false,
    showSpecialEffects: false,
    showPlayerCount: true,
    gridColumns: 2,
    cardSize: 'medium',
    updateInterval: 5000,
    maxResults: 30
  };
}

// Factory function to get render component
export function getGameRenderComponent(gameType: GameType): GameRenderComponent {
  return gameRenderMapping[gameType]?.component || 'GenericRenderer';
}

// Utility to detect game type from gameId
export function detectGameType(gameId: string, provider?: GameProvider): GameType {
  const gameIdLower = gameId.toLowerCase();
  
  // Evolution Gaming patterns
  if (gameIdLower.includes('crazy') || gameIdLower.includes('crazytime')) {
    return 'CRAZYTIME';
  }
  if (gameIdLower.includes('funky') || gameIdLower.includes('funkytime')) {
    return 'FUNKYTIME';
  }
  if (gameIdLower.includes('lightning') && gameIdLower.includes('roulette')) {
    return 'LIGHTNING_ROULETTE';
  }
  if (gameIdLower.includes('roulette')) {
    return 'ROULETTE';
  }
  if (gameIdLower.includes('blackjack')) {
    return 'BLACKJACK';
  }
  if (gameIdLower.includes('baccarat')) {
    return 'BACCARAT';
  }
  if (gameIdLower.includes('monopoly')) {
    return 'MONOPOLY_LIVE';
  }
  if (gameIdLower.includes('dream') || gameIdLower.includes('catcher')) {
    return 'DREAM_CATCHER';
  }
  if (gameIdLower.includes('mega') && gameIdLower.includes('wheel')) {
    return 'MEGAWHEEL';
  }
  if (gameIdLower.includes('andar') || gameIdLower.includes('bahar')) {
    return 'ANDARBAHAR';
  }
  
  // Pragmatic Play patterns
  if (gameIdLower.includes('sweet') || gameIdLower.includes('bonanza')) {
    return 'SWEETBONANZA';
  }
  if (gameIdLower.includes('dragon') || gameIdLower.includes('tiger')) {
    return 'DRAGONTIGER';
  }
  
  // Provider-specific fallbacks
  if (provider === 'pragmatic') {
    // Numeric IDs are often Pragmatic
    if (/^\d+$/.test(gameId)) {
      return 'SWEETBONANZA'; // Default for Pragmatic
    }
  }
  
  // Default fallback
  return 'ROULETTE';
}

// Get category from game type
export function getGameCategory(gameType: GameType): GameCategory {
  const config = gameRenderConfigs[gameType];
  return config?.category || 'table-games';
}

// Check if game supports specific features
export function gameSupportsMultipliers(gameType: GameType): boolean {
  const config = gameRenderConfigs[gameType];
  return config?.showMultipliers || false;
}

export function gameSupportsSpecialEffects(gameType: GameType): boolean {
  const config = gameRenderConfigs[gameType];
  return config?.showSpecialEffects || false;
}