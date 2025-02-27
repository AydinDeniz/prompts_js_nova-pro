const WebSocket = require('ws');
const firebase = require('firebase-admin');

// Initialize Firebase
const serviceAccount = require('path/to/serviceAccountKey.json');

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: 'https://your-project-id.firebaseio.com'
});

const db = firebase.database();

const wss = new WebSocket.Server({ port: 8080 });

const documents = new Map();

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (message) => {
        const { action, documentId, content, userId } = JSON.parse(message);

        if (action === 'join') {
            if (!documents.has(documentId)) {
                documents.set(documentId, '');
            }
            ws.send(JSON.stringify({ action: 'joined', documentId, content: documents.get(documentId) }));
        } else if (action === 'edit') {
            documents.set(documentId, content);

            // Save version history to Firebase
            const versionRef = db.ref(`documents/${documentId}/versions`).push();
            versionRef.set({
                content: content,
                userId: userId,
                timestamp: Date.now()
            });

            wss.clients.forEach((client) => {
                if (client !== ws && client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ action: 'update', documentId, content, userId }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

console.log('WebSocket server is running on ws://localhost:8080');