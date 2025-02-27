// Combined JavaScript Implementation for AI-Powered Personal Finance Tracker

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const axios = require('axios');
const tf = require('@tensorflow/tfjs-node');

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Database connection
const sequelize = new Sequelize('finance_tracker', 'username', 'password', {
    host: 'localhost',
    dialect: 'postgres'
});

// Models
const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: true
});

const Transaction = sequelize.define('Transaction', {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    timestamps: true
});

User.hasMany(Transaction);
Transaction.belongsTo(User);

// Plaid API configuration
const PLAID_CLIENT_ID = 'your_plaid_client_id';
const PLAID_SECRET = 'your_plaid_secret';
const PLAID_ENV = 'sandbox'; // or 'development' or 'production'

// TensorFlow.js model for category prediction
const model = tf.sequential();
model.add(tf.layers.dense({ units: 10, activation: 'relu', inputShape: [1] }));
model.add(tf.layers.dense({ units: 5, activation: 'softmax' }));
model.compile({ loss: 'categoricalCrossentropy', optimizer: 'adam' });

// API endpoint to fetch transactions from Plaid
app.post('/transactions', async (req, res) => {
    const { userId, accessToken } = req.body;

    const plaidConfig = {
        headers: {
            'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
            'PLAID-SECRET': PLAID_SECRET,
            'Plaid-Version': '2020-09-14'
        }
    };

    try {
        const response = await axios.post(`https://${PLAID_ENV}.plaid.com/transactions/get`, {
            access_token: accessToken,
            start_date: '2020-01-01',
            end_date: '2020-12-31'
        }, plaidConfig);

        const transactions = response.data.transactions;
        const categorizedTransactions = transactions.map(transaction => {
            const category = predictCategory(transaction.name);
            return { ...transaction, category };
        });

        await Transaction.bulkCreate(categorizedTransactions.map(transaction => ({
            userId,
            amount: transaction.amount,
            date: new Date(transaction.date),
            description: transaction.name,
            category: transaction.category
        })));

        res.json(categorizedTransactions);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching transactions from Plaid' });
    }
});

// API endpoint to get transaction analytics
app.get('/analytics/:userId', async (req, res) => {
    const { userId } = req.params;
    const transactions = await Transaction.findAll({ where: { userId } });

    const analytics = {
        totalSpent: transactions.reduce((acc, transaction) => acc + transaction.amount, 0),
        categories: transactions.reduce((acc, transaction) => {
            if (!acc[transaction.category]) {
                acc[transaction.category] = 0;
            }
            acc[transaction.category] += transaction.amount;
            return acc;
        }, {})
    };

    res.json(analytics);
});

// Function to predict category using TensorFlow.js model
function predictCategory(description) {
    // Dummy prediction for demonstration purposes
    const categories = ['Food', 'Transportation', 'Entertainment', 'Utilities', 'Other'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// Start the server
sequelize.sync().then(() => {
    app.listen(3000, () => {
        console.log('Server is running on port 3000');
    });
});

// Front-end (HTML + JavaScript + Chart.js)

const analyticsHTML = `
    <h1>Personal Finance Tracker</h1>
    <div id="analytics"></div>
    <canvas id="analyticsChart"></canvas>
`;

document.body.innerHTML += analyticsHTML;

async function fetchAnalytics(userId) {
    const response = await fetch(`/analytics/${userId}`);
    const analytics = await response.json();

    const analyticsDiv = document.getElementById('analytics');
    analyticsDiv.innerHTML = `
        <p>Total Spent: $${analytics.totalSpent.toFixed(2)}</p>
        <ul>
            ${Object.entries(analytics.categories).map(([category, amount]) => `
                <li>${category}: $${amount.toFixed(2)}</li>
            `).join('')}
        </ul>
    `;

    const ctx = document.getElementById('analyticsChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(analytics.categories),
            datasets: [{
                label: 'Amount Spent',
                data: Object.values(analytics.categories),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Example usage
const userId = 'user123';
fetchAnalytics(userId);