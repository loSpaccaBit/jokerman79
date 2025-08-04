import type { SlotDemo } from '@/types/slots';
import type { BlogPost } from '@/types/blog';

// Organization Schema per la home page
export const getOrganizationSchema = () => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Jokerman79",
    "url": "https://jokerman79.com",
    "logo": {
        "@type": "ImageObject",
        "url": "https://jokerman79.com/assets/logo.svg",
        "width": 600,
        "height": 200
    },
    "description": "La migliore piattaforma per scoprire slot machine online, recensioni e statistiche di gioco responsabile.",
    "foundingDate": "2024",
    "sameAs": [
        "https://twitter.com/jokerman79",
        "https://facebook.com/jokerman79",
        "https://instagram.com/jokerman79"
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "info@jokerman79.com"
    },
    "areaServed": "IT",
    "knowsAbout": [
        "Slot Machine",
        "Gioco Responsabile",
        "Casino Online",
        "Recensioni Gaming"
    ]
});

// WebSite Schema con Search Action
export const getWebSiteSchema = () => ({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Jokerman79",
    "url": "https://jokerman79.com",
    "description": "Scopri le migliori slot machine online con recensioni dettagliate e statistiche di gioco responsabile.",
    "potentialAction": {
        "@type": "SearchAction",
        "target": "https://jokerman79.com/slots?search={search_term_string}",
        "query-input": "required name=search_term_string"
    },
    "publisher": {
        "@type": "Organization",
        "name": "Jokerman79",
        "logo": {
            "@type": "ImageObject",
            "url": "https://jokerman79.com/assets/logo.svg"
        }
    }
});

// Game Schema per le slot machine
export const getSlotGameSchema = (slot: SlotDemo) => ({
    "@context": "https://schema.org",
    "@type": "Game",
    "name": slot.name,
    "description": slot.description || `Scopri ${slot.name}, una slot machine ${slot.provider} con ${slot.features?.join(', ')}.`,
    "url": `https://jokerman79.com/slots/${slot.slug}`,
    "image": slot.image ? `https://jokerman79.com${slot.image}` : undefined,
    "applicationCategory": "Game",
    "gamePlatform": "Web Browser",
    "genre": "Slot Machine",
    "publisher": {
        "@type": "Organization",
        "name": slot.provider,
        "url": `https://jokerman79.com/providers/${slot.provider.toLowerCase().replace(/\s+/g, '-')}`
    },
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock",
        "description": "Gioca gratis in modalità demo"
    },
    "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "bestRating": "5",
        "worstRating": "1",
        "ratingCount": 100
    },
    "gameItem": {
        "@type": "Thing",
        "name": "Virtual Credits",
        "description": "Crediti virtuali per giocare in modalità demo"
    },
    "playMode": "https://schema.org/SinglePlayer",
    "accessibilityFeature": ["textDescription", "alternativeText"],
    "keywords": [
        slot.name,
        slot.provider,
        "slot machine",
        "gioco demo",
        "casino online",
        ...(slot.features || [])
    ].join(", ")
});

// Article Schema per i blog post
export const getBlogPostSchema = (post: BlogPost) => ({
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "description": post.excerpt,
    "url": `https://jokerman79.com/blog/${post.slug}`,
    "datePublished": post.publishedAt,
    "dateModified": post.publishedAt,
    "author": {
        "@type": "Person",
        "name": post.author
    },
    "publisher": {
        "@type": "Organization",
        "name": "Jokerman79",
        "logo": {
            "@type": "ImageObject",
            "url": "https://jokerman79.com/assets/logo.svg",
            "width": 600,
            "height": 200
        }
    },
    "image": {
        "@type": "ImageObject",
        "url": `https://jokerman79.com${post.image}`,
        "width": 1200,
        "height": 630
    },
    "articleSection": post.category,
    "wordCount": 800, // Valore di default
    "inLanguage": "it-IT",
    "isAccessibleForFree": true,
    "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `https://jokerman79.com/blog/${post.slug}`
    }
});

// Collection Page Schema per pagine di categoria
export const getCollectionPageSchema = (
    title: string,
    description: string,
    url: string,
    items: Array<{ name: string; url: string; image?: string }>
) => ({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": title,
    "description": description,
    "url": url,
    "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": items.length,
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "item": {
                "@type": "Thing",
                "name": item.name,
                "url": item.url,
                "image": item.image ? `https://jokerman79.com${item.image}` : undefined
            }
        }))
    },
    "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://jokerman79.com"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": title,
                "item": url
            }
        ]
    }
});

// Provider Schema per pagine provider
export const getProviderSchema = (
    providerName: string,
    description: string,
    games: Array<{ name: string; slug: string }>
) => ({
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": providerName,
    "description": description,
    "url": `https://jokerman79.com/providers/${providerName.toLowerCase().replace(/\s+/g, '-')}`,
    "logo": {
        "@type": "ImageObject",
        "url": `https://jokerman79.com/assets/providers/${providerName.toLowerCase().replace(/\s+/g, '-')}.png`
    },
    "makesOffer": games.map(game => ({
        "@type": "Offer",
        "itemOffered": {
            "@type": "Game",
            "name": game.name,
            "url": `https://jokerman79.com/slots/${game.slug}`
        },
        "price": "0",
        "priceCurrency": "EUR",
        "availability": "https://schema.org/InStock"
    })),
    "areaServed": "IT",
    "knowsAbout": [
        "Slot Machine",
        "Gaming Software",
        "Casino Games"
    ]
});

// Review Schema per recensioni
export const getReviewSchema = (
    itemName: string,
    itemUrl: string,
    rating: number,
    reviewText: string,
    author: string,
    datePublished: string
) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
        "@type": "Game",
        "name": itemName,
        "url": itemUrl
    },
    "reviewRating": {
        "@type": "Rating",
        "ratingValue": rating,
        "bestRating": "5",
        "worstRating": "1"
    },
    "author": {
        "@type": "Person",
        "name": author
    },
    "datePublished": datePublished,
    "reviewBody": reviewText,
    "publisher": {
        "@type": "Organization",
        "name": "Jokerman79"
    }
});

// FAQ Schema per pagine informative
export const getFAQSchema = (faqs: Array<{ question: string; answer: string }>) => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
        }
    }))
});

// Breadcrumb Schema
export const getBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
    }))
});
