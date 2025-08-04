import { useQuery } from '@apollo/client';
import { useState, useEffect, useMemo } from 'react';
import {
    GET_SLOTS,
    GET_FEATURED_SLOTS,
    GET_POPULAR_SLOTS,
    GET_NEW_SLOTS,
    GET_SLOT_BY_SLUG,
    GET_PROVIDERS,
    SEARCH_SLOTS
} from '@/lib/graphql/queries';
import {
    SlotsQueryResponse,
    SlotGamesQueryVariables,
    ProvidersQueryResponse,
    ProvidersQueryVariables,
    strapiSlotToLocal,
    strapiProviderToLocal
} from '@/types/strapi';
import { SlotDemo, SlotProvider } from '@/types/slots';

// Hook per gestire i filtri delle slot con dati da Strapi
export function useStrapiSlotFilters(
    searchQuery?: string,
    providerFilter?: string,
    categoryFilter?: string,
    currentPage = 1,
    pageSize = 12
) {
    const [selectedProvider, setSelectedProvider] = useState(providerFilter || 'all');
    const [selectedCategory, setSelectedCategory] = useState(categoryFilter || 'all');
    const [sortBy, setSortBy] = useState('rating');

    // Costruisci i filtri dinamicamente
    const filters: SlotGamesQueryVariables['filters'] = {};

    if (searchQuery && searchQuery.length >= 2) {
        filters.or = [
            { name: { containsi: searchQuery } },
            { description: { containsi: searchQuery } },
            { provider: { name: { containsi: searchQuery } } },
            { category: { name: { containsi: searchQuery } } },
        ];
    }

    if (selectedProvider && selectedProvider !== 'all') {
        filters.provider = { name: { containsi: selectedProvider } };
    }

    if (selectedCategory && selectedCategory !== 'all') {
        filters.category = { name: { containsi: selectedCategory } };
    }

    // Query principale per le slot
    const { data: slotsData, loading: slotsLoading, error: slotsError, refetch } = useQuery<SlotsQueryResponse>(
        searchQuery && searchQuery.length >= 2 ? SEARCH_SLOTS : GET_SLOTS,
        {
            variables: searchQuery && searchQuery.length >= 2 ? {
                searchTerm: searchQuery,
                pagination: { page: currentPage, pageSize }
            } : {
                pagination: { page: currentPage, pageSize },
                filters: Object.keys(filters).length > 0 ? filters : undefined,
                sort: [`${sortBy}:desc`, 'createdAt:desc'],
            },
            notifyOnNetworkStatusChange: true,
        }
    );

    // Query per slot in evidenza
    const { data: featuredData } = useQuery<SlotsQueryResponse>(GET_FEATURED_SLOTS, {
        variables: { limit: 6 }
    });

    // Query per slot popolari
    const { data: popularData } = useQuery<SlotsQueryResponse>(GET_POPULAR_SLOTS, {
        variables: { limit: 10 }
    });

    // Query per slot nuove
    const { data: newData } = useQuery<SlotsQueryResponse>(GET_NEW_SLOTS, {
        variables: { limit: 10 }
    });

    // Converti i dati Strapi in formato locale
    const slots: SlotDemo[] = useMemo(() => {
        if (!slotsData?.slots || !Array.isArray(slotsData.slots)) {
            return [];
        }
        return slotsData.slots.map(strapiSlotToLocal);
    }, [slotsData]);

    const featuredSlots: SlotDemo[] = useMemo(() => {
        if (!featuredData?.slots || !Array.isArray(featuredData.slots)) {
            return [];
        }
        return featuredData.slots.map(strapiSlotToLocal);
    }, [featuredData]);

    const popularSlots: SlotDemo[] = useMemo(() => {
        if (!popularData?.slots || !Array.isArray(popularData.slots)) {
            return [];
        }
        return popularData.slots.map(strapiSlotToLocal);
    }, [popularData]);

    const newSlots: SlotDemo[] = useMemo(() => {
        if (!newData?.slots || !Array.isArray(newData.slots)) {
            return [];
        }
        return newData.slots.map(strapiSlotToLocal);
    }, [newData]);

    // Calcola le statistiche
    const stats = useMemo(() => {
        const total = slots.length;
        const filtered = slots.length; // Già filtrato dalla query GraphQL
        const popular = slots.filter(slot => slot.isPopular).length;
        const newCount = slots.filter(slot => slot.isNew).length;

        return {
            total,
            filtered,
            popular,
            new: newCount,
        };
    }, [slots]);

    // Stato della paginazione (simulato, in realtà dovrebbe venire da GraphQL)
    const pagination = {
        paginationState: {
            currentPage,
            totalPages: Math.ceil(stats.total / pageSize),
            pageSize,
            totalItems: stats.total,
            hasNextPage: currentPage < Math.ceil(stats.total / pageSize),
            hasPreviousPage: currentPage > 1,
        },
        paginationActions: {
            goToPage: (page: number) => {
                // In un'app reale, questo dovrebbe aggiornare l'URL
                console.log('Go to page:', page);
            },
            setPageSize: (size: number) => {
                console.log('Set page size:', size);
            },
        },
    };

    // Controlla se ci sono filtri attivi
    const hasActiveFilters = useMemo(() => {
        return selectedProvider !== 'all' ||
            selectedCategory !== 'all' ||
            (searchQuery && searchQuery.length > 0);
    }, [selectedProvider, selectedCategory, searchQuery]) as boolean;

    // Funzione per pulire i filtri
    const clearFilters = () => {
        setSelectedProvider('all');
        setSelectedCategory('all');
        setSortBy('rating');
    };

    return {
        // Slot filtrate e paginate
        paginatedSlots: slots,

        // Slot speciali
        featuredSlots,
        popularSlots,
        newSlots,

        // Statistiche
        stats,

        // Filtri attuali
        selectedProvider,
        selectedCategory,
        sortBy,
        searchQuery,
        hasActiveFilters,

        // Azioni sui filtri
        setSelectedProvider,
        setSelectedCategory,
        setSortBy,
        setSearchQuery: () => { }, // Gestito dal componente parent
        clearFilters,

        // Paginazione
        pagination,

        // Stati di loading/errore
        loading: slotsLoading,
        error: slotsError,
        refetch,
    };
}

// Hook semplificato per ottenere una singola slot
export function useStrapiSlot(slug: string) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_SLOT_BY_SLUG, {
        variables: {
            slug: slug
        },
        skip: !slug,
    });

    const slot = useMemo(() => {
        if (data?.slots && data.slots.length > 0) {
            return data.slots[0]; // Restituisce i dati raw di Strapi, non convertiti
        }
        return null;
    }, [data]);

    return {
        slot,
        loading,
        error,
    };
}

// Hook per ottenere tutti i provider
export function useProviders(variables?: ProvidersQueryVariables) {
    // Aggiungi filtro per provider visibili se non già specificato
    const defaultVariables: ProvidersQueryVariables = {
        pagination: {
            limit: 100 // Aumentiamo il limite per ottenere tutti i provider
        },
        filters: {
            isVisible: { eq: true },
            ...variables?.filters
        }
    };
    
    const { data, loading, error, refetch } = useQuery<ProvidersQueryResponse>(GET_PROVIDERS, {
        variables: defaultVariables,
    });

    const providers: SlotProvider[] = data?.providers?.map(strapiProviderToLocal) || [];

    return {
        providers,
        loading,
        error,
        refetch,
    };
}

// Hook per ottenere solo i provider che hanno slot demo disponibili
export function useProvidersWithSlots() {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_SLOTS, {
        variables: {
            filters: {
                publishedAt: { notNull: true },
                provider: { isVisible: { eq: true } }
            },
            pagination: {
                limit: 1000 // Limite alto per ottenere tutte le slot
            }
        }
    });

    const providersWithSlots = useMemo(() => {
        if (!data?.slots) return [];
        
        // Raggruppa le slot per provider e conta quante slot ha ogni provider
        const providerMap = new Map<string, { provider: SlotProvider; slotCount: number }>();
        
        data.slots.forEach(slot => {
            if (slot.provider) {
                const provider = strapiProviderToLocal(slot.provider);
                const existing = providerMap.get(provider.id);
                
                if (existing) {
                    existing.slotCount += 1;
                } else {
                    providerMap.set(provider.id, {
                        provider,
                        slotCount: 1
                    });
                }
            }
        });
        
        // Converte la mappa in array e ordina per numero di slot (decrescente)
        return Array.from(providerMap.values())
            .sort((a, b) => b.slotCount - a.slotCount)
            .map(item => ({
                ...item.provider,
                slotsCount: item.slotCount
            }));
    }, [data]);

    return {
        providers: providersWithSlots,
        loading,
        error,
    };
}

// Hook per ottenere le slot di un provider specifico
export function useSlotsByProvider(providerSlug: string) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_SLOTS, {
        variables: {
            filters: {
                provider: { slug: { eq: providerSlug } },
                publishedAt: { notNull: true }
            },
            pagination: {
                limit: 100
            }
        },
        skip: !providerSlug,
    });

    const slots: SlotDemo[] = useMemo(() => {
        return data?.slots?.map(strapiSlotToLocal) || [];
    }, [data]);

    const provider: SlotProvider | null = useMemo(() => {
        if (data?.slots && data.slots.length > 0 && data.slots[0].provider) {
            return strapiProviderToLocal(data.slots[0].provider);
        }
        return null;
    }, [data]);

    return {
        slots,
        provider,
        loading,
        error,
    };
}
