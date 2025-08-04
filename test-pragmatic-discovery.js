const PragmaticProvider = require('./providers/PragmaticProvider');
require('dotenv').config();

async function testPragmaticDiscovery() {
    console.log('🎰 Testing Pragmatic Play Live Game Discovery...\n');

    const config = {
        wsUrl: process.env.PRAGMATIC_WS_URL,
        casinoId: process.env.PRAGMATIC_CASINO_ID
    };

    console.log('Configuration:', {
        wsUrl: config.wsUrl ? 'Configured' : 'Missing',
        casinoId: config.casinoId ? 'Configured' : 'Missing'
    });

    const pragmatic = new PragmaticProvider(config);

    // Track discovered games
    let discoveredGames = 0;

    // Set up event listeners
    pragmatic.onGameUpdate = (update) => {
        if (update.type === 'table_update') {
            console.log('🎯 Table update received:', {
                tableId: update.gameId,
                tableName: update.data.tableName,
                status: update.data.tableOpen ? 'Open' : 'Closed',
                players: update.data.totalSeatedPlayers || 0,
                timestamp: update.timestamp
            });
        } else if (update.type === 'game_result') {
            console.log('🎲 Game result received:', {
                tableId: update.gameId,
                results: update.data.results?.slice(0, 3) || 'No results', // Show first 3 results
                timestamp: update.timestamp
            });
        }
    };

    try {
        console.log('\n📡 Attempting to connect to Pragmatic Play...');
        
        // Load initial state
        await pragmatic.loadInitialState();
        console.log(`✅ Initial state loaded. Starting games: ${pragmatic.games.size}`);

        if (pragmatic.isConnected) {
            console.log('✅ WebSocket connected - listening for live table discoveries...');
            console.log('⏱️  Will monitor for 30 seconds...\n');
            
            // Monitor for game discoveries
            let lastGameCount = pragmatic.games.size;
            const monitor = setInterval(() => {
                const currentGameCount = pragmatic.games.size;
                if (currentGameCount > lastGameCount) {
                    const newGames = currentGameCount - lastGameCount;
                    console.log(`🆕 Discovered ${newGames} new table(s)! Total: ${currentGameCount}`);
                    lastGameCount = currentGameCount;
                }
            }, 2000);

            // Wait and show final results
            setTimeout(() => {
                clearInterval(monitor);
                
                console.log('\n📊 Final Discovery Results:');
                console.log(`- Connected: ${pragmatic.isConnected}`);
                console.log(`- Total tables discovered: ${pragmatic.games.size}`);
                
                if (pragmatic.games.size > 0) {
                    console.log('\n🎮 Discovered Tables:');
                    Array.from(pragmatic.games.values()).slice(0, 5).forEach((game, index) => {
                        console.log(`  ${index + 1}. ${game.name} (${game.id}) - ${game.status}`);
                    });
                    
                    if (pragmatic.games.size > 5) {
                        console.log(`  ... and ${pragmatic.games.size - 5} more tables`);
                    }
                } else {
                    console.log('❓ No tables discovered - this could be normal if no tables are active');
                }

                process.exit(0);
            }, 30000);

        } else {
            console.log('❌ WebSocket not connected - using demo games');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

testPragmaticDiscovery();
