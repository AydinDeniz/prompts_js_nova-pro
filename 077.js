// JavaScript-based dark mode toggle with local storage persistence and additional features

const darkModeToggle = document.getElementById('dark-mode-toggle');
const body = document.body;
const darkModeKey = 'darkMode';
const darkModeIcon = document.getElementById('dark-mode-icon');
const darkModeLabel = document.getElementById('dark-mode-label');

function applyDarkMode() {
    body.classList.add('dark-mode');
    localStorage.setItem(darkModeKey, 'true');
    updateDarkModeUI();
}

function removeDarkMode() {
    body.classList.remove('dark-mode');
    localStorage.setItem(darkModeKey, 'false');
    updateDarkModeUI();
}

function toggleDarkMode() {
    if (body.classList.contains('dark-mode')) {
        removeDarkMode();
    } else {
        applyDarkMode();
    }
}

function initializeDarkMode() {
    const isDarkMode = localStorage.getItem(darkModeKey) === 'true';
    if (isDarkMode) {
        applyDarkMode();
    } else {
        removeDarkMode();
    }
}

function updateDarkModeUI() {
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.textContent = '🌙';
        darkModeLabel.textContent = 'Light Mode';
    } else {
        darkModeIcon.textContent = '☀️';
        darkModeLabel.textContent = 'Dark Mode';
    }
}

darkModeToggle.addEventListener('click', toggleDarkMode);

// Apply the saved theme preference on page load
initializeDarkMode();