// Client-side: JavaScript with Web Speech API and external translation services for real-time speech translation
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

let translatedText = '';

recognition.onresult = async (event) => {
    const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

    const translation = await translateText(transcript, 'en', 'es');
    translatedText = translation;
    speakTranslatedText(translation);
};

recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
};

recognition.onend = () => {
    recognition.start();
};

async function translateText(text, sourceLang, targetLang) {
    const apiKey = 'your-api-key';
    const response = await fetch(`https://translation-api.com/translate?text=${encodeURIComponent(text)}&source=${sourceLang}&target=${targetLang}`, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });
    const data = await response.json();
    return data.translation;
}

function speakTranslatedText(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
}

document.getElementById('start-translation').addEventListener('click', () => {
    recognition.start();
});

document.getElementById('stop-translation').addEventListener('click', () => {
    recognition.stop();
});