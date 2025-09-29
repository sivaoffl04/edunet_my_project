// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const apiKey = 'Enter Your Api'; // Api key for OpenWeatherMap

    // --- DOM ELEMENT REFERENCES ---
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const weatherContainer = document.getElementById('weather-container');

    // Current Weather Elements
    const cityNameEl = document.getElementById('city-name');
    const currentDateEl = document.getElementById('current-date');
    const temperatureEl = document.getElementById('temperature');
    const weatherIconEl = document.getElementById('weather-icon');
    const weatherConditionEl = document.getElementById('weather-condition');

    // Extra Details Elements
    const feelsLikeEl = document.getElementById('feels-like');
    const humidityEl = document.getElementById('humidity');
    const windSpeedEl = document.getElementById('wind-speed');
    const sunriseEl = document.getElementById('sunrise');
    const sunsetEl = document.getElementById('sunset');

    // Forecast Elements
    const forecastCardsContainer = document.getElementById('forecast-cards');

    // --- API HELPER ---
    /**
     * Fetches weather data for a given city.
     * @param {string} city The name of the city.
     */
    const getWeatherData = async (city) => {
        // API Key validation check
        if (apiKey === 'YOUR_API_KEY') {
            alert('Please replace "YOUR_API_KEY" with your actual OpenWeatherMap API key in script.js');
            return;
        }

        const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

        try {
            // Use Promise.all to fetch both current weather and forecast concurrently
            const [currentWeatherResponse, forecastResponse] = await Promise.all([
                fetch(currentWeatherUrl),
                fetch(forecastUrl)
            ]);

            if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                throw new Error('City not found. Please check the spelling and try again.');
            }

            const currentWeatherData = await currentWeatherResponse.json();
            const forecastData = await forecastResponse.json();

            updateUI(currentWeatherData, forecastData);
            localStorage.setItem('lastSearchedCity', city); // Save last searched city

        } catch (error) {
            alert(error.message);
            console.error('Error fetching weather data:', error);
        }
    };

    // --- UI UPDATE FUNCTIONS ---
    /**
     * Updates the entire UI with new weather data.
     * @param {object} currentWeatherData - Data from the current weather API endpoint.
     * @param {object} forecastData - Data from the forecast API endpoint.
     */
    const updateUI = (currentWeatherData, forecastData) => {
        updateCurrentWeather(currentWeatherData);
        updateForecast(forecastData);
        updateBackground(currentWeatherData.weather[0].main);
    };

    /**
     * Updates the current weather section of the UI.
     * @param {object} data - The current weather data object.
     */
    const updateCurrentWeather = (data) => {
        cityNameEl.textContent = `${data.name}, ${data.sys.country}`;
        currentDateEl.textContent = new Date().toLocaleDateString('en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        temperatureEl.textContent = `${Math.round(data.main.temp)}°C`;
        weatherIconEl.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        weatherIconEl.alt = data.weather[0].description;
        weatherConditionEl.textContent = data.weather[0].description;

        feelsLikeEl.textContent = `${Math.round(data.main.feels_like)}°C`;
        humidityEl.textContent = `${data.main.humidity}%`;
        windSpeedEl.textContent = `${data.wind.speed.toFixed(1)} m/s`;
        sunriseEl.textContent = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        sunsetEl.textContent = new Date(data.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    /**
     * Updates the 5-day forecast section of the UI.
     * @param {object} data - The forecast data object.
     */
    const updateForecast = (data) => {
        forecastCardsContainer.innerHTML = ''; // Clear previous forecast cards

        // Filter the forecast list to get one entry per day (around midday)
        const dailyForecasts = data.list.filter(item => item.dt_txt.includes("12:00:00"));

        dailyForecasts.forEach(day => {
            const card = document.createElement('div');
            card.classList.add('forecast-card');

            const date = new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' });
            const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
            const temp = `${Math.round(day.main.temp)}°C`;

            card.innerHTML = `
                <p class="date">${date}</p>
                <img src="${icon}" alt="${day.weather[0].description}" class="icon">
                <p class="temp">${temp}</p>
            `;
            forecastCardsContainer.appendChild(card);
        });
    };

    /**
     * Updates the body background based on the weather condition.
     * @param {string} weatherMain - The main weather condition (e.g., "Clear", "Clouds").
     */
    const updateBackground = (weatherMain) => {
        const body = document.body;
        body.className = ''; // Reset classes

        switch (weatherMain.toLowerCase()) {
            case 'clear':
                body.classList.add('sunny');
                break;
            case 'clouds':
                body.classList.add('cloudy');
                break;
            case 'rain':
            case 'drizzle':
            case 'mist':
                body.classList.add('rainy');
                break;
            case 'snow':
                body.classList.add('snowy');
                break;
            case 'thunderstorm':
                body.classList.add('thunderstorm');
                break;
            default:
                // Keep default gradient for other conditions like 'Haze', 'Fog', etc.
                break;
        }
    };

    // --- GEOLOCATION ---
    /**
     * Fetches weather for the user's current location.
     */
    const getWeatherByLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser. Please search for a city.");
            return;
        }

        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

            try {
                // Use Promise.all to fetch both concurrently, just like in getWeatherData
                const [currentWeatherResponse, forecastResponse] = await Promise.all([
                    fetch(currentWeatherUrl),
                    fetch(forecastUrl)
                ]);

                if (!currentWeatherResponse.ok || !forecastResponse.ok) {
                    throw new Error('Could not fetch weather for your location.');
                }

                const currentWeatherData = await currentWeatherResponse.json();
                const forecastData = await forecastResponse.json();

                updateUI(currentWeatherData, forecastData);
                localStorage.setItem('lastSearchedCity', currentWeatherData.name); // Save city from location
            } catch (error) {
                alert(error.message);
                console.error(error);
            }
        }, (error) => {
            alert("Unable to retrieve your location. Please allow location access or search for a city manually.");
            console.error("Geolocation error:", error);
        });
    };

    // --- EVENT LISTENERS ---
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (city) {
            getWeatherData(city);
            cityInput.value = ''; // Clear input after search
        } else {
            alert('Please enter a city name.');
        }
    });

    // --- INITIALIZATION ---
    /**
     * Initializes the application.
     * Tries to load the last searched city, otherwise falls back to geolocation.
     */
    const init = () => {
        const lastCity = localStorage.getItem('lastSearchedCity');
        if (lastCity) {
            getWeatherData(lastCity);
        } else {
            getWeatherByLocation();
        }
    };

    init();

});
