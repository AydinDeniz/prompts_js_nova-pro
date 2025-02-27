// JavaScript function to detect user's internet connection status and handle caching and syncing of form inputs

let isOnline = navigator.onLine;
const form = document.getElementById('my-form');
const inputs = form.querySelectorAll('input, textarea, select');
const cachedInputs = {};

window.addEventListener('online', handleOnline);
window.addEventListener('offline', handleOffline);

form.addEventListener('input', handleInputChange);

function handleOnline() {
    isOnline = true;
    displayNotification('You are back online.');
    syncCachedInputs();
}

function handleOffline() {
    isOnline = false;
    displayNotification('You are now offline.');
    cacheInputs();
}

function handleInputChange(event) {
    const input = event.target;
    cachedInputs[input.name] = input.value;
}

function cacheInputs() {
    localStorage.setItem('cachedInputs', JSON.stringify(cachedInputs));
}

function syncCachedInputs() {
    const cachedData = JSON.parse(localStorage.getItem('cachedInputs')) || {};
    for (const name in cachedData) {
        if (cachedData.hasOwnProperty(name)) {
            const input = form.querySelector(`[name='${name}']`);
            if (input) {
                input.value = cachedData[name];
            }
        }
    }
    sendDataToBackend(cachedData);
    localStorage.removeItem('cachedInputs');
}

function sendDataToBackend(data) {
    fetch('https://my-backend-api.com/sync', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Data sync failed.');
        }
        displayNotification('Data synced successfully.');
    })
    .catch(error => {
        displayNotification('An error occurred while syncing data.');
        console.error(error);
    });
}

function displayNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Initialize the form with cached inputs if any
syncCachedInputs();