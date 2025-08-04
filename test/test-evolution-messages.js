const EvolutionProvider = require('../providers/EvolutionProvider');
require('dotenv').config();

async function testEvolutionMessages() {
    console.log('🎰 Testing Evolution Messages...\n');

    try {
        const evolutionConfig = {
            hostname: process.env.EVOLUTION_HOSTNAME,
            casinoId: process.env.EVOLUTION_CASINO_ID,
            username: process.env.EVOLUTION_USERNAME,
            password: process.env.EVOLUTION_PASSWORD
        };

        const evolution = new EvolutionProvider(evolutionConfig);
        console.log('✅ Evolution provider created');
        
        // Load initial state
        await evolution.loadInitialState();
        console.log(`✅ Evolution games loaded: ${evolution.games.size}`);
        
        // Setup message listener
        let messageCount = 0;
        evolution.onGameUpdate = (data) => {
            messageCount++;
            console.log(`📨 Message ${messageCount}:`, {
                type: data.type,
                gameId: data.gameId,
                timestamp: data.timestamp
            });
            
            if (data.data && data.data.tableId) {
                console.log(`   TableId: ${data.data.tableId}`);
            }
        };
        
        // Connect WebSocket
        console.log('🔌 Connecting to Evolution WebSocket...');
        await evolution.connectWebSocket();
        console.log('✅ WebSocket connected');
        
        // Wait for messages
        console.log('⏳ Waiting for messages (30 seconds)...');
        await new Promise(resolve => setTimeout(resolve, 30000));
        
        console.log(`\n📊 Total messages received: ${messageCount}`);
        
        // Cleanup
        evolution.disconnect();
        console.log('🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ Evolution messages test failed:', error.message);
        console.error(error.stack);
    }
}

// Run test
testEvolutionMessages().catch(console.error);