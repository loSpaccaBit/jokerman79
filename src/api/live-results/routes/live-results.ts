/**
 * Routes per l'API di risultati live tramite SSE
 */

export default {
    routes: [
        {
            method: 'GET',
            path: '/live-results/stream/game/:gameId',
            handler: 'live-results.streamGameResults',
            config: {
                auth: false,
                middlewares: [],
                description: 'Stream SSE dei risultati live per un gioco specifico'
            }
        },
        {
            method: 'GET',
            path: '/live-results/stream/all',
            handler: 'live-results.streamAllResults',
            config: {
                auth: false,
                middlewares: [],
                description: 'Stream SSE dei risultati live per tutti i giochi'
            }
        },
        {
            method: 'GET',
            path: '/live-results/status',
            handler: 'live-results.getSSEStatus',
            config: {
                auth: false,
                middlewares: [],
                description: 'Stato delle connessioni SSE attive'
            }
        }
    ]
};
