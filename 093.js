// Custom password manager with client-side encryption/decryption and cloud sync

const crypto = require('crypto');
const axios = require('axios');

const MASTER_PASSWORD = 'myMasterPassword';
const SALT = crypto.randomBytes(16);
const ITERATIONS = 10000;
const KEY_LENGTH = 32;
const CLOUD_URL = 'https://mycloud.com/api/passwords';

function deriveKey(password, salt, iterations, keyLength) {
    return crypto.pbkdf2Sync(password, salt, iterations, keyLength, 'sha256');
}

function encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText, key) {
    const [ivHex, encrypted] = encryptedText.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

function savePasswords(passwords) {
    const key = deriveKey(MASTER_PASSWORD, SALT, ITERATIONS, KEY_LENGTH);
    const encryptedPasswords = Object.entries(passwords).reduce((acc, [site, password]) => {
        acc[site] = encrypt(password, key);
        return acc;
    }, {});
    axios.post(CLOUD_URL, { passwords: encryptedPasswords });
}

function loadPasswords() {
    return axios.get(CLOUD_URL).then(response => {
        const key = deriveKey(MASTER_PASSWORD, SALT, ITERATIONS, KEY_LENGTH);
        const encryptedPasswords = response.data.passwords;
        const passwords = Object.entries(encryptedPasswords).reduce((acc, [site, encryptedPassword]) => {
            acc[site] = decrypt(encryptedPassword, key);
            return acc;
        }, {});
        return passwords;
    });
}

// Example usage
const passwords = {
    'example.com': 'password123',
    'anothersite.com': 'anotherpassword'
};

savePasswords(passwords).then(() => {
    loadPasswords().then(loadedPasswords => {
        console.log('Loaded passwords:', loadedPasswords);
    });
});