// Combined JavaScript Implementation for Personalized News Aggregator

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const axios = require('axios');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Placeholder for user preferences and fetch history in local storage
let userPreferences = {};
let fetchHistory = {};

// API endpoint to fetch news articles
app.get('/news', async (req, res) => {
    const { topics } = req.query;
    const apiKey = 'your_newsapi_key';
    const url = `https://newsapi.org/v2/top-headlines?country=us&category=${topics}&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        res.json(response.data.articles);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching news articles' });
    }
});

// API endpoint to save user preferences
app.post('/preferences', (req, res) => {
    const { userId, topics } = req.body;
    userPreferences[userId] = topics;
    res.json({ message: 'Preferences saved successfully' });
});

// API endpoint to get user preferences
app.get('/preferences/:userId', (req, res) => {
    const { userId } = req.params;
    const topics = userPreferences[userId] || [];
    res.json({ topics });
});

// API endpoint to save fetch history
app.post('/history', (req, res) => {
    const { userId, article } = req.body;
    if (!fetchHistory[userId]) {
        fetchHistory[userId] = [];
    }
    fetchHistory[userId].push(article);
    res.json({ message: 'Fetch history saved successfully' });
});

// API endpoint to get fetch history
app.get('/history/:userId', (req, res) => {
    const { userId } = req.params;
    const history = fetchHistory[userId] || [];
    res.json({ history });
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

// Front-end (HTML + JavaScript)

// HTML for news aggregator
const newsAggregatorHTML = `
    <h1>Personalized News Aggregator</h1>
    <form id="preferencesForm">
        <label for="userId">User ID:</label>
        <input type="text" id="userId" name="userId" required><br><br>
        <label for="topics">Topics (comma-separated):</label>
        <input type="text" id="topics" name="topics" required><br><br>
        <button type="submit">Save Preferences</button>
    </form>
    <div id="newsFeed"></div>
    <div id="history"></div>
`;

document.body.innerHTML += newsAggregatorHTML;

document.getElementById('preferencesForm').addEventListener('submit', async (event) => {
    event.preventDefault();

    const userId = document.getElementById('userId').value;
    const topics = document.getElementById('topics').value.split(',');

    const response = await fetch('/preferences', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, topics })
    });

    const result = await response.json();
    alert(result.message);
    fetchNews(userId);
});

async function fetchNews(userId) {
    const response = await fetch(`/preferences/${userId}`);
    const { topics } = await response.json();
    const newsResponse = await fetch(`/news?topics=${topics.join(',')}`);
    const articles = await newsResponse.json();

    document.getElementById('newsFeed').innerHTML = '';
    articles.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        document.getElementById('newsFeed').appendChild(articleElement);
    });
}

async function fetchHistory(userId) {
    const response = await fetch(`/history/${userId}`);
    const { history } = await response.json();

    document.getElementById('history').innerHTML = '';
    history.forEach(article => {
        const articleElement = document.createElement('div');
        articleElement.innerHTML = `
            <h2>${article.title}</h2>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
        `;
        document.getElementById('history').appendChild(articleElement);
    });
}

// Notification system for breaking news
function checkForBreakingNews(userId) {
    setInterval(async () => {
        const response = await fetch(`/preferences/${userId}`);
        const { topics } = await response.json();
        const newsResponse = await fetch(`/news?topics=${topics.join(',')}`);
        const articles = await newsResponse.json();

        articles.forEach(article => {
            if (article.title.includes('Breaking')) {
                alert(`Breaking News: ${article.title}`);
            }
        });
    }, 60000); // Check every minute
}

// Example usage
const userId = 'user123';
fetchNews(userId);
fetchHistory(userId);
checkForBreakingNews(userId);