const WebSocket = require('ws');

console.log('🧪 Testing Live Updates Flow...');

const ws = new WebSocket('ws://localhost:4000/ws');

let updateCount = 0;

ws.on('open', function open() {
    console.log('✅ Connected to Casino Microservice');
    
    const subscribeMessage = {
        type: 'subscribe_game',
        provider: 'evolution',
        gameId: 'SpeedBlackjack04'
    };
    
    console.log('📡 Subscribing to Speed VIP Blackjack D (SpeedBlackjack04)...');
    ws.send(JSON.stringify(subscribeMessage));
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data);
        
        if (parsed.type === 'connection') {
            console.log('🔗 Connection established with providers:', parsed.providers);
        } else if (parsed.type === 'subscription_success') {
            console.log('✅ Successfully subscribed to live updates!');
            console.log('⏱️  Waiting 60 seconds for live messages...');
        } else if (parsed.type === 'game_update') {
            updateCount++;
            console.log(`📊 Live Update #${updateCount}:`, {
                provider: parsed.provider,
                gameId: parsed.gameId,
                messageType: parsed.data?.data?.type,
                tableId: parsed.data?.data?.tableId,
                timestamp: parsed.timestamp,
                hasResults: !!parsed.data?.data?.results,
                hasPlayers: !!parsed.data?.data?.players
            });
            
            if (parsed.data?.data?.type && parsed.data.data.type.endsWith('ResultsUpdated')) {
                console.log('🎲 GAME RESULT DETECTED:', {
                    type: parsed.data.data.type,
                    tableId: parsed.data.data.tableId,
                    results: parsed.data.data.results || 'No results in message'
                });
            }
        } else if (parsed.type === 'error') {
            console.log('❌ Error:', parsed.message, parsed.details);
        } else {
            console.log('📨 Other message:', parsed.type);
        }
        
    } catch (error) {
        console.error('❌ Error parsing message:', error);
        console.log('Raw data:', data.toString());
    }
});

ws.on('close', function close() {
    console.log('🔌 Connection closed');
    console.log(`📊 Total live updates received: ${updateCount}`);
    process.exit(0);
});

ws.on('error', function error(err) {
    console.error('❌ WebSocket error:', err);
    process.exit(1);
});

// Auto-close after 60 seconds
setTimeout(() => {
    console.log('⏰ Test complete - closing connection');
    console.log(`📊 Total live updates received: ${updateCount}`);
    
    if (updateCount === 0) {
        console.log('⚠️  No live updates were received during the test period.');
        console.log('   This could be normal if the selected game had no activity.');
    } else {
        console.log('✅ Live updates are working correctly!');
    }
    
    ws.close();
}, 60000);