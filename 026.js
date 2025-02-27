// Server-side: Node.js with WebSocket and Express
const express = require('express');
const http = require('http');
const WebSocket = require('websocket').server;
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const wsServer = new WebSocket({ httpServer: server });

mongoose.connect('mongodb://localhost:27017/gameDB', { useNewUrlParser: true, useUnifiedTopology: true });

const userSchema = new mongoose.Schema({
    username: String,
    score: Number
});
const User = mongoose.model('User', userSchema);

let clients = {};
let games = {};

wsServer.on('request', request => {
    const client = request.accept(null, request.origin);
    clients[client.id] = { client, username: null, game: null };

    client.on('message', message => {
        const data = JSON.parse(message.utf8Data());
        switch (data.type) {
            case 'login':
                clients[client.id].username = data.username;
                break;
            case 'createGame':
                games[data.gameId] = { host: client.id, players: [client.id], state: {} };
                break;
            case 'joinGame':
                if (games[data.gameId]) {
                    games[data.gameId].players.push(client.id);
                    clients[client.id].game = data.gameId;
                }
                break;
            case 'gameState':
                if (clients[client.id].game && games[clients[client.id].game]) {
                    games[clients[client.id].game].state = data.state;
                    broadcastGameState(clients[client.id].game);
                }
                break;
        }
    });

    client.on('close', () => {
        if (clients[client.id].game && games[clients[client.id].game]) {
            games[clients[client.id].game].players = games[clients[client.id].game].players.filter(id => id !== client.id);
            if (games[clients[client.id].game].players.length === 0) {
                delete games[clients[client.id].game];
            }
        }
        delete clients[client.id];
    });
});

function broadcastGameState(gameId) {
    games[gameId].players.forEach(playerId => {
        clients[playerId].client.sendUTF(JSON.stringify({ type: 'gameState', state: games[gameId].state }));
    });
}

server.listen(8080, () => {
    console.log('Server is running on port 8080');
});

// Client-side: JavaScript with PixiJS
const socket = new WebSocket('ws://localhost:8080');

socket.onopen = () => {
    socket.send(JSON.stringify({ type: 'login', username: 'Player1' }));
};

socket.onmessage = event => {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case 'gameState':
            updateGameState(data.state);
            break;
    }
};

function createGame() {
    socket.send(JSON.stringify({ type: 'createGame', gameId: 'game1' }));
}

function joinGame(gameId) {
    socket.send(JSON.stringify({ type: 'joinGame', gameId }));
}

function updateGameState(state) {
    // Use PixiJS to render the game state
}

// Example usage
createGame();
joinGame('game1');