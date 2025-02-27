// Client-side: JavaScript with weather data retrieval and visualization
const axios = require('axios');
const Chart = require('chart.js');

async function fetchWeatherData(location) {
    const apiKey = 'your-api-key';
    const response = await axios.get(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`);
    return response.data;
}

function displayCurrentWeather(weatherData) {
    const currentWeatherDiv = document.getElementById('current-weather');
    currentWeatherDiv.innerHTML = `
        <h2>${weatherData.location.name}, ${weatherData.location.country}</h2>
        <p>Temperature: ${weatherData.current.temp_c}°C</p>
        <p>Condition: ${weatherData.current.condition.text}</p>
    `;
}

function displayHourlyForecast(weatherData) {
    const hourlyForecastDiv = document.getElementById('hourly-forecast');
    hourlyForecastDiv.innerHTML = '';
    weatherData.forecast.forecastday[0].hour.forEach(hour => {
        const forecastItem = document.createElement('div');
        forecastItem.innerHTML = `
            <p>${hour.time.split(' ')[1]}</p>
            <p>Temperature: ${hour.temp_c}°C</p>
            <p>Condition: ${hour.condition.text}</p>
        `;
        hourlyForecastDiv.appendChild(forecastItem);
    });
}

function displayWeeklyForecast(weatherData) {
    const weeklyForecastDiv = document.getElementById('weekly-forecast');
    weeklyForecastDiv.innerHTML = '';
    weatherData.forecast.forecastday.forEach(day => {
        const forecastItem = document.createElement('div');
        forecastItem.innerHTML = `
            <p>${day.date}</p>
            <p>Max Temperature: ${day.day.maxtemp_c}°C</p>
            <p>Min Temperature: ${day.day.mintemp_c}°C</p>
            <p>Condition: ${day.day.condition.text}</p>
        `;
        weeklyForecastDiv.appendChild(forecastItem);
    });
}

function visualizeHistoricalWeather(weatherData) {
    const historicalWeatherDiv = document.getElementById('historical-weather');
    const dates = weatherData.forecast.forecastday.map(day => day.date);
    const temperatures = weatherData.forecast.forecastday.map(day => day.day.avgtemp_c);
    const ctx = historicalWeatherDiv.getContext('2d');
    if (window.myChart) {
        window.myChart.destroy();
    }
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Average Temperature',
                data: temperatures,
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

async function updateWeatherDashboard(location) {
    const weatherData = await fetchWeatherData(location);
    displayCurrentWeather(weatherData);
    displayHourlyForecast(weatherData);
    displayWeeklyForecast(weatherData);
    visualizeHistoricalWeather(weatherData);
}

// Example usage
updateWeatherDashboard('London');