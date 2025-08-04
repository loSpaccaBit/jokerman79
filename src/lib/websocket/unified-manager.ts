// Manager unificato per tutti i provider di giochi live
import { EventEmitter } from 'events';
import pragmaticWebSocketManager, { PragmaticGameData } from './pragmatic-manager';
import evolutionSSEManager, { EvolutionGameData, EvolutionGameConfig } from './evolution-manager';

export type UnifiedGameData = PragmaticGameData | EvolutionGameData;

export interface GameProvider {
  type: 'pragmatic' | 'evolution';
  gameId: string;
  tableIds?: string[]; // Per Pragmatic e Evolution
  gameType?: string; // Tipo di gioco (es. "GAMESHOW", "ROULETTE", "BLACKJACK")
  category?: string; // Categoria del gioco
  name?: string; // Nome del gioco
}

export interface UnifiedSubscription {
  gameId: string;
  provider: GameProvider;
  listeners: Set<(data: UnifiedGameData) => void>;
}

class UnifiedGameManager extends EventEmitter {
  private subscriptions = new Map<string, UnifiedSubscription>();
  private gameProviders = new Map<string, GameProvider>();

  /**
   * Registra un gioco con il suo provider
   */
  registerGame(gameId: string, provider: GameProvider): void {
    this.gameProviders.set(gameId, provider);
    console.log(`🎮 Registrato gioco ${gameId} con provider ${provider.type}`);
  }

  /**
   * Sottoscrivi a un gioco (automaticamente instrada al provider corretto)
   */
  async subscribeToGame(
    gameId: string, 
    listener: (data: UnifiedGameData) => void,
    provider?: GameProvider
  ): Promise<void> {
    // Se non è fornito il provider, cerca nella mappa
    const gameProvider = provider || this.gameProviders.get(gameId);
    
    if (!gameProvider) {
      throw new Error(`Provider non trovato per il gioco ${gameId}. Registra prima il gioco.`);
    }

    console.log(`🎮 Sottoscrizione unificata a gioco ${gameId} (provider: ${gameProvider.type})`);

    // Aggiungi alla mappa delle sottoscrizioni
    let subscription = this.subscriptions.get(gameId);
    if (!subscription) {
      subscription = {
        gameId,
        provider: gameProvider,
        listeners: new Set()
      };
      this.subscriptions.set(gameId, subscription);
    }

    subscription.listeners.add(listener);

    // Crea wrapper per il listener specifico del provider
    const wrappedListener = (data: UnifiedGameData) => {
      // Aggiungi metadata del provider
      const enrichedData = {
        ...data,
        providerType: gameProvider.type,
        gameId
      };
      
      subscription!.listeners.forEach(l => {
        try {
          l(enrichedData);
        } catch (error) {
          console.error(`❌ Errore notifica listener unificato per ${gameId}:`, error);
        }
      });
    };

    // Instrada al provider corretto
    try {
      switch (gameProvider.type) {
        case 'pragmatic':
          if (!gameProvider.tableIds || gameProvider.tableIds.length === 0) {
            throw new Error(`TableIds richiesti per Pragmatic Play gioco ${gameId}`);
          }
          await pragmaticWebSocketManager.subscribeToGame(
            gameId, 
            gameProvider.tableIds, 
            wrappedListener as (data: PragmaticGameData) => void
          );
          break;

        case 'evolution':
          // TEMPORANEAMENTE DISABILITATO: Evolution ora usa API diretta con polling
          // Il sistema SSE è stato deprecato in favore di chiamate API con rate limiting
          console.warn(`⚠️ Evolution Gaming WebSocket/SSE disabilitato per ${gameId}`);
          console.log(`ℹ️ Evolution Gaming ora usa API diretta nella pagina con testEvolutionStateAPI()`);
          
          if (!gameProvider.gameType) {
            console.warn(`⚠️ GameType mancante per Evolution Gaming gioco ${gameId}, ma procedo comunque`);
          }
          
          const evolutionConfig: EvolutionGameConfig = {
            type: 'evolution',
            gameId,
            gameType: gameProvider.gameType || 'UNKNOWN',
            tableIds: gameProvider.tableIds,
            category: gameProvider.category,
            name: gameProvider.name
          };
          
          console.log(`ℹ️ Configurazione mantenuta per compatibilità:`, evolutionConfig);
          
          // Simula una sottoscrizione di successo ma non fa nulla
          setTimeout(() => {
            console.log(`✅ Evolution subscription simulata per ${gameId} (nessuna connessione reale)`);
          }, 100);
          break;

        default:
          throw new Error(`Provider non supportato: ${gameProvider.type}`);
      }

      console.log(`✅ Sottoscrizione unificata completata per ${gameId}`);

    } catch (error) {
      console.error(`❌ Errore sottoscrizione unificata per ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Rimuovi sottoscrizione da un gioco
   */
  unsubscribeFromGame(gameId: string, listener: (data: UnifiedGameData) => void): void {
    console.log(`🎮 Rimozione sottoscrizione unificata da gioco ${gameId}`);

    const subscription = this.subscriptions.get(gameId);
    if (!subscription) return;

    subscription.listeners.delete(listener);

    // Se non ci sono più listener, rimuovi anche dal provider specifico
    if (subscription.listeners.size === 0) {
      switch (subscription.provider.type) {
        case 'pragmatic':
          // Per Pragmatic dobbiamo passare il listener originale, ma non lo abbiamo più
          // Dovremmo mantenere una mappa dei listener wrappati
          console.warn('⚠️ Rimozione automatica da Pragmatic non implementata completamente');
          break;

        case 'evolution':
          // Evolution SSE è disabilitato, non c'è nulla da disconnettere
          console.log(`ℹ️ Evolution unsubscribe simulato per ${gameId} (nessuna connessione reale)`);
          break;
      }

      this.subscriptions.delete(gameId);
    }
  }

  /**
   * Ottieni dati di un gioco da qualsiasi provider
   */
  getGameData(gameId: string): UnifiedGameData | null {
    const provider = this.gameProviders.get(gameId);
    if (!provider) return null;

    switch (provider.type) {
      case 'pragmatic':
        const pragmaticData = pragmaticWebSocketManager.getGameData(gameId);
        return pragmaticData.length > 0 ? pragmaticData[0] : null;

      case 'evolution':
        // Evolution SSE Manager non ha getGameData, dovremmo implementarlo se necessario
        console.warn('⚠️ getGameData non implementato per Evolution SSE Manager');
        return null;

      default:
        return null;
    }
  }

  /**
   * Connetti tutti i provider
   */
  async connectAll(): Promise<void> {
    console.log('🔌 Connessione a tutti i provider...');
    
    const connections = await Promise.allSettled([
      pragmaticWebSocketManager.connect(),
      evolutionSSEManager.connect('default') // Evolution SSE richiede un gameId
    ]);

    connections.forEach((result, index) => {
      const provider = index === 0 ? 'Pragmatic Play' : 'Evolution Gaming';
      if (result.status === 'fulfilled') {
        console.log(`✅ ${provider} connesso`);
      } else {
        console.error(`❌ Errore connessione ${provider}:`, result.reason);
      }
    });
  }

  /**
   * Disconnetti tutti i provider
   */
  disconnectAll(): void {
    console.log('🔌 Disconnessione da tutti i provider...');
    pragmaticWebSocketManager.disconnect();
    evolutionSSEManager.disconnect();
  }

  /**
   * Ottieni stato di tutti i provider
   */
  getConnectionStatus(): Record<string, string> {
    return {
      pragmatic: pragmaticWebSocketManager.getConnectionStatus(),
      evolution: evolutionSSEManager.connectionStatus.status
    };
  }

  /**
   * Ottieni statistiche unificate
   */
  getStats() {
    return {
      registeredGames: this.gameProviders.size,
      activeSubscriptions: this.subscriptions.size,
      providers: {
        pragmatic: pragmaticWebSocketManager.getStats(),
        evolution: {
          connected: evolutionSSEManager.connected,
          registeredGames: evolutionSSEManager.registeredGamesCount,
          connectionStatus: evolutionSSEManager.connectionStatus
        }
      },
      gamesByProvider: {
        pragmatic: Array.from(this.gameProviders.entries())
          .filter(([, provider]) => provider.type === 'pragmatic')
          .map(([gameId]) => gameId),
        evolution: Array.from(this.gameProviders.entries())
          .filter(([, provider]) => provider.type === 'evolution')
          .map(([gameId]) => gameId)
      }
    };
  }

  /**
   * Auto-registra giochi da configurazione Strapi
   */
  autoRegisterGames(games: Array<{
    gameId: string;
    provider: string;
    tableIds?: string[];
  }>): void {
    console.log(`🔄 Auto-registrazione di ${games.length} giochi...`);

    for (const game of games) {
      let providerType: 'pragmatic' | 'evolution';
      
      // Determina il tipo di provider dalla configurazione
      if (game.provider.toLowerCase().includes('pragmatic')) {
        providerType = 'pragmatic';
      } else if (game.provider.toLowerCase().includes('evolution')) {
        providerType = 'evolution';
      } else {
        console.warn(`⚠️ Provider sconosciuto per gioco ${game.gameId}: ${game.provider}`);
        continue;
      }

      this.registerGame(game.gameId, {
        type: providerType,
        gameId: game.gameId,
        tableIds: game.tableIds
      });
    }

    console.log(`✅ Auto-registrazione completata`);
  }

  /**
   * Forza la disconnessione di tutti i giochi e pulisce le risorse
   */
  forceDisconnectAll(): void {
    console.log('🔌 Disconnessione forzata di tutti i giochi...');
    
    // Disconnetti tutti i giochi attivi
    for (const [gameId] of this.subscriptions) {
      this.unsubscribeFromGameCompletely(gameId);
    }
    
    // Disconnetti i manager
    pragmaticWebSocketManager.disconnect();
    evolutionSSEManager.disconnect();
    
    // Pulisci le mappe
    this.subscriptions.clear();
    this.gameProviders.clear();
    
    console.log('✅ Disconnessione forzata completata');
  }

  /**
   * Rimuove completamente un gioco e tutte le sue sottoscrizioni
   */
  unsubscribeFromGameCompletely(gameId: string): void {
    const subscription = this.subscriptions.get(gameId);
    if (!subscription) {
      return;
    }

    console.log(`🗑️ Rimozione completa gioco ${gameId} con ${subscription.listeners.size} listener`);

    // Rimuovi tutti i listener
    for (const listener of subscription.listeners) {
      this.unsubscribeFromGame(gameId, listener);
    }

    // Rimuovi dalla mappa dei provider
    this.gameProviders.delete(gameId);
    
    console.log(`✅ Gioco ${gameId} rimosso completamente`);
  }

  /**
   * Ottieni la lista dei giochi attualmente connessi
   */
  getConnectedGames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Verifica se un gioco è attualmente connesso
   */
  isGameConnected(gameId: string): boolean {
    return this.subscriptions.has(gameId);
  }
}

// Singleton instance
const unifiedGameManager = new UnifiedGameManager();

export default unifiedGameManager;
