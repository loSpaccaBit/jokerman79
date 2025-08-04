require('dotenv').config();
const EvolutionProvider = require('./providers/EvolutionProvider');

async function testEvolutionWebSocket() {
    console.log('🧪 Testing Evolution Gaming WebSocket Connection...');
    
    const config = {
        hostname: process.env.EVOLUTION_HOSTNAME,
        casinoId: process.env.EVOLUTION_CASINO_ID,
        username: process.env.EVOLUTION_USERNAME,
        password: process.env.EVOLUTION_PASSWORD
    };
    
    console.log('📋 Configuration:', {
        hostname: config.hostname,
        casinoId: config.casinoId,
        username: config.username,
        passwordSet: !!config.password
    });
    
    const evolution = new EvolutionProvider(config);
    
    try {
        // First load the initial state to make sure API works
        console.log('🔄 Loading initial state...');
        await evolution.loadInitialState();
        console.log(`✅ Successfully loaded ${evolution.games.size} games`);
        
        // Now try to connect WebSocket
        console.log('🔌 Attempting WebSocket connection...');
        await evolution.connectWebSocket();
        console.log('✅ WebSocket connection successful!');
        
        // Wait for some messages
        console.log('⏱️  Waiting 10 seconds for messages...');
        setTimeout(() => {
            console.log('🔌 Disconnecting...');
            evolution.disconnect();
            process.exit(0);
        }, 10000);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

testEvolutionWebSocket();