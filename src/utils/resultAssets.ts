// Helper per gestire gli assets dei risultati dei giochi live

// Cache per gli URL degli asset per evitare ricalcoli
const assetUrlCache = new Map<string, string | null>();

export function getResultAssetUrl(
    result: string | number,
    game: {
        resultAssets?: { url: string; name: string; alternativeText?: string; }[];
        assetMapping?: Record<string, string>;
    }
): string | null {
    // Crea una chiave di cache unica basata su gameId (se disponibile) e risultato
    const gameId = (game as Record<string, unknown>)?.gameId || 'unknown';
    const cacheKey = `${gameId}-${result}`;

    // Controlla se abbiamo già calcolato questo URL
    if (assetUrlCache.has(cacheKey)) {
        const cachedUrl = assetUrlCache.get(cacheKey) || null;
        console.log('🚀 Cache hit for:', cacheKey, '→', cachedUrl);
        return cachedUrl;
    }

    console.log('🔍 getResultAssetUrl debug:', {
        result,
        hasResultAssets: !!game.resultAssets,
        hasAssetMapping: !!game.assetMapping,
        resultAssetsCount: game.resultAssets?.length || 0,
        assetMapping: game.assetMapping,
        cacheKey
    });

    if (!game.resultAssets || !game.assetMapping) {
        console.log('❌ Missing resultAssets or assetMapping');
        assetUrlCache.set(cacheKey, null);
        return null;
    }

    // Converti il risultato in stringa e normalizza
    const resultKey = String(result).toLowerCase().trim();
    console.log('🔑 Looking for key:', resultKey);

    // Cerca nella mappatura
    const assetName = game.assetMapping[resultKey];
    console.log('📁 Found asset name:', assetName);

    if (!assetName) {
        console.log('❌ No asset name found for key:', resultKey);
        assetUrlCache.set(cacheKey, null);
        return null;
    }

    // Trova l'asset corrispondente
    console.log('🔍 Searching in assets:', game.resultAssets.map(a => a.name));

    // Match esatto per nome del file
    const asset = game.resultAssets.find(asset =>
        asset.name.toLowerCase() === assetName.toLowerCase()
    );
    console.log('🎯 Match result:', asset);

    console.log('✅ Found asset:', asset);

    if (!asset) {
        assetUrlCache.set(cacheKey, null);
        return null;
    }

    // Se l'URL è relativo, aggiungi il base URL di Strapi
    let assetUrl = asset.url;
    if (assetUrl.startsWith('/')) {
        // Usa la variabile d'ambiente o fallback a localhost
        const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
        assetUrl = `${strapiUrl}${assetUrl}`;
    }

    console.log('🌐 Final asset URL:', assetUrl);

    // Salva in cache
    assetUrlCache.set(cacheKey, assetUrl);

    return assetUrl;
}

// Helper per ottenere l'alt text dell'asset (con cache)
export function getResultAssetAlt(
    result: string | number,
    game: {
        resultAssets?: { url: string; name: string; alternativeText?: string; }[];
        assetMapping?: Record<string, string>;
    }
): string {
    if (!game.resultAssets || !game.assetMapping) {
        return String(result);
    }

    const resultKey = String(result).toLowerCase().trim();
    const assetName = game.assetMapping[resultKey];

    if (!assetName) {
        return String(result);
    }

    // Match esatto per nome del file
    const asset = game.resultAssets.find(asset =>
        asset.name.toLowerCase() === assetName.toLowerCase()
    );

    return asset?.alternativeText || String(result);
}

// Helper per determinare se un gioco ha assets per i risultati
export function hasResultAssets(
    game: {
        resultAssets?: { url: string; name: string; alternativeText?: string; }[];
        assetMapping?: Record<string, string>;
    }
): boolean {
    return !!(game.resultAssets && game.resultAssets.length > 0 && game.assetMapping);
}

// Funzione per pulire la cache se necessario
export function clearAssetCache(): void {
    assetUrlCache.clear();
    console.log('🧹 Asset cache cleared');
}

// Funzione per ottenere statistiche della cache
export function getCacheStats(): { size: number; keys: string[] } {
    return {
        size: assetUrlCache.size,
        keys: Array.from(assetUrlCache.keys())
    };
}
