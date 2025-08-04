const EvolutionProvider = require('../providers/EvolutionProvider');
const PragmaticProvider = require('../providers/PragmaticProvider');
require('dotenv').config();

async function testProviders() {
    console.log('🎰 Testing Casino Providers...\n');

    // Test Evolution Gaming
    console.log('=== Evolution Gaming Test ===');
    try {
        const evolutionConfig = {
            hostname: process.env.EVOLUTION_HOSTNAME,
            casinoId: process.env.EVOLUTION_CASINO_ID,
            username: process.env.EVOLUTION_USERNAME,
            password: process.env.EVOLUTION_PASSWORD
        };

        const evolution = new EvolutionProvider(evolutionConfig);
        console.log('✅ Evolution provider created');
        
        await evolution.loadInitialState();
        console.log(`✅ Evolution games loaded: ${evolution.games.size}`);
        
        if (evolution.games.size > 0) {
            const firstGame = Array.from(evolution.games.values())[0];
            console.log('📋 First Evolution game:', firstGame.name, `(${firstGame.id})`);
        }
        
    } catch (error) {
        console.error('❌ Evolution test failed:', error.message);
    }

    console.log('\n=== Pragmatic Play Test ===');
    try {
        const pragmaticConfig = {
            wsUrl: process.env.PRAGMATIC_WS_URL
        };

        const pragmatic = new PragmaticProvider(pragmaticConfig);
        console.log('✅ Pragmatic provider created');
        
        await pragmatic.loadInitialState();
        console.log(`✅ Pragmatic games loaded: ${pragmatic.games.size}`);
        
        if (pragmatic.games.size > 0) {
            const firstGame = Array.from(pragmatic.games.values())[0];
            console.log('📋 First Pragmatic game:', firstGame.name, `(${firstGame.id})`);
        }
        
    } catch (error) {
        console.error('❌ Pragmatic test failed:', error.message);
    }

    console.log('\n🎯 Test completed!');
}

// Run test
testProviders().catch(console.error);