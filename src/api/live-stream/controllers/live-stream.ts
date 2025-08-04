export default ({ strapi }) => ({
  /**
   * Stream dei dati live per un gioco specifico
   */
  async streamGame(ctx) {
    const { gameId } = ctx.params;

    try {
      // Recupera le informazioni del gioco dal database
      const game = await strapi.entityService.findMany('api::live-game.live-game', {
        filters: { gameId: gameId },
        limit: 1,
      });

      if (!game || game.length === 0) {
        ctx.status = 404;
        ctx.body = { error: 'Gioco non trovato' };
        return;
      }

      const gameData = game[0];
      
      // Controlla che il gioco sia attivo
      if (!gameData.isActive) {
        ctx.status = 400;
        ctx.body = { error: 'Gioco non attivo' };
        return;
      }

      // Ottieni i tableIds dal gioco
      const tableIds = gameData.tableIds || [];
      
      if (tableIds.length === 0) {
        ctx.status = 400;
        ctx.body = { error: 'Nessun tavolo configurato per questo gioco' };
        return;
      }

      console.log(`🎮 Inizializzazione stream per gioco ${gameId} con tavoli:`, tableIds);

      // Ottieni il servizio SSE manager
      const sseManager = strapi.service('api::sse-manager.sse-manager');
      
      // Inizializza la connessione SSE
      await sseManager.initSSEConnection(ctx.request, ctx.response, gameId, tableIds);

    } catch (error) {
      console.error(`❌ Errore stream gioco ${gameId}:`, error);
      
      ctx.status = 500;
      ctx.body = { 
        error: 'Errore interno del server',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  },

  /**
   * Stato delle connessioni e del sistema
   */
  async getStatus(ctx) {
    try {
      // Ottieni il servizio SSE manager
      const sseManager = strapi.service('api::sse-manager.sse-manager');
      const stats = sseManager.getStats();
      
      // Recupera informazioni sui giochi attivi
      const activeGames = await strapi.entityService.findMany('api::live-game.live-game', {
        filters: { isActive: true },
        fields: ['gameId', 'name', 'gameType', 'tableIds'],
      });

      ctx.body = {
        success: true,
        timestamp: new Date().toISOString(),
        connections: {
          totalClients: stats.totalClients,
          gameClients: stats.gameClients,
        },
        pragmaticWebSocket: stats.pragmaticStatus,
        availableGames: activeGames.map(game => ({
          gameId: game.gameId,
          name: game.name,
          gameType: game.gameType,
          tableCount: (game.tableIds || []).length,
          connectedClients: stats.gameClients[game.gameId] || 0
        }))
      };

    } catch (error) {
      console.error('❌ Errore ottenimento status:', error);
      
      ctx.status = 500;
      ctx.body = { 
        error: 'Errore ottenimento status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      };
    }
  }
});
