import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useMemo, useTransition } from 'react';

// Mappatura per URLs SEO-friendly
const PROVIDER_SLUG_MAP: Record<string, string> = {
    'pragmatic-play': 'Pragmatic Play',
    'netent': 'NetEnt',
    'microgaming': 'Microgaming',
    'play-n-go': 'Play\'n GO',
    'evolution-gaming': 'Evolution Gaming',
    'yggdrasil': 'Yggdrasil',
    'quickspin': 'Quickspin',
    'big-time-gaming': 'Big Time Gaming'
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
    'classiche': 'classic',
    'video': 'video',
    'progressive': 'progressive',
    'megaways': 'megaways',
    'avventura': 'adventure',
    'mitologia': 'mythology',
    'frutta': 'fruits'
};

// Funzioni di conversione per URLs SEO-friendly
const providerToSlug = (provider: string): string => {
    const slug = Object.keys(PROVIDER_SLUG_MAP).find(key =>
        PROVIDER_SLUG_MAP[key].toLowerCase() === provider.toLowerCase()
    );
    return slug || provider.toLowerCase().replace(/[^a-z0-9]/g, '-');
};

const slugToProvider = (slug: string): string => {
    return PROVIDER_SLUG_MAP[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const categoryToSlug = (category: string): string => {
    const slug = Object.keys(CATEGORY_SLUG_MAP).find(key =>
        CATEGORY_SLUG_MAP[key] === category.toLowerCase()
    );
    return slug || category.toLowerCase();
};

const slugToCategory = (slug: string): string => {
    return CATEGORY_SLUG_MAP[slug] || slug;
};

export function useUrlFilters() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    // Ottieni i valori attuali dall'URL con conversione da slug
    const currentPage = parseInt(searchParams.get('page') || '1');
    const searchQuery = searchParams.get('q') || '';
    const providerSlug = searchParams.get('provider') || '';
    const categorySlug = searchParams.get('category') || '';
    const sortBy = searchParams.get('sort') || 'rating';
    const viewMode = searchParams.get('view') || 'grid'; // grid | list

    // Converti slug in valori leggibili
    const providerFilter = providerSlug ? slugToProvider(providerSlug) : '';
    const categoryFilter = categorySlug ? slugToCategory(categorySlug) : '';

    // Memoizza lo stato dei filtri per ottimizzazioni
    const filterState = useMemo(() => ({
        currentPage,
        searchQuery,
        providerFilter,
        categoryFilter,
        sortBy,
        viewMode,
        hasActiveFilters: !!(searchQuery || providerFilter || categoryFilter)
    }), [currentPage, searchQuery, providerFilter, categoryFilter, sortBy, viewMode]);

    // Funzione per aggiornare l'URL con ottimizzazioni SEO
    const updateUrl = useCallback((params: Record<string, string | number | undefined>) => {
        startTransition(() => {
            const current = new URLSearchParams(Array.from(searchParams.entries()));

            Object.entries(params).forEach(([key, value]) => {
                if (value === undefined || value === '' || value === 0) {
                    current.delete(key);
                } else {
                    // Converti provider e category in slug SEO-friendly
                    if (key === 'provider' && typeof value === 'string') {
                        current.set(key, providerToSlug(value));
                    } else if (key === 'category' && typeof value === 'string') {
                        current.set(key, categoryToSlug(value));
                    } else {
                        current.set(key, String(value));
                    }
                }
            });

            // Rimuovi parametri di default per URLs più puliti
            if (params.page === 1) current.delete('page');
            if (params.sort === 'rating') current.delete('sort');
            if (params.view === 'grid') current.delete('view');

            // Ordina parametri per URLs consistenti (migliore per SEO)
            const sortedParams = new URLSearchParams();
            const order = ['q', 'provider', 'category', 'sort', 'view', 'page'];

            order.forEach(key => {
                if (current.has(key)) {
                    sortedParams.set(key, current.get(key)!);
                }
            });

            const search = sortedParams.toString();
            const query = search ? `?${search}` : '';

            router.push(`${pathname}${query}`, { scroll: false });
        });
    }, [pathname, router, searchParams]);

    // Funzioni helper ottimizzate per aggiornare singoli parametri
    const setPage = useCallback((page: number) => {
        updateUrl({ page: page > 1 ? page : undefined });
    }, [updateUrl]);

    const setSearchQuery = useCallback((query: string) => {
        updateUrl({ q: query.trim(), page: undefined }); // Reset page when searching
    }, [updateUrl]);

    const setProviderFilter = useCallback((provider: string) => {
        updateUrl({ provider, page: undefined }); // Reset page when filtering
    }, [updateUrl]);

    const setCategoryFilter = useCallback((category: string) => {
        updateUrl({ category, page: undefined }); // Reset page when filtering
    }, [updateUrl]);

    const setSortBy = useCallback((sort: string) => {
        updateUrl({ sort, page: undefined }); // Reset page when sorting
    }, [updateUrl]);

    const setViewMode = useCallback((view: 'grid' | 'list') => {
        updateUrl({ view });
    }, [updateUrl]);

    // Funzioni per filtri multipli (più performanti)
    const setMultipleFilters = useCallback((filters: {
        provider?: string;
        category?: string;
        sort?: string;
        view?: 'grid' | 'list';
        resetPage?: boolean;
    }) => {
        const { resetPage, ...urlParams } = filters;
        updateUrl({
            ...urlParams,
            page: resetPage ? undefined : filterState.currentPage
        });
    }, [updateUrl, filterState.currentPage]);

    const clearFilters = useCallback(() => {
        router.push(pathname, { scroll: false });
    }, [pathname, router]);

    // Funzione per generare URL canonici per SEO
    const generateCanonicalUrl = useCallback((baseUrl: string = '') => {
        if (!filterState.hasActiveFilters) return `${baseUrl}${pathname}`;

        const params = new URLSearchParams();
        if (searchQuery) params.set('q', searchQuery);
        if (providerFilter) params.set('provider', providerToSlug(providerFilter));
        if (categoryFilter) params.set('category', categoryToSlug(categoryFilter));
        if (sortBy !== 'rating') params.set('sort', sortBy);

        return `${baseUrl}${pathname}?${params.toString()}`;
    }, [pathname, filterState.hasActiveFilters, searchQuery, providerFilter, categoryFilter, sortBy]);

    // Funzione per generare meta description dinamica per SEO
    const generateMetaDescription = useCallback((basePage: string = 'slot machine') => {
        const parts = [];

        if (searchQuery) {
            parts.push(`Cerca "${searchQuery}"`);
        }

        if (providerFilter) {
            parts.push(`${providerFilter}`);
        }

        if (categoryFilter) {
            parts.push(`categoria ${categoryFilter}`);
        }

        const filterDesc = parts.length > 0 ? ` - ${parts.join(', ')}` : '';
        const sortDesc = sortBy !== 'rating' ? ` ordinati per ${sortBy}` : '';

        return `Scopri le migliori ${basePage}${filterDesc}${sortDesc}. Demo gratuite, recensioni e bonus esclusivi su Jokerman79.`;
    }, [searchQuery, providerFilter, categoryFilter, sortBy]);

    return {
        // Current values (convertiti da slug)
        ...filterState,

        // Raw URL values (per compatibilità)
        providerSlug,
        categorySlug,

        // Setters
        setPage,
        setSearchQuery,
        setProviderFilter,
        setCategoryFilter,
        setSortBy,
        setViewMode,
        setMultipleFilters,
        clearFilters,

        // Utility
        updateUrl,
        generateCanonicalUrl,
        generateMetaDescription,

        // State
        isPending,

        // Conversion utilities (esportate per uso esterno)
        providerToSlug,
        slugToProvider,
        categoryToSlug,
        slugToCategory
    };
}
