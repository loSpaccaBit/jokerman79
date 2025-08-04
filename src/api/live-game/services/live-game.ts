/**
 * live-game service
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::live-game.live-game', ({ strapi }) => ({
    // Metodo personalizzato per ottenere giochi attivi
    async findActiveGames(filters = {}) {
        return await strapi.entityService.findMany('api::live-game.live-game', {
            filters: {
                isActive: true,
                publishedAt: {
                    $notNull: true
                },
                ...filters
            },
            sort: { sortOrder: 'asc' },
            populate: {
                image: true,
                seo: true
            }
        });
    },

    // Metodo per ottenere il mapping completo dei tavoli
    async getTableMapping() {
        const games = await strapi.entityService.findMany('api::live-game.live-game', {
            filters: {
                isActive: true,
                publishedAt: {
                    $notNull: true
                }
            },
            fields: ['gameId', 'tableIds', 'gameType', 'name', 'category']
        }) as any[];

        return games.reduce((acc: any, game: any) => {
            if (game.tableIds && Array.isArray(game.tableIds)) {
                game.tableIds.forEach((tableId: string) => {
                    acc[tableId] = {
                        gameId: game.gameId,
                        gameType: game.gameType,
                        name: game.name,
                        category: game.category
                    };
                });
            }
            return acc;
        }, {});
    }
}));
