// JavaScript-based auto-save feature for a web form

const form = document.getElementById('my-form');
const inputs = form.querySelectorAll('input, textarea, select');
const autoSaveInterval = 5000; // Save every 5 seconds
let autoSaveTimer;

function saveFormData() {
    const formData = {};
    inputs.forEach(input => {
        formData[input.name] = input.value;
    });
    localStorage.setItem('formData', JSON.stringify(formData));
}

function restoreFormData() {
    const savedData = JSON.parse(localStorage.getItem('formData')) || {};
    inputs.forEach(input => {
        if (savedData.hasOwnProperty(input.name)) {
            input.value = savedData[input.name];
        }
    });
    if (Object.keys(savedData).length > 0) {
        displayMessage('Form data restored from local storage.');
    }
}

function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}

function startAutoSave() {
    autoSaveTimer = setInterval(saveFormData, autoSaveInterval);
}

function stopAutoSave() {
    clearInterval(autoSaveTimer);
}

window.addEventListener('beforeunload', saveFormData);
window.addEventListener('load', restoreFormData);

form.addEventListener('input', saveFormData);

startAutoSave();

// Optional: Clear local storage when form is submitted
form.addEventListener('submit', () => {
    localStorage.removeItem('formData');
});