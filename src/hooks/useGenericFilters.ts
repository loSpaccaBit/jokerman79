import { useState, useMemo, useCallback } from 'react';
import {
    FilterableItem,
    UseGenericFiltersReturn,
    SORT_OPTIONS,
    FILTER_ALL_VALUE
} from '@/types/filters';

export function useGenericFilters<T extends FilterableItem>(
    items: T[],
    searchQuery: string
): UseGenericFiltersReturn<T> {
    const [selectedProvider, setSelectedProvider] = useState<string>(FILTER_ALL_VALUE);
    const [selectedCategory, setSelectedCategory] = useState<string>(FILTER_ALL_VALUE);
    const [sortBy, setSortBy] = useState<string>(SORT_OPTIONS.POPULARITY);

    // Memoized computed values
    const providers = useMemo(() => {
        const uniqueProviders = [...new Set(items.map(item => item.provider))];
        return uniqueProviders.sort();
    }, [items]);

    const categories = useMemo(() => {
        const uniqueCategories = [...new Set(items.map(item => item.category))];
        return uniqueCategories.sort();
    }, [items]);

    const filteredAndSortedItems = useMemo(() => {
        const filtered = items.filter(item => {
            const matchesSearch = searchQuery === '' ||
                item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.provider.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesProvider = selectedProvider === FILTER_ALL_VALUE || item.provider === selectedProvider;
            const matchesCategory = selectedCategory === FILTER_ALL_VALUE || item.category === selectedCategory;

            return matchesSearch && matchesProvider && matchesCategory;
        });

        // Sort filtered results
        filtered.sort((a, b) => {
            switch (sortBy) {
                case SORT_OPTIONS.NAME:
                    return a.name.localeCompare(b.name);
                case SORT_OPTIONS.RTP:
                    // Safe fallback for items without RTP
                    const aRtp = 'rtp' in a ? (a.rtp as number) : 0;
                    const bRtp = 'rtp' in b ? (b.rtp as number) : 0;
                    return bRtp - aRtp;
                case SORT_OPTIONS.NEWEST:
                    return Number(b.isNew) - Number(a.isNew);
                case SORT_OPTIONS.POPULARITY:
                default:
                    return Number(b.isPopular) - Number(a.isPopular);
            }
        });

        return filtered;
    }, [items, searchQuery, selectedProvider, selectedCategory, sortBy]);

    const hasActiveFilters = useMemo(() => {
        return searchQuery !== '' ||
            selectedProvider !== FILTER_ALL_VALUE ||
            selectedCategory !== FILTER_ALL_VALUE ||
            sortBy !== SORT_OPTIONS.POPULARITY;
    }, [searchQuery, selectedProvider, selectedCategory, sortBy]);

    const clearFilters = useCallback(() => {
        setSelectedProvider(FILTER_ALL_VALUE);
        setSelectedCategory(FILTER_ALL_VALUE);
        setSortBy(SORT_OPTIONS.POPULARITY);
    }, []);

    return {
        // State
        selectedProvider,
        selectedCategory,
        sortBy,

        // Actions
        setSelectedProvider,
        setSelectedCategory,
        setSortBy,
        clearFilters,

        // Computed
        filteredAndSortedItems,
        hasActiveFilters,
        providers,
        categories,
    };
}
