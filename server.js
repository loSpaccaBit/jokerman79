const express = require('express');
const cors = require('cors');
const https = require('https');
const WebSocket = require('ws');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
}));
app.use(express.json());

// Import providers (converted to Node.js modules)
const EvolutionProvider = require('./providers/EvolutionProvider');
const PragmaticProvider = require('./providers/PragmaticProvider');

// Provider instances
const providers = new Map();

// WebSocket clients management
const clients = new Set();

// Provider configuration
const evolutionConfig = {
    hostname: process.env.EVOLUTION_HOSTNAME,
    casinoId: process.env.EVOLUTION_CASINO_ID,
    username: process.env.EVOLUTION_USERNAME,
    password: process.env.EVOLUTION_PASSWORD
};

const pragmaticConfig = {
    wsUrl: process.env.PRAGMATIC_WS_URL,
    casinoId: process.env.PRAGMATIC_CASINO_ID
};

// Initialize providers
async function initializeProviders() {
    console.log('🚀 Initializing Casino Providers...');
    
    try {
        // Initialize Evolution Gaming
        if (evolutionConfig.hostname && evolutionConfig.casinoId) {
            console.log('🎮 Initializing Evolution Gaming...');
            const evolutionProvider = new EvolutionProvider(evolutionConfig);
            await evolutionProvider.loadInitialState();
            providers.set('evolution', evolutionProvider);
            console.log('✅ Evolution Gaming initialized');
        } else {
            console.warn('⚠️ Evolution Gaming configuration missing');
        }

        // Initialize Pragmatic Play
        if (pragmaticConfig.wsUrl && pragmaticConfig.casinoId) {
            console.log('🎮 Initializing Pragmatic Play...');
            const pragmaticProvider = new PragmaticProvider(pragmaticConfig);
            await pragmaticProvider.loadInitialState();
            providers.set('pragmatic', pragmaticProvider);
            console.log('✅ Pragmatic Play initialized');
        } else {
            console.warn('⚠️ Pragmatic Play configuration missing');
        }

        console.log(`🎯 ${providers.size} providers initialized successfully`);
        
    } catch (error) {
        console.error('❌ Failed to initialize providers:', error);
        throw error;
    }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    const providersStatus = {};
    for (const [name, provider] of providers) {
        providersStatus[name] = {
            connected: provider.isConnected || false,
            gameCount: provider.games.size
        };
    }
    
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: providersStatus
    });
});

// Get all providers
app.get('/api/providers', (req, res) => {
    const providerList = Array.from(providers.entries()).map(([name, provider]) => ({
        id: name,
        name: provider.name,
        isConnected: provider.isConnected || false,
        gameCount: provider.games.size,
        games: Array.from(provider.games.values())
    }));
    
    res.json(providerList);
});

// Get specific provider
app.get('/api/providers/:name', (req, res) => {
    const { name } = req.params;
    const provider = providers.get(name);
    
    if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
    }
    
    res.json({
        id: name,
        name: provider.name,
        isConnected: provider.isConnected || false,
        gameCount: provider.games.size,
        games: Array.from(provider.games.values())
    });
});

// Get games from specific provider
app.get('/api/providers/:name/games', (req, res) => {
    const { name } = req.params;
    const provider = providers.get(name);
    
    if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
    }
    
    const games = Array.from(provider.games.values());
    res.json({
        provider: name,
        gameCount: games.length,
        games: games
    });
});

// Get specific game details
app.get('/api/providers/:name/games/:id', (req, res) => {
    const { name, id } = req.params;
    const provider = providers.get(name);
    
    if (!provider) {
        return res.status(404).json({ error: 'Provider not found' });
    }
    
    const game = provider.games.get(id);
    if (!game) {
        return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
});

// Evolution Gaming proxy endpoints
app.all('/api/evolution/*', async (req, res) => {
    const evolutionProvider = providers.get('evolution');
    if (!evolutionProvider) {
        return res.status(503).json({ error: 'Evolution Gaming not available' });
    }
    
    try {
        // Forward request to Evolution Gaming API
        const path = req.params[0];
        const result = await evolutionProvider.proxyRequest(path, {
            method: req.method,
            body: req.body,
            query: req.query
        });
        
        res.json(result);
    } catch (error) {
        console.error('Evolution proxy error:', error);
        res.status(500).json({ error: 'Evolution API request failed' });
    }
});

// Strapi sync endpoint
app.post('/api/sync/strapi', async (req, res) => {
    try {
        const results = {};
        
        for (const [name, provider] of providers) {
            try {
                if (provider.syncWithStrapi) {
                    results[name] = await provider.syncWithStrapi();
                } else {
                    results[name] = { skipped: 'Sync not implemented' };
                }
            } catch (error) {
                results[name] = { error: error.message };
            }
        }
        
        res.json({
            success: true,
            results: results
        });
    } catch (error) {
        console.error('Sync error:', error);
        res.status(500).json({ error: 'Sync failed' });
    }
});

// Create HTTP server
const server = require('http').createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ 
    server,
    path: '/ws'
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
    console.log('🔌 New WebSocket connection');
    clients.add(ws);
    
    // Send initial connection message
    ws.send(JSON.stringify({
        type: 'connection',
        status: 'connected',
        providers: Array.from(providers.keys()),
        timestamp: new Date().toISOString()
    }));
    
    // Handle client messages
    ws.on('message', async (message) => {
        try {
            const data = JSON.parse(message);
            console.log('📨 WebSocket message received:', data);
            
            switch (data.type) {
                case 'subscribe_game':
                    await handleGameSubscription(ws, data);
                    break;
                    
                case 'unsubscribe_game':
                    await handleGameUnsubscription(ws, data);
                    break;
                    
                default:
                    console.log('Unknown message type:', data.type);
            }
        } catch (error) {
            console.error('WebSocket message error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid message format',
                timestamp: new Date().toISOString()
            }));
        }
    });
    
    // Handle disconnection
    ws.on('close', () => {
        console.log('🔌 WebSocket disconnected');
        clients.delete(ws);
    });
    
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        clients.delete(ws);
    });
});

// Game subscription handler
async function handleGameSubscription(ws, data) {
    const { provider: providerName, gameId } = data;
    
    console.log(`🎯 Subscribing to ${providerName} game: ${gameId}`);
    
    const provider = providers.get(providerName);
    if (!provider) {
        ws.send(JSON.stringify({
            type: 'error',
            message: `Provider ${providerName} not found`,
            timestamp: new Date().toISOString()
        }));
        return;
    }
    
    // Get provider state for logging
    console.log('📋 Provider state:', {
        name: provider.name,
        isConnected: provider.isConnected,
        wsState: provider.ws?.readyState,
        gameCount: provider.games.size
    });
    
    try {
        // Find the game
        const game = provider.games.get(gameId) || { id: gameId, name: gameId };
        console.log('✅ Selected game set:', game);
        
        // Set selected game
        provider.setSelectedGame(game);
        
        // Connect WebSocket if not already connected
        if (!provider.isConnected || !provider.ws || provider.ws.readyState !== WebSocket.OPEN) {
            console.log(`🔌 Connecting to ${providerName} WebSocket...`);
            await provider.connectWebSocket();
        }
        
        // Set up message forwarding from provider to client
        // IMPORTANTE: Pragmatic Play messages NON devono essere filtrati
        // Le risposte di Pragmatic sono diverse da Evolution e arrivano già specifiche per il tavolo
        provider.onGameUpdate = (gameUpdate) => {
            if (ws.readyState === WebSocket.OPEN) {
                if (providerName === 'pragmatic') {
                    // Pragmatic: nessun filtro, inoltra direttamente
                    console.log(`🎯 [PRAGMATIC] Forwarding update without filters for game: ${gameId}`);
                    ws.send(JSON.stringify({
                        type: 'game_update',
                        provider: providerName,
                        gameId,
                        data: gameUpdate,
                        timestamp: new Date().toISOString()
                    }));
                } else {
                    // Altri provider (Evolution): usa filtri
                    if (provider.isRelevantMessage && provider.isRelevantMessage(gameUpdate.data, provider.selectedGame)) {
                        console.log(`🎯 [${providerName.toUpperCase()}] Forwarding filtered update for game: ${gameId}`);
                        ws.send(JSON.stringify({
                            type: 'game_update',
                            provider: providerName,
                            gameId,
                            data: gameUpdate,
                            timestamp: new Date().toISOString()
                        }));
                    } else {
                        console.log(`🚫 [${providerName.toUpperCase()}] Update filtered out for game: ${gameId}`);
                    }
                }
            }
        };
        
        console.log(`✅ WebSocket connection successful for ${providerName}`);
        
        // Send confirmation
        ws.send(JSON.stringify({
            type: 'subscription_success',
            provider: providerName,
            gameId: gameId,
            timestamp: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error(`❌ Failed to subscribe to ${providerName} game ${gameId}:`, error);
        ws.send(JSON.stringify({
            type: 'error',
            message: `Failed to subscribe to game: ${error.message}`,
            timestamp: new Date().toISOString()
        }));
    }
}

// Game unsubscription handler
async function handleGameUnsubscription(ws, data) {
    const { provider: providerName, gameId } = data;
    
    console.log(`🎯 Unsubscribing from ${providerName} game: ${gameId}`);
    
    const provider = providers.get(providerName);
    if (!provider) {
        return;
    }
    
    try {
        // Clear selected game
        provider.setSelectedGame(null);
        
        // Clear callback
        provider.onGameUpdate = null;
        
        // Send confirmation
        ws.send(JSON.stringify({
            type: 'unsubscription_success',
            provider: providerName,
            gameId: gameId,
            timestamp: new Date().toISOString()
        }));
        
    } catch (error) {
        console.error(`Failed to unsubscribe from ${providerName} game ${gameId}:`, error);
    }
}

// Static files
app.use(express.static('public'));

// Start server
async function startServer() {
    try {
        // Initialize providers first
        await initializeProviders();
        
        // Start HTTP server
        server.listen(PORT, () => {
            console.log(`🚀 Casino Microservice running on port ${PORT}`);
            console.log(`📡 WebSocket server available at ws://localhost:${PORT}/ws`);
            console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
        });
        
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('📴 Shutting down server...');
    
    // Close all WebSocket connections
    for (const client of clients) {
        client.close();
    }
    
    // Disconnect providers
    for (const [name, provider] of providers) {
        try {
            provider.disconnect();
            console.log(`✅ ${name} provider disconnected`);
        } catch (error) {
            console.error(`❌ Error disconnecting ${name}:`, error);
        }
    }
    
    server.close(() => {
        console.log('✅ Server shut down successfully');
        process.exit(0);
    });
});

// Error handling
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});

// Start the server
startServer();
