// JavaScript function to monitor typing speed, accuracy, and visualize progress

const textArea = document.createElement('textarea');
const wpmDisplay = document.createElement('div');
const accuracyDisplay = document.createElement('div');
const progressBar = document.createElement('div');
const targetSpeed = 60; // Target words per minute

textArea.setAttribute('rows', 10);
textArea.setAttribute('cols', 50);
wpmDisplay.textContent = 'WPM: 0';
accuracyDisplay.textContent = 'Accuracy: 0%';
progressBar.style.width = '0%';
progressBar.style.height = '20px';
progressBar.style.backgroundColor = 'green';

document.body.appendChild(textArea);
document.body.appendChild(wpmDisplay);
document.body.appendChild(accuracyDisplay);
document.body.appendChild(progressBar);

let startTime = Date.now();
let correctWords = 0;
let totalWords = 0;

textArea.addEventListener('input', () => {
    const currentTime = Date.now();
    const elapsedTime = (currentTime - startTime) / 1000 / 60; // Time in minutes
    const text = textArea.value;
    const words = text.trim().split(/\s+/);
    totalWords = words.length;

    if (words.length > 0) {
        const lastWord = words[words.length - 1];
        if (isValidWord(lastWord)) {
            correctWords++;
        }
    }

    const wpm = Math.round(totalWords / elapsedTime);
    const accuracy = Math.round((correctWords / totalWords) * 100);
    const speedPercentage = Math.min((wpm / targetSpeed) * 100, 100);

    wpmDisplay.textContent = `WPM: ${wpm}`;
    accuracyDisplay.textContent = `Accuracy: ${accuracy}%`;
    progressBar.style.width = `${speedPercentage}%`;
});

function isValidWord(word) {
    // Implement word validation logic here (e.g., check against a dictionary)
    return true;
}