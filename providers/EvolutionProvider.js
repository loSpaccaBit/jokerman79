const BaseProvider = require('./BaseProvider');
const https = require('https');

/**
 * Provider per Evolution Gaming
 * Adattato per Node.js dal codice browser esistente
 */
class EvolutionProvider extends BaseProvider {
    constructor(config) {
        super('Evolution Gaming', config);
        this.hostname = config.hostname;
        this.casinoId = config.casinoId;
        this.username = config.username;
        this.password = config.password;
        this.isConnected = false;
        
        // Multiple subscriptions support instead of single selectedGame
        this.subscribedGames = new Set(); // Set of gameIds
        
        // Performance optimizations
        this.requestCache = new Map();
        this.cacheTimeout = parseInt(config.cacheTimeout) || 30000; // 30 seconds
        this.maxCacheSize = parseInt(config.maxCacheSize) || 1000;
        
        // Rate limiting
        this.lastRequest = 0;
        this.minRequestInterval = parseInt(config.minRequestInterval) || 1000; // 1 second
        
        // Setup event handlers
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('log', (logData) => {
            // Forward logs to external logger if needed
            if (this.externalLogger) {
                this.externalLogger(logData);
            }
        });
        
        this.on('error', (error) => {
            this.isConnected = false;
        });
        
        this.on('connected', () => {
            this.isConnected = true;
        });
        
        this.on('disconnected', () => {
            this.isConnected = false;
        });
    }

    // Implementazione metodi astratti BaseProvider
    async loadInitialState() {
        this.log('Loading Evolution Gaming state...');

        try {
            await this.fetchStateAPI();
            this.log(`Loaded ${this.games.size} Evolution games`);
            return true;

        } catch (error) {
            this.error('Failed to load Evolution state', error);
            throw error;
        }
    }

    async fetchStateAPI() {
        const cacheKey = 'state_api';
        
        // Check cache first
        const cached = this.getCachedRequest(cacheKey);
        if (cached) {
            this.debug('Using cached state data');
            return cached;
        }
        
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const delay = this.minRequestInterval - timeSinceLastRequest;
            this.debug(`Rate limiting: waiting ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        const params = new URLSearchParams({
            gameVertical: 'live',
            gameProvider: 'evolution',
            players: 'false',
            exclude: 'dealer,descriptions,betLimits'
        });

        const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        const path = `/api/lobby/v1/${this.casinoId}/state?${params}`;
        
        this.lastRequest = Date.now();

        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.hostname,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'Casino-Microservice/2.0',
                    'Accept': 'application/json',
                    'Connection': 'keep-alive'
                },
                timeout: 10000 // 10 second timeout
            };

            const req = https.request(options, (res) => {
                const chunks = [];
                let totalLength = 0;

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                    totalLength += chunk.length;
                    
                    // Prevent memory issues with large responses
                    if (totalLength > 10 * 1024 * 1024) { // 10MB limit
                        req.destroy();
                        reject(new Error('Response too large'));
                    }
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            throw new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
                        }

                        const data = Buffer.concat(chunks).toString('utf8');
                        const jsonData = JSON.parse(data);
                        
                        // Cache the successful response
                        this.setCachedRequest(cacheKey, jsonData);
                        
                        this.processStateData(jsonData);
                        resolve(jsonData);
                    } catch (error) {
                        this.error('Failed to parse state API response', error);
                        reject(error);
                    }
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.on('error', (error) => {
                this.error('State API request failed', error);
                reject(error);
            });

            req.end();
        });
    }
    
    getCachedRequest(key) {
        const cached = this.requestCache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        
        if (cached) {
            this.requestCache.delete(key);
        }
        
        return null;
    }
    
    setCachedRequest(key, data) {
        // Implement LRU cache behavior
        if (this.requestCache.size >= this.maxCacheSize) {
            const firstKey = this.requestCache.keys().next().value;
            this.requestCache.delete(firstKey);
        }
        
        this.requestCache.set(key, {
            data,
            timestamp: Date.now()
        });
    }

    processStateData(data) {
        if (data.tables && typeof data.tables === 'object') {
            const tableIds = Object.keys(data.tables);
            this.debug(`Processing ${tableIds.length} Evolution tables`);

            let processed = 0;
            let errors = 0;
            
            // Process tables in batches to avoid blocking
            const batchSize = 50;
            const processBatch = (startIndex) => {
                const endIndex = Math.min(startIndex + batchSize, tableIds.length);
                
                for (let i = startIndex; i < endIndex; i++) {
                    try {
                        const tableId = tableIds[i];
                        const table = data.tables[tableId];
                        const game = this.convertTableToGame(table);
                        const standardized = this.standardizeGame(game);
                        
                        if (standardized) {
                            this.games.set(game.id, standardized);
                            processed++;
                        }
                    } catch (error) {
                        errors++;
                        this.error(`Failed to process table ${tableIds[i]}`, error);
                    }
                }
                
                // Process next batch in next tick if there are more
                if (endIndex < tableIds.length) {
                    setImmediate(() => processBatch(endIndex));
                } else {
                    this.log(`Completed processing tables`, { processed, errors, total: tableIds.length });
                    this.emit('stateProcessed', { processed, errors, total: tableIds.length });
                }
            };
            
            processBatch(0);
        }
    }

    convertTableToGame(table) {
        return {
            id: table.tableId,
            name: table.name || table.tableId,
            provider: this.name,
            vertical: table.gameVertical || 'live',
            gameType: table.gameType,
            gameTypeUnified: table.gameTypeUnified,
            status: table.open ? 'open' : 'closed',
            playerCount: table.players || 0,
            language: table.language,
            providerData: {
                dealerHand: table.dealerHand,
                seatsTaken: table.seatsTaken,
                display: table.display,
                videoSnapshot: table.videoSnapshot,
                betLimits: table.betLimits,
                operationSchedules: table.operationSchedules
            }
        };
    }

    async connectWebSocket() {
        if (this.isConnected && this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.debug('WebSocket already connected');
            return;
        }

        const wsUrl = `wss://${this.username}:${this.password}@${this.hostname}/api/lobby/v1/${this.casinoId}/live`;
        
        try {
            this.log('Attempting to connect to Evolution WebSocket...');
            
            // Enhanced connection options
            const options = {
                timeout: 15000, // 15 second timeout
                headers: {
                    'Origin': `https://${this.hostname}`,
                    'Cache-Control': 'no-cache'
                }
            };
            
            await this.setupWebSocket(wsUrl, null, options);
            this.log('WebSocket connected successfully to Evolution Gaming');
            return true;
        } catch (error) {
            this.error('Failed to connect to Evolution WebSocket', error);
            throw new Error(`Evolution WebSocket connection failed: ${error.message}`);
        }
    }

    convertGameData(rawData) {
        return this.convertTableToGame(rawData);
    }

    parseMessage(data) {
        this.log(`Parsing message type: ${data.type}`);
        
        // Always apply filtering - if no subscriptions, all messages pass through
        this.filterMessageForSubscribedGames(data);
        
        // Legacy fallback for when no subscriptions are active
        if (this.subscribedGames.size === 0) {
            switch (data.type) {
            case 'state':
                this.handleStateMessage(data);
                break;
            case 'TableAssigned':
                this.handleTableAssigned(data);
                break;
            case 'tableUnassigned':
                this.handleTableUnassigned(data);
                break;
            case 'tableOpened':
                this.handleTableOpened(data);
                break;
            case 'tableClosed':
                this.handleTableClosed(data);
                break;
            case 'gameResult':
                this.handleGameResult(data);
                break;
            case 'playersUpdated':
                this.handlePlayersUpdated(data);
                break;
            default:
                if (data.type && data.type.endsWith('ResultsUpdated')) {
                    this.handleGameResult(data);
                } else {
                    this.log('Unhandled message type:', data.type);
                }
            }
        }
    }


    formatResults(data) {
        return {
            type: data.type,
            gameId: data.tableId || data.gameId,
            timestamp: new Date().toISOString(),
            data: data
        };
    }

    // Message handlers
    handleStateMessage(data) {
        this.log('Processing state message');
        if (data.tables) {
            this.processStateData(data);
        }
    }

    handleTableAssigned(data) {
        if (data.table) {
            const game = this.convertTableToGame(data.table);
            this.games.set(game.id, this.standardizeGame(game));
            this.log(`Table assigned: ${game.name}`);
            
            // Notify external listeners
            if (this.onGameUpdate) {
                this.onGameUpdate(this.formatResults({
                    type: 'table_assigned',
                    table: data.table
                }));
            }
        }
    }

    handleTableUnassigned(data) {
        if (data.gameId) {
            this.games.delete(data.gameId);
            this.log(`Table unassigned: ${data.gameId}`);
        }
    }

    handleTableOpened(data) {
        if (data.gameId && this.games.has(data.gameId)) {
            const game = this.games.get(data.gameId);
            game.status = 'open';
            this.games.set(data.gameId, game);
            this.log(`Table opened: ${data.gameId}`);
        }
    }

    handleTableClosed(data) {
        if (data.gameId && this.games.has(data.gameId)) {
            const game = this.games.get(data.gameId);
            game.status = 'closed';
            this.games.set(data.gameId, game);
            this.log(`Table closed: ${data.gameId}`);
        }
    }

    handleGameResult(data) {
        this.debug('Game result received', { tableId: data.tableId, type: data.type });
        
        // Emit structured event
        this.emit('gameResult', {
            provider: this.name,
            tableId: data.tableId,
            type: data.type,
            data: data,
            timestamp: Date.now()
        });
        
        // Notify external listeners (legacy compatibility)
        if (this.onGameUpdate) {
            this.onGameUpdate(this.formatResults(data));
        }
    }

    handlePlayersUpdated(data) {
        if (data.gameId && this.games.has(data.gameId)) {
            const game = this.games.get(data.gameId);
            game.playerCount = data.playerCount;
            this.games.set(data.gameId, game);
            this.log(`Players updated for ${data.gameId}: ${data.playerCount}`);
        }
    }

    // Enhanced message filtering for multiple subscriptions
    filterMessageForSubscribedGames(data) {
        let isRelevant = false;
        
        // If no subscriptions, allow all messages through
        if (this.subscribedGames.size === 0) {
            isRelevant = true;
            this.debug(`ℹ️ No subscriptions - processing all messages: ${data.type}`);
        } else {
            // Enhanced relevance check for multiple subscriptions
            if (data.tableId) {
                // Check if this message is for any of our subscribed games
                if (this.subscribedGames.has(data.tableId)) {
                    isRelevant = true;
                    this.debug(`✅ Message for subscribed game: ${data.tableId} (type: ${data.type})`);
                } else {
                    // STRICT FILTERING: Message is from a different table that we're not subscribed to
                    this.debug(`🚫 FILTERING OUT message from unsubscribed table: ${data.tableId} (type: ${data.type}) - subscribed to: [${Array.from(this.subscribedGames).join(', ')}]`);
                    this.updateStats(data.type || 'unknown', false);
                    return; // Don't process messages from unsubscribed tables
                }
            } else {
                // Messages without tableId: only allow specific global message types when subscriptions are active
                const allowedGlobalTypes = ['State', 'connection', 'error', 'heartbeat'];
                if (allowedGlobalTypes.includes(data.type)) {
                    isRelevant = true;
                    this.debug(`ℹ️ Processing allowed global message: ${data.type}`);
                } else {
                    // Block unknown global messages when subscriptions are active
                    isRelevant = false;
                    this.debug(`🚫 Blocking global message without tableId: ${data.type} (subscriptions active)`);
                    this.updateStats(data.type || 'unknown', false);
                    return;
                }
            }
        }
        
        // Update statistics
        const isResultMessage = data.type && data.type.endsWith('ResultsUpdated');
        this.updateStats(data.type || 'unknown', isRelevant, isResultMessage);
        
        // Debug logging for result messages
        if (isResultMessage) {
            this.debug('Game result received', {
                type: data.type,
                tableId: data.tableId,
                hasResults: !!data.results,
                subscribedTo: this.subscribedGames.has(data.tableId)
            });
        }
        
        // Forward only ResultsUpdated messages to onGameUpdate callback
        if (this.onGameUpdate && isRelevant && isResultMessage) {
            this.debug(`📤 Forwarding ResultsUpdated message: ${data.type}`);
            this.onGameUpdate(this.formatResults(data));
        } else if (this.onGameUpdate && isRelevant && !isResultMessage) {
            this.debug(`🚫 Skipping non-result message: ${data.type} (only ResultsUpdated forwarded to clients)`);
        }

        // Handle relevant message types efficiently
        this.handleMessageType(data, isResultMessage);
    }
    
    handleMessageType(data, isResultMessage) {
        switch (data.type) {
            case 'TableAssigned':
                this.handleTableAssigned(data);
                break;
            case 'tableUnassigned':
                this.handleTableUnassigned(data);
                break;
            case 'tableOpened':
                this.handleTableOpened(data);
                break;
            case 'tableClosed':
                this.handleTableClosed(data);
                break;
            case 'gameResult':
            case 'playersUpdated':
                this.handleGameResult(data);
                break;
            default:
                if (isResultMessage) {
                    this.handleGameResult(data);
                }
        }
    }

    disconnect() {
        // Clear cache on disconnect
        this.requestCache.clear();
        
        // Clear all subscriptions
        this.subscribedGames.clear();
        
        super.disconnect();
        this.log('Evolution provider disconnected');
    }
    
    // Enhanced health check
    isHealthy() {
        const baseHealth = super.isHealthy();
        return {
            ...baseHealth,
            cacheSize: this.requestCache.size,
            lastRequest: this.lastRequest,
            gameCount: this.games.size,
            subscribedGamesCount: this.subscribedGames.size,
            subscribedGames: Array.from(this.subscribedGames),
            hasCredentials: !!(this.username && this.password && this.hostname && this.casinoId)
        };
    }
    
    // Performance monitoring
    getPerformanceMetrics() {
        const baseMetrics = super.getPerformanceMetrics();
        return {
            ...baseMetrics,
            cache: {
                size: this.requestCache.size,
                maxSize: this.maxCacheSize,
                timeout: this.cacheTimeout
            },
            rateLimit: {
                lastRequest: this.lastRequest,
                minInterval: this.minRequestInterval
            },
            games: {
                total: this.games.size,
                types: this.getGameTypeDistribution()
            }
        };
    }
    
    getGameTypeDistribution() {
        const distribution = {};
        for (const game of this.games.values()) {
            const type = game.gameType || 'unknown';
            distribution[type] = (distribution[type] || 0) + 1;
        }
        return distribution;
    }

    // Add game subscription for Evolution Gaming
    async addSubscription(gameOrId) {
        const gameId = typeof gameOrId === 'object' && gameOrId !== null ? gameOrId.id : gameOrId;

        if (!gameId) {
            this.error('Cannot add subscription: gameId is required');
            return;
        }

        this.log(`Adding Evolution subscription for gameId: ${gameId}`);
        this.subscribedGames.add(gameId);
        this.log(`🔍 [Filter] Evolution now filtering for games: ${Array.from(this.subscribedGames).join(', ')}`);

        const game = this.games.get(gameId);
        if (game) {
            this.log(`Added Evolution subscription: ${game.name || gameId}`);

            // Per Evolution, ottieni immediatamente i risultati attuali
            try {
                await this.fetchCurrentGameResults(gameId);
            } catch (error) {
                this.error('Failed to fetch current Evolution game results', error);
            }
        } else {
            this.log(`Evolution game ${gameId} not found in games list, subscription still added`);
        }
    }

    // Remove game subscription for Evolution Gaming
    removeSubscription(gameOrId) {
        const gameId = typeof gameOrId === 'object' && gameOrId !== null ? gameOrId.id : gameOrId;

        if (!gameId) {
            this.error('Cannot remove subscription: gameId is required');
            return;
        }

        this.log(`Removing Evolution subscription for gameId: ${gameId}`);
        this.subscribedGames.delete(gameId);
        this.log(`🔍 [Filter] Evolution now filtering for games: ${Array.from(this.subscribedGames).join(', ')}`);

        if (this.subscribedGames.size === 0) {
            this.log('No more Evolution subscriptions - filtering disabled');
        }
    }

    // Legacy compatibility - keep for backward compatibility
    async setSelectedGame(gameOrId) {
        this.log('⚠️ setSelectedGame is deprecated, use addSubscription instead');
        await this.addSubscription(gameOrId);
    }

    // Nuovo metodo per ottenere i risultati attuali di un tavolo Evolution specifico
    async fetchCurrentGameResults(tableId) {
        this.log(`Fetching current Evolution results for table: ${tableId}`);

        const params = new URLSearchParams({
            gameVertical: 'live',
            gameProvider: 'evolution',
            players: 'false',
            exclude: 'dealer,descriptions,betLimits'
        });

        const credentials = Buffer.from(`${this.username}:${this.password}`).toString('base64');
        const path = `/api/lobby/v1/${this.casinoId}/state?${params}`;

        return new Promise((resolve, reject) => {
            const options = {
                hostname: this.hostname,
                path: path,
                method: 'GET',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'User-Agent': 'Casino-Microservice/2.0',
                    'Accept': 'application/json'
                },
                timeout: 5000 // 5 second timeout per risultati immediati
            };

            const req = https.request(options, (res) => {
                const chunks = [];

                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode !== 200) {
                            throw new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`);
                        }

                        const data = Buffer.concat(chunks).toString('utf8');
                        const jsonData = JSON.parse(data);
                        
                        // Estrai i risultati per il tavolo specifico
                        if (jsonData.tables && jsonData.tables[tableId]) {
                            const tableData = jsonData.tables[tableId];
                            this.log(`Found current Evolution data for table ${tableId}`);
                            
                            // Invia immediatamente i risultati se disponibili
                            if (this.onGameUpdate && this.hasGameResults(tableData)) {
                                this.log('Sending current Evolution game results immediately');
                                this.onGameUpdate(this.formatResults({
                                    type: 'currentResults',
                                    tableId: tableId,
                                    ...tableData
                                }));
                            }
                        } else {
                            this.log(`No current Evolution data found for table ${tableId}`);
                        }

                        resolve(jsonData);
                    } catch (error) {
                        this.error('Failed to parse Evolution current results response', error);
                        reject(error);
                    }
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Evolution current results request timeout'));
            });

            req.on('error', (error) => {
                this.error('Evolution current results request failed', error);
                reject(error);
            });

            req.end();
        });
    }

    // Verifica se i dati del tavolo Evolution contengono risultati
    hasGameResults(tableData) {
        return tableData.dealerHand || 
               tableData.results || 
               tableData.lastResults ||
               tableData.history ||
               (tableData.display && tableData.display.length > 0) ||
               tableData.gameResult ||
               tableData.winningNumber ||
               tableData.winningCards;
    }
    
    // Proxy request method for API calls
    async proxyRequest(path, options = {}) {
        const cacheKey = `proxy_${path}_${JSON.stringify(options.query || {})}`;
        
        // Check cache for GET requests
        if (options.method === 'GET' || !options.method) {
            const cached = this.getCachedRequest(cacheKey);
            if (cached) {
                return cached;
            }
        }
        
        // Rate limiting
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequest;
        if (timeSinceLastRequest < this.minRequestInterval) {
            const delay = this.minRequestInterval - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        this.lastRequest = Date.now();
        
        return new Promise((resolve, reject) => {
            const queryString = options.query ? '?' + new URLSearchParams(options.query).toString() : '';
            const fullPath = `/api/${path}${queryString}`;
            
            const requestOptions = {
                hostname: this.hostname,
                path: fullPath,
                method: options.method || 'GET',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`,
                    'User-Agent': 'Casino-Microservice/2.0',
                    'Accept': 'application/json',
                    ...options.headers
                },
                timeout: 10000
            };
            
            const req = https.request(requestOptions, (res) => {
                const chunks = [];
                
                res.on('data', (chunk) => {
                    chunks.push(chunk);
                });
                
                res.on('end', () => {
                    try {
                        const data = Buffer.concat(chunks).toString('utf8');
                        const jsonData = JSON.parse(data);
                        
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            // Cache successful GET responses
                            if (requestOptions.method === 'GET') {
                                this.setCachedRequest(cacheKey, jsonData);
                            }
                            resolve(jsonData);
                        } else {
                            reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
                        }
                    } catch (error) {
                        reject(new Error('Invalid JSON response'));
                    }
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });
            
            req.on('error', reject);
            
            if (options.body) {
                req.write(JSON.stringify(options.body));
            }
            
            req.end();
        });
    }
}

module.exports = EvolutionProvider;