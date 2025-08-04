import { useState, useEffect } from 'react';

export interface LiveGame {
    id: number;
    gameId: string;
    name: string;
    description?: string;
    gameType: string;
    category: string;
    tableIds: string[];
    icon?: string;
    color?: string;
    isActive: boolean;
    sortOrder: number;
    minBet?: number;
    maxBet?: number;
    features?: string[];
    image?: {
        url: string;
        alternativeText?: string;
    };
}

export interface UseLiveGamesState {
    games: LiveGame[];
    gamesByCategory: Record<string, LiveGame[]>;
    tableMapping: Record<string, { gameId: string; gameType: string; name: string; category: string; }>;
    loading: boolean;
    error: string | null;
}

export interface UseLiveGamesOptions {
    autoFetch?: boolean;
    category?: string;
}

export function useLiveGames(options: UseLiveGamesOptions = {}) {
    const { autoFetch = true, category } = options;

    const [state, setState] = useState<UseLiveGamesState>({
        games: [],
        gamesByCategory: {},
        tableMapping: {},
        loading: false,
        error: null
    });

    // Dati di fallback per quando il backend non è disponibile
    const fallbackGames: LiveGame[] = [
        {
            id: 1,
            gameId: 'mega-wheels',
            name: 'Mega Wheel',
            description: 'Ruota della fortuna con moltiplicatori fino a 500x',
            gameType: 'MEGAWHEEL',
            category: 'Game Shows',
            tableIds: ['801'],
            icon: '🎡',
            color: 'bg-purple-500',
            isActive: true,
            sortOrder: 1,
            minBet: 0.10,
            maxBet: 1000,
            features: ['Moltiplicatori', 'Live Host', 'Statistiche']
        },
        {
            id: 2,
            gameId: 'lightning-roulette',
            name: 'Lightning Roulette',
            description: 'Roulette europea con numeri fortunati e moltiplicatori RNG',
            gameType: 'ROULETTE',
            category: 'Table Games',
            tableIds: ['204', '205'],
            icon: '⚡',
            color: 'bg-yellow-500',
            isActive: true,
            sortOrder: 2,
            minBet: 0.20,
            maxBet: 5000,
            features: ['Lightning Numbers', 'Live Dealer', 'European Rules']
        },
        {
            id: 3,
            gameId: 'dragon-tiger',
            name: 'Dragon Tiger',
            description: 'Gioco di carte semplice e veloce con alta frequenza di gioco',
            gameType: 'DRAGONTIGER',
            category: 'Card Games',
            tableIds: ['301', '302'],
            icon: '🐉',
            color: 'bg-red-500',
            isActive: true,
            sortOrder: 3,
            minBet: 1.00,
            maxBet: 10000,
            features: ['Fast Play', 'Simple Rules', 'Side Bets']
        },
        {
            id: 4,
            gameId: 'sweet-bonanza',
            name: 'Sweet Bonanza Candyland',
            description: 'Ruota colorata a tema dolciumi con round bonus',
            gameType: 'SWEETBONANZA',
            category: 'Game Shows',
            tableIds: ['701'],
            icon: '🍭',
            color: 'bg-pink-500',
            isActive: true,
            sortOrder: 4,
            minBet: 0.10,
            maxBet: 2000,
            features: ['Bonus Rounds', 'Multipliers', 'Interactive']
        },
        {
            id: 5,
            gameId: 'andar-bahar',
            name: 'Andar Bahar',
            description: 'Tradizionale gioco di carte indiano con regole semplici',
            gameType: 'ANDARBAHAR',
            category: 'Card Games',
            tableIds: ['401'],
            icon: '🎴',
            color: 'bg-green-500',
            isActive: true,
            sortOrder: 5,
            minBet: 0.50,
            maxBet: 5000,
            features: ['Traditional Game', 'Live Dealer', 'Side Bets']
        },
        {
            id: 6,
            gameId: 'blackjack',
            name: 'Blackjack',
            description: 'Classico gioco del 21 con dealer dal vivo',
            gameType: 'BLACKJACK',
            category: 'Table Games',
            tableIds: ['501', '502', '503'],
            icon: '🃏',
            color: 'bg-blue-500',
            isActive: true,
            sortOrder: 6,
            minBet: 1.00,
            maxBet: 2500,
            features: ['Classic Rules', '3:2 Blackjack', 'Side Bets']
        }
    ];

    // Fetch tutti i giochi
    const fetchGames = async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const endpoint = category
                ? `/api/live-games/category/${category}`
                : '/api/live-games?populate=image&sort=sortOrder:asc&filters[isActive][$eq]=true';

            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
            const response = await fetch(`${strapiUrl}${endpoint}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const games = result.data || [];

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

        } catch (error) {
            console.error('Errore fetching live games:', error);

            let errorMessage = 'Errore nel caricamento dei giochi';
            let useFallback = false;

            if (error instanceof Error) {
                if (error.message.includes('Failed to fetch')) {
                    console.warn('⚠️ Backend Strapi non disponibile, utilizzo dati di fallback');
                    useFallback = true;
                    errorMessage = 'Utilizzando dati di esempio (backend non disponibile)';
                } else {
                    errorMessage = error.message;
                }
            }

            if (useFallback) {
                // Usa dati di fallback filtrati per categoria se specificata
                const filteredGames = category
                    ? fallbackGames.filter(game => game.category.toLowerCase().includes(category.toLowerCase()))
                    : fallbackGames;

                // Raggruppa per categoria
                const gamesByCategory = filteredGames.reduce((acc: Record<string, LiveGame[]>, game: LiveGame) => {
                    if (!acc[game.category]) {
                        acc[game.category] = [];
                    }
                    acc[game.category].push(game);
                    return acc;
                }, {});

                setState(prev => ({
                    ...prev,
                    games: filteredGames,
                    gamesByCategory,
                    loading: false,
                    error: null // Rimuovi l'errore quando usi i dati di fallback
                }));
            } else {
                setState(prev => ({
                    ...prev,
                    error: errorMessage,
                    loading: false
                }));
            }
        }
    };

    // Fetch mapping tavoli
    const fetchTableMapping = async () => {
        try {
            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
            const response = await fetch(`${strapiUrl}/api/live-games/mapping/table-ids`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            setState(prev => ({
                ...prev,
                tableMapping: result.data || {}
            }));

        } catch (error) {
            console.error('Errore fetching table mapping:', error);

            // Fallback: crea mapping dai dati di esempio
            const fallbackMapping: Record<string, { gameId: string; gameType: string; name: string; category: string; }> = {};

            fallbackGames.forEach(game => {
                game.tableIds.forEach(tableId => {
                    fallbackMapping[tableId] = {
                        gameId: game.gameId,
                        gameType: game.gameType,
                        name: game.name,
                        category: game.category
                    };
                });
            });

            setState(prev => ({
                ...prev,
                tableMapping: fallbackMapping
            }));
        }
    };

    // Fetch gioco specifico
    const fetchGameById = async (gameId: string): Promise<LiveGame | null> => {
        try {
            const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
            const response = await fetch(`${strapiUrl}/api/live-games/game/${gameId}?populate=image`);

            if (!response.ok) {
                if (response.status === 404) {
                    return null;
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result.data;

        } catch (error) {
            console.error(`Errore fetching game ${gameId}:`, error);

            // Fallback: cerca nei dati di esempio
            const fallbackGame = fallbackGames.find(game => game.gameId === gameId);
            if (fallbackGame) {
                console.warn(`⚠️ Usando dati di fallback per gioco: ${gameId}`);
                return fallbackGame;
            }

            return null;
        }
    };

    // Get tableIds per gameId
    const getTableIdsForGame = (gameId: string): string[] => {
        const game = state.games.find(g => g.gameId === gameId);
        return game?.tableIds || [];
    };

    // Get game info by tableId
    const getGameInfoByTableId = (tableId: string) => {
        return state.tableMapping[tableId] || null;
    };

    // Get games by category
    const getGamesByCategory = (categoryName: string) => {
        return state.gamesByCategory[categoryName] || [];
    };

    // Refresh data
    const refresh = async () => {
        await Promise.all([
            fetchGames(),
            fetchTableMapping()
        ]);
    };

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

        // Utilities
        getTableIdsForGame,
        getGameInfoByTableId,
        getGamesByCategory,

        // Status flags
        hasGames: state.games.length > 0,
        isEmpty: state.games.length === 0 && !state.loading
    };
}
