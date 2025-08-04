"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

export interface LiveGameData {
    tableId: string;
    tableName?: string;
    tableType: string;
    // Per Dragon Tiger, Sweet Bonanza, ecc.
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
    // Per Roulette, Mega Wheel
    last20Results?: Array<{
        time: string;
        result: string;
        color?: string;
        multiplier?: number;
        slots?: Record<string, number>;
        gameId: string;
        slot?: number;
    }>;
    // Informazioni generiche
    totalSeatedPlayers?: number;
    tableOpen?: boolean;
    tableLimits?: {
        minBet: number;
        maxBet: number;
        maxPlayers: number;
        ranges: number[];
    };
    dealer?: {
        name: string;
    };
    tableImage?: string;
    currency?: string;
    // Statistiche specifiche per tipo di gioco
    statistics?: string | {
        hotNumbers?: number[];
        coldNumbers?: number[];
        trends?: string[];
    };
    dragonTigerShoeSummary?: {
        totalGames: string;
        dragonWinCounter: string;
        tigerWinCounter: string;
        tieCounter: string;
    };
    currentRound?: {
        roundId: string;
        phase: string;
        timeRemaining?: number;
    };
    lastUpdate: string;
}

export interface LiveStatsState {
    games: LiveGameData[];
    availableTables: Array<{
        tableId: string;
        tableName: string;
        tableType: string;
        tableOpen: boolean;
    }>;
    connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
    subscribedTables: Set<string>;
}

interface LiveStatsOptions {
    autoConnect?: boolean;
    reconnectDelay?: number;
    maxReconnectAttempts?: number;
    enabled?: boolean; // Nuovo flag per disabilitare completamente l'hook
}

export function useLiveStats(options: LiveStatsOptions = {}) {
    const {
        autoConnect = true,
        reconnectDelay = 5000,
        maxReconnectAttempts = 5,
        enabled = true // Default abilitato per compatibilità
    } = options;

    // Se l'hook è disabilitato, ritorna uno stato vuoto ma stabile
    if (!enabled) {
        return {
            // Stato vuoto
            games: [],
            availableTables: [],
            connectionStatus: 'disconnected' as const,
            subscribedTables: new Set<string>(),

            // Azioni no-op
            connect: () => {},
            disconnect: () => {},
            requestAvailableTables: () => false,
            subscribeToTable: () => false,
            unsubscribeFromTable: () => false,

            // Utilities vuote
            getGamesByType: () => [],
            getAggregatedStats: () => ({
                totalTables: 0,
                gameTypes: [],
                activeRounds: 0,
                subscribedCount: 0
            }),

            // Stato connessione falso
            isConnected: false,
            isConnecting: false,
            hasError: false
        };
    }

    const [state, setState] = useState<LiveStatsState>({
        games: [],
        availableTables: [],
        connectionStatus: 'disconnected',
        subscribedTables: new Set()
    });

    const wsRef = useRef<WebSocket | null>(null);
    const reconnectAttemptsRef = useRef(0);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // URL del server LiveStats
    const getWebSocketUrl = useCallback(() => {
        // Usa la variabile d'ambiente se disponibile, altrimenti fallback
        const wsUrl = process.env.NEXT_PUBLIC_LIVE_STATS_WS_URL;
        if (wsUrl) {
            return wsUrl;
        }

        // Fallback per sviluppo locale
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = process.env.NODE_ENV === 'production'
            ? window.location.host
            : 'localhost:3000'; // Porta del server liveStats
        return `${protocol}//${host}`;
    }, []);

    // Connessione WebSocket
    const connect = useCallback(() => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            return;
        }

        setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

        try {
            const wsUrl = getWebSocketUrl();
            console.log('🔌 Connessione a LiveStats WebSocket:', wsUrl);

            wsRef.current = new WebSocket(wsUrl);

            wsRef.current.onopen = () => {
                console.log('✅ WebSocket connesso a LiveStats');
                setState(prev => ({ ...prev, connectionStatus: 'connected' }));
                reconnectAttemptsRef.current = 0;

                // Richiedi tabelle disponibili
                requestAvailableTables();
            };

            wsRef.current.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    handleWebSocketMessage(data);
                } catch (error) {
                    console.error('❌ Errore parsing messaggio WebSocket:', error);
                }
            };

            wsRef.current.onclose = (event) => {
                console.log('🔌 WebSocket disconnesso:', {
                    code: event.code,
                    reason: event.reason,
                    wasClean: event.wasClean
                });
                setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));

                // Tentativo di riconnessione solo se non è una chiusura volontaria
                if (event.code !== 1000 && reconnectAttemptsRef.current < maxReconnectAttempts) {
                    scheduleReconnect();
                } else if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
                    console.warn('🚫 Numero massimo di tentativi di riconnessione raggiunto');
                    setState(prev => ({ ...prev, connectionStatus: 'error' }));
                }
            };

            wsRef.current.onerror = (error) => {
                console.warn('⚠️ Errore WebSocket (server probabilmente non disponibile):', {
                    error,
                    url: wsUrl,
                    readyState: wsRef.current?.readyState
                });
                setState(prev => ({ ...prev, connectionStatus: 'error' }));
            };

        } catch (error) {
            console.error('❌ Errore creazione WebSocket:', error);
            setState(prev => ({ ...prev, connectionStatus: 'error' }));
        }
    }, [getWebSocketUrl, maxReconnectAttempts]);

    // Pianifica riconnessione
    const scheduleReconnect = useCallback(() => {
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectAttemptsRef.current++;
        console.log(`🔄 Tentativo riconnessione ${reconnectAttemptsRef.current}/${maxReconnectAttempts} in ${reconnectDelay}ms`);

        reconnectTimeoutRef.current = setTimeout(() => {
            connect();
        }, reconnectDelay);
    }, [connect, reconnectDelay, maxReconnectAttempts]);

    // Gestione messaggi WebSocket
    const handleWebSocketMessage = useCallback((data: any) => {
        console.log('📨 Messaggio WebSocket ricevuto:', data.type, data);

        switch (data.type) {
            case 'initialData':
                console.log('🎯 Dati iniziali ricevuti:', data.data?.length, 'giochi');
                setState(prev => ({
                    ...prev,
                    games: data.data?.map((game: any) => ({
                        ...game,
                        lastUpdate: new Date().toISOString()
                    })) || [],
                    connectionStatus: data.status === 'connected' ? 'connected' : 'disconnected'
                }));
                break;

            case 'gameUpdate':
                console.log('🔄 Aggiornamento gioco ricevuto per tavolo:', data.data.tableId);
                setState(prev => {
                    const updatedGames = [...prev.games];
                    const existingIndex = updatedGames.findIndex(g => g.tableId === data.data.tableId);

                    if (existingIndex >= 0) {
                        updatedGames[existingIndex] = {
                            ...updatedGames[existingIndex],
                            ...data.data,
                            lastUpdate: new Date().toISOString()
                        };
                        console.log('✅ Gioco aggiornato:', data.data.tableId);
                    } else {
                        updatedGames.push({
                            ...data.data,
                            lastUpdate: new Date().toISOString()
                        });
                        console.log('🆕 Nuovo gioco aggiunto:', data.data.tableId);
                    }

                    return { ...prev, games: updatedGames };
                });
                break;

            case 'availableTables':
                console.log('📋 Tabelle disponibili ricevute:', data.tables?.length);
                setState(prev => ({
                    ...prev,
                    availableTables: data.tables || []
                }));
                break;

            case 'subscriptionResponse':
                console.log('📊 Risposta sottoscrizione:', data);
                if (data.success) {
                    setState(prev => {
                        const newSubscribed = new Set(prev.subscribedTables);
                        if (data.action === 'subscribe') {
                            newSubscribed.add(data.tableId);
                            console.log('✅ Sottoscritto a tavolo:', data.tableId);
                        } else if (data.action === 'unsubscribe') {
                            newSubscribed.delete(data.tableId);
                            console.log('❌ Disiscritto da tavolo:', data.tableId);
                        }
                        return { ...prev, subscribedTables: newSubscribed };
                    });
                }
                break;

            case 'pong':
                // Risposta al ping per mantenere la connessione
                break;

            default:
                console.log('📨 Messaggio WebSocket non gestito:', data.type, data);
        }
    }, []);

    // Invia messaggio WebSocket
    const sendMessage = useCallback((message: any) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(message));
            return true;
        } else {
            console.warn('⚠️ WebSocket non connesso, impossibile inviare messaggio');
            return false;
        }
    }, []);

    // Richiedi tabelle disponibili
    const requestAvailableTables = useCallback(() => {
        return sendMessage({
            type: 'available',
            casinoId: 'il9srgw4dna11111' // Casino ID dal server liveStats
        });
    }, [sendMessage]);

    // Sottoscrivi a una tabella
    const subscribeToTable = useCallback((tableId: string, currency = 'EUR') => {
        console.log('📡 Invio sottoscrizione per tavolo:', tableId);
        const success = sendMessage({
            type: 'subscribe',
            key: tableId,
            casinoId: 'il9srgw4dna11111',
            currency
        });
        console.log('📡 Sottoscrizione inviata:', success ? 'successo' : 'fallita');
        return success;
    }, [sendMessage]);

    // Disiscrivi da una tabella
    const unsubscribeFromTable = useCallback((tableId: string) => {
        console.log('📡 Invio disiscrizione per tavolo:', tableId);
        const success = sendMessage({
            type: 'unsubscribe',
            key: tableId,
            casinoId: 'il9srgw4dna11111'
        });
        console.log('📡 Disiscrizione inviata:', success ? 'successo' : 'fallita');
        return success;
    }, [sendMessage]);

    // Disconnetti
    const disconnect = useCallback(() => {
        console.log('🔌 Disconnessione completa Pragmatic WebSocket');
        
        if (reconnectTimeoutRef.current) {
            clearTimeout(reconnectTimeoutRef.current);
            reconnectTimeoutRef.current = null;
        }

        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Reset completo dello stato alla disconnessione
        setState({
            games: [],
            availableTables: [],
            connectionStatus: 'disconnected',
            subscribedTables: new Set()
        });
    }, []);

    // Ping per mantenere la connessione
    useEffect(() => {
        const pingInterval = setInterval(() => {
            if (state.connectionStatus === 'connected') {
                sendMessage({ type: 'ping' });
            }
        }, 30000); // Ping ogni 30 secondi

        return () => clearInterval(pingInterval);
    }, [state.connectionStatus, sendMessage]);

    // Auto-connect
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);

    // Filtra giochi per tipo
    const getGamesByType = useCallback((gameType: string) => {
        return state.games.filter(game => game.tableType === gameType);
    }, [state.games]);

    // Ottieni statistiche aggregate
    const getAggregatedStats = useCallback(() => {
        const totalTables = state.games.length;
        const gameTypes = new Set(state.games.map(game => game.tableType));
        const activeRounds = state.games.filter(game => game.currentRound?.phase === 'active').length;

        return {
            totalTables,
            gameTypes: Array.from(gameTypes),
            activeRounds,
            subscribedCount: state.subscribedTables.size
        };
    }, [state.games, state.subscribedTables]);

    return {
        // Stato
        ...state,

        // Azioni
        connect,
        disconnect,
        requestAvailableTables,
        subscribeToTable,
        unsubscribeFromTable,

        // Utilities
        getGamesByType,
        getAggregatedStats,

        // Stato connessione
        isConnected: state.connectionStatus === 'connected',
        isConnecting: state.connectionStatus === 'connecting',
        hasError: state.connectionStatus === 'error'
    };
}

export default useLiveStats;
