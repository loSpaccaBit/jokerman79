const WebSocket = require('ws');

module.exports = {
    /**
     * Hook che si connette al server LiveStats e salva i risultati nel database
     */
    async initialize() {
        const liveStatsUrl = process.env.LIVE_STATS_WS_URL || 'ws://loca    // Cleanup periodico ogni ora
        setInterval(async () => {
            try {
                const cleanupResult = await strapi.service('api::game-result.game-result').cleanupExpiredResults();
                if (cleanupResult.deleted > 0) {
                    strapi.log.info(`🧹 Cleanup automatico: ${cleanupResult.deleted} risultati scaduti eliminati`);
                }
            } catch (error) {
                strapi.log.error('Errore cleanup periodico:', error);
            }
        }, 60 * 60 * 1000);00';

        strapi.log.info('🔌 Inizializzazione LiveStats Result Saver...');

        let ws;
        let reconnectAttempts = 0;
        const maxReconnectAttempts = 10;
        const reconnectDelay = 5000;

        const connect = () => {
            try {
                ws = new WebSocket(liveStatsUrl);

                ws.on('open', () => {
                    strapi.log.info('✅ Connesso al LiveStats WebSocket per salvataggio risultati');
                    reconnectAttempts = 0;

                    // Sottoscrivi a tutti i tavoli attivi
                    subscribeToActiveTables();
                });

                ws.on('message', async (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        await handleLiveMessage(message);
                    } catch (error) {
                        strapi.log.error('Errore parsing messaggio WebSocket:', error);
                    }
                });

                ws.on('close', () => {
                    strapi.log.warn('❌ Connessione LiveStats chiusa');
                    attemptReconnect();
                });

                ws.on('error', (error) => {
                    strapi.log.error('❌ Errore WebSocket LiveStats:', error);
                    attemptReconnect();
                });

            } catch (error) {
                strapi.log.error('Errore connessione WebSocket:', error);
                attemptReconnect();
            }
        };

        const attemptReconnect = () => {
            if (reconnectAttempts < maxReconnectAttempts) {
                reconnectAttempts++;
                strapi.log.info(`🔄 Tentativo riconnessione ${reconnectAttempts}/${maxReconnectAttempts} tra ${reconnectDelay / 1000}s...`);

                setTimeout(() => {
                    connect();
                }, reconnectDelay);
            } else {
                strapi.log.error('❌ Massimo numero di tentativi di riconnessione raggiunto');
            }
        };

        const subscribeToActiveTables = async () => {
            try {
                // Ottieni tutti i gameId attivi da Strapi
                const activeGames = await strapi.entityService.findMany('api::live-game.live-game', {
                    filters: { isActive: true },
                    fields: ['gameId', 'tableIds']
                });

                // Sottoscrivi a tutti i tavoli
                activeGames.forEach(game => {
                    if (game.tableIds && Array.isArray(game.tableIds)) {
                        game.tableIds.forEach(tableId => {
                            const subscribeMessage = JSON.stringify({
                                action: 'subscribe',
                                tableId: tableId
                            });

                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(subscribeMessage);
                                strapi.log.debug(`📡 Sottoscritto al tavolo: ${tableId} (${game.gameId})`);
                            }
                        });
                    }
                });

            } catch (error) {
                strapi.log.error('Errore sottoscrizione tavoli:', error);
            }
        };

        const handleLiveMessage = async (message) => {
            try {
                // Filtra solo i messaggi con risultati estratti
                if (message.type === 'game_data' && message.data) {
                    const gameData = message.data;

                    // Trova il gameId associato al tableId
                    const gameInfo = await findGameByTableId(gameData.tableId);

                    if (!gameInfo) {
                        strapi.log.debug(`Tavolo ${gameData.tableId} non associato a nessun gioco configurato`);
                        return;
                    }

                    // Gestisci risultati per diversi tipi di giochi
                    await processGameResults(gameData, gameInfo);
                }

            } catch (error) {
                strapi.log.error('Errore gestione messaggio live:', error);
            }
        };

        const findGameByTableId = async (tableId) => {
            try {
                const games = await strapi.entityService.findMany('api::live-game.live-game', {
                    filters: {
                        isActive: true,
                        tableIds: { $contains: tableId }
                    },
                    fields: ['gameId', 'gameType', 'name']
                });

                return games.length > 0 ? games[0] : null;

            } catch (error) {
                strapi.log.error('Errore ricerca gioco per tableId:', error);
                return null;
            }
        };

        const processGameResults = async (gameData, gameInfo) => {
            try {
                const promises = [];

                // Gestisci risultati gameResult (Sweet Bonanza, Dragon Tiger, etc.)
                if (gameData.gameResult && Array.isArray(gameData.gameResult)) {
                    gameData.gameResult.forEach(result => {
                        // Determina retention period e priorità
                        const { retentionPeriod, priority } = determineRetentionSettings(gameInfo.gameId, result);

                        // Calcola data di scadenza
                        const extractedAt = result.time ? new Date(result.time) : new Date();
                        const expiresAt = calculateExpiryDate(extractedAt, retentionPeriod);

                        const resultData = {
                            gameId: gameInfo.gameId,
                            tableId: gameData.tableId,
                            result: String(result.result),
                            resultType: determineResultType(result.result),
                            winner: result.winner,
                            multiplier: result.multiplier,
                            cardValue: result.cardValue,
                            color: result.color,
                            slots: result.slots,
                            payout: result.payout,
                            extractedAt: extractedAt.toISOString(),
                            expiresAt: expiresAt.toISOString(),
                            retentionPeriod,
                            priority,
                            roundId: result.gameId, // In realtà è roundId
                            dealerName: gameData.dealer?.name,
                            totalPlayers: gameData.totalSeatedPlayers,
                            metadata: {
                                gameType: gameInfo.gameType,
                                tableName: gameData.tableName,
                                source: 'websocket_live',
                                autoExpiry: true
                            }
                        };

                        promises.push(
                            strapi.service('api::game-result.game-result').saveResultSafe(resultData)
                        );
                    });
                }

                // Gestisci risultati last20Results (Roulette, Mega Wheel, etc.)
                if (gameData.last20Results && Array.isArray(gameData.last20Results)) {
                    gameData.last20Results.slice(0, 5).forEach(result => { // Salva solo gli ultimi 5 per evitare duplicati
                        const { retentionPeriod, priority } = determineRetentionSettings(gameInfo.gameId, result);

                        const extractedAt = result.time ? new Date(result.time) : new Date();
                        const expiresAt = calculateExpiryDate(extractedAt, retentionPeriod);

                        const resultData = {
                            gameId: gameInfo.gameId,
                            tableId: gameData.tableId,
                            result: String(result.result),
                            resultType: determineResultType(result.result),
                            color: result.color,
                            multiplier: result.multiplier,
                            slots: result.slots,
                            extractedAt: extractedAt.toISOString(),
                            expiresAt: expiresAt.toISOString(),
                            retentionPeriod,
                            priority,
                            roundId: result.gameId,
                            dealerName: gameData.dealer?.name,
                            totalPlayers: gameData.totalSeatedPlayers,
                            metadata: {
                                gameType: gameInfo.gameType,
                                tableName: gameData.tableName,
                                slot: result.slot,
                                source: 'websocket_live',
                                autoExpiry: true
                            }
                        };

                        promises.push(
                            strapi.service('api::game-result.game-result').saveResultSafe(resultData)
                        );
                    });
                }

                // Esegui tutti i salvataggi
                if (promises.length > 0) {
                    await Promise.all(promises);
                    strapi.log.debug(`💾 Salvati ${promises.length} risultati per ${gameInfo.gameId}/${gameData.tableId} con scadenze automatiche`);
                }

            } catch (error) {
                strapi.log.error('Errore processing game results:', error);
            }
        };

        // Avvia la connessione
        connect();

        // Cleanup periodico (ogni ora)
        setInterval(async () => {
            try {
                await strapi.service('api::game-result.game-result').cleanupOldResults(7); // Mantieni 7 giorni
            } catch (error) {
                strapi.log.error('Errore cleanup periodico:', error);
            }
        }, 60 * 60 * 1000);

        // Salva riferimento per cleanup
        strapi.liveStatsConnection = ws;
    },

    async destroy() {
        if (strapi.liveStatsConnection) {
            strapi.liveStatsConnection.close();
            strapi.log.info('🔌 Connessione LiveStats chiusa');
        }
    }
};

function determineResultType(result) {
    const str = String(result);

    if (/^\d+$/.test(str)) return 'number';
    if (/^[A-Za-z]$/.test(str)) return 'card';
    if (/^(red|black|green|blue|yellow)$/i.test(str)) return 'color';
    return 'text';
}

// Funzioni helper per gestione retention
function determineRetentionSettings(gameId, result) {
    // Configurazione predefinita
    const defaultSettings = {
        retentionPeriod: 7, // 7 giorni
        priority: 'normal'
    };

    // Logica specifica per tipo di gioco
    if (gameId.includes('sweetbonanza') || gameId.includes('gatesofoly')) {
        // Slot popolari - retention più lunga
        return {
            retentionPeriod: 30,
            priority: 'high'
        };
    }

    if (gameId.includes('roulette') || gameId.includes('megawheel')) {
        // Giochi da tavolo - retention media
        return {
            retentionPeriod: 14,
            priority: 'medium'
        };
    }

    // Logica specifica per moltiplicatori alti
    if (result.multiplier && parseFloat(result.multiplier) > 100) {
        return {
            retentionPeriod: 90, // 3 mesi per vincite eccezionali
            priority: 'critical'
        };
    }

    return defaultSettings;
}

function calculateExpiryDate(extractedAt, retentionDays) {
    const expiryDate = new Date(extractedAt);
    expiryDate.setDate(expiryDate.getDate() + retentionDays);
    return expiryDate;
}
