// JavaScript function to detect and prevent pasting text with special characters into an input field

const inputField = document.getElementById('my-input');
const feedbackElement = document.getElementById('feedback');

const specialCharacters = /[!@#$%^&*(),.?":{}|<>]/;

function handlePaste(event) {
    const pastedText = event.clipboardData.getData('text');
    if (specialCharacters.test(pastedText)) {
        event.preventDefault();
        displayFeedback('Invalid characters detected. Please remove special characters and try again.');
    }
}

function handleInput(event) {
    const inputValue = event.target.value;
    if (specialCharacters.test(inputValue)) {
        displayFeedback('Invalid characters detected. Please remove special characters.');
    } else {
        clearFeedback();
    }
}

function displayFeedback(message) {
    feedbackElement.textContent = message;
    feedbackElement.style.color = 'red';
}

function clearFeedback() {
    feedbackElement.textContent = '';
}

inputField.addEventListener('paste', handlePaste);
inputField.addEventListener('input', handleInput);