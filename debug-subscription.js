const WebSocket = require('ws');

console.log('🧪 Debug Game Subscription Error...');

const ws = new WebSocket('ws://localhost:4000/ws');

ws.on('open', function open() {
    console.log('✅ Connected to Casino Microservice');
    
    const subscribeMessage = {
        type: 'subscribe_game',
        provider: 'evolution',
        gameId: 'SpeedBlackjack04'
    };
    
    console.log('📡 Sending subscription message:', subscribeMessage);
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data);
        console.log('📨 Received message:', parsed);
        
        if (parsed.type === 'error') {
            console.log('❌ Error details:', {
                message: parsed.message,
                details: parsed.details
            });
        }
        
        // Close after first meaningful response
        if (parsed.type !== 'connection') {
            setTimeout(() => ws.close(), 1000);
        }
        
    } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.log('Raw data:', data.toString());
    }
});

ws.on('close', function close() {
    console.log('🔌 Connection closed');
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
    process.exit(1);
});

// Exit after 10 seconds
setTimeout(() => {
    console.log('⏰ Timeout - closing connection');
    ws.close();
}, 10000);