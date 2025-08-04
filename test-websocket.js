const WebSocket = require('ws');

// Test WebSocket connection to the casino microservice
console.log('🧪 Testing Casino Microservice WebSocket Connection...');

const ws = new WebSocket('ws://localhost:4000/ws');

ws.on('open', function open() {
    console.log('✅ Connected to Casino Microservice WebSocket');
    
    // Test game subscription to an open Evolution Gaming table
    console.log('📡 Subscribing to Speed VIP Blackjack D (SpeedBlackjack04)...');
    
    const subscribeMessage = {
        type: 'subscribe_game',
        provider: 'evolution',
        gameId: 'SpeedBlackjack04'
    };
    
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data);
        console.log('📨 Received message:', {
            type: parsed.type,
            provider: parsed.provider,
            gameId: parsed.gameId,
            timestamp: parsed.timestamp
        });
        
        if (parsed.type === 'game_update') {
            console.log('🎯 Live game update received:', {
                gameType: parsed.data?.data?.type,
                tableId: parsed.data?.data?.tableId,
                hasResults: !!parsed.data?.data?.results
            });
        }
        
        if (parsed.type === 'subscription_success') {
            console.log('✅ Successfully subscribed to live updates!');
            console.log('⏱️  Waiting 30 seconds for live messages...');
            
            // Auto-unsubscribe after 30 seconds
            setTimeout(() => {
                console.log('🔌 Unsubscribing and closing connection...');
                ws.send(JSON.stringify({
                    type: 'unsubscribe_game',
                    provider: 'evolution',
                    gameId: 'SpeedBlackjack04'
                }));
                
                setTimeout(() => {
                    ws.close();
                }, 1000);
            }, 30000);
        }
        
    } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.log('Raw data:', data.toString());
    }
});

ws.on('close', function close() {
    console.log('🔌 WebSocket connection closed');
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
    process.exit(1);
});

// Exit after 35 seconds maximum
setTimeout(() => {
    console.log('⏰ Test timeout - closing connection');
    ws.close();
}, 35000);