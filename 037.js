// Client-side: JavaScript with WebSockets, stock market API, and D3.js
const WebSocket = require('ws');
const d3 = require('d3');

let ws;
let stocks = {};
let portfolio = {};

function connectWebSocket() {
    ws = new WebSocket('wss://streamer.finance.yahoo.com');

    ws.on('open', () => {
        console.log('Connected to WebSocket');
    });

    ws.on('message', (data) => {
        const stockData = JSON.parse(data);
        updateStockData(stockData);
        updatePortfolio();
        visualizePortfolio();
    });

    ws.on('close', () => {
        console.log('Disconnected from WebSocket');
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
}

function updateStockData(stockData) {
    for (const symbol in stockData) {
        if (!stocks[symbol]) {
            stocks[symbol] = { price: 0, change: 0 };
        }
        stocks[symbol].price = stockData[symbol].p;
        stocks[symbol].change = stockData[symbol].c;
    }
}

function updatePortfolio() {
    let totalValue = 0;
    for (const symbol in portfolio) {
        const quantity = portfolio[symbol].quantity;
        const price = stocks[symbol].price;
        portfolio[symbol].value = quantity * price;
        totalValue += portfolio[symbol].value;
    }
    document.getElementById('total-value').textContent = `Total Value: $${totalValue.toFixed(2)}`;
}

function visualizePortfolio() {
    const svg = d3.select('svg');
    svg.selectAll('*').remove();

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const x = d3.scaleBand()
        .domain(Object.keys(portfolio))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const y = d3.scaleLinear()
        .domain([0, d3.max(Object.values(portfolio), d => d.value)])
        .nice()
        .range([height - margin.bottom, margin.top]);

    svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    svg.selectAll('.bar')
        .data(Object.values(portfolio))
        .enter().append('rect')
        .attr('class', 'bar')
        .attr('x', d => x(d.symbol))
        .attr('y', d => y(d.value))
        .attr('width', x.bandwidth())
        .attr('height', d => y(0) - y(d.value));
}

function buyStock(symbol, quantity) {
    if (!portfolio[symbol]) {
        portfolio[symbol] = { quantity: 0, value: 0 };
    }
    portfolio[symbol].quantity += quantity;
    updatePortfolio();
    visualizePortfolio();
}

function sellStock(symbol, quantity) {
    if (portfolio[symbol] && portfolio[symbol].quantity >= quantity) {
        portfolio[symbol].quantity -= quantity;
        updatePortfolio();
        visualizePortfolio();
    }
}

connectWebSocket();

// Example usage
buyStock('AAPL', 10);
sellStock('AAPL', 5);