import { useQuery } from '@apollo/client';
import { useMemo } from 'react';
import {
    GET_PROVIDER_BY_SLUG,
    GET_PROVIDER_BONUSES,
    GET_PROVIDER_SLOTS,
    GET_PROVIDERS
} from '@/lib/graphql/queries';
import {
    ProvidersQueryResponse,
    ProviderBonusesQueryResponse,
    SlotsQueryResponse,
    StrapiProvider,
    StrapiProviderBonus,
    strapiSlotToLocal
} from '@/types/strapi';
import { SlotDemo } from '@/types/slots';

interface UseProviderOptions {
    includeBonuses?: boolean;
    includeSlots?: boolean;
    slotsLimit?: number;
}

/**
 * Hook per ottenere i dati completi di un provider
 */
export function useProvider(
    slug: string,
    options: UseProviderOptions = {}
) {
    const {
        includeBonuses = true,
        includeSlots = true,
        slotsLimit = 12
    } = options;

    // Query per i dati base del provider
    const {
        data: providerData,
        loading: providerLoading,
        error: providerError
    } = useQuery<ProvidersQueryResponse>(GET_PROVIDER_BY_SLUG, {
        variables: { slug },
        skip: !slug,
    });

    // Query per i bonus del provider
    const {
        data: bonusesData,
        loading: bonusesLoading,
        error: bonusesError
    } = useQuery<ProviderBonusesQueryResponse>(GET_PROVIDER_BONUSES, {
        variables: { providerSlug: slug },
        skip: !slug || !includeBonuses,
    });

    // Query per le slot del provider
    const {
        data: slotsData,
        loading: slotsLoading,
        error: slotsError
    } = useQuery<SlotsQueryResponse>(GET_PROVIDER_SLOTS, {
        variables: {
            providerSlug: slug,
            pagination: { pageSize: slotsLimit }
        },
        skip: !slug || !includeSlots,
    });

    // Elabora i dati del provider
    const provider: StrapiProvider | null = useMemo(() => {
        return providerData?.providers?.[0] || null;
    }, [providerData]);

    // Elabora i bonus
    const bonuses: StrapiProviderBonus[] = useMemo(() => {
        return bonusesData?.providerBonuses || [];
    }, [bonusesData]);

    // Elabora le slot (converti in formato locale)
    const slots: SlotDemo[] = useMemo(() => {
        return slotsData?.slots?.map(strapiSlotToLocal) || [];
    }, [slotsData]);

    // Calcola statistiche
    const stats = useMemo(() => {
        if (!slots.length) return null;

        return {
            totalSlots: slots.length,
            averageRating: 0, // Il campo rating non esiste in SlotDemo
            popularSlots: slots.filter(slot => slot.isPopular).length,
            newSlots: slots.filter(slot => slot.isNew).length,
            featuredSlots: 0, // Il campo isFeatured non esiste in SlotDemo
            averageRTP: slots.reduce((acc, slot) => acc + (slot.rtp || 0), 0) / slots.length,
        };
    }, [slots]);

    // Stati di loading e errore combinati
    const loading = providerLoading ||
        (includeBonuses && bonusesLoading) ||
        (includeSlots && slotsLoading);

    const error = providerError || bonusesError || slotsError;

    // Funzione per ottenere bonus per tipo
    const getBonusesByType = (type: StrapiProviderBonus['type']) => {
        return bonuses.filter(bonus => bonus.type === type);
    };

    // Funzione per ottenere slot per categoria
    const getSlotsByCategory = (categorySlug: string) => {
        return slots.filter(slot => slot.category === categorySlug);
    };

    return {
        // Dati principali
        provider,
        bonuses,
        slots,
        stats,

        // Stati
        loading,
        error,

        // Funzioni helper
        getBonusesByType,
        getSlotsByCategory,

        // Dati specifici per facilità d'uso
        welcomeBonuses: getBonusesByType('welcome'),
        freeSpinsBonuses: getBonusesByType('free-spins'),
        cashbackBonuses: getBonusesByType('cashback'),

        // SEO data se disponibile
        seoData: provider?.seo ? {
            title: provider.seo.metaTitle || `${provider.name} - Recensione e Bonus | Jokerman79`,
            description: provider.seo.metaDescription ||
                `Scopri ${provider.name}: recensione completa, bonus esclusivi e migliori slot. ${provider.description}`,
            keywords: provider.seo.keywords || `${provider.name}, slot online, bonus casino, recensione provider`,
            canonicalUrl: provider.seo.canonicalURL || `/providers/${slug}`,
            metaImage: provider.seo.metaImage?.url,
            structuredData: provider.seo.structuredData
        } : null
    };
}

/**
 * Hook semplificato per ottenere solo i dati base del provider
 */
export function useProviderBasic(slug: string) {
    return useProvider(slug, {
        includeBonuses: false,
        includeSlots: false
    });
}

/**
 * Hook per ottenere tutti i provider con informazioni di base
 */
export function useProviders(limit = 100) {
    const { data, loading, error } = useQuery<ProvidersQueryResponse>(GET_PROVIDERS, {
        variables: {
            pagination: { limit: limit },
            filters: {
                isVisible: { eq: true }
            }
        }
    });

    const providers = useMemo(() => {
        return data?.providers || [];
    }, [data]);

    const popularProviders = useMemo(() => {
        return providers.filter(provider => provider.isPopular);
    }, [providers]);

    return {
        providers,
        popularProviders,
        loading,
        error
    };
}
