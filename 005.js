const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const SECRET_KEY = 'your_secret_key';

function createToken(payload) {
    return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
}

function verifyToken(token) {
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch (error) {
        return null;
    }
}

function authMiddleware(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).send('Access denied. No token provided.');

    try {
        const decoded = verifyToken(token);
        if (!decoded) return res.status(400).send('Invalid token.');

        req.user = decoded;
        next();
    } catch (ex) {
        res.status(400).send('Invalid token.');
    }
}

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === 'admin' && password === 'password') {
        const token = createToken({ username });
        res.send({ token });
    } else {
        res.status(400).send('Invalid username or password');
    }
});

app.get('/protected', authMiddleware, (req, res) => {
    res.send('This is a protected route');
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});