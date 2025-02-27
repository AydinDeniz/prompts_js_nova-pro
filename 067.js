// Client-side: JavaScript with D3.js for stock market data visualization
const d3 = require('d3');
const axios = require('axios');

let stockData = [];

async function fetchStockData(symbol) {
    const response = await axios.get(`https://stock-market-api.com/${symbol}`);
    return response.data;
}

function drawHistoricalChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#historical-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.price), d3.max(data, d => d.price)])
        .range([height, 0]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.price))
        );
}

function drawPredictiveChart(data) {
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select('#predictive-chart')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleTime()
        .domain(d3.extent(data, d => new Date(d.date)))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.predictedPrice), d3.max(data, d => d.predictedPrice)])
        .range([height, 0]);

    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));

    svg.append('g')
        .call(d3.axisLeft(y));

    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'orange')
        .attr('stroke-width', 1.5)
        .attr('d', d3.line()
            .x(d => x(new Date(d.date)))
            .y(d => y(d.predictedPrice))
        );
}

async function updateStockData(symbol) {
    stockData = await fetchStockData(symbol);
    drawHistoricalChart(stockData);
    drawPredictiveChart(stockData);
}

// Example usage
const symbol = 'AAPL';
updateStockData(symbol);