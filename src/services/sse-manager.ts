import { Request, Response } from 'express';
import pragmaticWebSocketService, { PragmaticGameData } from '../services/websocket-pragmatic';

export interface SSEClient {
  response: Response;
  gameId: string;
  connected: boolean;
  lastPing: number;
}

class SSEManager {
  private clients = new Map<string, SSEClient>();
  private pingInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startPingInterval();
  }

  /**
   * Inizializza una connessione SSE per un gioco specifico
   */
  public async initSSEConnection(req: Request, res: Response, gameId: string, tableIds: string[]): Promise<void> {
    const clientId = `${gameId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Setup headers SSE
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
        'X-Accel-Buffering': 'no' // Nginx
      });

      // Invia messaggio di connessione iniziale
      this.sendSSEMessage(res, 'connected', {
        gameId,
        tableIds,
        timestamp: new Date().toISOString(),
        status: 'connected'
      });

      // Registra il client
      const client: SSEClient = {
        response: res,
        gameId,
        connected: true,
        lastPing: Date.now()
      };
      this.clients.set(clientId, client);

      // Crea il listener per i dati del gioco
      const gameDataListener = (data: PragmaticGameData) => {
        if (client.connected) {
          this.sendSSEMessage(res, 'gameData', {
            gameId,
            tableId: data.tableId,
            data,
            timestamp: new Date().toISOString()
          });
        }
      };

      // Sottoscrive al WebSocket Pragmatic
      await pragmaticWebSocketService.subscribeToGame(gameId, tableIds, gameDataListener);

      // Invia dati esistenti se disponibili
      const existingData = pragmaticWebSocketService.getGameData(gameId);
      if (existingData.length > 0) {
        this.sendSSEMessage(res, 'initialData', {
          gameId,
          data: existingData,
          timestamp: new Date().toISOString()
        });
      }

      // Gestione chiusura connessione
      req.on('close', () => {
        console.log(`🔌 Client SSE disconnesso: ${clientId}`);
        client.connected = false;
        this.clients.delete(clientId);
        
        // Rimuovi la sottoscrizione dal WebSocket
        pragmaticWebSocketService.unsubscribeFromGame(gameId, gameDataListener);
      });

      req.on('error', (error) => {
        console.error(`❌ Errore client SSE ${clientId}:`, error);
        client.connected = false;
        this.clients.delete(clientId);
        pragmaticWebSocketService.unsubscribeFromGame(gameId, gameDataListener);
      });

      console.log(`✅ Client SSE connesso per gioco ${gameId}: ${clientId} (${this.clients.size} client totali)`);

    } catch (error) {
      console.error(`❌ Errore inizializzazione SSE per gioco ${gameId}:`, error);
      
      this.sendSSEMessage(res, 'error', {
        gameId,
        error: 'Impossibile connettersi al feed dei dati',
        timestamp: new Date().toISOString()
      });
      
      res.end();
    }
  }

  /**
   * Invia un messaggio SSE
   */
  private sendSSEMessage(res: Response, event: string, data: any): void {
    try {
      const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
      res.write(message);
    } catch (error) {
      console.error('❌ Errore invio messaggio SSE:', error);
    }
  }

  /**
   * Invia ping periodici per mantenere vive le connessioni
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      const now = Date.now();
      const clientsToRemove: string[] = [];

      for (const [clientId, client] of this.clients) {
        if (!client.connected) {
          clientsToRemove.push(clientId);
          continue;
        }

        try {
          // Invia ping
          this.sendSSEMessage(client.response, 'ping', {
            timestamp: new Date().toISOString(),
            gameId: client.gameId
          });
          
          client.lastPing = now;
        } catch (error) {
          console.error(`❌ Errore ping client ${clientId}:`, error);
          client.connected = false;
          clientsToRemove.push(clientId);
        }
      }

      // Rimuovi client disconnessi
      clientsToRemove.forEach(clientId => {
        this.clients.delete(clientId);
      });

      if (clientsToRemove.length > 0) {
        console.log(`🧹 Rimossi ${clientsToRemove.length} client disconnessi`);
      }

    }, 30000); // Ping ogni 30 secondi
  }

  /**
   * Broadcast messaggio a tutti i client di un gioco
   */
  public broadcastToGame(gameId: string, event: string, data: any): void {
    let sent = 0;
    
    for (const [clientId, client] of this.clients) {
      if (client.gameId === gameId && client.connected) {
        try {
          this.sendSSEMessage(client.response, event, {
            ...data,
            gameId,
            timestamp: new Date().toISOString()
          });
          sent++;
        } catch (error) {
          console.error(`❌ Errore broadcast a client ${clientId}:`, error);
          client.connected = false;
        }
      }
    }

    if (sent > 0) {
      console.log(`📢 Broadcast '${event}' inviato a ${sent} client del gioco ${gameId}`);
    }
  }

  /**
   * Ottieni statistiche connessioni
   */
  public getStats(): { totalClients: number; gameClients: Record<string, number>; pragmaticStatus: any } {
    const gameClients: Record<string, number> = {};
    
    for (const client of this.clients.values()) {
      if (client.connected) {
        gameClients[client.gameId] = (gameClients[client.gameId] || 0) + 1;
      }
    }

    return {
      totalClients: this.clients.size,
      gameClients,
      pragmaticStatus: pragmaticWebSocketService.getConnectionStatus()
    };
  }

  /**
   * Chiudi tutte le connessioni
   */
  public shutdown(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    for (const [clientId, client] of this.clients) {
      try {
        this.sendSSEMessage(client.response, 'shutdown', {
          message: 'Server in manutenzione',
          timestamp: new Date().toISOString()
        });
        client.response.end();
      } catch (error) {
        console.error(`❌ Errore chiusura client ${clientId}:`, error);
      }
    }

    this.clients.clear();
    pragmaticWebSocketService.disconnect();
    console.log('🛑 SSE Manager spento');
  }
}

// Singleton instance
export const sseManager = new SSEManager();

export default sseManager;
