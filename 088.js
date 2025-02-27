// API endpoint to update user profile information

const express = require('express');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
app.use(bodyParser.json());

// Simulated user database
const users = [
    { id: 1, username: 'user1', email: 'user1@example.com', role: 'user' },
    { id: 2, username: 'admin', email: 'admin@example.com', role: 'admin' }
];

// Middleware to check user permissions
function checkPermissions(req, res, next) {
    const userId = req.body.userId;
    const user = users.find(u => u.id === userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'admin' && req.body.role) {
        return res.status(403).json({ error: 'Unauthorized to change role' });
    }

    req.user = user;
    next();
}

// Validation middleware
const validateProfileUpdate = [
    check('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
    check('email').isEmail().withMessage('Invalid email address')
];

// API endpoint to update user profile
app.post('/update-profile', validateProfileUpdate, checkPermissions, (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { userId, username, email, role } = req.body;
    const user = req.user;

    user.username = username;
    user.email = email;
    if (user.role === 'admin' && role) {
        user.role = role;
    }

    res.json({ message: 'Profile updated successfully', user });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});