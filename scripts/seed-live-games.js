/**
 * Script per popolare il database con i giochi live iniziali
 */

const liveGamesData = [
    {
        gameId: 'roulette',
        name: 'Mega Roulette',
        description: 'Roulette dal vivo con moltiplicatori fino a 500x',
        gameType: 'ROULETTE',
        category: 'Table Games',
        tableIds: ['204', '205', '206', '207', '208', '209', '210'],
        icon: '🎰',
        color: 'bg-red-500',
        isActive: true,
        sortOrder: 1,
        minBet: 0.1,
        maxBet: 10000,
        features: ['Moltiplicatori Live', 'Dealer Professionali', 'HD Streaming'],
        publishedAt: new Date().toISOString()
    },
    {
        gameId: 'dragon-tiger',
        name: 'Dragon Tiger',
        description: 'Gioco di carte veloce e semplice',
        gameType: 'DRAGONTIGER',
        category: 'Card Games',
        tableIds: ['1001', '1002'],
        icon: '🐉',
        color: 'bg-orange-500',
        isActive: true,
        sortOrder: 2,
        minBet: 0.1,
        maxBet: 5000,
        features: ['Gioco Veloce', 'Regole Semplici', 'Alta Frequenza'],
        publishedAt: new Date().toISOString()
    },
    {
        gameId: 'boom-city',
        name: 'Boom City',
        description: 'Game show con ruota dei moltiplicatori',
        gameType: 'GAMESHOW',
        category: 'Game Shows',
        tableIds: ['1401'],
        icon: '💥',
        color: 'bg-purple-500',
        isActive: true,
        sortOrder: 3,
        minBet: 0.2,
        maxBet: 3000,
        features: ['Show Interattivo', 'Moltiplicatori Elevati', 'Bonus Round'],
        publishedAt: new Date().toISOString()
    },
    {
        gameId: 'sweet-bonanza-candyland',
        name: 'Sweet Bonanza CandyLand',
        description: 'Game show a tema dolciario',
        gameType: 'SWEETBONANZA',
        category: 'Game Shows',
        tableIds: ['1101'],
        icon: '🍭',
        color: 'bg-pink-500',
        isActive: true,
        sortOrder: 4,
        minBet: 0.2,
        maxBet: 3000,
        features: ['Tema Sweet', 'Sugar Bomb', 'Free Spins Wheel'],
        publishedAt: new Date().toISOString()
    },
    {
        gameId: 'mega-wheels',
        name: 'Mega Wheel',
        description: 'Ruota della fortuna con grandi premi',
        gameType: 'MEGAWHEEL',
        category: 'Game Shows',
        tableIds: ['801'],
        icon: '🎡',
        color: 'bg-blue-500',
        isActive: true,
        sortOrder: 5,
        minBet: 0.1,
        maxBet: 1000,
        features: ['Moltiplicatori x500', 'Jackpot Progressivo', 'Bonus Spins'],
        publishedAt: new Date().toISOString()
    },
    {
        gameId: 'andar-bahar',
        name: 'Andar Bahar',
        description: 'Tradizionale gioco di carte indiano',
        gameType: 'ANDARBAHAR',
        category: 'Card Games',
        tableIds: ['1024', '1301', '1320', '1501', '1701'],
        icon: '🃏',
        color: 'bg-green-500',
        isActive: true,
        sortOrder: 6,
        minBet: 0.1,
        maxBet: 5000,
        features: ['Gioco Tradizionale', 'Scommesse Laterali', 'Payout Elevati'],
        publishedAt: new Date().toISOString()
    }
];

async function seedLiveGames() {
    try {
        console.log('🌱 Inizio seeding dei Live Games...');

        for (const gameData of liveGamesData) {
            // Controlla se il gioco esiste già
            const existingGame = await strapi.entityService.findMany('api::live-game.live-game', {
                filters: {
                    gameId: gameData.gameId
                }
            });

            if (existingGame.length === 0) {
                // Crea il nuovo gioco
                await strapi.entityService.create('api::live-game.live-game', {
                    data: gameData
                });
                console.log(`✅ Creato gioco: ${gameData.name}`);
            } else {
                console.log(`⚠️ Gioco già esistente: ${gameData.name}`);
            }
        }

        console.log('🎉 Seeding completato!');
    } catch (error) {
        console.error('❌ Errore durante il seeding:', error);
    }
}

// Esporta la funzione per l'uso in altri script
module.exports = { seedLiveGames, liveGamesData };
