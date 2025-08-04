# 🎰 Casino Microservice

Microservizio per gestire connessioni live ai provider casino (Evolution Gaming, Pragmatic Play) e fornire API REST + WebSocket per l'integrazione con Next.js.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start the microservice
npm start

# Or for development with auto-reload
npm run dev
```

## 🌐 Endpoints

### Health Check
```
GET /health
```

### Providers
```
GET /api/providers                    # List all providers
GET /api/providers/:name/games        # Get games from specific provider
GET /api/providers/:name/games/:id    # Get specific game details
```

### Evolution Gaming Proxy
```
GET /api/evolution/*                  # Proxy to Evolution Gaming API
```

### Strapi Integration
```
POST /api/sync/strapi                 # Sync games with Strapi
```

### WebSocket
```
WS /ws                                # Real-time game updates
```

## 📡 WebSocket Messages

### Client to Server
```javascript
// Subscribe to game updates
{
  "type": "subscribe_game",
  "provider": "evolution",
  "gameId": "table_123"
}

// Get all games
{
  "type": "get_games",
  "provider": "evolution" // optional
}

// Unsubscribe
{
  "type": "unsubscribe_game",
  "provider": "evolution",
  "gameId": "table_123"
}
```

### Server to Client
```javascript
// Connection established
{
  "type": "connection",
  "status": "connected",
  "providers": ["Evolution Gaming", "Pragmatic Play"],
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Game update
{
  "type": "game_update",
  "provider": "evolution",
  "gameId": "table_123",
  "data": { /* game result data */ },
  "timestamp": "2025-01-01T00:00:00.000Z"
}

// Games list
{
  "type": "games_list",
  "provider": "evolution",
  "games": [/* array of games */],
  "total": 42,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## 🏗️ Architecture

```
Casino Microservice (Port 4000)
├── Express Server (REST API)
├── WebSocket Server (Real-time)
├── Provider System
│   ├── BaseProvider (Abstract)
│   ├── EvolutionProvider
│   └── PragmaticProvider
└── Strapi Integration
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `NODE_ENV` | Environment | `development` |
| `EVOLUTION_HOSTNAME` | Evolution Gaming hostname | `sportbetit.evo-games.com` |
| `EVOLUTION_CASINO_ID` | Casino ID | `sportbetit000001` |
| `EVOLUTION_USERNAME` | Username | `sportbetit000001` |
| `EVOLUTION_PASSWORD` | Password/Token | `your_token` |
| `PRAGMATIC_WS_URL` | Pragmatic WebSocket URL | `wss://dga.pragmaticplaylive.net/ws` |
| `PRAGMATIC_CASINO_ID` | Pragmatic Casino ID | `il9srgw4dna11111` |
| `STRAPI_URL` | Strapi backend URL | `http://localhost:1337` |
| `ALLOWED_ORIGINS` | CORS origins | `http://localhost:3000` |

## 🧪 Testing

```bash
# Test provider connections
npm test

# Manual health check
curl http://localhost:4000/health

# Test Evolution API proxy
curl -H "Authorization: Basic <base64_credentials>" \
     http://localhost:4000/api/evolution/api/lobby/v1/sportbetit000001/state

# Test WebSocket (use wscat or browser)
wscat -c ws://localhost:4000/ws
```

## 🔌 Next.js Integration

### Hook Example
```javascript
// hooks/useCasinoMicroservice.js
import { useState, useEffect } from 'react';

export function useCasinoMicroservice() {
  const [socket, setSocket] = useState(null);
  const [games, setGames] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:4000/ws');
    
    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
      
      // Request all games
      ws.send(JSON.stringify({
        type: 'get_games'
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'all_games') {
        setGames(Object.values(data.games).flat());
      } else if (data.type === 'game_update') {
        // Handle real-time updates
        console.log('Game update:', data);
      }
    };
    
    ws.onclose = () => setConnected(false);
    
    return () => ws.close();
  }, []);

  const subscribeToGame = (provider, gameId) => {
    if (socket) {
      socket.send(JSON.stringify({
        type: 'subscribe_game',
        provider,
        gameId
      }));
    }
  };

  return { games, connected, subscribeToGame };
}
```

### SSE Alternative
```javascript
// pages/api/casino/stream/[gameId].js
export default function handler(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
  });

  // Connect to microservice WebSocket
  const ws = new WebSocket('ws://localhost:4000/ws');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  req.on('close', () => {
    ws.close();
    res.end();
  });
}
```

## 📊 Monitoring

### Health Check Response
```javascript
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "providers": ["Evolution Gaming", "Pragmatic Play"],
  "activeConnections": 5,
  "uptime": 3600
}
```

### Logs
```bash
# Real-time logs
tail -f logs/casino-microservice.log

# Debug specific provider
DEBUG=evolution npm start
```

## 🔐 Security

- Environment variables for sensitive data
- CORS protection
- Optional API key authentication
- No credentials in source code
- HTTPS/WSS in production

## 🚀 Production Deployment

```bash
# Using PM2
npm install -g pm2
pm2 start server.js --name casino-microservice

# Using Docker
docker build -t casino-microservice .
docker run -p 4000:4000 casino-microservice

# Environment variables for production
NODE_ENV=production
PORT=4000
# ... other production settings
```

## 📝 Provider Notes

### Evolution Gaming
- Provides initial game list via API endpoint
- Games are loaded during provider initialization
- Uses authentication with username/password
- WebSocket updates for existing games only

### Pragmatic Play
- No initial game list available
- Games discovered dynamically from live WebSocket messages
- Authentication uses only casino ID
- New tables appear automatically when they go live

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Test your changes
4. Submit pull request

## 📄 License

MIT License - see LICENSE file for details