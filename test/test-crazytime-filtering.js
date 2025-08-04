const EvolutionProvider = require('../providers/EvolutionProvider');
require('dotenv').config();

async function testCrazyTimeFiltering() {
    console.log('🎰 Testing CrazyTime Filtering...\n');

    try {
        const evolutionConfig = {
            hostname: process.env.EVOLUTION_HOSTNAME,
            casinoId: process.env.EVOLUTION_CASINO_ID,
            username: process.env.EVOLUTION_USERNAME,
            password: process.env.EVOLUTION_PASSWORD
        };

        const evolution = new EvolutionProvider(evolutionConfig);
        console.log('✅ Evolution provider created');
        
        // Load initial state
        await evolution.loadInitialState();
        console.log(`✅ Evolution games loaded: ${evolution.games.size}`);
        
        // Find CrazyTime games
        const crazyTimeGames = [];
        for (const [id, game] of evolution.games.entries()) {
            if (game.name && game.name.toLowerCase().includes('crazy time')) {
                crazyTimeGames.push({ id, name: game.name });
            }
        }
        
        // Debug: show all games to understand structure
        if (crazyTimeGames.length === 0) {
            console.log('🔍 Debug: First 5 games in Evolution:');
            let count = 0;
            for (const [id, game] of evolution.games.entries()) {
                if (count < 5) {
                    console.log(`  ${id}: ${game.name} (type: ${game.gameType})`);
                    count++;
                }
            }
            
            // Try searching for CrazyTime specifically by ID pattern
            console.log('🔍 Searching for CrazyTime by ID pattern:');
            for (const [id, game] of evolution.games.entries()) {
                if (id.startsWith('CrazyTime')) {
                    crazyTimeGames.push({ id, name: game.name });
                    console.log(`  Found: ${id} - ${game.name}`);
                }
            }
            
            // If still not found, manually add known CrazyTime IDs
            if (crazyTimeGames.length === 0) {
                console.log('🔍 Manually adding known CrazyTime IDs...');
                const knownCrazyTimeIds = ['CrazyTime0000001', 'CrazyTime0000002'];
                for (const id of knownCrazyTimeIds) {
                    crazyTimeGames.push({ id, name: 'Crazy Time' });
                    console.log(`  Added: ${id} - Crazy Time (manual)`);
                }
            }
        }
        
        console.log('🎯 Found CrazyTime games:', crazyTimeGames);
        
        if (crazyTimeGames.length === 0) {
            console.log('❌ No CrazyTime games found');
            return;
        }
        
        // Subscribe to first CrazyTime game
        const targetGame = crazyTimeGames[0];
        console.log(`🔔 Subscribing to: ${targetGame.name} (${targetGame.id})`);
        
        // Setup message listener with detailed logging
        let messageCount = 0;
        const messageTypes = new Map();
        const messageTables = new Map();
        
        evolution.onGameUpdate = (data) => {
            messageCount++;
            const type = data.type || 'unknown';
            const tableId = data.data ? data.data.tableId : data.gameId;
            
            // Count message types
            messageTypes.set(type, (messageTypes.get(type) || 0) + 1);
            
            // Track which tables send messages
            if (tableId) {
                messageTables.set(tableId, (messageTables.get(tableId) || 0) + 1);
            }
            
            // Log unexpected messages (not from CrazyTime)
            if (tableId && tableId !== targetGame.id) {
                console.log(`🚨 UNWANTED MESSAGE from ${tableId}:`, {
                    type: type,
                    expectedTable: targetGame.id,
                    actualTable: tableId,
                    messageData: data.data
                });
            } else if (tableId === targetGame.id) {
                console.log(`✅ CORRECT MESSAGE from ${tableId}:`, {
                    type: type,
                    timestamp: data.timestamp
                });
            } else {
                console.log(`⚠️  GLOBAL MESSAGE (no tableId):`, {
                    type: type,
                    data: data.data
                });
            }
        };
        
        // Add subscription to specific CrazyTime game
        await evolution.addSubscription(targetGame);
        
        // Connect WebSocket
        console.log('🔌 Connecting to Evolution WebSocket...');
        await evolution.connectWebSocket();
        console.log('✅ WebSocket connected');
        
        // Wait for messages
        console.log('⏳ Monitoring messages for 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        console.log(`\n📊 FILTERING ANALYSIS:`);
        console.log(`Total messages received: ${messageCount}`);
        console.log(`Subscribed to: ${targetGame.name} (${targetGame.id})`);
        
        console.log(`\n📈 Message Types:`);
        for (const [type, count] of messageTypes.entries()) {
            console.log(`  ${type}: ${count}`);
        }
        
        console.log(`\n🎯 Messages by Table:`);
        for (const [tableId, count] of messageTables.entries()) {
            const isTarget = tableId === targetGame.id;
            const indicator = isTarget ? '✅' : '🚨';
            console.log(`  ${indicator} ${tableId}: ${count} messages${isTarget ? ' (TARGET)' : ' (UNWANTED)'}`);
        }
        
        // Check filtering effectiveness
        let unwantedMessages = 0;
        for (const [tableId, count] of messageTables.entries()) {
            if (tableId !== targetGame.id) {
                unwantedMessages += count;
            }
        }
        
        const filteringEffectiveness = messageCount > 0 ? 
            ((messageCount - unwantedMessages) / messageCount * 100).toFixed(1) : 0;
        
        console.log(`\n🎯 FILTERING EFFECTIVENESS: ${filteringEffectiveness}%`);
        console.log(`   Wanted: ${messageCount - unwantedMessages}`);
        console.log(`   Unwanted: ${unwantedMessages}`);
        
        // Cleanup
        evolution.disconnect();
        console.log('🔌 Disconnected');
        
    } catch (error) {
        console.error('❌ CrazyTime filtering test failed:', error.message);
        console.error(error.stack);
    }
}

// Run test
testCrazyTimeFiltering().catch(console.error);