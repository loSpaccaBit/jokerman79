const PragmaticProvider = require('./providers/PragmaticProvider');
require('dotenv').config();

console.log('🔬 Testing Pragmatic WebSocket Message Reception...');

const config = {
    wsUrl: process.env.PRAGMATIC_WS_URL,
    casinoId: process.env.PRAGMATIC_CASINO_ID
};

console.log('Configuration:', {
    wsUrl: config.wsUrl ? 'Configured' : 'Missing',
    casinoId: config.casinoId ? 'Configured' : 'Missing'
});

const provider = new PragmaticProvider(config);

// Override parseMessage per logging dettagliato
const originalParseMessage = provider.parseMessage.bind(provider);
provider.parseMessage = function(data) {
    console.log('🎯 parseMessage called with:', JSON.stringify(data, null, 2));
    return originalParseMessage(data);
};

// Override handleTableUpdate per logging dettagliato
const originalHandleTableUpdate = provider.handleTableUpdate.bind(provider);
provider.handleTableUpdate = function(data) {
    console.log('🔄 handleTableUpdate called with:', JSON.stringify(data, null, 2));
    return originalHandleTableUpdate(data);
};

// Callback per aggiornamenti
provider.onGameUpdate = (update) => {
    console.log('📤 onGameUpdate triggered:', JSON.stringify(update, null, 2));
};

// Inizializza il provider
provider.loadInitialState()
    .then(() => {
        console.log('✅ Provider initialized, waiting for WebSocket messages...');
        console.log('📊 Games loaded:', provider.games.size);
        
        // Simula la selezione di un gioco per testare la sottoscrizione
        setTimeout(() => {
            if (provider.games.size > 0) {
                const firstGame = Array.from(provider.games.values())[0];
                console.log('🎮 Setting selected game:', firstGame.id);
                provider.setSelectedGame(firstGame);
            } else {
                console.log('🎮 No games available, creating test game for subscription');
                const testGame = { id: '1101', name: 'Test Table 1101' };
                provider.setSelectedGame(testGame);
            }
        }, 3000);
        
        // Monitora per 60 secondi
        setTimeout(() => {
            console.log('⏰ Test completed after 60 seconds');
            console.log('📊 Final game count:', provider.games.size);
            if (provider.games.size > 0) {
                console.log('🎮 Games discovered:');
                Array.from(provider.games.values()).forEach(game => {
                    console.log(`  - ${game.id}: ${game.name}`);
                });
            }
            process.exit(0);
        }, 60000);
    })
    .catch(error => {
        console.error('❌ Failed to initialize provider:', error);
        process.exit(1);
    });
