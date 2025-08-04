// Pragmatic Play WebSocket Manager per il frontend
import { EventEmitter } from 'events';

export interface PragmaticGameData {
  tableId: string;
  tableName?: string;
  tableType?: string;
  tableOpen?: boolean;
  dealer?: {
    name: string;
  };
  totalSeatedPlayers?: number;
  gameResult?: Array<{
    result: string;
    winner?: string;
    multiplier?: number;
    cardValue?: string;
    color?: string;
    slots?: Record<string, unknown>;
  }>;
  last20Results?: Array<{
    result: string;
    color?: string;
    multiplier?: number;
  }>;
  lastUpdate?: string;
}

export interface PragmaticSubscription {
  gameId: string;
  tableIds: string[];
  listeners: Set<(data: PragmaticGameData) => void>;
}

class PragmaticWebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private isConnected = false;
  private reconnectInterval: NodeJS.Timeout | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10;
  
  // Mappa delle sottoscrizioni attive: gameId -> subscription
  private subscriptions = new Map<string, PragmaticSubscription>();
  
  // Ultimi dati ricevuti per ogni tavolo
  private tableData = new Map<string, PragmaticGameData>();

  private readonly config = {
    wsUrl: 'wss://dga.pragmaticplaylive.net/ws',
    casinoId: 'il9srgw4dna11111', // Casino ID dall'archivio
    reconnectDelay: 5000,
  };

  /**
   * Connessione al WebSocket di Pragmatic Play
   */
  async connect(): Promise<boolean> {
    if (this.isConnected || this.ws) {
      console.log('🔌 Già connesso o connessione in corso');
      return true;
    }

    try {
      console.log(`🔌 Connessione a Pragmatic Play: ${this.config.wsUrl}`);
      
      this.ws = new WebSocket(this.config.wsUrl);

      return new Promise((resolve, reject) => {
        if (!this.ws) {
          reject(new Error('WebSocket non inizializzato'));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error('Timeout connessione WebSocket'));
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(timeout);
          console.log('✅ Connesso a Pragmatic Play WebSocket');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.clearReconnectTimeout();
          
          // Richiedi tavoli disponibili
          this.requestAvailableTables();
          
          this.emit('connected');
          resolve(true);
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onclose = (event) => {
          clearTimeout(timeout);
          console.log(`❌ Connessione WebSocket chiusa: ${event.code} - ${event.reason}`);
          this.isConnected = false;
          this.ws = null;
          this.emit('disconnected');
          this.scheduleReconnect();
        };

        this.ws.onerror = (error) => {
          clearTimeout(timeout);
          console.error('❌ Errore WebSocket:', error);
          this.isConnected = false;
          this.ws = null;
          this.emit('error', error);
          this.scheduleReconnect();
          reject(error);
        };
      });

    } catch (error) {
      console.error('❌ Errore connessione WebSocket:', error);
      this.scheduleReconnect();
      return false;
    }
  }

  /**
   * Disconnessione dal WebSocket
   */
  disconnect(): void {
    console.log('🔌 Disconnessione da Pragmatic Play...');
    
    this.clearReconnectTimeout();
    this.isConnected = false;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.emit('disconnected');
  }

  /**
   * Richiedi tavoli disponibili
   */
  requestAvailableTables(): void {
    this.sendMessage({
      type: 'available',
      casinoId: this.config.casinoId
    });
  }

  /**
   * Sottoscrivi a un gioco specifico
   */
  async subscribeToGame(gameId: string, tableIds: string[], listener: (data: PragmaticGameData) => void): Promise<void> {
    console.log(`🎮 Sottoscrizione a gioco ${gameId} con tavoli:`, tableIds);

    // Aggiungi o aggiorna la sottoscrizione
    let subscription = this.subscriptions.get(gameId);
    if (!subscription) {
      subscription = {
        gameId,
        tableIds,
        listeners: new Set()
      };
      this.subscriptions.set(gameId, subscription);
    }

    subscription.listeners.add(listener);

    // Se già connesso, sottoscrivi subito
    if (this.isConnected) {
      this.subscribeToTables(tableIds);
    } else {
      // Altrimenti connetti prima
      await this.connect();
      this.subscribeToTables(tableIds);
    }

    // Invia dati esistenti se disponibili
    const existingData = this.getGameData(gameId);
    if (existingData.length > 0) {
      existingData.forEach(data => listener(data));
    }
  }

  /**
   * Sottoscrivi ai tavoli specifici
   */
  private subscribeToTables(tableIds: string[]): void {
    for (const tableId of tableIds) {
      this.sendMessage({
        type: 'subscribe',
        key: tableId,
        casinoId: this.config.casinoId,
        currency: 'EUR'
      });
      console.log(`📊 Sottoscritto al tavolo ${tableId}`);
    }
  }

  /**
   * Rimuovi sottoscrizione da un gioco
   */
  unsubscribeFromGame(gameId: string, listener: (data: PragmaticGameData) => void): void {
    console.log(`🎮 Rimozione sottoscrizione da gioco ${gameId}`);

    const subscription = this.subscriptions.get(gameId);
    if (!subscription) return;

    subscription.listeners.delete(listener);

    // Se non ci sono più listener, rimuovi la sottoscrizione
    if (subscription.listeners.size === 0) {
      this.subscriptions.delete(gameId);
      
      // Disiscrivi dai tavoli su Pragmatic Play
      for (const tableId of subscription.tableIds) {
        this.sendMessage({
          type: 'unsubscribe',
          key: tableId,
          casinoId: this.config.casinoId
        });
        console.log(`📊 Disiscritto dal tavolo ${tableId} per ${gameId}`);
      }
    }
  }

  /**
   * Ottieni dati di un gioco
   */
  getGameData(gameId: string): PragmaticGameData[] {
    const subscription = this.subscriptions.get(gameId);
    if (!subscription) return [];

    const gameData: PragmaticGameData[] = [];
    for (const tableId of subscription.tableIds) {
      const data = this.tableData.get(tableId);
      if (data) {
        gameData.push(data);
      }
    }

    return gameData;
  }

  /**
   * Invia messaggio al WebSocket
   */
  private sendMessage(message: Record<string, unknown>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ WebSocket non connesso, impossibile inviare messaggio');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      console.error('❌ Errore invio messaggio:', error);
    }
  }

  /**
   * Gestisce i messaggi ricevuti dal WebSocket
   */
  private handleMessage(rawData: string): void {
    try {
      const data = JSON.parse(rawData);
      
      // Log del messaggio ricevuto (troncato)
      const logData = JSON.stringify(data).substring(0, 200);
      console.log(`📨 Messaggio Pragmatic: ${logData}...`);

      // Gestisci diversi tipi di messaggio
      if (data.type === 'available' && data.tables) {
        console.log(`📋 Ricevuti ${data.tables.length} tavoli disponibili`);
        this.emit('availableTables', data.tables);
        return;
      }

      // Gestisci aggiornamenti dei tavoli
      if (data.tableId) {
        const gameData: PragmaticGameData = {
          ...data,
          lastUpdate: new Date().toISOString()
        };

        // Salva i dati del tavolo
        this.tableData.set(data.tableId, gameData);

        // Notifica tutti i listener interessati
        this.subscriptions.forEach((subscription) => {
          if (subscription.tableIds.includes(data.tableId)) {
            subscription.listeners.forEach(listener => {
              try {
                listener(gameData);
              } catch (error) {
                console.error(`❌ Errore notifica listener per ${subscription.gameId}:`, error);
              }
            });
          }
        });

        console.log(`📈 Aggiornamento tavolo ${data.tableId} (${data.tableType || 'unknown'})`);
      }

    } catch (error) {
      console.error('❌ Errore parsing messaggio:', error);
    }
  }

  /**
   * Programma riconnessione automatica
   */
  private scheduleReconnect(): void {
    if (this.reconnectInterval || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Riconnessione programmata (tentativo ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectInterval = setTimeout(() => {
      this.reconnectInterval = null;
      this.connect().catch(console.error);
    }, this.config.reconnectDelay);
  }

  /**
   * Cancella timeout di riconnessione
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Ottieni stato della connessione
   */
  getConnectionStatus(): 'connected' | 'connecting' | 'disconnected' | 'error' {
    if (this.isConnected) return 'connected';
    if (this.reconnectInterval) return 'connecting';
    return 'disconnected';
  }

  /**
   * Ottieni statistiche del servizio
   */
  getStats() {
    return {
      isConnected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      activeSubscriptions: this.subscriptions.size,
      cachedTables: this.tableData.size,
      subscriptions: Array.from(this.subscriptions.entries()).map(([gameId, sub]) => ({
        gameId,
        tableIds: sub.tableIds,
        listeners: sub.listeners.size
      }))
    };
  }
}

// Singleton instance
const pragmaticWebSocketManager = new PragmaticWebSocketManager();

export default pragmaticWebSocketManager;
