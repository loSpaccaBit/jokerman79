import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
    GET_PROVIDER_BONUSES,
    GET_FEATURED_BONUSES,
    GET_ALL_ACTIVE_BONUSES
} from '@/lib/graphql/queries';
import {
    BonusesQueryResponse,
    strapiProviderBonusToLocal
} from '@/types/strapi';
import { ProviderBonus } from '@/types/bonus';

/**
 * Hook per ottenere i bonus di un provider
 */
export function useProviderBonuses(providerSlug: string) {
    const { data, loading, error } = useQuery<BonusesQueryResponse>(GET_PROVIDER_BONUSES, {
        variables: { providerSlug },
        skip: !providerSlug,
    });

    const bonuses: ProviderBonus[] = useMemo(() => {
        if (!data?.providerBonuses || !Array.isArray(data.providerBonuses)) {
            return [];
        }
        return data.providerBonuses.map(strapiProviderBonusToLocal);
    }, [data]);

    return {
        bonuses,
        loading,
        error,
    };
}

/**
 * Hook per ottenere i bonus featured per la homepage
 */
export function useFeaturedBonuses(limit: number = 6) {
    const { data, loading, error } = useQuery<BonusesQueryResponse>(GET_FEATURED_BONUSES, {
        variables: { limit },
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // Log per debug solo in development
    if (error && process.env.NODE_ENV === 'development') {
        console.error('GraphQL error in useFeaturedBonuses:', {
            message: error.message || 'Unknown error',
            graphQLErrors: error.graphQLErrors?.map(e => e.message) || [],
            networkError: error.networkError?.message || 'No network error',
        });
    }

    const bonuses: ProviderBonus[] = useMemo(() => {
        if (!data?.providerBonuses || !Array.isArray(data.providerBonuses)) {
            return [];
        }

        // Filtra solo i bonus attivi
        return data.providerBonuses
            .filter(bonus => bonus.isActive)
            .map(strapiProviderBonusToLocal);
    }, [data]);

    return {
        bonuses,
        loading,
        error,
        hasData: bonuses.length > 0
    };
}

/**
 * Hook per ottenere un singolo bonus principale per la sezione hero
 */
export function useHeroBonuses() {
    const { data, loading, error } = useQuery<BonusesQueryResponse>(GET_ALL_ACTIVE_BONUSES, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // Log per debug solo in development
    if (error && process.env.NODE_ENV === 'development') {
        console.error('GraphQL error in useHeroBonuses:', {
            message: error.message || 'Unknown error',
            graphQLErrors: error.graphQLErrors?.map(e => e.message) || [],
            networkError: error.networkError?.message || 'No network error',
        });
    }

    const heroBonus: ProviderBonus | null = useMemo(() => {
        if (!data?.providerBonuses || !Array.isArray(data.providerBonuses) || data.providerBonuses.length === 0) {
            return null;
        }

        // Prendi il primo bonus attivo per l'hero
        return strapiProviderBonusToLocal(data.providerBonuses[0]);
    }, [data]);

    return {
        heroBonus,
        loading,
        error
    };
}

/**
 * Hook per ottenere i bonus per la griglia
 */
export function useGridBonuses() {
    const { data, loading, error } = useQuery<BonusesQueryResponse>(GET_ALL_ACTIVE_BONUSES, {
        errorPolicy: 'all',
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first',
    });

    // Log per debug solo in development
    if (error && process.env.NODE_ENV === 'development') {
        console.error('GraphQL error in useGridBonuses:', {
            message: error.message || 'Unknown error',
            graphQLErrors: error.graphQLErrors?.map(e => e.message) || [],
            networkError: error.networkError?.message || 'No network error',
        });
    }

    const bonuses: ProviderBonus[] = useMemo(() => {
        if (!data?.providerBonuses || !Array.isArray(data.providerBonuses)) {
            return [];
        }

        // I bonus sono già filtrati per isActive nella query
        return data.providerBonuses.map(strapiProviderBonusToLocal);
    }, [data]);

    return {
        gridBonuses: bonuses,
        loading,
        error,
        hasData: bonuses.length > 0
    };
}
