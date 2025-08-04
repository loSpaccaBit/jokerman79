/**
 * live-game controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::live-game.live-game', ({ strapi }) => ({
    // Override del metodo find per aggiungere logica personalizzata
    async find(ctx) {
        // Esegui la query di base
        const { data, meta } = await super.find(ctx);

        // Aggiungi logica personalizzata se necessario
        return { data, meta };
    },

    // Endpoint personalizzato per ottenere giochi per categoria
    async findByCategory(ctx) {
        const { category } = ctx.params;

        try {
            const entities = await strapi.entityService.findMany('api::live-game.live-game', {
                filters: {
                    category: {
                        $eqi: category
                    },
                    isActive: true,
                    publishedAt: {
                        $notNull: true
                    }
                },
                sort: { sortOrder: 'asc' },
                populate: {
                    image: true,
                    seo: true
                }
            });

            return this.transformResponse(entities);
        } catch (err) {
            return ctx.badRequest('Errore nel recupero dei giochi per categoria');
        }
    },

    // Endpoint per ottenere configurazione di un gioco specifico
    async findByGameId(ctx) {
        const { gameId } = ctx.params;

        try {
            const entities = await strapi.entityService.findMany('api::live-game.live-game', {
                filters: {
                    gameId: {
                        $eq: gameId
                    },
                    isActive: true,
                    publishedAt: {
                        $notNull: true
                    }
                },
                populate: {
                    image: true,
                    seo: true
                }
            });

            if (entities.length === 0) {
                return ctx.notFound('Gioco non trovato');
            }

            return this.transformResponse(entities[0]);
        } catch (err) {
            return ctx.badRequest('Errore nel recupero del gioco');
        }
    },

    // Endpoint per ottenere tutti i tableIds mappati
    async getTableIdsMapping(ctx) {
        try {
            const entities = await strapi.entityService.findMany('api::live-game.live-game', {
                filters: {
                    isActive: true,
                    publishedAt: {
                        $notNull: true
                    }
                },
                fields: ['gameId', 'tableIds', 'gameType', 'name']
            }) as any[];

            // Crea mapping gameId -> tableIds
            const mapping = entities.reduce((acc: any, game: any) => {
                acc[game.gameId] = {
                    tableIds: game.tableIds || [],
                    gameType: game.gameType,
                    name: game.name
                };
                return acc;
            }, {});

            return { data: mapping };
        } catch (err) {
            return ctx.badRequest('Errore nel recupero del mapping');
        }
    }
}));
