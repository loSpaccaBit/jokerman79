const BaseProvider = require('./BaseProvider');
const WebSocket = require('ws');

/**
 * Provider per Pragmatic Play
 * Implementazione semplificata per Node.js
 */
class PragmaticProvider extends BaseProvider {
    constructor(config) {
        super('Pragmatic Play', config);
        this.wsUrl = config.wsUrl;
        this.casinoId = config.casinoId;
        this.isConnected = false;
        this.pollingInterval = null;
        this.pingInterval = null;
    }

    // Implementazione metodi astratti BaseProvider
    async loadInitialState() {
        this.log('Loading Pragmatic Play state...');

        try {
            // Pragmatic Play non fornisce una lista giochi iniziale
            // I giochi vengono scoperti dai messaggi WebSocket in tempo reale
            this.log('Pragmatic Play: Games will be discovered from live WebSocket messages');
            
            // Tenta la connessione WebSocket per ricevere aggiornamenti live
            if (this.wsUrl && this.casinoId) {
                this.log('Attempting real WebSocket connection...');
                await this.connectWebSocket();
            } else {
                this.log('Missing WebSocket URL or Casino ID, using demo games...');
                this.createDemoGames();
            }
            
            this.log(`Loaded ${this.games.size} Pragmatic games (${this.isConnected ? 'live discovery mode' : 'demo'})`);
            return true;

        } catch (error) {
            this.error('Failed to load Pragmatic state', error);
            // Non lanciare errore, usa demo games come fallback
            this.createDemoGames();
            return true;
        }
    }

    createDemoGames() {
        const demoGames = [
            {
                id: 'pragmatic_roulette_1',
                name: 'Pragmatic Roulette',
                gameType: 'roulette',
                vertical: 'live',
                status: 'open',
                playerCount: 12,
                language: 'en'
            },
            {
                id: 'pragmatic_blackjack_1',
                name: 'Pragmatic Blackjack',
                gameType: 'blackjack',
                vertical: 'live',
                status: 'open',
                playerCount: 8,
                language: 'en'
            },
            {
                id: 'pragmatic_baccarat_1',
                name: 'Pragmatic Baccarat',
                gameType: 'baccarat',
                vertical: 'live',
                status: 'open',
                playerCount: 15,
                language: 'en'
            },
            // Giochi con ID numerici per test
            {
                id: '1101',
                name: 'Live Mega Roulette',
                gameType: 'roulette',
                vertical: 'live',
                status: 'open',
                playerCount: 25,
                language: 'en'
            },
            {
                id: '1102',
                name: 'PowerUP Roulette',
                gameType: 'roulette',
                vertical: 'live',
                status: 'open',
                playerCount: 18,
                language: 'en'
            },
            {
                id: '1103', 
                name: 'Speed Baccarat A',
                gameType: 'baccarat',
                vertical: 'live',
                status: 'open',
                playerCount: 22,
                language: 'en'
            },
            {
                id: '42',
                name: 'Mega Wheel',
                gameType: 'wheel',
                vertical: 'live',
                status: 'open',
                playerCount: 35,
                language: 'en'
            }
        ];

        demoGames.forEach(game => {
            game.provider = this.name;
            game.providerData = {};
            this.games.set(game.id, this.standardizeGame(game));
        });
    }

    async connectWebSocket() {
        if (this.isConnected) {
            this.log('WebSocket already connected');
            return;
        }

        if (!this.wsUrl || !this.casinoId) {
            this.log('Missing Pragmatic Play WebSocket URL or Casino ID - using demo games');
            return;
        }

        try {
            this.log(`Connecting to Pragmatic Play WebSocket: ${this.wsUrl}`);
            
            await this.setupWebSocket(this.wsUrl);
            this.isConnected = true;
            this.log('✅ Pragmatic Play WebSocket connected - will discover games from live messages');
            
        } catch (error) {
            this.error('Failed to connect Pragmatic WebSocket, using demo games', error);
            this.isConnected = false;
        }
    }

    supportsDirectSubscription() {
        return true; // Pragmatic supports direct game subscription
    }

    // Autenticazione WebSocket per Pragmatic Play (semplificata)
    authenticateWebSocket() {
        console.log(`\n🔐 [PRAGMATIC] ========= AUTHENTICATION DEBUG =========`);
        console.log(`🔐 WebSocket state:`, this.ws?.readyState);
        console.log(`🔐 WebSocket OPEN constant:`, WebSocket.OPEN);
        console.log(`🔐 Casino ID:`, this.config.casinoId);
        
        // Invia il casino ID per l'autenticazione
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            const authMessage = {
                casino_id: this.config.casinoId,
                timestamp: new Date().getTime()
            };
            
            console.log('🔐 Sending authentication with casino ID:', this.config.casinoId);
            console.log('🔐 Auth message:', JSON.stringify(authMessage));
            this.ws.send(JSON.stringify(authMessage));
            console.log('✅ Auth message sent successfully');
            
            // Aggiungi anche un messaggio di "subscribe to all tables"
            setTimeout(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    const subscribeAllMessage = {
                        action: 'subscribe_all',
                        casino_id: this.config.casinoId
                    };
                    console.log('🔔 Sending subscribe all tables message');
                    console.log('🔔 Subscribe message:', JSON.stringify(subscribeAllMessage));
                    this.ws.send(JSON.stringify(subscribeAllMessage));
                    console.log('✅ Subscribe all message sent successfully');
                } else {
                    console.log('❌ WebSocket not ready for subscribe all message');
                }
            }, 1000);
            
            // Aggiungi un ping periodico per mantenere la connessione
            this.pingInterval = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                    const pingMessage = { action: 'ping', timestamp: new Date().getTime() };
                    console.log('💓 Sending ping:', JSON.stringify(pingMessage));
                    this.ws.send(JSON.stringify(pingMessage));
                } else {
                    console.log('❌ WebSocket not ready for ping, clearing interval');
                    if (this.pingInterval) {
                        clearInterval(this.pingInterval);
                        this.pingInterval = null;
                    }
                }
            }, 30000); // Ping ogni 30 secondi
            
        } else {
            console.log('❌ WebSocket not ready for authentication');
            console.log('❌ WS exists:', !!this.ws);
            console.log('❌ WS readyState:', this.ws?.readyState);
        }
        
        console.log('🔐 Pragmatic WebSocket ready to receive live data');
        console.log(`🔐 [PRAGMATIC] ========= END AUTHENTICATION DEBUG =========\n`);
    }

    // Connessione a API live come fallback
    async connectToLiveAPI() {
        this.log('Connecting to Pragmatic Play live API endpoints...');
        
        try {
            // Pragmatic Play live casino API endpoints
            const apiEndpoints = [
                'https://api.pragmaticplaylive.net/v1/games',
                'https://api.pragmaticplay.net/live/games'
            ];
            
            // Prova diversi endpoint API
            for (const endpoint of apiEndpoints) {
                try {
                    const response = await fetch(endpoint, {
                        headers: {
                            'User-Agent': 'Casino-Microservice/1.0',
                            'Accept': 'application/json'
                        }
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        this.log(`✅ Connected to Pragmatic API: ${endpoint}`);
                        this.processLiveGames(data);
                        this.startPolling(endpoint);
                        return;
                    }
                } catch (error) {
                    this.log(`Failed to connect to ${endpoint}: ${error.message}`);
                }
            }
            
            this.log('Could not connect to any Pragmatic API endpoint, using demo games');
            
        } catch (error) {
            this.error('Failed to connect to Pragmatic Live API', error);
        }
    }

    // Elabora i giochi live dall'API
    processLiveGames(data) {
        if (data.games && Array.isArray(data.games)) {
            this.log(`Processing ${data.games.length} live Pragmatic games`);
            
            data.games.forEach(game => {
                const standardizedGame = this.convertGameData(game);
                this.games.set(standardizedGame.id, standardizedGame);
            });
        }
    }

    // Polling per aggiornamenti live
    startPolling(endpoint) {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        
        this.pollingInterval = setInterval(async () => {
            try {
                const response = await fetch(endpoint);
                if (response.ok) {
                    const data = await response.json();
                    this.processLiveUpdates(data);
                }
            } catch (error) {
                this.log('Polling error:', error.message);
            }
        }, 5000); // Poll ogni 5 secondi
    }

    // Elabora aggiornamenti live
    processLiveUpdates(data) {
        if (data.updates && Array.isArray(data.updates)) {
            data.updates.forEach(update => {
                if (this.selectedGame && update.gameId === this.selectedGame.id) {
                    // Invia aggiornamento ai client WebSocket
                    this.broadcastGameUpdate(update);
                }
            });
        }
    }

    convertGameData(rawData) {
        return {
            id: rawData.gameId || rawData.id,
            name: rawData.name || rawData.gameName,
            provider: this.name,
            vertical: rawData.vertical || 'live',
            gameType: rawData.gameType || rawData.type,
            status: rawData.status || 'open',
            playerCount: rawData.playerCount || 0,
            language: rawData.language || 'en',
            providerData: rawData
        };
    }

    parseMessage(data) {
        console.log(`\n🎯 [PRAGMATIC] ========= PARSE MESSAGE DEBUG =========`);
        console.log(`🎯 Full message:`, JSON.stringify(data, null, 2));
        console.log(`🎯 Message type:`, data.type);
        console.log(`🎯 Has data property:`, !!data.data);
        console.log(`🎯 Has tableId:`, !!data.tableId);
        
        // Pragmatic Play invia messaggi con type e data
        if (data.type === 'gameUpdate' && data.data) {
            const gameData = data.data;
            console.log(`🎯 Processing game update for table: ${gameData.tableId}`);
            console.log(`🎯 Game data:`, JSON.stringify(gameData, null, 2));
            
            // Questo è un aggiornamento di stato del tavolo
            this.handleTableUpdate(gameData);
            
            // Se ci sono risultati di gioco, gestiscili
            if (gameData.gameResult && gameData.gameResult.length > 0) {
                console.log(`🎰 Processing ${gameData.gameResult.length} game results for: ${gameData.tableId}`);
                this.handleGameResult({
                    type: 'game_result',
                    tableId: gameData.tableId,
                    results: gameData.gameResult,
                    timestamp: new Date().toISOString()
                });
            }
        } else if (data.tableId) {
            // Formato alternativo con tableId diretto
            console.log(`🎯 Processing direct table update for: ${data.tableId}`);
            this.handleTableUpdate(data);
            
            if (data.gameResult && data.gameResult.length > 0) {
                console.log(`🎰 Processing game result for: ${data.tableId}`);
                this.handleGameResult({
                    type: 'game_result',
                    tableId: data.tableId,
                    results: data.gameResult,
                    timestamp: data.lastUpdate || new Date().toISOString()
                });
            }
        } else {
            console.log(`⚠️ Unhandled message format`);
            console.log(`⚠️ Available properties:`, Object.keys(data));
            // Messaggi di controllo (rari)
            switch (data.type) {
                case 'error':
                    this.error('Pragmatic WebSocket error:', data.message);
                    break;
                default:
                    console.log('Unhandled Pragmatic message type:', data.type || 'unknown');
                    console.log('Full unhandled message:', JSON.stringify(data, null, 2));
            }
        }
        console.log(`🎯 [PRAGMATIC] ========= END PARSE MESSAGE DEBUG =========\n`);
    }

    formatResults(data) {
        return {
            type: data.type,
            gameId: data.gameId || data.tableId,
            timestamp: new Date().toISOString(),
            data: data
        };
    }

    // Message handlers
    handleGameResult(data) {
        this.log('🎯 Pragmatic game result received:', data.tableId || data.gameId);
        
        const result = this.formatResults(data);
        if (result && this.onGameUpdate) {
            this.onGameUpdate({
                type: 'game_result',
                gameId: data.tableId || data.gameId,
                provider: this.name,
                data: result,
                timestamp: data.timestamp || new Date().toISOString()
            });
        }
    }

    handleTableUpdate(data) {
        this.log(`🔄 handleTableUpdate called for table: ${data.tableId}`);
        const isNewTable = !this.games.has(data.tableId);
        
        if (isNewTable) {
            this.log('🆕 Discovered new Pragmatic table:', data.tableId);
        } else {
            this.log('📊 Pragmatic table update:', data.tableId);
        }
        
        // Aggiorna o crea il gioco con i nuovi dati
        if (data.tableId) {
            const gameData = {
                id: data.tableId,
                name: data.tableName || data.tableId,
                provider: this.name,
                vertical: 'live',
                gameType: data.tableType || data.tableSubtype || 'unknown',
                status: data.tableOpen ? 'open' : 'closed',
                playerCount: data.totalSeatedPlayers || 0,
                language: data.dedicatedLanguage || 'en',
                currency: data.currency || 'EUR',
                limits: data.tableLimits || {},
                dealer: data.dealer || {},
                image: data.tableImage || null,
                providerData: data
            };
            
            this.games.set(data.tableId, this.standardizeGame(gameData));
            
            if (isNewTable) {
                this.log(`✅ Added new Pragmatic table: ${data.tableName || data.tableId} (total: ${this.games.size})`);
            }
        }
        
        // Invia aggiornamento ai client - SENZA FILTRI per Pragmatic
        this.log(`📤 Sending table update to clients for: ${data.tableId}`);
        if (this.onGameUpdate) {
            this.onGameUpdate({
                type: 'table_update',
                gameId: data.tableId,
                provider: this.name,
                data: data,
                timestamp: new Date().toISOString()
            });
            this.log(`✅ Update sent successfully for: ${data.tableId}`);
        } else {
            this.log(`❌ No onGameUpdate callback available for: ${data.tableId}`);
        }
    }

    handlePlayerUpdate(data) {
        if (data.gameId && this.games.has(data.gameId)) {
            const game = this.games.get(data.gameId);
            game.playerCount = data.playerCount || 0;
            this.games.set(data.gameId, game);
            this.log(`Pragmatic players updated for ${data.gameId}: ${game.playerCount}`);
        }
    }

    disconnect() {
        // Interrompi il polling
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
            this.pollingInterval = null;
        }
        
        // Interrompi il ping
        if (this.pingInterval) {
            clearInterval(this.pingInterval);
            this.pingInterval = null;
        }
        
        // Disconnetti WebSocket
        super.disconnect();
        this.isConnected = false;
        this.log('Pragmatic provider disconnected');
    }

    // Override setSelectedGame per inviare sottoscrizione
    setSelectedGame(game) {
        console.log(`\n🎮 [PRAGMATIC] ========= SET SELECTED GAME DEBUG =========`);
        console.log(`🎮 Game:`, game);
        console.log(`🎮 WebSocket exists:`, !!this.ws);
        console.log(`🎮 WebSocket state:`, this.ws?.readyState);
        console.log(`🎮 WebSocket OPEN:`, WebSocket.OPEN);
        
        super.setSelectedGame(game);
        
        if (game && this.ws && this.ws.readyState === WebSocket.OPEN) {
            const subscribeMessage = {
                action: 'subscribe',
                table_id: game.id,
                casino_id: this.config.casinoId
            };
            
            console.log(`🔔 Subscribing to table: ${game.id}`);
            console.log(`🔔 Subscribe message:`, JSON.stringify(subscribeMessage));
            this.ws.send(JSON.stringify(subscribeMessage));
            console.log(`✅ Subscribe message sent successfully`);
        } else {
            console.log(`❌ Cannot subscribe - conditions not met:`);
            console.log(`❌ Game exists:`, !!game);
            console.log(`❌ WS exists:`, !!this.ws);
            console.log(`❌ WS is open:`, this.ws?.readyState === WebSocket.OPEN);
        }
        console.log(`🎮 [PRAGMATIC] ========= END SET SELECTED GAME DEBUG =========\n`);
    }
}

module.exports = PragmaticProvider;