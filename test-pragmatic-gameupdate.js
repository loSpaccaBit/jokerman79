const WebSocket = require('ws');

console.log('🎰 Testing Pragmatic Game Updates...\n');

// Start server in background
const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '4002' }
});

server.stdout.on('data', (data) => {
    console.log(`[SERVER] ${data.toString().trim()}`);
});

server.stderr.on('data', (data) => {
    console.log(`[SERVER ERROR] ${data.toString().trim()}`);
});

// Wait for server to start
setTimeout(() => {
    console.log('\n🔌 Connecting to WebSocket...');
    
    const ws = new WebSocket('ws://localhost:4002/ws');
    let messageCount = 0;
    
    ws.on('open', () => {
        console.log('✅ WebSocket connected!');
        
        // Subscribe to a Pragmatic game
        setTimeout(() => {
            console.log('📤 Subscribing to Sweet Bonanza CandyLand (1101)...');
            ws.send(JSON.stringify({
                type: 'subscribe_game',
                provider: 'pragmatic',
                gameId: '1101'
            }));
        }, 1000);
    });
    
    ws.on('message', (data) => {
        messageCount++;
        const message = JSON.parse(data.toString());
        console.log(`📨 Message ${messageCount}:`, {
            type: message.type,
            provider: message.provider,
            gameId: message.gameId,
            timestamp: message.timestamp
        });
        
        if (message.type === 'game_update') {
            console.log('🎲 GAME UPDATE RECEIVED!', {
                tableId: message.data?.tableId,
                hasGameResult: !!message.data?.gameResult,
                resultCount: message.data?.gameResult?.length || 0
            });
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
    });
    
    // Test for 30 seconds
    setTimeout(() => {
        console.log(`\n📊 Test Summary:`);
        console.log(`- Messages received: ${messageCount}`);
        console.log(`- Test duration: 30 seconds`);
        
        ws.close();
        server.kill();
        
        setTimeout(() => {
            if (messageCount > 0) {
                console.log('✅ SUCCESS: Pragmatic game updates are working!');
            } else {
                console.log('❌ FAILED: No game updates received');
            }
            process.exit(0);
        }, 1000);
    }, 30000);
    
}, 3000);