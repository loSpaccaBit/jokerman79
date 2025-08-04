import { useState, useEffect, useCallback } from 'react';
import { useUrlFilters } from './useUrlFilters';

/**
 * Hook per gestire la ricerca con debouncing e ottimizzazioni
 */
export function useOptimizedSearch(initialDelay: number = 300) {
    const filters = useUrlFilters();
    const [inputValue, setInputValue] = useState(filters.searchQuery);
    const [isSearching, setIsSearching] = useState(false);

    // Sincronizza input con URL quando cambia da esterno
    useEffect(() => {
        setInputValue(filters.searchQuery);
    }, [filters.searchQuery]);

    // Debouncing della ricerca
    useEffect(() => {
        if (inputValue === filters.searchQuery) return;

        setIsSearching(true);
        const timeoutId = setTimeout(() => {
            filters.setSearchQuery(inputValue);
            setIsSearching(false);
        }, initialDelay);

        return () => {
            clearTimeout(timeoutId);
            setIsSearching(false);
        };
    }, [inputValue, filters.searchQuery, filters.setSearchQuery, initialDelay]);

    // Funzione per aggiornare l'input (non l'URL immediatamente)
    const updateInput = useCallback((value: string) => {
        setInputValue(value);
    }, []);

    // Funzione per ricerca immediata (senza debouncing)
    const searchImmediate = useCallback((value: string) => {
        setInputValue(value);
        setIsSearching(true);
        filters.setSearchQuery(value);
        setIsSearching(false);
    }, [filters.setSearchQuery]);

    // Funzione per pulire la ricerca
    const clearSearch = useCallback(() => {
        setInputValue('');
        filters.setSearchQuery('');
    }, [filters.setSearchQuery]);

    return {
        // Valore corrente dell'input
        inputValue,

        // Stato del debouncing
        isSearching,

        // Funzioni
        updateInput,
        searchImmediate,
        clearSearch,

        // Passa attraverso tutte le altre funzioni dei filtri
        ...filters
    };
}

/**
 * Hook per gestire filtri rapidi (preset comuni)
 */
export function useQuickFilters() {
    const filters = useUrlFilters();

    const quickFilters = [
        {
            id: 'popular',
            label: 'Popolari',
            icon: '⭐',
            action: () => filters.setMultipleFilters({ sort: 'rating', resetPage: true })
        },
        {
            id: 'new',
            label: 'Nuove',
            icon: '🆕',
            action: () => filters.setMultipleFilters({ sort: 'releaseDate', resetPage: true })
        },
        {
            id: 'high-rtp',
            label: 'Alto RTP',
            icon: '💰',
            action: () => filters.setMultipleFilters({ sort: 'rtp', resetPage: true })
        },
        {
            id: 'megaways',
            label: 'Megaways',
            icon: '🎰',
            action: () => filters.setMultipleFilters({ category: 'megaways', resetPage: true })
        }
    ];

    return {
        quickFilters,
        ...filters
    };
}

/**
 * Hook per gestire la cronologia dei filtri (per navigazione avanti/indietro)
 */
export function useFilterHistory() {
    const filters = useUrlFilters();
    const [history, setHistory] = useState<Array<{
        timestamp: number;
        filters: {
            searchQuery: string;
            providerFilter: string;
            categoryFilter: string;
            sortBy: string;
        };
        url: string;
    }>>([]);

    // Salva stato attuale nella cronologia
    useEffect(() => {
        const currentState = {
            timestamp: Date.now(),
            filters: {
                searchQuery: filters.searchQuery,
                providerFilter: filters.providerFilter,
                categoryFilter: filters.categoryFilter,
                sortBy: filters.sortBy
            },
            url: window.location.href
        };

        setHistory(prev => {
            // Evita duplicati consecutivi
            if (prev.length > 0) {
                const last = prev[prev.length - 1];
                const isSame = Object.keys(currentState.filters).every(
                    key => last.filters[key as keyof typeof last.filters] ===
                        currentState.filters[key as keyof typeof currentState.filters]
                );
                if (isSame) return prev;
            }

            // Mantieni solo gli ultimi 10 stati
            return [...prev.slice(-9), currentState];
        });
    }, [filters.searchQuery, filters.providerFilter, filters.categoryFilter, filters.sortBy]);

    // Funzione per andare a uno stato precedente
    const goToHistoryState = useCallback((index: number) => {
        const state = history[index];
        if (!state) return;

        filters.setMultipleFilters({
            provider: state.filters.providerFilter || undefined,
            category: state.filters.categoryFilter || undefined,
            sort: state.filters.sortBy || undefined,
            resetPage: true
        });

        if (state.filters.searchQuery) {
            filters.setSearchQuery(state.filters.searchQuery);
        }
    }, [history, filters]);

    return {
        history,
        goToHistoryState,
        canGoBack: history.length > 1,
        ...filters
    };
}
