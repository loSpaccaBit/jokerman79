import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import { GET_HOMEPAGE_PARTNERS } from '@/lib/graphql/queries';
import {
    HomepagePartnersQueryResponse,
    strapiHomepagePartnerToLocal,
    HomepagePartner
} from '@/types/strapi';

/**
 * Hook per ottenere i partner in evidenza per la homepage
 * Restituisce una struttura semplificata ottimizzata per il componente Partner
 */
export function useHomepagePartners(limit: number = 4) {
    const { data, loading, error } = useQuery<HomepagePartnersQueryResponse>(GET_HOMEPAGE_PARTNERS, {
        variables: { limit },
        errorPolicy: 'all', // Mostra errori ma continua a funzionare con i dati parziali
        notifyOnNetworkStatusChange: true,
        fetchPolicy: 'cache-first', // Usa cache se disponibile
        // Aggiungi un timeout per evitare hang infiniti
        context: {
            timeout: 10000, // 10 secondi timeout
        },
        // Non saltare mai la query, ma gestisci gracefully gli errori
        skip: false,
        // Aggiungi retry automatico
        onError: (apolloError) => {
            console.warn('Partners query failed, will retry:', {
                message: apolloError.message || 'Unknown error',
                networkError: apolloError.networkError?.message || 'No network error',
                graphQLErrors: apolloError.graphQLErrors?.map(e => e.message) || [],
            });
        }
    });

    // Log per debug solo in development
    if (error && process.env.NODE_ENV === 'development') {
        console.error('GraphQL error in useHomepagePartners:', {
            message: error.message || 'Unknown error message',
            graphQLErrors: error.graphQLErrors?.map(e => ({
                message: e.message,
                path: e.path,
                locations: e.locations
            })) || [],
            networkError: error.networkError ? {
                message: error.networkError.message,
                statusCode: (error.networkError as any)?.statusCode,
                result: (error.networkError as any)?.result,
            } : null,
            extraInfo: error.extraInfo || 'No extra info'
        });
    }

    if (loading && process.env.NODE_ENV === 'development') {
        console.log('Loading partners data...');
    }

    const partners: HomepagePartner[] = useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            console.log('Raw partners data from GraphQL:', data?.partners);
        }

        if (!data?.partners) {
            if (process.env.NODE_ENV === 'development') {
                console.log('No partners data received');
            }
            return [];
        }

        if (data.partners.length === 0) {
            if (process.env.NODE_ENV === 'development') {
                console.log('Partners array is empty');
            }
            return [];
        }

        if (process.env.NODE_ENV === 'development') {
            console.log(`Processing ${data.partners.length} partners`);
        }
        return data.partners.map(strapiHomepagePartnerToLocal);
    }, [data]);

    return {
        partners,
        loading,
        error: error || null, // Assicurati che l'errore sia null se undefined
        hasData: partners.length > 0
    };
}
