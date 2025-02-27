// JavaScript feature to record and replay user interactions on a webpage

const interactions = [];
let isRecording = false;
let playbackSpeed = 1; // Playback speed in seconds per interaction

function startRecording() {
    isRecording = true;
    document.addEventListener('click', recordClick);
    document.addEventListener('scroll', recordScroll);
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('input', recordInput);
    });
}

function stopRecording() {
    isRecording = false;
    document.removeEventListener('click', recordClick);
    document.removeEventListener('scroll', recordScroll);
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.removeEventListener('input', recordInput);
    });
}

function recordClick(event) {
    if (!isRecording) return;
    interactions.push({
        type: 'click',
        target: event.target,
        timestamp: Date.now()
    });
}

function recordScroll(event) {
    if (!isRecording) return;
    interactions.push({
        type: 'scroll',
        scrollY: window.scrollY,
        timestamp: Date.now()
    });
}

function recordInput(event) {
    if (!isRecording) return;
    interactions.push({
        type: 'input',
        target: event.target,
        value: event.target.value,
        timestamp: Date.now()
    });
}

function replayInteractions() {
    let currentIndex = 0;
    const replayInterval = setInterval(() => {
        if (currentIndex >= interactions.length) {
            clearInterval(replayInterval);
            return;
        }
        const interaction = interactions[currentIndex];
        const delay = interaction.timestamp - (currentIndex > 0 ? interactions[currentIndex - 1].timestamp : Date.now());
        setTimeout(() => {
            switch (interaction.type) {
                case 'click':
                    interaction.target.click();
                    break;
                case 'scroll':
                    window.scrollTo(0, interaction.scrollY);
                    break;
                case 'input':
                    interaction.target.value = interaction.value;
                    interaction.target.dispatchEvent(new Event('input', { bubbles: true }));
                    break;
            }
            currentIndex++;
        }, delay * playbackSpeed);
    }, 1000 / playbackSpeed);
}

// Example usage
startRecording();

// Stop recording and replay interactions after 10 seconds
setTimeout(() => {
    stopRecording();
    replayInteractions();
}, 10000);