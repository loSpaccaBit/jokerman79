import WebSocket from 'ws';
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
    slots?: Record<string, any>;
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

class PragmaticWebSocketService extends EventEmitter {
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
    casinoId: 'il9srgw4dna11111', // Casino ID da archivio
  };

  constructor() {
    super();
  }

  /**
   * Inizializza la connessione WebSocket se non già connessa
   */
  private async ensureConnection(): Promise<void> {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    return new Promise((resolve, reject) => {
      try {
        console.log('🔌 Connessione a Pragmatic Play WebSocket...');
        this.ws = new WebSocket(this.config.wsUrl);

        this.ws.on('open', () => {
          console.log('✅ Connesso a Pragmatic Play');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.clearReconnectInterval();
          resolve();
        });

        this.ws.on('message', (data) => {
          try {
            const gameData = JSON.parse(data.toString()) as PragmaticGameData;
            this.handleGameData(gameData);
          } catch (error) {
            console.error('❌ Errore parsing dati Pragmatic:', error);
          }
        });

        this.ws.on('close', () => {
          console.log('❌ Connessione Pragmatic chiusa');
          this.isConnected = false;
          this.scheduleReconnect();
        });

        this.ws.on('error', (error) => {
          console.error('❌ Errore WebSocket Pragmatic:', error);
          this.isConnected = false;
          if (this.reconnectAttempts === 0) {
            reject(error);
          }
          this.scheduleReconnect();
        });

      } catch (error) {
        console.error('❌ Errore connessione Pragmatic:', error);
        reject(error);
      }
    });
  }

  /**
   * Gestisce i dati ricevuti dal WebSocket
   */
  private handleGameData(data: PragmaticGameData): void {
    if (!data.tableId) return;

    // Aggiorna timestamp
    data.lastUpdate = new Date().toISOString();
    
    // Salva i dati del tavolo
    this.tableData.set(data.tableId, data);

    let notifiedListeners = 0;

    // Trova le sottoscrizioni interessate a questo tavolo
    for (const [gameId, subscription] of this.subscriptions) {
      if (subscription.tableIds.includes(data.tableId)) {
        // Notifica tutti i listener per questo gioco
        subscription.listeners.forEach(listener => {
          try {
            listener(data);
            notifiedListeners++;
          } catch (error) {
            console.error(`❌ Errore notifica listener per gioco ${gameId}:`, error);
          }
        });
      }
    }

    console.log(`📊 Dati ricevuti per tavolo ${data.tableId} (${notifiedListeners} listener notificati)`);
  }

  /**
   * Invia un messaggio al WebSocket Pragmatic
   */
  private sendMessage(message: any): void {
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
   * Sottoscrive i tavoli per un gioco specifico
   */
  private subscribeToTables(tableIds: string[]): void {
    tableIds.forEach(tableId => {
      this.sendMessage({
        type: 'subscribe',
        key: tableId,
        casinoId: this.config.casinoId,
        currency: 'EUR'
      });
      console.log(`📊 Sottoscritto al tavolo ${tableId}`);
    });
  }

  /**
   * Disiscrive i tavoli
   */
  private unsubscribeFromTables(tableIds: string[]): void {
    tableIds.forEach(tableId => {
      this.sendMessage({
        type: 'unsubscribe',
        key: tableId,
        casinoId: this.config.casinoId
      });
      console.log(`📊 Disiscritto dal tavolo ${tableId}`);
    });
  }

  /**
   * Gestisce la riconnessione automatica
   */
  private scheduleReconnect(): void {
    if (this.reconnectInterval || this.reconnectAttempts >= this.maxReconnectAttempts) {
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);

    console.log(`🔄 Riconnessione programmata in ${delay}ms (tentativo ${this.reconnectAttempts})`);
    
    this.reconnectInterval = setTimeout(async () => {
      this.clearReconnectInterval();
      try {
        await this.ensureConnection();
        // Risottoscrivi tutti i tavoli attivi
        const allTableIds = Array.from(this.subscriptions.values())
          .flatMap(sub => sub.tableIds);
        if (allTableIds.length > 0) {
          this.subscribeToTables([...new Set(allTableIds)]);
        }
      } catch (error) {
        console.error('❌ Fallimento riconnessione:', error);
      }
    }, delay);
  }

  private clearReconnectInterval(): void {
    if (this.reconnectInterval) {
      clearTimeout(this.reconnectInterval);
      this.reconnectInterval = null;
    }
  }

  /**
   * Sottoscrive un client ai dati di un gioco specifico
   */
  public async subscribeToGame(
    gameId: string, 
    tableIds: string[], 
    listener: (data: PragmaticGameData) => void
  ): Promise<void> {
    try {
      // Assicura la connessione
      await this.ensureConnection();

      // Crea o aggiorna la sottoscrizione
      let subscription = this.subscriptions.get(gameId);
      
      if (!subscription) {
        subscription = {
          gameId,
          tableIds: [...tableIds],
          listeners: new Set()
        };
        this.subscriptions.set(gameId, subscription);
        
        // Sottoscrivi ai tavoli solo se è la prima sottoscrizione per questo gioco
        this.subscribeToTables(tableIds);
      } else {
        // Aggiungi eventuali nuovi tableIds
        const newTableIds = tableIds.filter(id => !subscription!.tableIds.includes(id));
        if (newTableIds.length > 0) {
          subscription.tableIds.push(...newTableIds);
          this.subscribeToTables(newTableIds);
        }
      }

      // Aggiungi il listener
      subscription.listeners.add(listener);

      // Invia i dati esistenti al nuovo listener
      tableIds.forEach(tableId => {
        const existingData = this.tableData.get(tableId);
        if (existingData) {
          try {
            listener(existingData);
          } catch (error) {
            console.error(`❌ Errore invio dati esistenti:`, error);
          }
        }
      });

      console.log(`✅ Client sottoscritto al gioco ${gameId} (${subscription.listeners.size} listener attivi)`);

    } catch (error) {
      console.error(`❌ Errore sottoscrizione gioco ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Rimuove la sottoscrizione di un client
   */
  public unsubscribeFromGame(gameId: string, listener: (data: PragmaticGameData) => void): void {
    const subscription = this.subscriptions.get(gameId);
    if (!subscription) return;

    subscription.listeners.delete(listener);

    // Se non ci sono più listener, rimuovi la sottoscrizione
    if (subscription.listeners.size === 0) {
      this.unsubscribeFromTables(subscription.tableIds);
      this.subscriptions.delete(gameId);
      console.log(`🗑️ Sottoscrizione rimossa per gioco ${gameId}`);
      
      // Se non ci sono più sottoscrizioni, chiudi la connessione
      if (this.subscriptions.size === 0) {
        this.disconnect();
      }
    } else {
      console.log(`📉 Listener rimosso dal gioco ${gameId} (${subscription.listeners.size} rimanenti)`);
    }
  }

  /**
   * Disconnette il WebSocket
   */
  public disconnect(): void {
    this.clearReconnectInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    this.isConnected = false;
    this.subscriptions.clear();
    this.tableData.clear();
    console.log('🔌 WebSocket Pragmatic disconnesso');
  }

  /**
   * Ottieni lo stato della connessione
   */
  public getConnectionStatus(): { connected: boolean; subscriptions: number; tables: number } {
    return {
      connected: this.isConnected,
      subscriptions: this.subscriptions.size,
      tables: this.tableData.size
    };
  }

  /**
   * Ottieni i dati di un tavolo specifico
   */
  public getTableData(tableId: string): PragmaticGameData | undefined {
    return this.tableData.get(tableId);
  }

  /**
   * Ottieni tutti i dati per un gioco
   */
  public getGameData(gameId: string): PragmaticGameData[] {
    const subscription = this.subscriptions.get(gameId);
    if (!subscription) return [];

    return subscription.tableIds
      .map(tableId => this.tableData.get(tableId))
      .filter((data): data is PragmaticGameData => data !== undefined);
  }
}

// Singleton instance
export const pragmaticWebSocketService = new PragmaticWebSocketService();

export default pragmaticWebSocketService;
