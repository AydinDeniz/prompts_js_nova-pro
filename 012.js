const apiKey = 'your_openweathermap_api_key';
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

function searchWeather() {
    const city = document.getElementById('cityInput').value;
    if (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                displayWeather(data);
                saveRecentSearch(city);
            })
            .catch(error => console.error('Error:', error));
    }
}

function displayWeather(data) {
    const temp = (data.main.temp - 273.15).toFixed(2); // Convert Kelvin to Celsius
    const weatherChart = document.getElementById('weatherChart').getContext('2d');
    new Chart(weatherChart, {
        type: 'bar',
        data: {
            labels: ['Temperature'],
            datasets: [{
                label: 'Weather',
                data: [temp],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
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

function saveRecentSearch(city) {
    if (!recentSearches.includes(city)) {
        recentSearches.push(city);
        if (recentSearches.length > 5) {
            recentSearches.shift();
        }
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        displayRecentSearches();
    }
}

function displayRecentSearches() {
    const recentSearchesDiv = document.getElementById('recentSearches');
    recentSearchesDiv.innerHTML = '';
    recentSearches.forEach(city => {
        const button = document.createElement('button');
        button.textContent = city;
        button.onclick = () => {
            document.getElementById('cityInput').value = city;
            searchWeather();
        };
        recentSearchesDiv.appendChild(button);
    });
}

displayRecentSearches();