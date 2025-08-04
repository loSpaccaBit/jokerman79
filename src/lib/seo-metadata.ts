import { Metadata } from 'next';

export interface SEOData {
    title: string;
    description: string;
    keywords?: string[];
    canonicalUrl?: string;
    ogImage?: string;
    ogType?: 'website' | 'article';
    twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    section?: string;
    tags?: string[];
    locale?: string;
    alternateLanguages?: Array<{ hrefLang: string; href: string }>;
}

const DEFAULT_KEYWORDS = [
    'slot machine',
    'casino online',
    'gioco responsabile',
    'demo gratis',
    'recensioni slot',
    'rtp slot',
    'volatilità slot',
    'bonus casino'
];

const SITE_CONFIG = {
    siteName: 'Jokerman79',
    siteUrl: 'https://jokerman79.com',
    defaultImage: '/assets/og-default.jpg',
    twitterHandle: '@jokerman79',
    locale: 'it_IT',
    themeColor: '#1e293b'
};

export function generateSEOMetadata(seoData: SEOData): Metadata {
    const {
        title,
        description,
        keywords = [],
        canonicalUrl,
        ogImage,
        ogType = 'website',
        twitterCard = 'summary_large_image',
        author,
        publishedTime,
        modifiedTime,
        section,
        tags = [],
        locale = SITE_CONFIG.locale,
        alternateLanguages = []
    } = seoData;

    const fullTitle = title.includes('Jokerman79') ? title : `${title} | Jokerman79`;
    const fullCanonicalUrl = canonicalUrl || SITE_CONFIG.siteUrl;
    const fullOgImage = ogImage ? `${SITE_CONFIG.siteUrl}${ogImage}` : `${SITE_CONFIG.siteUrl}${SITE_CONFIG.defaultImage}`;
    const allKeywords = [...DEFAULT_KEYWORDS, ...keywords, ...tags].filter(Boolean);

    const metadata: Metadata = {
        title: fullTitle,
        description,
        keywords: allKeywords.join(', '),
        authors: author ? [{ name: author }] : [{ name: 'Jokerman79 Team' }],
        creator: 'Jokerman79',
        publisher: 'Jokerman79',

        // Alternate URLs
        alternates: {
            canonical: fullCanonicalUrl,
            languages: alternateLanguages.reduce((acc, lang) => {
                acc[lang.hrefLang] = lang.href;
                return acc;
            }, {} as Record<string, string>)
        },

        // Open Graph
        openGraph: {
            title: fullTitle,
            description,
            url: fullCanonicalUrl,
            siteName: SITE_CONFIG.siteName,
            locale,
            type: ogType,
            images: [
                {
                    url: fullOgImage,
                    width: 1200,
                    height: 630,
                    alt: title
                }
            ],
            ...(publishedTime && { publishedTime }),
            ...(modifiedTime && { modifiedTime }),
            ...(section && { section }),
            ...(tags.length > 0 && { tags })
        },

        // Twitter
        twitter: {
            card: twitterCard,
            site: SITE_CONFIG.twitterHandle,
            creator: SITE_CONFIG.twitterHandle,
            title: fullTitle,
            description,
            images: [fullOgImage]
        },

        // Additional meta tags
        other: {
            'theme-color': SITE_CONFIG.themeColor,
            'mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-capable': 'yes',
            'apple-mobile-web-app-status-bar-style': 'default',
            'format-detection': 'telephone=no',
            'msapplication-TileColor': SITE_CONFIG.themeColor
        },

        // Robots
        robots: {
            index: true,
            follow: true,
            nocache: false,
            googleBot: {
                index: true,
                follow: true,
                noimageindex: false,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1
            }
        }
    };

    return metadata;
}

// Metadata per la home page
export const homePageSEO: SEOData = {
    title: 'Jokerman79 - Le Migliori Slot Machine Online e Demo Gratis',
    description: 'Scopri le migliori slot machine online con demo gratis, recensioni dettagliate, statistiche RTP e guide al gioco responsabile. Oltre 1000 slot da provare!',
    keywords: [
        'slot gratis',
        'demo slot',
        'slot online',
        'migliori slot',
        'rtp alto',
        'slot machine gratis'
    ],
    ogType: 'website',
    ogImage: '/assets/og-home.jpg'
};

// Metadata per pagina slots
export const slotsPageSEO: SEOData = {
    title: 'Slot Machine Gratis - Demo e Recensioni Complete',
    description: 'Prova gratis oltre 1000 slot machine online. Demo senza registrazione, recensioni dettagliate, RTP e volatilità per ogni gioco.',
    keywords: [
        'slot demo',
        'slot gratis',
        'prova slot',
        'slot senza registrazione',
        'recensioni slot'
    ],
    ogImage: '/assets/og-slots.jpg'
};

// Metadata per pagina providers
export const providersPageSEO: SEOData = {
    title: 'Provider Slot Machine - Migliori Sviluppatori di Giochi',
    description: 'Scopri i migliori provider di slot machine: NetEnt, Pragmatic Play, Microgaming e molti altri. Confronta giochi e caratteristiche.',
    keywords: [
        'provider slot',
        'sviluppatori slot',
        'software casino',
        'netent',
        'pragmatic play',
        'microgaming'
    ],
    ogImage: '/assets/og-providers.jpg'
};

// Metadata per pagina blog
export const blogPageSEO: SEOData = {
    title: 'Blog Slot Machine - Guide, Strategie e Notizie Casino',
    description: 'Leggi le ultime news sul mondo delle slot machine, guide strategiche, recensioni esclusive e consigli per il gioco responsabile.',
    keywords: [
        'blog slot',
        'guide slot',
        'strategie casino',
        'news slot',
        'gioco responsabile'
    ],
    ogType: 'website',
    ogImage: '/assets/og-blog.jpg'
};

// Metadata per pagina stats
export const statsPageSEO: SEOData = {
    title: 'Statistiche Slot Machine - RTP, Volatilità e Analisi Dati',
    description: 'Analizza le statistiche complete delle slot machine: RTP, volatilità, frequenza di vincita e molto altro. Dati aggiornati in tempo reale.',
    keywords: [
        'statistiche slot',
        'rtp slot',
        'volatilità slot',
        'analisi slot',
        'dati slot'
    ],
    ogImage: '/assets/og-stats.jpg'
};

// Funzione per generare metadata per singola slot
export function generateSlotSEO(slot: {
    name: string;
    slug: string;
    provider: string;
    description?: string;
    rtp: number;
    volatility: string;
    image: string;
}): SEOData {
    return {
        title: `${slot.name} by ${slot.provider} - Demo Gratis e Recensione`,
        description: slot.description || `Prova gratis ${slot.name} by ${slot.provider}. RTP ${slot.rtp}%, volatilità ${slot.volatility}. Demo senza registrazione e recensione completa.`,
        keywords: [
            slot.name.toLowerCase(),
            slot.provider.toLowerCase(),
            'demo gratis',
            'slot online',
            `rtp ${slot.rtp}%`,
            `volatilità ${slot.volatility}`
        ],
        canonicalUrl: `https://jokerman79.com/slots/${slot.slug}`,
        ogType: 'article',
        ogImage: slot.image
    };
}

// Funzione per generare metadata per singolo blog post
export function generateBlogPostSEO(post: {
    title: string;
    slug: string;
    excerpt: string;
    author: string;
    publishedAt: string;
    category: string;
    image: string;
}): SEOData {
    return {
        title: post.title,
        description: post.excerpt,
        canonicalUrl: `https://jokerman79.com/blog/${post.slug}`,
        ogType: 'article',
        ogImage: post.image,
        author: post.author,
        publishedTime: post.publishedAt,
        section: post.category,
        keywords: [
            post.category.toLowerCase(),
            'slot machine',
            'casino online',
            'gioco responsabile'
        ]
    };
}
