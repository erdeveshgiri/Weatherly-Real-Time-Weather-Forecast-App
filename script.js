const API_KEY = '9c0e41eb9e7d4ff4abb143006252709';
const BASE_URL = 'https://api.weatherapi.com/v1';

const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const loading = document.getElementById('loading');
const error = document.getElementById('error');
const weatherDisplay = document.getElementById('weatherDisplay');
const welcome = document.getElementById('welcome');

const weatherIcon = document.getElementById('weatherIcon');
const temperature = document.getElementById('temperature');
const description = document.getElementById('description');
const cityName = document.getElementById('cityName');
const currentDate = document.getElementById('currentDate');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const forecastContainer = document.getElementById('forecastContainer');

searchBtn.addEventListener('click', handleSearch);
locationBtn.addEventListener('click', getCurrentLocation);
cityInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        handleSearch();
    }
});

function showWelcome() {
    welcome.classList.remove('hidden');
    loading.classList.add('hidden');
    error.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

function showLoading() {
    hideWelcome();
    loading.classList.remove('hidden');
    error.classList.add('hidden');
    weatherDisplay.classList.add('hidden');
}

function showError() {
    hideWelcome();
    loading.classList.add('hidden');
    error.classList.remove('hidden');
    weatherDisplay.classList.add('hidden');
}

function showWeather() {
    hideWelcome();
    loading.classList.add('hidden');
    error.classList.add('hidden');
    weatherDisplay.classList.remove('hidden');
}

function hideWelcome() {
    welcome.classList.add('hidden');
}

async function handleSearch() {
    const city = cityInput.value.trim();
    if (!city) {
        alert('Please enter a city name!');
        return;
    }
    await getWeatherData(city);
}

function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('Location not supported by your browser!');
        return;
    }
    
    showLoading();
    navigator.geolocation.getCurrentPosition(
        async function(position) {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            await getWeatherData(`${lat},${lon}`);
        },
        function() {
            showError();
        }
    );
}

async function getWeatherData(location) {
    try {
        showLoading();
        
        const currentResponse = await fetch(
            `${BASE_URL}/current.json?key=${API_KEY}&q=${location}`
        );
        
        if (!currentResponse.ok) {
            throw new Error('City not found');
        }
        
        const currentData = await currentResponse.json();
        
        const forecastResponse = await fetch(
            `${BASE_URL}/forecast.json?key=${API_KEY}&q=${location}&days=5`
        );
        
        const forecastData = await forecastResponse.json();
        
        displayWeatherData(currentData, forecastData);
        
    } catch (err) {
        console.error('Error:', err);
        showError();
    }
}

function displayWeatherData(current, forecast) {
    weatherIcon.src = `https:${current.current.condition.icon}`;
    weatherIcon.alt = current.current.condition.text;
    
    temperature.textContent = Math.round(current.current.temp_c);
    description.textContent = current.current.condition.text;
    
    cityName.textContent = `${current.location.name}, ${current.location.country}`;
    
    const now = new Date(current.location.localtime);
    currentDate.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    feelsLike.textContent = `${Math.round(current.current.feelslike_c)}°C`;
    humidity.textContent = `${current.current.humidity}%`;
    windSpeed.textContent = `${Math.round(current.current.wind_kph)} km/h`;
    pressure.textContent = `${current.current.pressure_mb} hPa`;
    
    displayForecast(forecast.forecast.forecastday);
    
    showWeather();
    cityInput.value = '';
}

function displayForecast(forecastDays) {
    forecastContainer.innerHTML = '';
    
    forecastDays.forEach((day, index) => {
        const dayDate = new Date(day.date);
        const dayName = index === 0 ? 'Today' : 
                       dayDate.toLocaleDateString('en-US', { weekday: 'short' });
        
        const dateStr = dayDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
        
        const forecastItem = document.createElement('div');
        forecastItem.className = 'forecast-item';
        
        forecastItem.innerHTML = `
            <div class="day">${dayName}</div>
            <div class="date">${dateStr}</div>
            <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
            <div class="temp">${Math.round(day.day.maxtemp_c)}°</div>
            <div class="desc">${day.day.condition.text}</div>
        `;
        
        forecastContainer.appendChild(forecastItem);
    });
}

function searchCity(cityName) {
    cityInput.value = cityName;
    getWeatherData(cityName);
}

window.addEventListener('load', function() {
    showWelcome();
    console.log('Weather app loaded successfully!');
});
