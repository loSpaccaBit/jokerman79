import WebSocket from 'ws';
import { Core } from '@strapi/strapi';

type RetentionPeriod = 'oneDay' | 'threeDays' | 'sevenDays' | 'thirtyDays' | 'permanent';
type Priority = 'low' | 'normal' | 'high' | 'permanent';
type ResultType = 'number' | 'text' | 'card' | 'color';

interface GameResultData {
  gameId: string;
  tableId: string;
  result: string;
  resultType: ResultType;
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

interface LiveMessage {
  type: string;
  data?: any;
}

interface GameInfo {
  gameId: string;
  gameType: string;
  name: string;
}

interface GameData {
  tableId: string;
  tableName?: string;
  dealer?: { name: string };
  totalSeatedPlayers?: number;
  gameResult?: Array<{
    gameId: string;
    result: string | number;
    time: string;
    winner?: string;
    multiplier?: number;
    cardValue?: string;
    slots?: Record<string, number>;
    color?: string;
    payout?: number[];
  }>;
  last20Results?: Array<{
    time: string;
    result: string;
    color?: string;
    multiplier?: number;
    slots?: Record<string, number>;
    gameId: string;
    slot?: number;
  }>;
}

// Estende l'interfaccia Strapi per includere la nostra connessione
interface ExtendedStrapi extends Core.Strapi {
  liveStatsConnection?: WebSocket;
}

export default {
  /**
   * Hook che si connette al server LiveStats e salva i risultati nel database
   */
  async initialize(): Promise<void> {
    const liveStatsUrl = process.env.LIVE_STATS_WS_URL || 'ws://localhost:3000';

    strapi.log.info('🔌 Inizializzazione LiveStats Result Saver...');

    let ws: WebSocket;
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 10;
    const reconnectDelay = 5000;

    const connect = (): void => {
      try {
        ws = new WebSocket(liveStatsUrl);

        ws.on('open', () => {
          strapi.log.info('✅ Connesso al LiveStats WebSocket per salvataggio risultati');
          reconnectAttempts = 0;

          // Sottoscrivi a tutti i tavoli attivi
          subscribeToActiveTables();
        });

        ws.on('message', async (data: WebSocket.Data) => {
          try {
            const message: LiveMessage = JSON.parse(data.toString());
            await handleLiveMessage(message);
          } catch (error) {
            strapi.log.error('Errore parsing messaggio WebSocket:', error);
          }
        });

        ws.on('close', () => {
          strapi.log.warn('❌ Connessione LiveStats chiusa');
          attemptReconnect();
        });

        ws.on('error', (error: Error) => {
          strapi.log.error('❌ Errore WebSocket LiveStats:', error);
          attemptReconnect();
        });

      } catch (error) {
        strapi.log.error('Errore connessione WebSocket:', error);
        attemptReconnect();
      }
    };

    const attemptReconnect = (): void => {
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

    const subscribeToActiveTables = async (): Promise<void> => {
      try {
        // Ottieni tutti i gameId attivi da Strapi
        const activeGames = await strapi.entityService.findMany('api::live-game.live-game', {
          filters: { isActive: true },
          fields: ['gameId', 'tableIds']
        });

        // Sottoscrivi a tutti i tavoli
        activeGames.forEach((game: any) => {
          if (game.tableIds && Array.isArray(game.tableIds)) {
            game.tableIds.forEach((tableId: string) => {
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

    const handleLiveMessage = async (message: LiveMessage): Promise<void> => {
      try {
        // Filtra solo i messaggi con risultati estratti
        if (message.type === 'game_data' && message.data) {
          const gameData: GameData = message.data;

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

    const findGameByTableId = async (tableId: string): Promise<GameInfo | null> => {
      try {
        const games = await strapi.entityService.findMany('api::live-game.live-game', {
          filters: {
            isActive: true,
            tableIds: { $contains: tableId }
          },
          fields: ['gameId', 'gameType', 'name']
        });

        return games.length > 0 ? {
          gameId: games[0].gameId || '',
          gameType: games[0].gameType || '',
          name: games[0].name || ''
        } : null;

      } catch (error) {
        strapi.log.error('Errore ricerca gioco per tableId:', error);
        return null;
      }
    };

    const processGameResults = async (gameData: GameData, gameInfo: GameInfo): Promise<void> => {
      try {
        const promises: Promise<any>[] = [];

        // Gestisci risultati gameResult (Sweet Bonanza, Dragon Tiger, etc.)
        if (gameData.gameResult && Array.isArray(gameData.gameResult)) {
          gameData.gameResult.forEach(result => {
            const { expiresAt, retentionPeriod, priority } = calculateExpiryAndPriority(result);

            const resultData: GameResultData = {
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
              extractedAt: result.time ? new Date(result.time).toISOString() : new Date().toISOString(),
              expiresAt,
              retentionPeriod,
              priority,
              roundId: result.gameId, // In realtà è roundId
              dealerName: gameData.dealer?.name,
              totalPlayers: gameData.totalSeatedPlayers,
              metadata: {
                gameType: gameInfo.gameType,
                tableName: gameData.tableName,
                source: 'websocket_live'
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
            const { expiresAt, retentionPeriod, priority } = calculateExpiryAndPriority(result);

            const resultData: GameResultData = {
              gameId: gameInfo.gameId,
              tableId: gameData.tableId,
              result: String(result.result),
              resultType: determineResultType(result.result),
              color: result.color,
              multiplier: result.multiplier,
              slots: result.slots,
              extractedAt: result.time ? new Date(result.time).toISOString() : new Date().toISOString(),
              expiresAt,
              retentionPeriod,
              priority,
              roundId: result.gameId,
              dealerName: gameData.dealer?.name,
              totalPlayers: gameData.totalSeatedPlayers,
              metadata: {
                gameType: gameInfo.gameType,
                tableName: gameData.tableName,
                slot: result.slot,
                source: 'websocket_live'
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
          strapi.log.debug(`💾 Salvati ${promises.length} risultati per ${gameInfo.gameId}/${gameData.tableId}`);
        }

      } catch (error) {
        strapi.log.error('Errore processing game results:', error);
      }
    };

    // Avvia la connessione
    connect();

    // Cleanup periodico ogni ora
    setInterval(async () => {
      try {
        const cleanupResult = await strapi.service('api::game-result.game-result').cleanupExpiredResults();
        if (cleanupResult.deleted > 0) {
          strapi.log.info(`🧹 Cleanup automatico: ${cleanupResult.deleted} risultati scaduti eliminati`);
        }
      } catch (error) {
        strapi.log.error('Errore cleanup periodico:', error);
      }
    }, 60 * 60 * 1000);

    // Salva riferimento per cleanup
    (strapi as any).liveStatsConnection = ws;
  },

  async destroy(): Promise<void> {
    if ((strapi as any).liveStatsConnection) {
      (strapi as any).liveStatsConnection.close();
      strapi.log.info('🔌 Connessione LiveStats chiusa');
    }
  }
};

// Funzioni di utilità
function determineResultType(result: any): ResultType {
  const str = String(result);

  if (/^\d+$/.test(str)) return 'number';
  if (/^[A-Za-z]$/.test(str)) return 'card';
  if (/^(red|black|green|blue|yellow)$/i.test(str)) return 'color';
  return 'text';
}

function calculateExpiryAndPriority(resultData: any): {
  expiresAt: string;
  retentionPeriod: RetentionPeriod;
  priority: Priority
} {
  const now = new Date();
  let retentionPeriod: RetentionPeriod = 'sevenDays';
  let priority: Priority = 'normal';

  // Logica di priorità basata sul tipo di risultato
  if (resultData.multiplier >= 100) {
    // Moltiplicatori molto alti: conserva più a lungo
    retentionPeriod = 'thirtyDays';
    priority = 'permanent';
  } else if (resultData.multiplier >= 10) {
    // Big wins: conserva 30 giorni
    retentionPeriod = 'thirtyDays';
    priority = 'high';
  } else if (resultData.winner && resultData.winner.toLowerCase().includes('bonus')) {
    // Bonus wins: conserva 7 giorni
    retentionPeriod = 'sevenDays';
    priority = 'high';
  } else {
    // Risultati normali: 7 giorni
    retentionPeriod = 'sevenDays';
    priority = 'normal';
  }

  // Calcola data di scadenza
  const retentionDays = {
    'oneDay': 1,
    'threeDays': 3,
    'sevenDays': 7,
    'thirtyDays': 30,
    'permanent': 365 * 10 // 10 anni per i permanenti
  };

  const expiresAt = new Date(now.getTime() + retentionDays[retentionPeriod] * 24 * 60 * 60 * 1000);

  return {
    expiresAt: expiresAt.toISOString(),
    retentionPeriod,
    priority
  };
}
