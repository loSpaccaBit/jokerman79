import { useQuery } from '@apollo/client';
import {
    GET_SLOTS,
    GET_SLOT_BY_SLUG,
    GET_PROVIDERS,
    GET_PROVIDER_BY_SLUG,
    GET_CATEGORIES,
    GET_POPULAR_SLOTS,
    GET_NEW_SLOTS,
    GET_FEATURED_SLOTS,
    SEARCH_SLOTS,
    GET_STATS
} from '@/lib/graphql/queries';
import {
    SlotsQueryResponse,
    SlotsQueryVariables,
    ProvidersQueryResponse,
    ProvidersQueryVariables,
    CategoriesQueryResponse,
    StatsQueryResponse,
    strapiSlotToLocal,
    strapiProviderToLocal
} from '@/types/strapi';
import { SlotDemo, SlotProvider } from '@/types/slots';

// Hook per ottenere tutte le slot
export function useSlots(variables?: SlotsQueryVariables) {
    const { data, loading, error, refetch } = useQuery<SlotsQueryResponse>(GET_SLOTS, {
        variables,
        notifyOnNetworkStatusChange: true,
    });

    const slots: SlotDemo[] = data?.slots?.map(strapiSlotToLocal) || [];

    return {
        slots,
        loading,
        error,
        refetch,
    };
}

// Hook per ottenere una singola slot
export function useSlot(slug: string) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_SLOT_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    const slot = data?.slots?.[0] ? strapiSlotToLocal(data.slots[0]) : null;

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
    };    const { data, loading, error, refetch } = useQuery<ProvidersQueryResponse>(GET_PROVIDERS, {
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

// Hook per ottenere un singolo provider
export function useProvider(slug: string) {
    const { data, loading, error } = useQuery<ProvidersQueryResponse>(GET_PROVIDER_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    const provider = data?.providers?.[0] ? strapiProviderToLocal(data.providers[0]) : null;

    return {
        provider,
        loading,
        error,
    };
}

// Hook per ottenere tutte le categorie
export function useCategories() {
    const { data, loading, error } = useQuery<CategoriesQueryResponse>(GET_CATEGORIES);

    const categories = data?.categories || [];

    return {
        categories,
        loading,
        error,
    };
}

// Hook per ottenere slot popolari
export function usePopularSlots(limit = 10) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_POPULAR_SLOTS, {
        variables: { limit },
    });

    const slots: SlotDemo[] = data?.slots?.map(strapiSlotToLocal) || [];

    return {
        slots,
        loading,
        error,
    };
}

// Hook per ottenere slot nuove
export function useNewSlots(limit = 10) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_NEW_SLOTS, {
        variables: { limit },
    });

    const slots: SlotDemo[] = data?.slots?.map(strapiSlotToLocal) || [];

    return {
        slots,
        loading,
        error,
    };
}

// Hook per ottenere slot in evidenza
export function useFeaturedSlots(limit = 6) {
    const { data, loading, error } = useQuery<SlotsQueryResponse>(GET_FEATURED_SLOTS, {
        variables: { limit },
    });

    const slots: SlotDemo[] = data?.slots?.map(strapiSlotToLocal) || [];

    return {
        slots,
        loading,
        error,
    };
}

// Hook per la ricerca di slot
export function useSearchSlots(searchTerm: string, variables?: { pagination?: { page?: number; pageSize?: number } }) {
    const { data, loading, error, refetch } = useQuery<SlotsQueryResponse>(SEARCH_SLOTS, {
        variables: {
            searchTerm,
            ...variables,
        },
        skip: !searchTerm || searchTerm.length < 2,
    });

    const slots: SlotDemo[] = data?.slots?.map(strapiSlotToLocal) || [];

    return {
        slots,
        loading,
        error,
        refetch,
    };
}

// Hook per ottenere statistiche generali
export function useStats() {
    const { data, loading, error } = useQuery<StatsQueryResponse>(GET_STATS);

    const stats = {
        totalSlots: data?.slots_connection?.pageInfo?.total || 0,
        totalProviders: data?.providers_connection?.pageInfo?.total || 0,
        totalCategories: data?.categories_connection?.pageInfo?.total || 0,
    };

    return {
        stats,
        loading,
        error,
    };
}

// Hook personalizzato per sostituire useSlotFilters con dati reali
export function useStrapiSlotFilters(
    searchQuery?: string,
    providerFilter?: string,
    categoryFilter?: string,
    currentPage = 1,
    pageSize = 12
) {
    // Costruisci i filtri dinamicamente
    const filters: SlotsQueryVariables['filters'] = {};

    if (searchQuery && searchQuery.length >= 2) {
        filters.or = [
            { name: { containsi: searchQuery } },
            { description: { containsi: searchQuery } },
            { provider: { name: { containsi: searchQuery } } },
            { category: { name: { containsi: searchQuery } } },
        ];
    }

    if (providerFilter) {
        filters.provider = { name: { containsi: providerFilter } };
    }

    if (categoryFilter) {
        filters.category = { name: { containsi: categoryFilter } };
    }

    const { slots, loading, error, refetch } = useSlots({
        pagination: { page: currentPage, pageSize },
        filters: Object.keys(filters).length > 0 ? filters : undefined,
        sort: ['rating:desc', 'reviewCount:desc', 'createdAt:desc'],
    });

    // Per ora utilizziamo valori mock per la paginazione
    // In una implementazione completa dovreste utilizzare una query separata per ottenere il totale
    const totalItems = slots.length; // Questo è limitato dalla pageSize, dovrebbe essere il totale reale
    const totalPages = Math.ceil(totalItems / pageSize);

    const paginationState = {
        currentPage,
        totalPages,
        pageSize,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1,
    };

    const stats = {
        total: totalItems,
        filtered: totalItems,
        popular: slots.filter(slot => slot.isPopular).length,
        new: slots.filter(slot => slot.isNew).length,
    };

    return {
        paginatedSlots: slots,
        stats,
        pagination: {
            paginationState,
            paginationActions: {
                goToPage: (page: number) => {
                    // In un'app reale, questo dovrebbe aggiornare l'URL
                    console.log('Go to page:', page);
                },
                setPageSize: (size: number) => {
                    console.log('Set page size:', size);
                },
            },
        },
        loading,
        error,
        refetch,
    };
}
