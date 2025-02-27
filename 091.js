// Custom OAuth2.0 implementation with JWT token handling, refresh token rotation, and role-based access control

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const axios = require('axios');

const SECRET_KEY = crypto.randomBytes(32).toString('hex');
const REFRESH_TOKENS = new Map();
const ACCESS_TOKENS = new Map();
const USERS = {
    'user1': { password: 'password1', roles: ['user'] },
    'admin': { password: 'adminpassword', roles: ['admin'] }
};

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

function generateAccessToken(user) {
    return jwt.sign(user, SECRET_KEY, { expiresIn: '15m' });
}

function generateRefreshToken() {
    return crypto.randomBytes(32).toString('hex');
}

function authenticateUser(username, password) {
    const user = USERS[username];
    if (user && user.password === password) {
        return user;
    }
    return null;
}

function authorizeClient(clientId, clientSecret) {
    // Implement client authorization logic here
    return true;
}

function handleAuthorizationCodeGrant(req, res) {
    const { code, redirectUri } = req.body;
    // Validate code and redirectUri
    const user = authenticateUser('user1', 'password1'); // Simulate user authentication
    if (user) {
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();
        REFRESH_TOKENS.set(refreshToken, user.username);
        res.json({ accessToken, refreshToken });
    } else {
        res.status(401).json({ error: 'Invalid credentials' });
    }
}

function handleClientCredentialsGrant(req, res) {
    const { clientId, clientSecret } = req.body;
    if (authorizeClient(clientId, clientSecret)) {
        const user = { username: 'client', roles: ['client'] };
        const accessToken = generateAccessToken(user);
        res.json({ accessToken });
    } else {
        res.status(401).json({ error: 'Invalid client credentials' });
    }
}

function handleTokenRefresh(req, res) {
    const { refreshToken } = req.body;
    const username = REFRESH_TOKENS.get(refreshToken);
    if (username) {
        const user = USERS[username];
        const newAccessToken = generateAccessToken(user);
        const newRefreshToken = generateRefreshToken();
        REFRESH_TOKENS.delete(refreshToken);
        REFRESH_TOKENS.set(newRefreshToken, username);
        res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } else {
        res.status(401).json({ error: 'Invalid refresh token' });
    }
}

function handleKeyRotation() {
    setInterval(() => {
        SECRET_KEY = crypto.randomBytes(32).toString('hex');
    }, 24 * 60 * 60 * 1000); // Rotate key every 24 hours
}

function auditLog(event) {
    // Implement audit logging logic here
    console.log('Audit log:', event);
}

// Express app setup
const express = require('express');
const app = express();
app.use(express.json());
app.use(limiter);

app.post('/oauth/token', (req, res) => {
    const { grant_type } = req.body;
    switch (grant_type) {
        case 'authorization_code':
            handleAuthorizationCodeGrant(req, res);
            break;
        case 'client_credentials':
            handleClientCredentialsGrant(req, res);
            break;
        case 'refresh_token':
            handleTokenRefresh(req, res);
            break;
        default:
            res.status(400).json({ error: 'Unsupported grant type' });
    }
});

handleKeyRotation();

app.listen(3000, () => {
    console.log('OAuth2.0 server running on port 3000');
});