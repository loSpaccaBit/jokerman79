const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:4000/ws');

ws.on('open', () => {
    console.log('🔌 Connected to server WebSocket');
    
    // Subscribe to Pragmatic game
    const subscribeMessage = {
        type: 'subscribe_game',
        provider: 'pragmatic',
        gameId: '1101'
    };
    
    console.log('📤 Sending subscription:', subscribeMessage);
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', (data) => {
    try {
        const message = JSON.parse(data.toString());
        console.log('📨 Received:', message);
        
        // After subscription success, wait for game updates
        if (message.type === 'subscription_success') {
            console.log('✅ Subscription successful, waiting for updates...');
        } else if (message.type === 'game_update') {
            console.log('🎯 Game update received!', {
                provider: message.provider,
                gameId: message.gameId,
                type: message.data?.type
            });
        }
    } catch (error) {
        console.error('❌ Failed to parse message:', error);
    }
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
});

ws.on('close', (code, reason) => {
    console.log('🔌 WebSocket closed:', code, reason.toString());
});

// Keep alive for 30 seconds
setTimeout(() => {
    console.log('⏰ Test completed');
    ws.close();
}, 30000);