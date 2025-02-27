// Real-time chat feature using WebSockets with enhanced functionality

const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const clients = new Set();

// Function to broadcast a message to all connected clients
function broadcast(message) {
    clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

// Function to handle new WebSocket connections
function handleConnection(ws) {
    clients.add(ws);

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        broadcast(message);
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
}

// Event listener for new WebSocket connections
wss.on('connection', (ws) => {
    handleConnection(ws);
});

// Log server status
console.log('WebSocket server is running on ws://localhost:8080');

// Additional functionality: Handling different message types
function handleMessage(ws, message) {
    const data = JSON.parse(message);
    switch (data.type) {
        case 'text':
            broadcast(message);
            break;
        case 'join':
            const joinMessage = `User ${data.username} has joined the chat`;
            broadcast(joinMessage);
            break;
        case 'leave':
            const leaveMessage = `User ${data.username} has left the chat`;
            broadcast(leaveMessage);
            break;
        default:
            console.log('Unknown message type');
    }
}

// Enhanced connection handler to support different message types
function enhancedHandleConnection(ws) {
    clients.add(ws);

    ws.on('message', (message) => {
        console.log(`Received message: ${message}`);
        handleMessage(ws, message);
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log('Client disconnected');
    });
}

// Replace the original connection handler with the enhanced one
wss.on('connection', (ws) => {
    enhancedHandleConnection(ws);
});