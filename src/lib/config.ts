/**
 * Configurazione degli URL per l'applicazione
 * Gestisce automaticamente localhost vs IP per dispositivi mobili
 */

// Funzione per rilevare se siamo su mobile
function isMobileDevice(): boolean {
    if (typeof window === 'undefined') return false;

    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
    );
}

// Funzione per ottenere l'IP locale della macchina di sviluppo
function getLocalIP(): string | null {
    // In development, potresti voler usare l'IP della macchina invece di localhost
    // per permettere l'accesso da dispositivi mobili sulla stessa rete

    // Questa è una configurazione che dovrai aggiornare manualmente
    // oppure usare una variabile d'ambiente
    return process.env.NEXT_PUBLIC_DEV_SERVER_IP || null;
}

// URL base per Strapi
export function getStrapiBaseUrl(): string {
    // In production, usa l'URL di produzione
    if (process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_STRAPI_URL || 'https://your-strapi-production-url.com';
    }

    // In development
    if (process.env.NEXT_PUBLIC_STRAPI_URL) {
        return process.env.NEXT_PUBLIC_STRAPI_URL;
    }

    // Se siamo su mobile e abbiamo un IP locale configurato
    const localIP = getLocalIP();
    if (isMobileDevice() && localIP) {
        return `http://${localIP}:1337`;
    }

    // Default localhost
    return 'http://localhost:1337';
}

// URL GraphQL
export function getStrapiGraphQLUrl(): string {
    // In sviluppo, usa il proxy di Next.js per evitare problemi CORS
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
        return '/api/strapi/graphql';
    }
    
    return `${getStrapiBaseUrl()}/graphql`;
}

// URL per le immagini
export function getStrapiImageUrl(imagePath?: string): string {
    if (!imagePath) return '';

    const baseUrl = getStrapiBaseUrl();

    // Se l'immagine è già un URL completo, restituiscila così com'è
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // Se inizia con /, è un percorso relativo da Strapi
    if (imagePath.startsWith('/')) {
        return `${baseUrl}${imagePath}`;
    }

    // Altrimenti, aggiungi il prefisso completo
    return `${baseUrl}/${imagePath}`;
}

// Configurazione per testing
export const config = {
    strapi: {
        baseUrl: getStrapiBaseUrl(),
        graphqlUrl: getStrapiGraphQLUrl(),
        timeout: 10000,
        retries: 3,
    },
    app: {
        isDevelopment: process.env.NODE_ENV === 'development',
        isProduction: process.env.NODE_ENV === 'production',
        isMobile: typeof window !== 'undefined' ? isMobileDevice() : false,
    }
} as const;

// Log della configurazione in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    console.log('🔧 App Configuration:', {
        strapiUrl: config.strapi.baseUrl,
        graphqlUrl: config.strapi.graphqlUrl,
        isMobile: config.app.isMobile,
        environment: process.env.NODE_ENV,
    });

    // Suggerimenti per configurazione mobile
    if (config.app.isMobile && config.strapi.baseUrl.includes('localhost')) {
        console.warn(
            '📱 Mobile Development Tip:\n' +
            'To test on mobile devices, set NEXT_PUBLIC_DEV_SERVER_IP environment variable\n' +
            'to your computer\'s IP address (e.g., 192.168.1.100)\n' +
            'or use NEXT_PUBLIC_STRAPI_URL=http://YOUR_IP:1337'
        );
    }
}

export default config;
