// WebSocket-based real-time file transfer system with end-to-end encryption

const WebSocket = require('ws');
const fs = require('fs');
const crypto = require('crypto');
const wss = new WebSocket.Server({ port: 8080 });

const CHUNK_SIZE = 1024 * 1024; // 1 MB
const BANDWIDTH_LIMIT = 1024 * 1024; // 1 MB/s
const TRANSFERS = new Map();

function generateKeyPair() {
    return crypto.generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
}

function encrypt(data, publicKey) {
    const buffer = Buffer.from(data);
    return crypto.publicEncrypt(publicKey, buffer).toString('base64');
}

function decrypt(data, privateKey) {
    const buffer = Buffer.from(data, 'base64');
    return crypto.privateDecrypt(privateKey, buffer).toString();
}

function calculateChecksum(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
}

function handleFileTransfer(ws, file) {
    const { path, resume } = file;
    const stats = fs.statSync(path);
    const fileSize = stats.size;
    let offset = resume ? resume : 0;
    const privateKey = generateKeyPair().privateKey;
    const publicKey = generateKeyPair().publicKey;

    TRANSFERS.set(ws, { fileSize, offset, privateKey, publicKey });

    ws.send(JSON.stringify({ type: 'key', publicKey }));

    const stream = fs.createReadStream(path, { start: offset, highWaterMark: CHUNK_SIZE });
    let bytesSent = 0;

    stream.on('data', (chunk) => {
        const checksum = calculateChecksum(chunk);
        const encryptedChunk = encrypt(chunk, publicKey);
        const message = JSON.stringify({ type: 'chunk', data: encryptedChunk, checksum });

        ws.send(message, (err) => {
            if (err) {
                console.error('Error sending chunk:', err);
                return;
            }

            bytesSent += chunk.length;
            offset += chunk.length;

            if (bytesSent >= BANDWIDTH_LIMIT) {
                stream.pause();
                setTimeout(() => stream.resume(), 1000);
            }

            if (offset >= fileSize) {
                stream.close();
                TRANSFERS.delete(ws);
            }
        });
    });

    stream.on('end', () => {
        ws.send(JSON.stringify({ type: 'end' }));
    });
}

wss.on('connection', (ws) => {
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.type) {
            case 'file':
                handleFileTransfer(ws, data.file);
                break;
            case 'resume':
                const transfer = TRANSFERS.get(ws);
                if (transfer) {
                    handleFileTransfer(ws, { path: transfer.fileSize, resume: transfer.offset });
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'No active transfer found' }));
                }
                break;
            default:
                ws.send(JSON.stringify({ type: 'error', message: 'Unknown message type' }));
        }
    });
});

console.log('WebSocket file transfer server running on ws://localhost:8080');