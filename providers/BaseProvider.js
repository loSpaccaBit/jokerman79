const WebSocket = require('ws');

/**
 * Classe base astratta per tutti i provider di giochi casino
 */
class BaseProvider {
    constructor(name, config) {
        this.name = name;
        this.config = config;
        this.games = new Map();
        this.selectedGame = null;
        this.ws = null;
        this.messageStats = null;
    }

    // Metodi astratti che ogni provider deve implementare
    async loadInitialState() {
        throw new Error(`${this.name}: loadInitialState() must be implemented`);
    }

    connectWebSocket() {
        throw new Error(`${this.name}: connectWebSocket() must be implemented`);
    }

    convertGameData(rawData) {
        throw new Error(`${this.name}: convertGameData() must be implemented`);
    }

    parseMessage(data) {
        throw new Error(`${this.name}: parseMessage() must be implemented`);
    }

    isRelevantMessage(data, selectedGame) {
        throw new Error(`${this.name}: isRelevantMessage() must be implemented`);
    }

    formatResults(data) {
        throw new Error(`${this.name}: formatResults() must be implemented`);
    }

    // Indica se il provider supporta sottoscrizione diretta ai giochi
    supportsDirectSubscription() {
        return false; // Default: usa filtraggio
    }

    // Metodi comuni che possono essere sovrascritti
    getAuthHeaders() {
        if (this.config.username && this.config.password) {
            const credentials = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');
            return { 'Authorization': `Basic ${credentials}` };
        }
        return {};
    }

    updateStats(type, isRelevant, isResult = false) {
        if (!this.messageStats) {
            this.messageStats = {
                total: 0,
                relevant: 0,
                results: 0,
                relevantResults: 0,
                types: {}
            };
        }

        this.messageStats.total++;
        if (isRelevant) this.messageStats.relevant++;
        if (isResult) {
            this.messageStats.results++;
            if (isRelevant) this.messageStats.relevantResults++;
        }

        this.messageStats.types[type] = (this.messageStats.types[type] || 0) + 1;

        if (this.messageStats.total % 20 === 0) {
            console.log(`📊 [${this.name}] STATS:`, {
                ...this.messageStats,
                relevanceRatio: `${((this.messageStats.relevant / this.messageStats.total) * 100).toFixed(1)}%`
            });
        }
    }

    // Metodi di utilità
    log(message, data = null) {
        console.log(`[${this.name}] ${message}`, data || '');
    }

    error(message, error = null) {
        console.error(`[${this.name}] ERROR: ${message}`, error || '');
    }

    // Imposta il gioco selezionato
    setSelectedGame(game) {
        this.selectedGame = game;
        if (game) {
            this.log(`Selected game: ${game.id} (${game.name || game.id})`);
        } else {
            this.log('Cleared selected game');
        }
    }

    // Standardizza il formato dei giochi per l'interfaccia
    standardizeGame(game) {
        return {
            id: game.id,
            name: game.name,
            provider: this.name,
            gameType: game.gameType,
            vertical: game.vertical || 'live',
            status: game.status,
            playerCount: game.playerCount || 0,
            language: game.language,
            // Campi specifici del provider
            providerData: game.providerData || {}
        };
    }

    // Gestione WebSocket comune
    setupWebSocket(url, protocols = null, options = {}) {
        this.log(`Connecting WebSocket to: ${url.replace(/\/\/.*@/, '//***:***@')}`);
        
        console.log(`\n🔍 [${this.name}] WEBSOCKET SETUP DEBUG`);
        console.log(`🔍 Current WS exists:`, !!this.ws);
        console.log(`🔍 Current WS state:`, this.ws?.readyState);
        console.log(`🔍 WebSocket OPEN constant:`, WebSocket.OPEN);
        console.log(`🔍 Is currently open:`, this.ws?.readyState === WebSocket.OPEN);
        
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log(`✅ WebSocket already connected and open, reusing connection`);
            this.log('WebSocket already connected, reusing connection');
            return Promise.resolve();
        } else if (this.ws) {
            console.log(`🔄 WebSocket exists but not open (state: ${this.ws.readyState}), creating new connection`);
            this.ws.close(); // Chiudi la connessione esistente
            this.ws = null;
        } else {
            console.log(`🆕 No existing WebSocket, creating new connection`);
        }

        return new Promise((resolve, reject) => {
            try {
                // Merge default options with provided options
                const wsOptions = {
                    headers: {
                        'User-Agent': 'Casino-Microservice/1.0',
                        ...options.headers
                    }
                };

                // Only pass protocols if they are provided and valid
                this.ws = protocols ? 
                    new WebSocket(url, protocols, wsOptions) : 
                    new WebSocket(url, wsOptions);
                
                this.ws.onopen = () => {
                    console.log(`\n🟢 [${this.name}] WEBSOCKET OPENED SUCCESSFULLY`);
                    this.log('WebSocket connected');
                    resolve();
                };
                
                this.ws.onmessage = (event) => {
                    this.handleWebSocketMessage(event);
                };
                
                this.ws.onclose = (event) => {
                    console.log(`\n🔴 [${this.name}] WEBSOCKET CLOSED`);
                    console.log(`🔴 Close code:`, event.code);
                    console.log(`🔴 Close reason:`, event.reason);
                    console.log(`🔴 Was clean:`, event.wasClean);
                    
                    // Codici di chiusura comuni:
                    // 1000: Normal closure
                    // 1001: Endpoint going away
                    // 1002: Protocol error
                    // 1003: Unsupported data
                    // 1006: Abnormal closure (no close frame)
                    // 1011: Server error
                    const closeReasons = {
                        1000: 'Normal closure',
                        1001: 'Endpoint going away',
                        1002: 'Protocol error',
                        1003: 'Unsupported data',
                        1006: 'Abnormal closure (connection lost)',
                        1011: 'Server error'
                    };
                    
                    console.log(`🔴 Close reason description:`, closeReasons[event.code] || 'Unknown');
                    this.log(`WebSocket closed: ${event.code} ${event.reason}`);
                    
                    // Se la chiusura non è normale, prova a riconnetterti
                    if (event.code !== 1000 && this.name === 'Pragmatic Play') {
                        console.log(`🔄 Attempting to reconnect in 5 seconds...`);
                        setTimeout(() => {
                            if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
                                console.log(`🔄 Reconnecting Pragmatic WebSocket...`);
                                this.connectWebSocket().catch(err => 
                                    console.error(`❌ Reconnection failed:`, err)
                                );
                            }
                        }, 5000);
                    }
                };
                
                this.ws.onerror = (error) => {
                    console.log(`\n❌ [${this.name}] WEBSOCKET ERROR`);
                    console.log(`❌ Error event:`, error);
                    console.log(`❌ Error type:`, error.type);
                    console.log(`❌ Error target state:`, error.target ? error.target.readyState : 'unknown');
                    
                    // Stati del WebSocket
                    const states = {
                        0: 'CONNECTING',
                        1: 'OPEN', 
                        2: 'CLOSING',
                        3: 'CLOSED'
                    };
                    
                    if (error.target && error.target.readyState !== undefined) {
                        console.log(`❌ WebSocket state: ${error.target.readyState} (${states[error.target.readyState]})`);
                    }
                    
                    this.error('WebSocket error', error);
                    reject(error);
                };
                
            } catch (error) {
                this.error('Failed to create WebSocket', error);
                reject(error);
            }
        });
    }

    handleWebSocketMessage(event) {
        try {
            // MOSTRA TUTTO PER DEBUG
            console.log(`\n🔥 [${this.name}] ========= WEBSOCKET MESSAGE DEBUG =========`);
            console.log(`📨 Raw data type:`, typeof event.data);
            console.log(`📨 Raw data length:`, event.data.length || event.data.byteLength || event.data.size);
            
            // Gestisce sia messaggi text (Pragmatic) che binary (Evolution)
            if (event.data instanceof ArrayBuffer || event.data instanceof Blob) {
                // Messaggio binary (Evolution Gaming)
                console.log(`📨 BINARY MESSAGE:`, event.data);
                this.parseBinaryMessage(event.data);
            } else {
                // Messaggio text JSON (Pragmatic Play)
                console.log(`📨 RAW TEXT MESSAGE:`, event.data);
                
                const data = JSON.parse(event.data);
                console.log(`📨 PARSED JSON:`, JSON.stringify(data, null, 2));
                
                // Gestione diversa per provider con/senza sottoscrizione diretta
                if (this.supportsDirectSubscription()) {
                    console.log(`🔄 [${this.name}] DIRECT SUBSCRIPTION - NO FILTERS`);
                    this.parseMessage(data);
                } else {
                    console.log(`🔄 [${this.name}] USING FILTERS`);
                    if (this.selectedGame && this.filterMessageForSelectedGame) {
                        this.filterMessageForSelectedGame(data);
                    } else {
                        this.parseMessage(data);
                    }
                }
            }
            console.log(`🔥 [${this.name}] ========= END MESSAGE DEBUG =========\n`);
        } catch (error) {
            console.error(`❌ [${this.name}] WEBSOCKET MESSAGE ERROR:`, error);
            console.log(`❌ Raw message data:`, event.data);
        }
    }

    // Metodo di default per messaggi binary (da implementare nei provider specifici)
    parseBinaryMessage(binaryData) {
        this.log('Binary message received but no parser implemented');
        // I provider specifici (Evolution) dovranno implementare questo metodo
    }

    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
            this.log('WebSocket disconnected');
        }
    }
}

// Export per Node.js
module.exports = BaseProvider;