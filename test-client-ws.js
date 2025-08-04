const WebSocket = require('ws');

console.log('🧪 Testing WebSocket connection from client perspective...');

const wsUrl = 'ws://localhost:4000/ws';
console.log('📡 Connecting to:', wsUrl);

const ws = new WebSocket(wsUrl);

ws.on('open', function open() {
    console.log('✅ WebSocket connection successful!');
    
    // Send a test message
    const testMessage = {
        type: 'get_games'
    };
    
    console.log('📨 Sending test message:', testMessage);
    ws.send(JSON.stringify(testMessage));
});

ws.on('message', function message(data) {
    try {
        const parsed = JSON.parse(data);
        console.log('📨 Received message type:', parsed.type);
        console.log('📨 Full message:', parsed);
        
        // Close after getting response
        setTimeout(() => {
            console.log('🔌 Closing connection...');
            ws.close();
        }, 2000);
        
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

// Exit after 10 seconds
setTimeout(() => {
    console.log('⏰ Test timeout - closing connection');
    ws.close();
}, 10000);