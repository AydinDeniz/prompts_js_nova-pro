// Client-side: JavaScript with WebSockets for online multiplayer game
const WebSocket = require('ws');

let ws;
let playerId;
let gameState = { players: [], leaderboard: [] };

function connectWebSocket() {
    ws = new WebSocket('ws://multiplayer-game-server.com');

    ws.on('open', () => {
        console.log('Connected to WebSocket');
        ws.send(JSON.stringify({ type: 'join' }));
    });

    ws.on('message', (data) => {
        const message = JSON.parse(data);
        if (message.type === 'playerId') {
            playerId = message.playerId;
        } else if (message.type === 'gameState') {
            gameState = message.gameState;
            updateGameState();
        } else if (message.type === 'leaderboard') {
            gameState.leaderboard = message.leaderboard;
            updateLeaderboard();
        }
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function updateGameState() {
    const playersDiv = document.getElementById('players');
    playersDiv.innerHTML = '';
    gameState.players.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `Player ${player.id}: ${player.score}`;
        playersDiv.appendChild(playerDiv);
    });
}

function updateLeaderboard() {
    const leaderboardDiv = document.getElementById('leaderboard');
    leaderboardDiv.innerHTML = '';
    gameState.leaderboard.forEach(player => {
        const playerDiv = document.createElement('div');
        playerDiv.textContent = `Player ${player.id}: ${player.score}`;
        leaderboardDiv.appendChild(playerDiv);
    });
}

function sendGameAction(action) {
    ws.send(JSON.stringify({ type: 'gameAction', action }));
}

document.getElementById('start-game').addEventListener('click', () => {
    sendGameAction('start');
});

document.getElementById('perform-action').addEventListener('click', () => {
    sendGameAction('perform');
});

connectWebSocket();