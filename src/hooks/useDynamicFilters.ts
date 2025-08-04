import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
    GET_FILTER_OPTIONS,
    GET_FILTER_COUNTS,
    GET_PROVIDER_SLOT_COUNT,
    GET_CATEGORY_SLOT_COUNT
} from '@/lib/graphql/queries';

// Types per i filtri dinamici
export interface FilterOption {
    documentId: string;
    name: string;
    slug: string;
    isPopular?: boolean;
    color?: string;
    order?: number;
}

export interface FilterCounts {
    totalSlots: number;
    providerSlots: number;
    categorySlots: number;
    popularSlots: number;
    newSlots: number;
    featuredSlots: number;
}

interface FilterOptionsResponse {
    providers: FilterOption[];
    categories: FilterOption[];
}

interface FilterCountsResponse {
    totalSlots: { pageInfo: { total: number } };
    popularSlots: { pageInfo: { total: number } };
    newSlots: { pageInfo: { total: number } };
    featuredSlots: { pageInfo: { total: number } };
}

interface ProviderSlotCountResponse {
    slots_connection: { pageInfo: { total: number } };
}

interface CategorySlotCountResponse {
    slots_connection: { pageInfo: { total: number } };
}

/**
 * Hook per ottenere le opzioni di filtro dinamicamente dal backend
 */
export function useDynamicFilterOptions() {
    const { data, loading, error } = useQuery<FilterOptionsResponse>(GET_FILTER_OPTIONS, {
        // Cache per 5 minuti dato che provider e categorie cambiano raramente
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    });

    const providers = useMemo(() => {
        return data?.providers || [];
    }, [data?.providers]);

    const categories = useMemo(() => {
        return data?.categories || [];
    }, [data?.categories]);

    // Provider formattati per UI (aggiungi "Tutti i Provider")
    const providersForUI = useMemo(() => {
        const allProviders = providers.map(p => p.name);
        return ['Tutti i Provider', ...allProviders];
    }, [providers]);

    // Categorie formattate per UI (aggiungi "Tutte le Categorie")  
    const categoriesForUI = useMemo(() => {
        const allCategories = categories.map(c => c.name);
        return ['Tutte le Categorie', ...allCategories];
    }, [categories]);

    // Provider popolari
    const popularProviders = useMemo(() => {
        return providers.filter(p => p.isPopular);
    }, [providers]);

    // Funzioni di conversione slug/nome
    const getProviderBySlug = (slug: string) => {
        return providers.find(p => p.slug === slug);
    };

    const getCategoryBySlug = (slug: string) => {
        return categories.find(c => c.slug === slug);
    };

    const getProviderSlug = (name: string) => {
        const provider = providers.find(p => p.name.toLowerCase() === name.toLowerCase());
        return provider?.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    };

    const getCategorySlug = (name: string) => {
        const category = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
        return category?.slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    };

    return {
        // Dati raw
        providers,
        categories,
        popularProviders,

        // Dati formattati per UI
        providersForUI,
        categoriesForUI,

        // Utility functions
        getProviderBySlug,
        getCategoryBySlug,
        getProviderSlug,
        getCategorySlug,

        // Stati
        loading,
        error,
    };
}

/**
 * Hook per ottenere i conteggi dei filtri dinamicamente
 */
export function useDynamicFilterCounts(provider?: string, category?: string) {
    // Query base per conteggi generali
    const { data: baseData, loading: baseLoading, error: baseError } = useQuery<FilterCountsResponse>(GET_FILTER_COUNTS, {
        fetchPolicy: 'cache-first',
        notifyOnNetworkStatusChange: true,
    });

    // Query per conteggio provider specifico
    const { data: providerData, loading: providerLoading, error: providerError } = useQuery<ProviderSlotCountResponse>(
        GET_PROVIDER_SLOT_COUNT,
        {
            variables: { providerSlug: provider },
            skip: !provider || provider === 'all',
            fetchPolicy: 'cache-first',
        }
    );

    // Query per conteggio categoria specifica
    const { data: categoryData, loading: categoryLoading, error: categoryError } = useQuery<CategorySlotCountResponse>(
        GET_CATEGORY_SLOT_COUNT,
        {
            variables: { categorySlug: category },
            skip: !category || category === 'all',
            fetchPolicy: 'cache-first',
        }
    );

    const counts: FilterCounts = useMemo(() => {
        return {
            totalSlots: baseData?.totalSlots?.pageInfo?.total || 0,
            providerSlots: providerData?.slots_connection?.pageInfo?.total || 0,
            categorySlots: categoryData?.slots_connection?.pageInfo?.total || 0,
            popularSlots: baseData?.popularSlots?.pageInfo?.total || 0,
            newSlots: baseData?.newSlots?.pageInfo?.total || 0,
            featuredSlots: baseData?.featuredSlots?.pageInfo?.total || 0,
        };
    }, [baseData, providerData, categoryData]);

    return {
        counts,
        loading: baseLoading || providerLoading || categoryLoading,
        error: baseError || providerError || categoryError,
    };
}

/**
 * Hook combinato per gestire tutti i filtri dinamici
 */
export function useDynamicFilters(currentProvider?: string, currentCategory?: string) {
    const filterOptions = useDynamicFilterOptions();
    const filterCounts = useDynamicFilterCounts(currentProvider, currentCategory);

    return {
        ...filterOptions,
        ...filterCounts,

        // Stato generale
        isLoading: filterOptions.loading || filterCounts.loading,
        hasError: filterOptions.error || filterCounts.error,
    };
}
