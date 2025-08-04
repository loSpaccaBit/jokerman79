/**
 * Script per aggiornare Sweet Bonanza con gli assets dei risultati
 * Eseguire dopo aver caricato le immagini in Strapi
 */

const STRAPI_URL = 'http://localhost:1337/api';

// Mappatura dei simboli di Sweet Bonanza agli assets
const SWEET_BONANZA_ASSET_MAPPING = {
    'apple': 'sweet_apple.png',
    'banana': 'sweet_banana.png',
    'grapes': 'sweet_grapes.png',
    'watermelon': 'sweet_watermelon.png',
    'plum': 'sweet_plum.png',
    'cherry': 'sweet_cherry.png',
    'heart': 'sweet_heart.png',
    'diamond': 'sweet_diamond.png',
    'spade': 'sweet_spade.png',
    'club': 'sweet_club.png',
    'lollipop': 'sweet_lollipop.png',
    'bomb': 'sweet_bomb.png',
    'scatter': 'sweet_scatter.png',
    'multiplier': 'sweet_multiplier.png'
};

// Esempio per altri giochi
const MEGA_WHEEL_ASSET_MAPPING = {
    '1': 'wheel_1.png',
    '2': 'wheel_2.png',
    '5': 'wheel_5.png',
    '10': 'wheel_10.png',
    '20': 'wheel_20.png',
    '40': 'wheel_40.png',
    'bonus': 'wheel_bonus.png'
};

const ROULETTE_ASSET_MAPPING = {
    // Numeri rossi
    '1': 'roulette_1_red.png',
    '3': 'roulette_3_red.png',
    '5': 'roulette_5_red.png',
    '7': 'roulette_7_red.png',
    '9': 'roulette_9_red.png',
    '12': 'roulette_12_red.png',
    '14': 'roulette_14_red.png',
    '16': 'roulette_16_red.png',
    '18': 'roulette_18_red.png',
    '19': 'roulette_19_red.png',
    '21': 'roulette_21_red.png',
    '23': 'roulette_23_red.png',
    '25': 'roulette_25_red.png',
    '27': 'roulette_27_red.png',
    '30': 'roulette_30_red.png',
    '32': 'roulette_32_red.png',
    '34': 'roulette_34_red.png',
    '36': 'roulette_36_red.png',
    // Numeri neri
    '2': 'roulette_2_black.png',
    '4': 'roulette_4_black.png',
    '6': 'roulette_6_black.png',
    '8': 'roulette_8_black.png',
    '10': 'roulette_10_black.png',
    '11': 'roulette_11_black.png',
    '13': 'roulette_13_black.png',
    '15': 'roulette_15_black.png',
    '17': 'roulette_17_black.png',
    '20': 'roulette_20_black.png',
    '22': 'roulette_22_black.png',
    '24': 'roulette_24_black.png',
    '26': 'roulette_26_black.png',
    '28': 'roulette_28_black.png',
    '29': 'roulette_29_black.png',
    '31': 'roulette_31_black.png',
    '33': 'roulette_33_black.png',
    '35': 'roulette_35_black.png',
    // Zero verde
    '0': 'roulette_0_green.png'
};

async function updateGameAssets(gameId, assetMapping) {
    try {
        console.log(`🎨 Aggiornamento assets per ${gameId}...`);

        // Prima ottieni il gioco esistente
        const gameResponse = await fetch(`${STRAPI_URL}/live-games?filters[gameId][$eq]=${gameId}`);
        const gameData = await gameResponse.json();

        if (!gameData.data || gameData.data.length === 0) {
            console.error(`❌ Gioco ${gameId} non trovato`);
            return;
        }

        const game = gameData.data[0];
        console.log(`✅ Trovato gioco: ${game.name}`);

        // Aggiorna con la mappatura degli assets
        const updateResponse = await fetch(`${STRAPI_URL}/live-games/${game.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                data: {
                    assetMapping: assetMapping
                }
            })
        });

        if (updateResponse.ok) {
            console.log(`✅ Assets mapping aggiornato per ${gameId}`);
        } else {
            console.error(`❌ Errore aggiornamento ${gameId}:`, await updateResponse.text());
        }

    } catch (error) {
        console.error(`❌ Errore per ${gameId}:`, error);
    }
}

async function updateAllGameAssets() {
    console.log('🎯 Aggiornamento mappature assets per tutti i giochi...');

    await updateGameAssets('sweet-bonanza-candyland', SWEET_BONANZA_ASSET_MAPPING);
    await updateGameAssets('mega-wheels', MEGA_WHEEL_ASSET_MAPPING);
    await updateGameAssets('roulette', ROULETTE_ASSET_MAPPING);

    console.log('🎉 Aggiornamento completato!');
    console.log('');
    console.log('📝 Prossimi passi:');
    console.log('1. Carica le immagini corrispondenti in Strapi Admin');
    console.log('2. Assicurati che i nomi dei file corrispondano alla mappatura');
    console.log('3. Testa la visualizzazione nella pagina del gioco');
}

// Esegui se chiamato direttamente
if (require.main === module) {
    updateAllGameAssets();
}

module.exports = {
    updateGameAssets,
    updateAllGameAssets,
    SWEET_BONANZA_ASSET_MAPPING,
    MEGA_WHEEL_ASSET_MAPPING,
    ROULETTE_ASSET_MAPPING
};
