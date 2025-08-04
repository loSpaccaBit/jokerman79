export default {
    routes: [
        {
            method: 'GET',
            path: '/live-games',
            handler: 'live-game.find',
            config: {
                policies: []
            }
        },
        {
            method: 'GET',
            path: '/live-games/category/:category',
            handler: 'live-game.findByCategory',
            config: {
                policies: []
            }
        },
        {
            method: 'GET',
            path: '/live-games/game/:gameId',
            handler: 'live-game.findByGameId',
            config: {
                policies: []
            }
        },
        {
            method: 'GET',
            path: '/live-games/mapping/table-ids',
            handler: 'live-game.getTableIdsMapping',
            config: {
                policies: []
            }
        }
    ]
};
