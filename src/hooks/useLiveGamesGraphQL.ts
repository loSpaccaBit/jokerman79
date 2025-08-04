import { useState, useEffect, useCallback } from 'react';

// Query GraphQL per i giochi live - Struttura corretta Strapi v5
const LIVE_GAMES_QUERY = `
  query getLiveGames {
    liveGames {
      gameId
      name
      gameType
      category
      provider
      streamingUrl
      tableIds
      description
      isActive
      sortOrder
      features
      image {
        url
        alternativeText
      }
      resultAssets {
        url
        name
        alternativeText
      }
      assetMapping
    }
  }
`;

const LIVE_GAME_BY_ID_QUERY = `
  query getLiveGameById($gameId: String!) {
    liveGames(filters: { gameId: { eq: $gameId } }) {
      gameId
      name
      gameType
      category
      provider
      streamingUrl
      tableIds
      description
      isActive
      sortOrder
      features
      image {
        url
        alternativeText
      }
      resultAssets {
        url
        name
        alternativeText
      }
      assetMapping
    }
  }
`;

const TABLE_MAPPING_QUERY = `
  query getTableMapping {
    liveGames {
      gameId
      tableIds
      gameType
      name
      category
      provider
    }
  }
`;

export interface LiveGame {
    id: number;
    gameId: string;
    name: string;
    description?: string;
    gameType: string;
    category: string;
    provider: 'pragmatic' | 'evolution'; // Nuovo campo per determinare il provider
    tableIds: string[];
    isActive: boolean;
    sortOrder: number;
    features?: string[];
    streamingUrl?: string;
    image?: {
        url: string;
        alternativeText?: string;
    };
    resultAssets?: {
        url: string;
        name: string;
        alternativeText?: string;
    }[];
    assetMapping?: Record<string, string>; // Mappatura risultato -> nome asset
}

export interface UseLiveGamesGraphQLState {
    games: LiveGame[];
    gamesByCategory: Record<string, LiveGame[]>;
    tableMapping: Record<string, { gameId: string; gameType: string; name: string; category: string; }>;
    subscriptions: Set<string>; // Tableids sottoscritti
    loading: boolean;
    error: string | null;
}

export interface UseLiveGamesGraphQLOptions {
    autoFetch?: boolean;
    category?: string;
    autoSubscribe?: boolean; // Se sottoscrivere automaticamente ai tavoli
}

export function useLiveGamesGraphQL(options: UseLiveGamesGraphQLOptions = {}) {
    const { autoFetch = true, category, autoSubscribe = false } = options;

    const [state, setState] = useState<UseLiveGamesGraphQLState>({
        games: [],
        gamesByCategory: {},
        tableMapping: {},
        subscriptions: new Set(),
        loading: false,
        error: null
    });

    // REST API fetch utility (sostituisce GraphQL)
    const restFetch = useCallback(async (endpoint: string, params?: URLSearchParams) => {
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337/api';
        const url = params ? `${strapiUrl}${endpoint}?${params.toString()}` : `${strapiUrl}${endpoint}`;

        console.log('🔍 REST API Request:', { url });

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ REST API Error Response:', errorText);
                throw new Error(`REST API request failed: ${response.status}`);
            }

            const result = await response.json();
            console.log('✅ REST API Success:', {
                hasData: !!result.data,
                dataCount: result.data?.length || 0
            });

            return result;
        } catch (error) {
            console.error('❌ REST API Request failed:', error);
            throw error;
        }
    }, []);

    // GraphQL fetch utility (deprecated, mantenuto per compatibilità)
    const graphqlFetch = useCallback(async (query: string, variables?: any) => {
        console.warn('⚠️ GraphQL deprecato, usando REST API');
        // Fallback to REST for basic queries
        return restFetch('/live-games', new URLSearchParams({ populate: '*' }));
    }, [restFetch]);    // Transform Strapi response to our interface
    const transformStrapiGame = useCallback((strapiGame: any): LiveGame => {
        // Debug log per vedere cosa arriva da Strapi
        console.log('🔄 Transforming game:', strapiGame.gameId, {
            hasImage: !!strapiGame.image,
            imageData: strapiGame.image,
            hasResultAssets: !!strapiGame.resultAssets,
            resultAssetsCount: strapiGame.resultAssets?.length || 0,
            hasAssetMapping: !!strapiGame.assetMapping,
            assetMapping: strapiGame.assetMapping,
            rawGame: JSON.stringify(strapiGame, null, 2)
        });

        // Strapi v5 con GraphQL restituisce direttamente i campi
        return {
            id: parseInt(strapiGame.id || Math.random() * 1000),
            gameId: strapiGame.gameId || '',
            name: strapiGame.name || 'Unnamed Game',
            description: strapiGame.description || '',
            gameType: strapiGame.gameType || 'UNKNOWN',
            category: strapiGame.category || 'Other',
            provider: strapiGame.provider || 'pragmatic', // Default a pragmatic se non specificato
            tableIds: strapiGame.tableIds || [],
            isActive: strapiGame.isActive !== false,
            sortOrder: strapiGame.sortOrder || 0,
            features: strapiGame.features || [],
            streamingUrl: strapiGame.streamingUrl || undefined,
            image: strapiGame.image ? {
                url: strapiGame.image.url,
                alternativeText: strapiGame.image.alternativeText
            } : undefined,
            resultAssets: strapiGame.resultAssets || [],
            assetMapping: strapiGame.assetMapping || {}
        };
    }, []);

    // Fetch tutti i giochi con REST API
    const fetchGames = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            // Usa REST API invece di GraphQL
            const params = new URLSearchParams({
                'populate': '*',
                'sort': 'sortOrder:asc',
                'filters[isActive][$eq]': 'true'
            });

            if (category) {
                params.set('filters[category][$eq]', category);
            }

            const result = await restFetch('/live-games', params);
            
            // Trasforma i dati Strapi REST in formato LiveGame
            const games = result.data.map((strapiGame: any) => transformStrapiGame(strapiGame));

            // Raggruppa per categoria
            const gamesByCategory = games.reduce((acc: Record<string, LiveGame[]>, game: LiveGame) => {
                if (!acc[game.category]) {
                    acc[game.category] = [];
                }
                acc[game.category].push(game);
                return acc;
            }, {});

            setState(prev => ({
                ...prev,
                games,
                gamesByCategory,
                loading: false
            }));

            return games;

        } catch (error) {
            console.error('Errore fetching live games con REST API:', error);

            setState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Errore REST API sconosciuto',
                loading: false
            }));

            return [];
        }
    }, [restFetch, transformStrapiGame, category]);

    // Fetch mapping tavoli con REST API
    const fetchTableMapping = useCallback(async () => {
        try {
            const params = new URLSearchParams({
                'populate': '*'
            });

            const result = await restFetch('/live-games', params);

            const mapping = result.data.reduce((acc: any, game: any) => {
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

            setState(prev => ({
                ...prev,
                tableMapping: mapping
            }));

            return mapping;

        } catch (error) {
            console.error('Errore fetching table mapping con REST API:', error);
            return {};
        }
    }, [graphqlFetch]);

    // Fetch gioco specifico con GraphQL
    const fetchGameById = useCallback(async (gameId: string): Promise<LiveGame | null> => {
        try {
            console.log(`🔍 Ricerca nel database REST: ${gameId}`);
            
            const params = new URLSearchParams({
                'populate': '*',
                'filters[gameId][$eq]': gameId
            });

            const result = await restFetch('/live-games', params);

            console.log(`📋 Risultati REST per ${gameId}:`, result);

            if (!result.data || result.data.length === 0) {
                console.log(`❌ Nessun gioco trovato con gameId: ${gameId}`);
                return null;
            }

            const transformedGame = transformStrapiGame(result.data[0]);
            console.log(`✅ Gioco trasformato:`, transformedGame);
            return transformedGame;

        } catch (error) {
            console.error(`Errore fetching game ${gameId} con REST API:`, error);
            return null;
        }
    }, [restFetch, transformStrapiGame]);

    // Ottieni tableIds per un gameId
    const getTableIdsForGame = useCallback((gameId: string): string[] => {
        const game = state.games.find(g => g.gameId === gameId);
        return game?.tableIds || [];
    }, [state.games]);

    // Ottieni info gioco da tableId
    const getGameInfoByTableId = useCallback((tableId: string) => {
        return state.tableMapping[tableId] || null;
    }, [state.tableMapping]);

    // Ottieni giochi per categoria
    const getGamesByCategory = useCallback((category: string) => {
        return state.gamesByCategory[category] || [];
    }, [state.gamesByCategory]);

    // Gestione sottoscrizioni tavoli
    const subscribeToGame = useCallback((gameId: string) => {
        const tableIds = getTableIdsForGame(gameId);
        setState(prev => {
            const newSubscriptions = new Set(prev.subscriptions);
            tableIds.forEach(tableId => newSubscriptions.add(tableId));
            return { ...prev, subscriptions: newSubscriptions };
        });
        return tableIds;
    }, [getTableIdsForGame]);

    const unsubscribeFromGame = useCallback((gameId: string) => {
        const tableIds = getTableIdsForGame(gameId);
        setState(prev => {
            const newSubscriptions = new Set(prev.subscriptions);
            tableIds.forEach(tableId => newSubscriptions.delete(tableId));
            return { ...prev, subscriptions: newSubscriptions };
        });
        return tableIds;
    }, [getTableIdsForGame]);

    const subscribeToTable = useCallback((tableId: string) => {
        setState(prev => {
            const newSubscriptions = new Set(prev.subscriptions);
            newSubscriptions.add(tableId);
            return { ...prev, subscriptions: newSubscriptions };
        });
    }, []);

    const unsubscribeFromTable = useCallback((tableId: string) => {
        setState(prev => {
            const newSubscriptions = new Set(prev.subscriptions);
            newSubscriptions.delete(tableId);
            return { ...prev, subscriptions: newSubscriptions };
        });
    }, []);

    // Refresh completo
    const refresh = useCallback(async () => {
        const games = await fetchGames();
        await fetchTableMapping();

        // Auto-sottoscrizione se abilitata
        if (autoSubscribe && games.length > 0) {
            const allTableIds = games.flatMap((game: LiveGame) => game.tableIds);
            setState(prev => ({
                ...prev,
                subscriptions: new Set(allTableIds)
            }));
        }
    }, [fetchGames, fetchTableMapping, autoSubscribe]);

    // Auto-fetch on mount
    useEffect(() => {
        if (autoFetch) {
            refresh();
        }
    }, [autoFetch, category]);

    return {
        // State
        ...state,

        // Actions
        fetchGames,
        fetchTableMapping,
        fetchGameById,
        refresh,

        // Subscription management
        subscribeToGame,
        unsubscribeFromGame,
        subscribeToTable,
        unsubscribeFromTable,

        // Utilities
        getTableIdsForGame,
        getGameInfoByTableId,
        getGamesByCategory,

        // Status flags
        hasGames: state.games.length > 0,
        isEmpty: state.games.length === 0 && !state.loading,
        isSubscribed: (tableId: string) => state.subscriptions.has(tableId),
        subscribedTables: Array.from(state.subscriptions)
    };
}
