import { useEffect } from 'react';
import type { StrapiSEO } from '@/types/strapi';

interface SEOData {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    robots?: string;
    canonicalUrl?: string;
    structuredData?: any;
}

export function useDynamicSEO(seoData: SEOData) {
    useEffect(() => {
        // Aggiorna il title
        if (seoData.title) {
            document.title = seoData.title;
        }

        // Aggiorna o crea meta tags
        const updateMetaTag = (name: string, content: string, property?: boolean) => {
            if (!content) return;

            const attribute = property ? 'property' : 'name';
            let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;

            if (!meta) {
                meta = document.createElement('meta');
                meta.setAttribute(attribute, name);
                document.head.appendChild(meta);
            }

            meta.content = content;
        };

        // Meta description
        updateMetaTag('description', seoData.description || '');

        // Keywords
        updateMetaTag('keywords', seoData.keywords || '');

        // Robots
        updateMetaTag('robots', seoData.robots || 'index,follow');

        // Open Graph tags
        updateMetaTag('og:title', seoData.title || '', true);
        updateMetaTag('og:description', seoData.description || '', true);
        updateMetaTag('og:type', 'website', true);

        if (seoData.image) {
            updateMetaTag('og:image', seoData.image, true);
        }

        // Twitter Card tags
        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', seoData.title || '');
        updateMetaTag('twitter:description', seoData.description || '');

        if (seoData.image) {
            updateMetaTag('twitter:image', seoData.image);
        }

        // Canonical URL
        if (seoData.canonicalUrl) {
            let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }

            canonical.href = seoData.canonicalUrl;
        }

        // Structured Data (JSON-LD)
        if (seoData.structuredData) {
            let script = document.querySelector('script[type="application/ld+json"]') as HTMLScriptElement;

            if (!script) {
                script = document.createElement('script');
                script.type = 'application/ld+json';
                document.head.appendChild(script);
            }

            script.textContent = JSON.stringify(seoData.structuredData);
        }

        // Cleanup function per rimuovere i meta tags quando il componente viene smontato
        return () => {
            // In una SPA, potremmo voler mantenere alcuni meta tags
            // ma per ora li lasciamo così
        };
    }, [seoData]);
}

// Funzione helper per convertire i dati SEO da Strapi
export function convertStrapiSEOToLocal(strapiSEO?: StrapiSEO, fallbackData?: {
    slotName?: string;
    provider?: string;
    description?: string;
    slug?: string;
}): SEOData {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jokerman79.com';

    return {
        title: strapiSEO?.metaTitle ||
            (fallbackData?.slotName ? `${fallbackData.slotName} - Slot ${fallbackData.provider ? `di ${fallbackData.provider}` : ''} | Jokerman79` : ''),
        description: strapiSEO?.metaDescription ||
            fallbackData?.description ||
            `Gioca alla slot ${fallbackData?.slotName || 'online'} ${fallbackData?.provider ? `di ${fallbackData.provider}` : ''}. Demo gratuita, recensioni e bonus esclusivi su Jokerman79.`,
        keywords: strapiSEO?.keywords ||
            `slot machine, ${fallbackData?.slotName}, ${fallbackData?.provider}, casino online, demo gratuita, bonus`,
        image: strapiSEO?.metaImage?.url ?
            (strapiSEO.metaImage.url.startsWith('http') ? strapiSEO.metaImage.url : `${baseUrl}${strapiSEO.metaImage.url}`) :
            undefined,
        robots: strapiSEO?.metaRobots || 'index,follow',
        canonicalUrl: strapiSEO?.canonicalURL ||
            (fallbackData?.slug ? `${baseUrl}/slots/${fallbackData.slug}` : undefined),
        structuredData: strapiSEO?.structuredData || generateDefaultStructuredData(fallbackData)
    };
}

// Genera structured data di base per le slot
function generateDefaultStructuredData(fallbackData?: {
    slotName?: string;
    provider?: string;
    description?: string;
    slug?: string;
}) {
    if (!fallbackData?.slotName) return null;

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://jokerman79.com';

    return {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": fallbackData.slotName,
        "description": fallbackData.description || `Slot machine ${fallbackData.slotName}`,
        "url": `${baseUrl}/slots/${fallbackData.slug}`,
        "gameItem": {
            "@type": "Thing",
            "name": fallbackData.slotName
        },
        "provider": fallbackData.provider ? {
            "@type": "Organization",
            "name": fallbackData.provider
        } : undefined,
        "applicationCategory": "Game",
        "operatingSystem": "Web Browser"
    };
}
