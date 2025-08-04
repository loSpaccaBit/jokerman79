import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
    GET_PARTNERS,
    GET_FEATURED_PARTNERS,
    GET_PARTNER_BY_SLUG
} from '@/lib/graphql/queries';
import {
    PartnersQueryResponse,
    PartnersQueryVariables,
    strapiPartnerToLocal
} from '@/types/strapi';
import { Partner } from '@/types/partner';

/**
 * Hook per ottenere tutti i partner
 */
export function usePartners(variables?: PartnersQueryVariables) {
    const { data, loading, error, refetch } = useQuery<PartnersQueryResponse, PartnersQueryVariables>(GET_PARTNERS, {
        variables,
    });

    const partners: Partner[] = useMemo(() => {
        return data?.partners?.map(strapiPartnerToLocal) || [];
    }, [data]);

    return {
        partners,
        loading,
        error,
        refetch,
    };
}

/**
 * Hook per ottenere i partner in evidenza per la homepage
 */
export function useFeaturedPartners(limit: number = 4) {
    const { data, loading, error } = useQuery<PartnersQueryResponse, PartnersQueryVariables>(GET_FEATURED_PARTNERS, {
        variables: { limit },
    });

    const featuredPartners: Partner[] = useMemo(() => {
        return data?.partners?.map(strapiPartnerToLocal) || [];
    }, [data]);

    return {
        featuredPartners,
        loading,
        error,
    };
}

/**
 * Hook per ottenere un singolo partner per slug
 */
export function usePartner(slug: string) {
    const { data, loading, error } = useQuery<PartnersQueryResponse, PartnersQueryVariables>(GET_PARTNER_BY_SLUG, {
        variables: { filters: { slug: { eq: slug } } },
        skip: !slug,
    });

    const partner = useMemo(() => {
        return data?.partners?.[0] ? strapiPartnerToLocal(data.partners[0]) : null;
    }, [data]);

    return {
        partner,
        loading,
        error,
    };
}
