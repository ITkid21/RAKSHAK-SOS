import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

// 1. Setup Express & HTTP Server
const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 8080;

// 2. Resolve __dirname (ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 3. Serve Frontend (from 'dist' folder)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// 4. WebSocket Setup (Attached to same HTTP Server)
const wss = new WebSocketServer({ server });

console.log(`SOS Dispatch Server running on port ${PORT}`);

// Handle WebSocket Connections
wss.on('connection', function connection(ws) {
    console.log('New Client Connected');
    ws.on('error', console.error);

    ws.on('message', function message(data, isBinary) {
        // Broadcast to all clients
        wss.clients.forEach(function each(client) {
            if (client !== ws && client.readyState === 1) {
                client.send(data, { binary: isBinary });
            }
        });

        try {
            const signal = JSON.parse(data);
            console.log(`SIGNAL: [${signal.mode}] from ${signal.id}`);
        } catch (e) { }
    });

    ws.send(JSON.stringify({ status: 'connected', message: 'Dispatch Hub Ready' }));
});

// 5. Catch-all for React Routing (if needed, though this is mostly SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

// 6. Start Server
server.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
