// Session management system using persistent tokens stored in the browser

const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRATION_KEY = 'token_expiration';
const TOKEN_EXPIRATION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to generate a new token
function generateToken() {
    return Math.random().toString(36).substring(2);
}

// Function to save the token and its expiration time
function saveToken(token) {
    const expirationTime = Date.now() + TOKEN_EXPIRATION_DURATION;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_EXPIRATION_KEY, expirationTime.toString());
}

// Function to get the current token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Function to check if the token is expired
function isTokenExpired() {
    const expirationTime = localStorage.getItem(TOKEN_EXPIRATION_KEY);
    return expirationTime ? Date.now() > parseInt(expirationTime, 10) : true;
}

// Function to handle user login
function loginUser() {
    const token = generateToken();
    saveToken(token);
    console.log('User logged in with token:', token);
}

// Function to handle user logout
function logoutUser() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRATION_KEY);
    console.log('User logged out');
}

// Function to check user authentication status
function checkAuthentication() {
    const token = getToken();
    if (!token || isTokenExpired()) {
        logoutUser();
        console.log('User not authenticated');
        return false;
    }
    console.log('User authenticated with token:', token);
    return true;
}

// Example usage
loginUser();
checkAuthentication();

// Simulate token expiration after 1 second
setTimeout(() => {
    checkAuthentication();
}, 1000);