/**
 * Controller per gli endpoint di risultati live tramite SSE
 */

interface SSEClient {
    id: string;
    response: any;
    gameId?: string;
    tableId?: string;
    lastEventId?: string;
    subscriptions: Set<string>;
}

class SSEManager {
    private clients = new Map<string, SSEClient>();
    private gameSubscriptions = new Map<string, Set<string>>(); // gameId -> Set of clientIds
    private tableSubscriptions = new Map<string, Set<string>>(); // tableId -> Set of clientIds

    addClient(client: SSEClient) {
        this.clients.set(client.id, client);
        strapi.log.info(`📱 SSE Client connesso: ${client.id}`);
    }

    removeClient(clientId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            // Rimuovi dalle sottoscrizioni
            client.subscriptions.forEach(subscription => {
                if (subscription.startsWith('game:')) {
                    const gameId = subscription.replace('game:', '');
                    this.gameSubscriptions.get(gameId)?.delete(clientId);
                } else if (subscription.startsWith('table:')) {
                    const tableId = subscription.replace('table:', '');
                    this.tableSubscriptions.get(tableId)?.delete(clientId);
                }
            });

            this.clients.delete(clientId);
            strapi.log.info(`📱 SSE Client disconnesso: ${clientId}`);
        }
    }

    subscribeToGame(clientId: string, gameId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            client.subscriptions.add(`game:${gameId}`);

            if (!this.gameSubscriptions.has(gameId)) {
                this.gameSubscriptions.set(gameId, new Set());
            }
            this.gameSubscriptions.get(gameId)!.add(clientId);

            strapi.log.debug(`📡 Client ${clientId} sottoscritto a gioco ${gameId}`);
        }
    }

    subscribeToTable(clientId: string, tableId: string) {
        const client = this.clients.get(clientId);
        if (client) {
            client.subscriptions.add(`table:${tableId}`);

            if (!this.tableSubscriptions.has(tableId)) {
                this.tableSubscriptions.set(tableId, new Set());
            }
            this.tableSubscriptions.get(tableId)!.add(clientId);

            strapi.log.debug(`📡 Client ${clientId} sottoscritto a tavolo ${tableId}`);
        }
    }

    broadcastToGame(gameId: string, data: any) {
        const clientIds = this.gameSubscriptions.get(gameId);
        if (clientIds) {
            clientIds.forEach(clientId => {
                this.sendToClient(clientId, data);
            });
        }
    }

    broadcastToTable(tableId: string, data: any) {
        const clientIds = this.tableSubscriptions.get(tableId);
        if (clientIds) {
            clientIds.forEach(clientId => {
                this.sendToClient(clientId, data);
            });
        }
    }

    sendToClient(clientId: string, data: any) {
        const client = this.clients.get(clientId);
        if (client && !client.response.destroyed) {
            try {
                const eventData = `data: ${JSON.stringify(data)}\n\n`;
                client.response.write(eventData);
            } catch (error) {
                strapi.log.error(`Errore invio SSE a client ${clientId}:`, error);
                this.removeClient(clientId);
            }
        }
    }

    getClientCount(): number {
        return this.clients.size;
    }

    getGameSubscriptions(gameId: string): number {
        return this.gameSubscriptions.get(gameId)?.size || 0;
    }

    getAllGameSubscriptions(): Map<string, Set<string>> {
        return this.gameSubscriptions;
    }

    getAllTableSubscriptions(): Map<string, Set<string>> {
        return this.tableSubscriptions;
    }

    getTotalGames(): number {
        return this.gameSubscriptions.size;
    }

    getTotalTables(): number {
        return this.tableSubscriptions.size;
    }
}

// Manager globale SSE
const sseManager = new SSEManager();

export default {
    /**
     * Endpoint SSE per risultati live di un gioco specifico
     * GET /api/live-results/stream/game/:gameId
     */
    async streamGameResults(ctx: any) {
        const { gameId } = ctx.params;
        const { tableId } = ctx.query;

        // Verifica che il gioco esista
        const game = await strapi.entityService.findMany('api::live-game.live-game', {
            filters: { gameId: { $eq: gameId }, isActive: true },
            limit: 1
        });

        if (!game || game.length === 0) {
            ctx.throw(404, `Gioco ${gameId} non trovato o non attivo`);
        }

        // Setup SSE headers
        ctx.request.socket.setTimeout(0);
        ctx.req.socket.setNoDelay(true);
        ctx.req.socket.setKeepAlive(true);

        ctx.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'X-Accel-Buffering': 'no' // Nginx
        });

        ctx.status = 200;

        // Genera ID client unico
        const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Crea client SSE
        const client: SSEClient = {
            id: clientId,
            response: ctx.res,
            gameId,
            tableId,
            subscriptions: new Set()
        };

        // Aggiungi client al manager
        sseManager.addClient(client);
        sseManager.subscribeToGame(clientId, gameId);

        // Se specificato un tableId, sottoscrivi anche al tavolo
        if (tableId) {
            sseManager.subscribeToTable(clientId, tableId);
        }

        // Invia messaggio di connessione
        ctx.res.write(`data: ${JSON.stringify({
            type: 'connected',
            clientId,
            gameId,
            tableId,
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Invia risultati iniziali (ultimi 10)
        try {
            const filters: any = {
                gameId: { $eq: gameId },
                expiresAt: { $gte: new Date().toISOString() }
            };

            if (tableId) {
                filters.tableId = { $eq: tableId };
            }

            const latestResults = await strapi.entityService.findMany('api::game-result.game-result' as any, {
                filters,
                sort: { extractedAt: 'desc' },
                limit: 10
            });

            if (latestResults.length > 0) {
                ctx.res.write(`data: ${JSON.stringify({
                    type: 'initial_results',
                    gameId,
                    tableId,
                    results: latestResults,
                    count: latestResults.length,
                    timestamp: new Date().toISOString()
                })}\n\n`);
            }
        } catch (error) {
            strapi.log.error('Errore caricamento risultati iniziali:', error);
        }

        // Cleanup quando la connessione si chiude
        ctx.req.on('close', () => {
            sseManager.removeClient(clientId);
        });

        ctx.req.on('error', () => {
            sseManager.removeClient(clientId);
        });

        // Mantieni la connessione aperta
        return new Promise(() => {
            // La promise non viene mai risolta per mantenere la connessione aperta
        });
    },

    /**
     * Endpoint SSE per tutti i giochi
     * GET /api/live-results/stream/all
     */
    async streamAllResults(ctx: any) {
        const { category } = ctx.query;

        // Setup SSE headers
        ctx.request.socket.setTimeout(0);
        ctx.req.socket.setNoDelay(true);
        ctx.req.socket.setKeepAlive(true);

        ctx.set({
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
            'X-Accel-Buffering': 'no'
        });

        ctx.status = 200;

        const clientId = `client_all_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const client: SSEClient = {
            id: clientId,
            response: ctx.res,
            subscriptions: new Set()
        };

        sseManager.addClient(client);

        // Sottoscrivi a tutti i giochi attivi
        const activeGames = await strapi.entityService.findMany('api::live-game.live-game', {
            filters: {
                isActive: true,
                ...(category && { category: { $eq: category } })
            },
            fields: ['gameId']
        });

        activeGames.forEach((game: any) => {
            sseManager.subscribeToGame(clientId, game.gameId);
        });

        // Messaggio di connessione
        ctx.res.write(`data: ${JSON.stringify({
            type: 'connected',
            clientId,
            subscribedGames: activeGames.map((g: any) => g.gameId),
            category,
            timestamp: new Date().toISOString()
        })}\n\n`);

        // Cleanup
        ctx.req.on('close', () => {
            sseManager.removeClient(clientId);
        });

        ctx.req.on('error', () => {
            sseManager.removeClient(clientId);
        });

        return new Promise(() => { });
    },

    /**
     * Stato delle connessioni SSE
     * GET /api/live-results/status
     */
    async getSSEStatus(ctx: any) {
        const gameStats = new Map();

        // Calcola statistiche per gioco
        for (const [gameId, clientIds] of sseManager.getAllGameSubscriptions()) {
            gameStats.set(gameId, {
                gameId,
                connectedClients: clientIds.size,
                subscriptions: clientIds.size
            });
        }

        ctx.body = {
            totalClients: sseManager.getClientCount(),
            totalGames: sseManager.getTotalGames(),
            totalTables: sseManager.getTotalTables(),
            gameStats: Array.from(gameStats.values()),
            timestamp: new Date().toISOString()
        };
    },

    /**
     * Funzione per inviare nuovi risultati ai client SSE
     * Chiamata dai service quando arrivano nuovi risultati
     */
    broadcastNewResult(resultData: any) {
        const { gameId, tableId } = resultData;

        const broadcastData = {
            type: 'new_result',
            gameId,
            tableId,
            result: resultData,
            timestamp: new Date().toISOString()
        };

        // Invia a tutti i client sottoscritti al gioco
        sseManager.broadcastToGame(gameId, broadcastData);

        // Invia anche ai client sottoscritti specificamente al tavolo
        if (tableId) {
            sseManager.broadcastToTable(tableId, broadcastData);
        }

        strapi.log.debug(`📡 Broadcast risultato: ${gameId}/${tableId} -> ${resultData.result}`);
    },

    /**
     * Funzione per inviare aggiornamenti di statistiche
     */
    broadcastGameStats(gameId: string, stats: any) {
        const broadcastData = {
            type: 'game_stats',
            gameId,
            stats,
            timestamp: new Date().toISOString()
        };

        sseManager.broadcastToGame(gameId, broadcastData);
    },

    // Esponi il manager per uso interno
    getSSEManager: () => sseManager
};
