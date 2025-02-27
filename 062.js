// Client-side: JavaScript with cryptocurrency exchange API integration and trading bot logic
const axios = require('axios');

let tradingBot;

async function initializeTradingBot(apiKey, apiSecret) {
    tradingBot = {
        apiKey,
        apiSecret,
        balance: await fetchBalance(),
        orders: []
    };
}

async function fetchBalance() {
    const response = await axios.get('https://crypto-exchange-api.com/balance', {
        headers: {
            'API-Key': tradingBot.apiKey,
            'API-Secret': tradingBot.apiSecret
        }
    });
    return response.data;
}

async function fetchMarketData(symbol) {
    const response = await axios.get(`https://crypto-exchange-api.com/market/${symbol}`);
    return response.data;
}

async function placeOrder(symbol, type, quantity, price) {
    const response = await axios.post('https://crypto-exchange-api.com/order', {
        symbol,
        type,
        quantity,
        price
    }, {
        headers: {
            'API-Key': tradingBot.apiKey,
            'API-Secret': tradingBot.apiSecret
        }
    });
    return response.data;
}

function executeTradingStrategy() {
    const symbol = 'BTCUSDT';
    const marketData = fetchMarketData(symbol);
    const currentPrice = marketData.lastPrice;
    const quantity = tradingBot.balance / currentPrice;

    if (currentPrice < 30000) {
        placeOrder(symbol, 'buy', quantity, currentPrice);
    } else if (currentPrice > 40000) {
        placeOrder(symbol, 'sell', quantity, currentPrice);
    }
}

async function logTransactions() {
    const response = await axios.get('https://crypto-exchange-api.com/transactions', {
        headers: {
            'API-Key': tradingBot.apiKey,
            'API-Secret': tradingBot.apiSecret
        }
    });
    const transactions = response.data;
    transactions.forEach(transaction => {
        console.log(`Transaction ID: ${transaction.id}, Type: ${transaction.type}, Quantity: ${transaction.quantity}, Price: ${transaction.price}`);
    });
}

// Example usage
const apiKey = 'your-api-key';
const apiSecret = 'your-api-secret';
initializeTradingBot(apiKey, apiSecret);

setInterval(executeTradingStrategy, 60000); // Execute trading strategy every minute
setInterval(logTransactions, 60000); // Log transactions every minute