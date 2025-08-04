const WebSocket = require('ws');
require('dotenv').config();

console.log('🔬 Testing direct Pragmatic WebSocket connection...');

const wsUrl = process.env.PRAGMATIC_WS_URL;
const casinoId = process.env.PRAGMATIC_CASINO_ID;

console.log('Config:', { wsUrl, casinoId });

const ws = new WebSocket(wsUrl);

ws.on('open', () => {
    console.log('✅ WebSocket connected');
    
    // Send authentication
    const authMessage = {
        casino_id: casinoId,
        timestamp: new Date().getTime()
    };
    
    console.log('🔐 Sending auth:', JSON.stringify(authMessage));
    ws.send(JSON.stringify(authMessage));
    
    // Subscribe to table 1101
    setTimeout(() => {
        const subscribeMessage = {
            action: 'subscribe',
            table_id: '1101',
            casino_id: casinoId
        };
        
        console.log('🔔 Subscribing to table 1101:', JSON.stringify(subscribeMessage));
        ws.send(JSON.stringify(subscribeMessage));
    }, 2000);
});

ws.on('message', (data) => {
    console.log('📨 Raw message received:', data.toString());
    try {
        const parsed = JSON.parse(data);
        console.log('📨 Parsed message:', JSON.stringify(parsed, null, 2));
    } catch (e) {
        console.log('📨 Non-JSON message:', data.toString());
    }
});

ws.on('close', (code, reason) => {
    console.log('🔌 WebSocket closed:', code, reason.toString());
});

ws.on('error', (error) => {
    console.error('❌ WebSocket error:', error);
});

// Keep alive for 60 seconds
setTimeout(() => {
    console.log('⏰ Test completed');
    ws.close();
    process.exit(0);
}, 60000);
