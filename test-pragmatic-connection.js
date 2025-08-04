const PragmaticProvider = require('./providers/PragmaticProvider');
require('dotenv').config();

async function testPragmaticConnection() {
    console.log('🎰 Testing Pragmatic Play WebSocket Connection...\n');

    const config = {
        wsUrl: process.env.PRAGMATIC_WS_URL,
        casinoId: process.env.PRAGMATIC_CASINO_ID
    };

    console.log('Configuration:', {
        wsUrl: config.wsUrl ? 'Configured' : 'Missing',
        casinoId: config.casinoId ? 'Configured' : 'Missing'
    });

    const pragmatic = new PragmaticProvider(config);

    // Set up event listeners
    pragmatic.onGameUpdate = (update) => {
        console.log('🎯 Game update received:', {
            type: update.type,
            gameId: update.gameId,
            timestamp: update.timestamp
        });
    };

    try {
        console.log('\n📡 Attempting to connect to Pragmatic Play...');
        
        // Load initial state (includes connection attempt)
        await pragmatic.loadInitialState();
        console.log(`✅ Initial state loaded. Games: ${pragmatic.games.size}`);

        // Try WebSocket connection
        await pragmatic.connectWebSocket();
        console.log('✅ WebSocket connection attempt completed');

        // Wait a bit to see if we get any messages
        console.log('\n⏳ Waiting for messages...');
        setTimeout(() => {
            console.log('\n📊 Final status:');
            console.log(`- Connected: ${pragmatic.isConnected}`);
            console.log(`- Games loaded: ${pragmatic.games.size}`);
            
            if (pragmatic.games.size > 0) {
                const firstGame = Array.from(pragmatic.games.values())[0];
                console.log(`- First game: ${firstGame.name} (${firstGame.id})`);
            }

            process.exit(0);
        }, 10000);

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testPragmaticConnection();
