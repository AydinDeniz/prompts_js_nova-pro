// Combined JavaScript Implementation for Smart Home Dashboard

const express = require('express');
const WebSocket = require('ws');
const d3 = require('d3');

const app = express();
const server = app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

const wss = new WebSocket.Server({ server });

// Simulated IoT device data
let deviceData = {
    temperature: 22,
    humidity: 50,
    energyConsumption: 150
};

// WebSocket connection to handle remote control
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Send initial device data to the client
    ws.send(JSON.stringify(deviceData));

    ws.on('message', (message) => {
        const { action, value } = JSON.parse(message);

        if (action === 'setTemperature') {
            deviceData.temperature = value;
        } else if (action === 'setHumidity') {
            deviceData.humidity = value;
        } else if (action === 'setEnergyConsumption') {
            deviceData.energyConsumption = value;
        }

        // Broadcast updated device data to all clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(deviceData));
            }
        });
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Serve the dashboard HTML
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Smart Home Dashboard</title>
            <style>
                #chart {
                    width: 600px;
                    height: 400px;
                    border: 1px solid #ccc;
                }
            </style>
        </head>
        <body>
            <h1>Smart Home Dashboard</h1>
            <div id="chart"></div>
            <div>
                <label for="temperature">Temperature:</label>
                <input type="number" id="temperature" value="${deviceData.temperature}">
                <button onclick="setTemperature()">Set Temperature</button>
            </div>
            <div>
                <label for="humidity">Humidity:</label>
                <input type="number" id="humidity" value="${deviceData.humidity}">
                <button onclick="setHumidity()">Set Humidity</button>
            </div>
            <div>
                <label for="energyConsumption">Energy Consumption:</label>
                <input type="number" id="energyConsumption" value="${deviceData.energyConsumption}">
                <button onclick="setEnergyConsumption()">Set Energy Consumption</button>
            </div>

            <script src="https://d3js.org/d3.v6.min.js"></script>
            <script>
                const ws = new WebSocket('ws://localhost:3000');
                const chart = d3.select('#chart');

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);

                    const svg = chart.selectAll('svg').data([data]);
                    const gEnter = svg.enter().append('svg');

                    gEnter.append('circle')
                        .attr('cx', 300)
                        .attr('cy', 200)
                        .attr('r', 50)
                        .attr('fill', 'blue');

                    svg.select('circle')
                        .transition()
                        .duration(1000)
                        .attr('r', data.temperature * 2);

                    svg.selectAll('text').remove();
                    svg.append('text')
                        .attr('x', 300)
                        .attr('y', 200)
                        .attr('text-anchor', 'middle')
                        .attr('dominant-baseline', 'middle')
                        .text(\`Temperature: \${data.temperature}°C\`);
                };

                function setTemperature() {
                    const temperature = document.getElementById('temperature').value;
                    ws.send(JSON.stringify({ action: 'setTemperature', value: temperature }));
                }

                function setHumidity() {
                    const humidity = document.getElementById('humidity').value;
                    ws.send(JSON.stringify({ action: 'setHumidity', value: humidity }));
                }

                function setEnergyConsumption() {
                    const energyConsumption = document.getElementById('energyConsumption').value;
                    ws.send(JSON.stringify({ action: 'setEnergyConsumption', value: energyConsumption }));
                }
            </script>
        </body>
        </html>
    `);
});