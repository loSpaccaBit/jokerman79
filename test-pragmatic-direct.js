const PragmaticProvider = require('./providers/PragmaticProvider');

async function testPragmaticDirect() {
    console.log('🎯 Testing PragmaticProvider direct connection...');
    
    const provider = new PragmaticProvider({
        wsUrl: 'wss://dga.pragmaticplaylive.net/ws',
        casinoId: 'il9srgw4dna11111'
    });
    
    // Set up message logging
    provider.onGameUpdate = (update) => {
        console.log('📨 onGameUpdate callback called:', update);
    };
    
    try {
        console.log('🔧 Loading initial state...');
        await provider.loadInitialState();
        console.log(`✅ Games loaded: ${provider.games.size}`);
        
        console.log('🔌 Connecting WebSocket...');
        await provider.connectWebSocket();
        console.log('✅ WebSocket connected');
        
        // Hook into WebSocket to see all messages
        const originalOnMessage = provider.ws.onmessage;
        provider.ws.onmessage = (event) => {
            console.log('📨 RAW WebSocket message received:', event.data);
            originalOnMessage.call(provider.ws, event);
        };
        
        console.log('🎯 Setting selected game to 1101...');
        provider.setSelectedGame('1101');
        
        console.log('⏳ Waiting for messages for 30 seconds...');
        setTimeout(() => {
            console.log('⏰ Test completed');
            provider.disconnect();
            process.exit(0);
        }, 30000);
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        process.exit(1);
    }
}

testPragmaticDirect();