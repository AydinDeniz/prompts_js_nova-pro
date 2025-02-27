// JavaScript function to detect user idleness and log out automatically

let idleTimeout;
let logoutTimeout;
const idleTime = 60000; // 1 minute
const logoutTime = 120000; // 2 minutes

function resetTimers() {
    clearTimeout(idleTimeout);
    clearTimeout(logoutTimeout);

    idleTimeout = setTimeout(showIdleWarning, idleTime);
    logoutTimeout = setTimeout(logoutUser, idleTime + logoutTime);
}

function showIdleWarning() {
    const modal = document.createElement('div');
    modal.id = 'idle-warning-modal';
    modal.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 1000;">
            <p>You have been idle for too long. Please interact with the page to continue.</p>
        </div>
    `;
    document.body.appendChild(modal);

    document.addEventListener('mousemove', resetTimers);
    document.addEventListener('keypress', resetTimers);
}

function logoutUser() {
    const modal = document.getElementById('idle-warning-modal');
    if (modal) {
        modal.innerHTML = '<p>You have been logged out due to inactivity.</p>';
    } else {
        const logoutModal = document.createElement('div');
        logoutModal.id = 'logout-modal';
        logoutModal.innerHTML = `
            <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border: 1px solid black; z-index: 1000;">
                <p>You have been logged out due to inactivity.</p>
            </div>
        `;
        document.body.appendChild(logoutModal);
    }

    // Perform logout actions here (e.g., redirect to login page, clear session, etc.)
    console.log('User logged out due to inactivity.');
}

// Initialize timers on page load
document.addEventListener('DOMContentLoaded', resetTimers);