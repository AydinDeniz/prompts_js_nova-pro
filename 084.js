// Lightweight authentication system using a JSON file to store user credentials

const fs = require('fs');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const usersFile = 'users.json';

// Ensure the users file exists
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify([]));
}

// Function to read users from the JSON file
function readUsers() {
    const data = fs.readFileSync(usersFile);
    return JSON.parse(data);
}

// Function to write users to the JSON file
function writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Function to register a new user
function registerUser(username, password) {
    const users = readUsers();
    const userExists = users.some(user => user.username === username);

    if (userExists) {
        throw new Error('Username already exists');
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            throw new Error('Error hashing password');
        }

        users.push({ username, password: hash });
        writeUsers(users);
    });
}

// Function to validate user login
function loginUser(username, password) {
    const users = readUsers();
    const user = users.find(user => user.username === username);

    if (!user) {
        throw new Error('Invalid username or password');
    }

    bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
            throw new Error('Error comparing passwords');
        }

        if (!result) {
            throw new Error('Invalid username or password');
        }

        console.log('Login successful');
    });
}

// Example usage
try {
    registerUser('user1', 'password123');
    loginUser('user1', 'password123');
} catch (error) {
    console.error(error.message);
}