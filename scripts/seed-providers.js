const fs = require('fs');
const path = require('path');

/**
 * Script per caricare i provider dal file JSON
 * Uso: node scripts/seed-providers.js
 */

const STRAPI_URL = process.env.STRAPI_URL || 'http://localhost:1337';
const PROVIDERS_JSON_PATH = path.join(__dirname, '../../provider_seo_completi.json');

// Per testing locale, potresti aver bisogno di configurare i permessi pubblici in Strapi
// oppure aggiungere autenticazione qui se necessario

async function loadProviders() {
    try {
        console.log('🚀 Avvio caricamento provider...');

        // Leggi il file JSON
        if (!fs.existsSync(PROVIDERS_JSON_PATH)) {
            console.error('❌ File provider_seo_completi.json non trovato in:', PROVIDERS_JSON_PATH);
            process.exit(1);
        }

        const providersData = JSON.parse(fs.readFileSync(PROVIDERS_JSON_PATH, 'utf8'));
        console.log(`📁 Trovati ${providersData.length} provider nel file JSON`);

        // Processo ogni provider
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < providersData.length; i++) {
            const providerData = providersData[i];
            console.log(`\n📦 Elaborando provider ${i + 1}/${providersData.length}: ${providerData.name}`);
            console.log(`📊 Progresso: ${Math.round((i / providersData.length) * 100)}%`);

            try {
                await createOrUpdateProvider(providerData);
                successCount++;
                console.log(`✅ Provider ${providerData.name} elaborato con successo`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Errore durante l'elaborazione di ${providerData.name}:`, error.message);
            }

            // Pausa più lunga per evitare sovraccarico del server
            console.log(`⏳ Attendo 2 secondi prima del prossimo provider...`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // 2 secondi di pausa
        }

        console.log(`\n🎉 Caricamento completato!`);
        console.log(`📊 Riepilogo:`);
        console.log(`   ✅ Successi: ${successCount}/${providersData.length}`);
        console.log(`   ❌ Errori: ${errorCount}/${providersData.length}`);
        console.log(`   📈 Percentuale successo: ${Math.round((successCount / providersData.length) * 100)}%`);

    } catch (error) {
        console.error('❌ Errore generale:', error);
        process.exit(1);
    }
}

async function createOrUpdateProvider(providerData) {
    // Verifica se il provider esiste già
    console.log(`🔍 Ricerca provider esistente: ${providerData.name}`);
    const existingProvider = await findProviderBySlug(providerData.slug);

    // Piccola pausa dopo la ricerca
    await new Promise(resolve => setTimeout(resolve, 500));

    if (existingProvider) {
        console.log(`🔄 Aggiornamento provider esistente: ${providerData.name}`);
        await updateProvider(existingProvider.documentId, providerData);
    } else {
        console.log(`➕ Creazione nuovo provider: ${providerData.name}`);
        await createProvider(providerData);
    }

    // Pausa dopo ogni operazione
    await new Promise(resolve => setTimeout(resolve, 500));
}

async function findProviderBySlug(slug) {
    try {
        const response = await fetch(`${STRAPI_URL}/api/providers?filters[slug][$eq]=${slug}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.data && data.data.length > 0 ? data.data[0] : null;
    } catch (error) {
        console.error(`Errore nella ricerca del provider ${slug}:`, error.message);
        return null;
    }
}

async function createProvider(providerData) {
    const payload = formatProviderData(providerData);

    const response = await fetch(`${STRAPI_URL}/api/providers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Errore HTTP ${response.status}:`, errorData);
        throw new Error(`Errore nella creazione: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log(`➕ Provider ${providerData.name} creato con ID: ${result.data.documentId}`);
    return result;
}

async function updateProvider(documentId, providerData) {
    const payload = formatProviderData(providerData);

    const response = await fetch(`${STRAPI_URL}/api/providers/${documentId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: payload }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error(`❌ Errore HTTP ${response.status}:`, errorData);
        throw new Error(`Errore nell'aggiornamento: ${response.status} - ${errorData}`);
    }

    const result = await response.json();
    console.log(`🔄 Provider ${providerData.name} aggiornato con ID: ${result.data.documentId}`);
    return result;
}

function formatProviderData(data) {
    // Mappa TUTTI i dati dal JSON al formato Strapi
    const providerData = {
        name: data.name,
        slug: data.slug,
        isVisible: data.isVisible !== false, // Default true se non specificato
        description: data.description || '',
        foundedYear: data.foundedYear || null,
        country: data.country || '',
        website: data.website || '',
        rating: data.rating ? parseFloat(data.rating) : null,
        isPopular: data.isPopular || false,
        licenses: data.licenses || [],
        reviewSummary: data.reviewSummary || '',
        reviewPros: data.reviewPros || [],
        reviewCons: data.reviewCons || [],
        reviewVerdict: data.reviewVerdict || ''
    };

    // Genera SEO automaticamente da dati esistenti
    const metaTitle = `${data.name} - Recensione Casino Provider | Jokerman79`;
    const metaDescription = data.description
        ? data.description.substring(0, 150) + (data.description.length > 150 ? '...' : '')
        : `Scopri ${data.name}: recensione completa, bonus esclusivi e migliori slot online.`;

    providerData.seo = {
        metaTitle: metaTitle.substring(0, 60), // Limita a 60 caratteri
        metaDescription: metaDescription.substring(0, 160), // Limita a 160 caratteri
        keywords: `${data.name}, slot online, casino provider, bonus casino, giochi online`,
        canonicalURL: `/providers/${data.slug}`
    };

    console.log(`📋 Formattando dati per ${data.name}:`, {
        hasDescription: !!providerData.description,
        foundedYear: providerData.foundedYear,
        country: providerData.country,
        hasWebsite: !!providerData.website,
        rating: providerData.rating,
        isPopular: providerData.isPopular,
        licensesCount: providerData.licenses.length,
        hasReviewSummary: !!providerData.reviewSummary,
        prosCount: providerData.reviewPros.length,
        consCount: providerData.reviewCons.length,
        hasVerdict: !!providerData.reviewVerdict
    });

    return providerData;
}

// Avvia lo script
if (require.main === module) {
    loadProviders();
}

module.exports = { loadProviders, createOrUpdateProvider };
