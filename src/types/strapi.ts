import { SlotDemo, SlotCategory, SlotProvider } from './slots';
import { BlogPost } from './blog';
import { ProviderBonus } from './bonus';
import { getStrapiImageUrl as getImageUrl } from '@/lib/config';

// ===== CONFIGURAZIONE STRAPI =====

/**
 * Wrapper per la funzione getStrapiImageUrl da config
 * @deprecated Usa getStrapiImageUrl da @/lib/config
 */
function getStrapiImageUrl(strapiImageUrl: string | undefined): string {
    return getImageUrl(strapiImageUrl);
}

// ===== TIPI STRAPI =====

export interface StrapiImage {
    url: string;
    alternativeText?: string;
    width?: number;
    height?: number;
}

export interface StrapiProvider {
    documentId: string;
    name: string;
    slug: string;
    description?: string;
    website?: string;
    foundedYear?: string;
    country?: string;
    isVisible: boolean;
    isPopular?: boolean;
    rating?: string;
    licenses?: string[];
    reviewSummary?: string;
    reviewPros?: string[];
    reviewCons?: string[];
    reviewVerdict?: string;
    logo?: StrapiImage;
    seo?: {
        metaTitle?: string;
        metaDescription?: string;
        keywords?: string;
        canonicalURL?: string;
        metaImage?: StrapiImage;
        structuredData?: Record<string, unknown>;
    };
}

export interface StrapiCategory {
    documentId: string;
    name: string;
    slug: string;
    color?: string;
}

export interface StrapiSlot {
    documentId: string;
    name: string;
    slug: string;
    description?: string;
    shortDescription?: string;
    provider?: StrapiProvider;
    category?: StrapiCategory;
    rtp?: number;
    volatility?: 'low' | 'medium' | 'high';
    minBet?: number;
    maxBet?: number;
    paylines?: number;
    reels?: number;
    rows?: number;
    features?: string[];
    image?: StrapiImage;
    thumbnail?: StrapiImage;
    demoUrl?: string;
    rating?: number;
    reviewCount?: number;
    isPopular?: boolean;
    isNew?: boolean;
    isFeatured?: boolean;
    isVisible?: boolean;
    order?: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface StrapiBlogPost {
    documentId: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    featuredImage?: StrapiImage; // Campo corretto dalla query GraphQL
    author?: string;
    category?: StrapiCategory;
    tags?: (string | { name: string } | Record<string, unknown>)[]; // Gestisce sia stringhe che oggetti tag
    readTime?: number;
    isFeatured?: boolean;
    isVisible?: boolean;
    order?: number;
    seoTitle?: string;
    seoDescription?: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface StrapiPartner {
    documentId: string;
    name: string;
    text?: string;
    img?: StrapiImage;
    imgAlt?: string;
    isReversed?: boolean;
    isFeatured?: boolean;
    order?: number;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

export interface StrapiProviderBonus {
    documentId: string;
    title: string;
    description?: string;
    type: 'welcome' | 'deposit' | 'free-spins' | 'cashback' | 'loyalty' | 'tournament';
    amount?: string;
    code?: string;
    terms?: string[];
    url?: string;
    isActive?: boolean;
    isExclusive?: boolean;
    validUntil?: string;
    order?: number;
    provider?: StrapiProvider;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
}

// ===== TIPI QUERY RESPONSE =====

export interface SlotsQueryResponse {
    slots: StrapiSlot[];
}

export interface ProvidersQueryResponse {
    providers: StrapiProvider[];
}

export interface CategoriesQueryResponse {
    categories: StrapiCategory[];
}

export interface StatsQueryResponse {
    slots_connection?: {
        pageInfo?: {
            total?: number;
        };
    };
    providers_connection?: {
        pageInfo?: {
            total?: number;
        };
    };
    categories_connection?: {
        pageInfo?: {
            total?: number;
        };
    };
}

export interface BlogPostsQueryResponse {
    blogPosts: StrapiBlogPost[];
}

export interface PartnersQueryResponse {
    partners: StrapiPartner[];
}

export interface BonusesQueryResponse {
    providerBonuses: StrapiProviderBonus[];
}

export interface ProviderBonusesQueryResponse {
    providerBonuses: StrapiProviderBonus[];
}

// ===== TIPI VARIABLES =====

export interface TestimonialsQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
}

export interface ProvidersQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
        limit?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
    limit?: number;
}

export interface CategoriesQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
        limit?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
    limit?: number;
}

export interface BlogPostsQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
    limit?: number;
}

export interface PartnersQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
    limit?: number;
}

export interface SlotGamesQueryVariables {
    pagination?: {
        page?: number;
        pageSize?: number;
    };
    filters?: {
        [key: string]: unknown;
    };
    sort?: string[];
}

// ===== FUNZIONI DI CONVERSIONE =====

export function strapiSlotToLocal(strapiSlot: StrapiSlot): SlotDemo {
    // Mappa la categoria Strapi a SlotCategory
    const getCategoryFromString = (categoryName: string): SlotCategory => {
        const normalized = categoryName.toLowerCase();
        switch (normalized) {
            case 'classic':
            case 'classiche':
                return 'classic';
            case 'video':
                return 'video';
            case 'progressive':
            case 'progressiva':
            case 'jackpot':
                return 'progressive';
            case 'megaways':
                return 'megaways';
            case 'adventure':
            case 'avventura':
                return 'adventure';
            case 'mythology':
            case 'mitologia':
                return 'mythology';
            case 'fruits':
            case 'frutta':
                return 'fruits';
            default:
                return 'other';
        }
    };

    return {
        id: strapiSlot.documentId,
        name: strapiSlot.name,
        slug: strapiSlot.slug,
        description: strapiSlot.description || '',
        provider: strapiSlot.provider?.name || 'Unknown',
        category: getCategoryFromString(strapiSlot.category?.name || 'other'),
        rtp: strapiSlot.rtp || 96,
        volatility: strapiSlot.volatility || 'medium',
        minBet: strapiSlot.minBet || 0.01,
        maxBet: strapiSlot.maxBet || 100,
        paylines: strapiSlot.paylines || 25,
        features: strapiSlot.features || [],
        image: getStrapiImageUrl(strapiSlot.thumbnail?.url), // URL assoluto da Strapi
        demoUrl: strapiSlot.demoUrl || '',
        isPopular: strapiSlot.isPopular || false,
        isNew: strapiSlot.isNew || false,
        videoUrl: strapiSlot.demoUrl,
        videoUrlMobile: strapiSlot.demoUrl,
    };
}

export function strapiBlogPostToLocal(strapiBlogPost: StrapiBlogPost): BlogPost {
    return {
        id: strapiBlogPost.documentId,
        title: strapiBlogPost.title,
        slug: strapiBlogPost.slug,
        excerpt: strapiBlogPost.excerpt || '',
        content: strapiBlogPost.content || '',
        image: getStrapiImageUrl(strapiBlogPost.featuredImage?.url), // URL assoluto da Strapi
        author: strapiBlogPost.author || 'Jokerman79',
        category: strapiBlogPost.category?.name || 'General',
        tags: strapiBlogPost.tags?.map(tag => {
            // Gestisci sia stringhe che oggetti tag
            if (process.env.NODE_ENV === 'development') {
                console.log('🏷️ Processing blog post tag:', { tag, type: typeof tag });
            }
            const tagName = typeof tag === 'string' ? tag : 
                            typeof (tag as Record<string, unknown>)?.name === 'string' ? 
                            (tag as Record<string, unknown>).name as string : 
                            String(tag);
            return { 
                name: tagName, 
                slug: tagName.toLowerCase().replace(/\s+/g, '-') 
            };
        }) || [],
        readTime: `${strapiBlogPost.readTime || 5} min`,
        isFeatured: strapiBlogPost.isFeatured || false,
        publishedAt: strapiBlogPost.publishedAt,
        views: 0,
    };
}

export interface LocalPartner {
    id: string;
    name: string;
    text: string;
    img: string;
    imgAlt: string;
    isReversed: boolean;
    isFeatured: boolean;
    order: number;
}

export function strapiPartnerToLocal(strapiPartner: StrapiPartner): LocalPartner {
    return {
        id: strapiPartner.documentId,
        name: strapiPartner.name,
        text: strapiPartner.text || '',
        img: getStrapiImageUrl(strapiPartner.img?.url), // URL assoluto da Strapi
        imgAlt: strapiPartner.imgAlt || strapiPartner.name,
        isReversed: strapiPartner.isReversed || false,
        isFeatured: strapiPartner.isFeatured || false,
        order: strapiPartner.order || 0,
    };
}

export function strapiProviderToLocal(strapiProvider: StrapiProvider): SlotProvider {
    return {
        id: strapiProvider.documentId,
        name: strapiProvider.name,
        slug: strapiProvider.slug,
        logo: getStrapiImageUrl(strapiProvider.logo?.url),
        slotsCount: 0, // Questo dovrebbe essere calcolato dinamicamente
        description: '', // Non presente in StrapiProvider
        isVisible: strapiProvider.isVisible,
        rating: 0, // Non presente in StrapiProvider
        bonuses: [], // Dovrebbero essere caricate separatamente
    };
}

export function strapiProviderBonusToLocal(strapiBonus: StrapiProviderBonus): ProviderBonus {
    return {
        id: strapiBonus.documentId,
        title: strapiBonus.title,
        description: strapiBonus.description || '',
        type: strapiBonus.type,
        amount: strapiBonus.amount || '',
        code: strapiBonus.code,
        terms: strapiBonus.terms || [],
        url: strapiBonus.url || '',
        isActive: strapiBonus.isActive || false,
        isExclusive: strapiBonus.isExclusive || false,
        validUntil: strapiBonus.validUntil,
        order: strapiBonus.order || 0,
        provider: strapiBonus.provider ? {
            id: strapiBonus.provider.documentId,
            name: strapiBonus.provider.name,
            slug: strapiBonus.provider.slug,
            logo: getStrapiImageUrl(strapiBonus.provider.logo?.url), // URL assoluto da Strapi
        } : undefined,
        publishedAt: strapiBonus.publishedAt,
    };
}

// Alias per compatibilità
export type HomepagePartnersQueryResponse = PartnersQueryResponse;
export type HomepagePartner = LocalPartner;
export const strapiHomepagePartnerToLocal = strapiPartnerToLocal;
