import { Core } from '@strapi/strapi';

type RetentionPeriod = 'oneDay' | 'threeDays' | 'sevenDays' | 'thirtyDays' | 'permanent';
type Priority = 'low' | 'normal' | 'high' | 'permanent';

interface GameResultData {
    gameId: string;
    tableId: string;
    result: string;
    resultType: 'number' | 'text' | 'card' | 'color';
    winner?: string;
    multiplier?: number;
    cardValue?: string;
    color?: string;
    slots?: any;
    payout?: any;
    extractedAt: string;
    expiresAt: string;
    retentionPeriod: RetentionPeriod;
    priority: Priority;
    roundId?: string;
    dealerName?: string;
    totalPlayers?: number;
    metadata?: any;
}

export default {

    // Salva risultato con deduplicazione e gestione scadenze
    async saveResultSafe(resultData: GameResultData) {
        try {
            // Controlla se esiste già un risultato identico (deduplicazione)
            const extractedDate = new Date(resultData.extractedAt);
            const timeWindow = 5000; // ±5 secondi

            const existing = await strapi.entityService.findMany('api::game-result.game-result' as any, {
                filters: {
                    gameId: { $eq: resultData.gameId },
                    tableId: { $eq: resultData.tableId },
                    result: { $eq: resultData.result },
                    extractedAt: {
                        $gte: new Date(extractedDate.getTime() - timeWindow).toISOString(),
                        $lte: new Date(extractedDate.getTime() + timeWindow).toISOString()
                    },
                    expiresAt: { $gte: new Date().toISOString() } // Solo non scaduti
                },
                limit: 1
            });

            if (existing.length > 0) {
                strapi.log.debug(`Risultato duplicato ignorato: ${resultData.gameId}/${resultData.tableId} -> ${resultData.result}`);
                return existing[0];
            }

            // Salva nuovo risultato
            const result = await strapi.entityService.create('api::game-result.game-result' as any, {
                data: resultData as any
            });

            strapi.log.info(`Nuovo risultato salvato: ${resultData.gameId}/${resultData.tableId} -> ${resultData.result} (scade: ${resultData.expiresAt})`);

            // Invia notifica SSE per il nuovo risultato
            try {
                const liveResultsController = strapi.controller('api::live-results.live-results');
                if (liveResultsController && typeof liveResultsController.broadcastNewResult === 'function') {
                    // Creiamo un context fittizio per il controller
                    const fakeContext = {
                        request: { body: result },
                        response: {},
                        state: {}
                    };
                    const fakeNext = () => Promise.resolve();
                    liveResultsController.broadcastNewResult(fakeContext as any, fakeNext);
                }
            } catch (sseError) {
                strapi.log.error('Errore invio notifica SSE:', sseError);
                // Non bloccare il salvataggio per errori SSE
            }

            return result;

        } catch (error: any) {
            strapi.log.error('Error saving result:', error);
            throw error;
        }
    },

    // Pulisci risultati scaduti
    async cleanupExpiredResults(): Promise<number> {
        try {
            const now = new Date().toISOString();

            // Trova tutti i risultati scaduti eccetto quelli permanenti
            const expiredResults = await strapi.db.query('api::game-result.game-result').findMany({
                select: ['id'],
                where: {
                    expiresAt: { $lt: now },
                    priority: { $ne: 'permanent' }
                },
                limit: 1000 // Processo a batch
            });

            if (expiredResults.length === 0) {
                return 0;
            }

            const deletedCount = await strapi.db.query('api::game-result.game-result').deleteMany({
                where: {
                    id: { $in: expiredResults.map((r: any) => r.id) }
                }
            });

            strapi.log.info(`🧹 Cleanup completato: ${deletedCount.count || 0} risultati scaduti eliminati`);
            return deletedCount.count || 0;

        } catch (error: any) {
            strapi.log.error('Error in cleanup:', error);
            throw error;
        }
    },

    // Pulisci selettivamente per gameId
    async cleanupGameResults(gameId: string, olderThanDays: number = 30): Promise<number> {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

            const deletedCount = await strapi.db.query('api::game-result.game-result').deleteMany({
                where: {
                    gameId: { $eq: gameId },
                    extractedAt: { $lt: cutoffDate.toISOString() },
                    priority: { $ne: 'permanent' }
                }
            });

            strapi.log.info(`Game cleanup completato per ${gameId}: ${deletedCount.count || 0} risultati eliminati (più vecchi di ${olderThanDays} giorni)`);
            return deletedCount.count || 0;

        } catch (error: any) {
            strapi.log.error('Error in game cleanup:', error);
            throw error;
        }
    },

    // Ottieni statistiche aggregate per dashboard
    async getAggregatedStats() {
        try {
            const now = new Date().toISOString();

            // Statistiche per retention period
            const retentionStats = await strapi.db.query('api::game-result.game-result').findMany({
                select: ['gameId', 'retentionPeriod', 'priority'],
                where: {
                    expiresAt: { $gte: now }
                }
            });

            // Raggruppa per gameId
            const gameStats = retentionStats.reduce((acc: any, result: any) => {
                if (!acc[result.gameId]) {
                    acc[result.gameId] = {
                        total: 0,
                        retention: {},
                        priority: {}
                    };
                }

                acc[result.gameId].total++;
                acc[result.gameId].retention[result.retentionPeriod] =
                    (acc[result.gameId].retention[result.retentionPeriod] || 0) + 1;
                acc[result.gameId].priority[result.priority] =
                    (acc[result.gameId].priority[result.priority] || 0) + 1;

                return acc;
            }, {});

            return gameStats;

        } catch (error: any) {
            strapi.log.error('Error getting aggregated stats:', error);
            throw error;
        }
    },

    // Estendi scadenza per risultati importanti
    async extendRetention(resultIds: number[], newRetentionPeriod: RetentionPeriod, reason?: string) {
        try {
            const newExpiryDate = calculateExpiryDate(new Date(), newRetentionPeriod);

            const updatedCount = await strapi.db.query('api::game-result.game-result').updateMany({
                where: {
                    id: { $in: resultIds }
                },
                data: {
                    retentionPeriod: newRetentionPeriod,
                    expiresAt: newExpiryDate.toISOString(),
                    metadata: {
                        retentionExtended: true,
                        extensionReason: reason || 'Manual extension',
                        extensionDate: new Date().toISOString()
                    }
                }
            });

            strapi.log.info(`Retention estesa per ${updatedCount.count || 0} risultati a ${newRetentionPeriod}`);
            return updatedCount.count || 0;

        } catch (error: any) {
            strapi.log.error('Error extending retention:', error);
            throw error;
        }
    },

    // Ottieni risultati in scadenza (per notifiche/backup)
    async getExpiringResults(days: number = 1) {
        try {
            const now = new Date();
            const warningDate = new Date(now.getTime() + (days * 24 * 60 * 60 * 1000));

            const expiringResults = await strapi.entityService.findMany('api::game-result.game-result' as any, {
                filters: {
                    expiresAt: {
                        $gte: now.toISOString(),
                        $lte: warningDate.toISOString()
                    },
                    priority: { $ne: 'permanent' }
                },
                sort: { extractedAt: 'desc' }, // Usa extractedAt invece di expiresAt
                limit: 100
            });

            return expiringResults;

        } catch (error: any) {
            strapi.log.error('Error getting expiring results:', error);
            throw error;
        }
    }
};

// Funzione di utilità per calcolare data di scadenza
function calculateExpiryDate(baseDate: Date, retentionPeriod: RetentionPeriod): Date {
    const date = new Date(baseDate);

    switch (retentionPeriod) {
        case 'oneDay':
            date.setDate(date.getDate() + 1);
            break;
        case 'threeDays':
            date.setDate(date.getDate() + 3);
            break;
        case 'sevenDays':
            date.setDate(date.getDate() + 7);
            break;
        case 'thirtyDays':
            date.setDate(date.getDate() + 30);
            break;
        case 'permanent':
            // Imposta una data molto lontana (100 anni)
            date.setFullYear(date.getFullYear() + 100);
            break;
    }

    return date;
}
