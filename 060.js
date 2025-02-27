// Client-side: JavaScript with real-time collaborative document editing features
const WebSocket = require('ws');

let ws;
let documentContent = '';
let documentVersion = 0;

function connectWebSocket() {
    ws = new WebSocket('ws://collaborative-document-server.com');

    ws.on('open', () => {
        console.log('Connected to WebSocket');
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'update') {
            if (message.version > documentVersion) {
                documentVersion = message.version;
                documentContent = message.content;
                updateDocument();
            }
        } else if (message.type === 'comment') {
            addComment(message.comment);
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function updateDocument() {
    const documentElement = document.getElementById('document');
    documentElement.textContent = documentContent;
}

function addComment(comment) {
    const commentList = document.getElementById('comment-list');
    const commentItem = document.createElement('li');
    commentItem.textContent = comment;
    commentList.appendChild(commentItem);
}

function sendUpdate(content) {
    const message = { type: 'update', version: documentVersion + 1, content };
    ws.send(JSON.stringify(message));
    documentVersion++;
    documentContent = content;
    updateDocument();
}

function sendComment(comment) {
    const message = { type: 'comment', comment };
    ws.send(JSON.stringify(message));
}

document.getElementById('document').addEventListener('input', (event) => {
    sendUpdate(event.target.value);
});

document.getElementById('comment-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const commentInput = document.getElementById('comment-input');
    const comment = commentInput.value;
    sendComment(comment);
    commentInput.value = '';
});

connectWebSocket();

// Example usage
sendUpdate('Initial document content');
sendComment('Great start!');