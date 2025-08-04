import { EventEmitter } from 'events';

export interface EvolutionGameConfig {
  type: 'evolution';
  gameId: string;
  gameType: string;
  category?: string;
  name?: string;
  tableIds?: string[];
}

export interface EvolutionGameData {
  gameType: string;
  tableId?: string;
  gameState?: Record<string, unknown>;
  cards?: Record<string, unknown>[];
  results?: Record<string, unknown>[];
  statistics?: Record<string, unknown>;
  bets?: Record<string, unknown>;
  players?: Record<string, unknown>[];
  dealers?: Record<string, unknown>[];
  timestamp: string;
  provider: 'evolution';
}

export interface EvolutionConnectionState {
  status: 'disconnected' | 'connecting' | 'connected' | 'error';
  error?: string;
  gameId?: string;
  connectedAt?: string;
  reconnectAttempts: number;
}

/**
 * Manager SSE per Evolution Gaming - utilizza l'endpoint Next.js esistente
 * Connessione sicura tramite Server-Sent Events invece di WebSocket client
 */
class EvolutionSSEManager extends EventEmitter {
  private eventSource: EventSource | null = null;
  private connectionState: EvolutionConnectionState = {
    status: 'disconnected',
    reconnectAttempts: 0
  };
  
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private maxReconnectAttempts: number = 3;
  private reconnectDelay: number = 5000; // 5 secondi
  
  // Gestione giochi registrati
  private gameConfigs: Map<string, EvolutionGameConfig> = new Map();
  private gameListeners: Map<string, Set<(data: EvolutionGameData) => void>> = new Map();

  constructor() {
    super();
    
    // Listener di default per errori non gestiti
    this.on('error', (error) => {
      console.warn('⚠️ Errore Evolution SSE (gestito):', error);
    });
    
    // Cleanup automatico quando la pagina si chiude
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', () => {
        this.disconnect();
      });
    }
  }

  /**
   * Costruisce l'URL SSE per Evolution Gaming con parametri completi
   */
  private buildSSEUrl(gameId: string, gameType?: string, tableIds?: string[]): string {
    const baseUrl = '/api/evolution/websocket-proxy';
    const params = new URLSearchParams({
      gameId: gameId,
      provider: 'evolution',
      timestamp: Date.now().toString()
    });
    
    if (gameType) {
      params.set('gameType', gameType);
    }
    
    if (tableIds && tableIds.length > 0) {
      params.set('tableIds', tableIds.join(','));
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Chiama Evolution Gaming state API prima della connessione WebSocket
   */
  private async fetchEvolutionState(gameId: string, tableIds?: string[]): Promise<Record<string, unknown>> {
    try {
      const stateUrl = '/api/evolution/proxy';
      const params = new URLSearchParams({
        path: '/api/lobby/v1/sportbetit000001/state',
        gameId: gameId
      });
      
      if (tableIds && tableIds.length > 0) {
        params.set('tableIds', tableIds.join(','));
      }
      
      console.log(`📡 Chiamata Evolution state API per ${gameId}:`, {
        url: `${stateUrl}?${params.toString()}`,
        tableIds
      });
      
      const response = await fetch(`${stateUrl}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Evolution state API error: ${response.status} ${response.statusText}`);
      }
      
      const stateData = await response.json();
      
      console.log('✅ Evolution state API risposta:', {
        hasData: !!stateData,
        tables: stateData?.tables?.length || 0,
        games: stateData?.games?.length || 0,
        timestamp: stateData?._proxy?.timestamp
      });
      
      return stateData;
      
    } catch (error) {
      console.error(`❌ Errore chiamata Evolution state API per ${gameId}:`, error);
      throw error;
    }
  }

  /**
   * Connette al server SSE Evolution Gaming con flusso completo
   */
  async connect(gameId: string): Promise<void> {
    if (this.connectionState.status === 'connected' || this.connectionState.status === 'connecting') {
      console.log('SSE Evolution già connesso o in connessione');
      return;
    }

    try {
      this.updateConnectionState({
        status: 'connecting',
        gameId,
        error: undefined
      });

      // Ottieni configurazione del gioco
      const gameConfig = this.gameConfigs.get(gameId);
      if (!gameConfig) {
        throw new Error(`Configurazione non trovata per gameId: ${gameId}`);
      }

      console.log(`🎮 Avvio flusso Evolution Gaming per ${gameId}:`, {
        gameType: gameConfig.gameType,
        tableIds: gameConfig.tableIds,
        category: gameConfig.category
      });

      // STEP 1: Chiama Evolution state API prima della connessione WebSocket
      try {
        console.log('🔄 STEP 1: Chiamata Evolution state API...');
        const stateData = await this.fetchEvolutionState(gameId, gameConfig.tableIds);
        
        // Emetti dati state iniziali se disponibili
        if (stateData) {
          this.emit('evolution-state-data', { gameId, stateData });
        }
        
      } catch (stateError) {
        console.warn('⚠️ Errore state API (continuo con WebSocket):', stateError);
        // Non bloccare il flusso se state API fallisce
      }

      // STEP 2: Connessione WebSocket SSE
      console.log('🔄 STEP 2: Avvio connessione WebSocket SSE...');
      const sseUrl = this.buildSSEUrl(gameId, gameConfig.gameType, gameConfig.tableIds);
      console.log(`📡 URL SSE: ${sseUrl}`);

      // Crea EventSource per SSE
      this.eventSource = new EventSource(sseUrl);

      // Setup handlers SSE
      this.eventSource.onopen = () => {
        console.log('✅ SSE Evolution connesso con successo');
        this.updateConnectionState({
          status: 'connected',
          gameId,
          connectedAt: new Date().toISOString(),
          reconnectAttempts: 0
        });
        
        this.emit('connected', { gameId });
      };

      this.eventSource.onmessage = (event) => {
        this.handleSSEMessage(event);
      };

      this.eventSource.onerror = (error) => {
        this.handleSSEError(error);
      };

      // Timeout per la connessione
      const connectionTimeout = setTimeout(() => {
        if (this.connectionState.status === 'connecting') {
          console.error('❌ Timeout connessione Evolution SSE');
          this.updateConnectionState({
            status: 'error',
            error: 'Timeout connessione SSE'
          });
          this.disconnect();
        }
      }, 10000); // 10 secondi timeout

      // Cleanup timeout quando connesso
      this.once('connected', () => {
        clearTimeout(connectionTimeout);
      });

    } catch (error) {
      console.error('❌ Errore connessione Evolution SSE:', error);
      this.updateConnectionState({
        status: 'error',
        error: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
      this.emit('error', { type: 'connection_error', error });
    }
  }

  /**
   * Gestisce messaggi SSE
   */
  private handleSSEMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      console.log('📨 Messaggio SSE Evolution ricevuto:', {
        type: data.type,
        timestamp: data.timestamp,
        hasData: !!data.data
      });

      switch (data.type) {
        case 'connection-established':
          console.log('🔗 Connessione Evolution stabilita:', data);
          this.emit('connection-established', data);
          break;

        case 'evolution-data':
          console.log('📊 Dati Evolution ricevuti:', {
            messageType: data.data?.type,
            tableId: data.data?.tableId,
            hasResults: !!data.data?.results,
            timestamp: data.timestamp
          });
          this.processEvolutionData(data.data);
          break;

        case 'error':
          console.error('❌ Errore dal server SSE:', data);
          this.emit('error', { type: 'server_error', error: data.error || data.message });
          break;

        default:
          console.log('📨 Messaggio SSE non gestito:', data.type, data);
      }

    } catch (error) {
      console.error('❌ Errore parsing messaggio SSE:', error);
    }
  }

  /**
   * Gestisce errori SSE
   */
  private handleSSEError(error: Event): void {
    console.error('❌ Errore Evolution SSE:', error);
    
    // Se l'EventSource è in stato CLOSED, la connessione è terminata
    if (this.eventSource?.readyState === EventSource.CLOSED) {
      console.log('🔌 Connessione SSE chiusa dal server');
      this.updateConnectionState({
        status: 'disconnected',
        error: 'Connessione chiusa dal server'
      });
      
      this.emit('disconnected');
      
      // Tentativo di riconnessione automatica
      this.scheduleReconnect();
    } else {
      console.warn('⚠️ Errore SSE temporaneo:', {
        readyState: this.eventSource?.readyState,
        url: this.eventSource?.url
      });
      
      this.updateConnectionState({
        status: 'error',
        error: 'Errore temporaneo connessione SSE'
      });
    }
  }

  /**
   * Processa dati Evolution Gaming dal server SSE
   */
  private processEvolutionData(message: Record<string, unknown>): void {
    try {
      if (!message || !this.shouldProcessMessage(message)) {
        return;
      }

      const gameData = this.extractGameData(message);
      if (gameData) {
        this.distributeGameData(gameData);
      }

    } catch (error) {
      console.error('❌ Errore processamento dati Evolution:', error);
    }
  }

  /**
   * Determina se processare il messaggio
   */
  private shouldProcessMessage(message: Record<string, unknown>): boolean {
    const messageType = message.type;
    
    // Filtro per messaggi risultati Evolution Gaming
    const allowedTypes = [
      'CrazyTimeResultsUpdated',
      'RouletteNumbersUpdated', 
      'BaccaratRoadUpdated',
      'MoneyWheelNumbersUpdated',
      'MonopolyResultsUpdated',
      'MegaBallResultsUpdated',
      'BlackjackResultsUpdated'
    ];
    
    const shouldProcess = typeof messageType === 'string' && allowedTypes.includes(messageType);
    
    if (shouldProcess) {
      console.log(`✅ Processando messaggio Evolution SSE: ${messageType} per tavolo ${message.tableId}`);
    }
    
    return shouldProcess;
  }

  /**
   * Estrae dati di gioco dal messaggio
   */
  private extractGameData(message: Record<string, unknown>): EvolutionGameData | null {
    try {
      const tableId = message.tableId || (message.table as Record<string, unknown>)?.id;
      const messageType = message.type;

      const tableIdStr = typeof tableId === 'string' ? tableId : String(tableId);
      
      if (!tableIdStr) {
        console.log('⚠️ Nessun tableId trovato nel messaggio SSE:', message);
        return null;
      }

      // Trova configurazione per questo tableId
      let gameConfig: EvolutionGameConfig | null = null;
      for (const config of this.gameConfigs.values()) {
        if (config.tableIds && config.tableIds.includes(tableIdStr)) {
          gameConfig = config;
          break;
        }
      }

      if (!gameConfig) {
        console.log(`⚠️ TableId ${tableIdStr} non trovato nella configurazione - messaggio ignorato`);
        return null;
      }

      // Estrai risultati basandosi sul tipo di messaggio
      let results: Record<string, unknown>[] = [];
      switch (messageType) {
        case 'CrazyTimeResultsUpdated':
          results = Array.isArray(message.results) ? message.results as Record<string, unknown>[] : [];
          console.log('🎡 Dati CrazyTime SSE:', {
            tableId: tableIdStr,
            results: results.slice(-3), // Ultimi 3 risultati per debug
            totalResults: results.length
          });
          break;

        case 'RouletteNumbersUpdated':
          results = Array.isArray(message.results) ? 
            (message.results as unknown[]).map((result: unknown) => ({ 
              result, 
              value: result,
              color: this.getRouletteColor(Number(result))
            })) : [];
          break;

        case 'MoneyWheelNumbersUpdated':
        case 'MonopolyResultsUpdated':
          results = Array.isArray(message.results) ? 
            (message.results as unknown[]).map((result: unknown) => ({ 
              result, 
              value: result 
            })) : [];
          break;

        case 'BaccaratRoadUpdated':
          results = Array.isArray(message.results) ? message.results as Record<string, unknown>[] : 
                   Array.isArray(message.road) ? message.road as Record<string, unknown>[] : [];
          break;

        default:
          results = Array.isArray(message.results) ? message.results as Record<string, unknown>[] : 
                   Array.isArray(message.gameResults) ? message.gameResults as Record<string, unknown>[] : [];
          break;
      }

      const gameData: EvolutionGameData = {
        gameType: gameConfig.gameType,
        tableId: tableIdStr,
        gameState: typeof message.gameState === 'object' && message.gameState !== null ? 
                  message.gameState as Record<string, unknown> : 
                  typeof message.state === 'object' && message.state !== null ?
                  message.state as Record<string, unknown> : undefined,
        results: results.length > 0 ? results : undefined,
        statistics: typeof message.statistics === 'object' && message.statistics !== null ? 
                   message.statistics as Record<string, unknown> : 
                   typeof message.stats === 'object' && message.stats !== null ?
                   message.stats as Record<string, unknown> : undefined,
        players: message.players ? [{ count: message.players }] as Record<string, unknown>[] : undefined,
        timestamp: new Date().toISOString(),
        provider: 'evolution'
      };

      console.log(`🎯 Evolution SSE data estratti per ${gameConfig.gameId}:`, {
        gameType: gameData.gameType,
        tableId: tableIdStr,
        resultsCount: results.length,
        messageType
      });

      return gameData;

    } catch (error) {
      console.error('❌ Errore estrazione dati Evolution SSE:', error);
      return null;
    }
  }

  /**
   * Determina colore della roulette
   */
  private getRouletteColor(number: number): string {
    if (number === 0) return 'green';
    
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(number) ? 'red' : 'black';
  }

  /**
   * Distribuisce dati ai listener registrati
   */
  private distributeGameData(gameData: EvolutionGameData): void {
    for (const [gameId, config] of this.gameConfigs.entries()) {
      if (this.shouldReceiveData(config, gameData)) {
        const listeners = this.gameListeners.get(gameId);
        if (listeners) {
          console.log(`📤 Invio dati Evolution SSE a ${gameId}:`, {
            gameType: gameData.gameType,
            tableId: gameData.tableId,
            hasResults: !!gameData.results,
            listenersCount: listeners.size
          });

          listeners.forEach(listener => {
            try {
              listener(gameData);
            } catch (error) {
              console.error(`❌ Errore nel listener SSE per ${gameId}:`, error);
            }
          });
        }
      }
    }
  }

  /**
   * Determina se il gioco dovrebbe ricevere i dati
   */
  private shouldReceiveData(config: EvolutionGameConfig, gameData: EvolutionGameData): boolean {
    // Filtra per tableIds specifici se disponibili
    if (config.tableIds && config.tableIds.length > 0 && gameData.tableId) {
      return config.tableIds.includes(gameData.tableId);
    }

    // Altrimenti filtra per gameType
    return config.gameType === gameData.gameType;
  }

  /**
   * Aggiorna stato connessione
   */
  private updateConnectionState(updates: Partial<EvolutionConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
    console.log('🔄 Stato connessione Evolution aggiornato:', this.connectionState);
    this.emit('connection-state-changed', this.connectionState);
  }

  /**
   * Pianifica riconnessione automatica
   */
  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('🚫 Numero massimo di tentativi di riconnessione SSE raggiunto');
      this.updateConnectionState({
        status: 'error',
        error: 'Numero massimo di tentativi di riconnessione raggiunto'
      });
      return;
    }

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    const delay = this.reconnectDelay * Math.pow(2, this.connectionState.reconnectAttempts);
    console.log(`🔄 Riconnessione Evolution SSE in ${delay}ms (tentativo ${this.connectionState.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);

    this.updateConnectionState({
      reconnectAttempts: this.connectionState.reconnectAttempts + 1
    });

    this.reconnectTimeout = setTimeout(() => {
      const gameId = this.connectionState.gameId || 'default';
      this.connect(gameId).catch(error => {
        console.error('❌ Errore riconnessione Evolution SSE:', error);
      });
    }, delay);
  }

  /**
   * Registra un nuovo gioco
   */
  registerGame(gameId: string, config: EvolutionGameConfig): void {
    console.log(`🎮 Registrazione gioco Evolution SSE ${gameId}:`, {
      gameType: config.gameType,
      hasTableIds: !!(config.tableIds && config.tableIds.length > 0),
      tableIds: config.tableIds
    });

    if (!config.tableIds || config.tableIds.length === 0) {
      throw new Error(`Configurazione incompleta per ${gameId}: tableIds obbligatori`);
    }

    if (!config.gameType) {
      throw new Error(`Configurazione incompleta per ${gameId}: gameType obbligatorio`);
    }

    this.gameConfigs.set(gameId, config);

    if (!this.gameListeners.has(gameId)) {
      this.gameListeners.set(gameId, new Set());
    }
  }

  /**
   * Sottoscrivi ai dati di un gioco
   */
  async subscribeToGame(gameId: string, listener: (data: EvolutionGameData) => void): Promise<void> {
    if (!this.gameListeners.has(gameId)) {
      this.gameListeners.set(gameId, new Set());
    }

    this.gameListeners.get(gameId)!.add(listener);
    console.log(`🔔 Sottoscrizione Evolution SSE per ${gameId} (${this.gameListeners.get(gameId)!.size} listener)`);

    // Auto-connessione se non già connesso
    if (this.connectionState.status === 'disconnected') {
      console.log('🔌 Avvio connessione Evolution SSE automatica...');
      try {
        await this.connect(gameId);
      } catch (error) {
        console.error('❌ Errore avvio connessione Evolution SSE:', error);
      }
    }
  }

  /**
   * Annulla sottoscrizione
   */
  unsubscribeFromGame(gameId: string, listener: (data: EvolutionGameData) => void): void {
    const listeners = this.gameListeners.get(gameId);
    if (listeners) {
      listeners.delete(listener);
      console.log(`🔕 Annullata sottoscrizione Evolution SSE per ${gameId} (${listeners.size} rimasti)`);

      if (listeners.size === 0) {
        this.gameListeners.delete(gameId);
        this.gameConfigs.delete(gameId);
        console.log(`🗑️ Rimosso gioco Evolution SSE ${gameId}`);

        // Se non ci sono più listener, disconnetti
        if (this.gameListeners.size === 0) {
          console.log('🔌 Nessun listener attivo, disconnessione Evolution SSE');
          this.disconnect();
        }
      }
    }
  }

  /**
   * Disconnette dal server SSE
   */
  disconnect(): void {
    console.log('🔌 Disconnessione Evolution SSE');

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }

    this.updateConnectionState({
      status: 'disconnected',
      error: undefined,
      reconnectAttempts: 0
    });

    this.gameConfigs.clear();
    this.gameListeners.clear();
    
    this.emit('disconnected');
  }

  /**
   * Stato della connessione
   */
  get connected(): boolean {
    return this.connectionState.status === 'connected';
  }

  /**
   * Stato completo della connessione
   */
  get connectionStatus(): EvolutionConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Numero di giochi registrati
   */
  get registeredGamesCount(): number {
    return this.gameConfigs.size;
  }

  /**
   * Lista dei giochi registrati
   */
  get registeredGames(): string[] {
    return Array.from(this.gameConfigs.keys());
  }
}

// Istanza singleton
const evolutionSSEManager = new EvolutionSSEManager();

// Rendi il manager accessibile globalmente per il debug
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).evolutionSSEManager = evolutionSSEManager;
  console.log('🔧 Evolution SSE Manager disponibile come window.evolutionSSEManager per debug');
}

export default evolutionSSEManager;