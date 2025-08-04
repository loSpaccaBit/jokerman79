import Head from 'next/head';

interface SlotSEOProps {
    slot: {
        name: string;
        description?: string;
        provider?: {
            name: string;
        };
        category?: {
            name: string;
        };
        rating?: number;
        rtp?: number;
        volatility?: string;
        thumbnail?: {
            url: string;
        };
        features?: string[];
        reviewSummary?: string;
        maxWin?: string;
    };
    slug: string;
}

export function SlotSEO({ slot, slug }: SlotSEOProps) {
    // Genera title ottimizzato per SEO
    const title = `${slot.name} - Slot Online ${slot.provider?.name ? `di ${slot.provider.name}` : ''} | Gioca Gratis`;

    // Genera description ottimizzata
    const description = slot.reviewSummary ||
        slot.description ||
        `Gioca gratis alla slot ${slot.name}${slot.provider?.name ? ` di ${slot.provider.name}` : ''}. ${slot.rtp ? `RTP ${slot.rtp}%` : ''} ${slot.volatility ? `volatilità ${slot.volatility}` : ''}. Demo gratuita e recensione completa.`;

    // Keywords dinamiche
    const keywords = [
        slot.name,
        'slot online',
        'gioca gratis',
        'demo slot',
        slot.provider?.name,
        slot.category?.name,
        slot.volatility,
        ...(slot.features || [])
    ].filter(Boolean).join(', ');

    // URL canonico
    const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jokerman79.com'}/slots/${slug}`;

    // Immagine per social media - solo da Strapi, nessun fallback locale
    const ogImage = slot.thumbnail?.url || `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jokerman79.com'}/icons/icon-512x512.png`;

    // Structured Data per Google
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": slot.name,
        "description": description,
        "provider": slot.provider?.name ? {
            "@type": "Organization",
            "name": slot.provider.name
        } : undefined,
        "category": slot.category?.name,
        "aggregateRating": slot.rating ? {
            "@type": "AggregateRating",
            "ratingValue": slot.rating,
            "bestRating": 5,
            "ratingCount": 1
        } : undefined,
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "EUR",
            "availability": "https://schema.org/InStock",
            "description": "Gioca gratis alla demo"
        },
        "image": ogImage.startsWith('http') ? ogImage : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jokerman79.com'}${ogImage}`,
        "url": canonicalUrl,
        "gameItem": slot.features?.map(feature => ({
            "@type": "Thing",
            "name": feature
        }))
    };

    return (
        <Head>
            {/* Basic Meta Tags */}
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph Meta Tags */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jokerman79.com'}${ogImage}`} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:locale" content="it_IT" />
            <meta property="og:site_name" content="Jokerman79" />

            {/* Twitter Card Meta Tags */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jokerman79.com'}${ogImage}`} />

            {/* Gaming Specific Meta Tags */}
            {slot.rtp && <meta name="game:rtp" content={slot.rtp.toString()} />}
            {slot.volatility && <meta name="game:volatility" content={slot.volatility} />}
            {slot.provider?.name && <meta name="game:provider" content={slot.provider.name} />}
            {slot.maxWin && <meta name="game:max_win" content={slot.maxWin} />}

            {/* Robots Meta Tags */}
            <meta name="robots" content="index, follow, max-image-preview:large" />
            <meta name="googlebot" content="index, follow" />

            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(structuredData, null, 2)
                }}
            />

            {/* Additional SEO Meta Tags */}
            <meta name="author" content="Jokerman79" />
            <meta name="language" content="it" />
            <meta name="geo.region" content="IT" />
            <meta name="theme-color" content="#1a1a1a" />

            {/* Preconnect per performance */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        </Head>
    );
}
