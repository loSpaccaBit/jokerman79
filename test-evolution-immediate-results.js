const WebSocket = require('ws');

console.log('🎰 Testing Evolution Immediate Results...\n');

// Start server in background
const { spawn } = require('child_process');
const server = spawn('node', ['server.js'], {
    env: { ...process.env, PORT: '4003' }
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
    
    const ws = new WebSocket('ws://localhost:4003/ws');
    let messageCount = 0;
    let immediateResultsReceived = false;
    
    ws.on('open', () => {
        console.log('✅ WebSocket connected!');
        
        // Subscribe to an Evolution game table
        setTimeout(() => {
            console.log('📤 Subscribing to Evolution Lightning Roulette (vctlz20yfnmp1ylr)...');
            ws.send(JSON.stringify({
                type: 'subscribe_game',
                provider: 'evolution',
                gameId: 'vctlz20yfnmp1ylr' // Lightning Roulette table ID
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
                hasCurrentResults: message.data?.type === 'currentResults',
                hasDealerHand: !!message.data?.dealerHand,
                hasResults: !!message.data?.results,
                hasDisplay: !!message.data?.display
            });
            
            if (message.data?.type === 'currentResults') {
                immediateResultsReceived = true;
                console.log('⚡ IMMEDIATE RESULTS RECEIVED from HTTP /state call!');
            }
        }
    });
    
    ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error.message);
    });
    
    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
    });
    
    // Test for 15 seconds (shorter test since we're checking immediate results)
    setTimeout(() => {
        console.log(`\n📊 Test Summary:`);
        console.log(`- Messages received: ${messageCount}`);
        console.log(`- Immediate results received: ${immediateResultsReceived ? 'YES' : 'NO'}`);
        console.log(`- Test duration: 15 seconds`);
        
        ws.close();
        server.kill();
        
        setTimeout(() => {
            if (immediateResultsReceived) {
                console.log('✅ SUCCESS: Evolution immediate results are working!');
            } else if (messageCount > 0) {
                console.log('⚠️ PARTIAL SUCCESS: Messages received but no immediate results');
            } else {
                console.log('❌ FAILED: No messages received');
            }
            process.exit(0);
        }, 1000);
    }, 15000);
    
}, 3000);