// backend/services/weatherService.js (FINAL - Using Free Endpoints)
const axios = require('axios');

const API_KEY = process.env.OPENWEATHER_API_KEY ? process.env.OPENWEATHER_API_KEY.trim() : null;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

/**
 * Fetches comprehensive weather data using two separate free-tier OpenWeatherMap API calls
 * and combines them into a single, clean object.
 * @param {number} lat Latitude
 * @param {number} lon Longitude
 * @returns {object} A fully formatted weather data object for the frontend.
 */
const getWeatherData = async (lat = 12.9716, lon = 77.5946) => {
    if (!API_KEY) {
        throw new Error('OpenWeatherMap API key is missing or not loaded from .env');
    }

    // --- Step 1: Define parameters for both API calls ---
    const weatherParams = new URLSearchParams({
        lat: lat,
        lon: lon,
        appid: API_KEY,
        units: 'metric'
    });
    
    const forecastParams = new URLSearchParams({
        lat: lat,
        lon: lon,
        appid: API_KEY,
        units: 'metric',
        cnt: 40 // Request all 40 timestamps for the 5-day forecast
    });

    try {
        // --- Step 2: Make both API calls concurrently ---
        const [weatherResponse, forecastResponse] = await Promise.all([
            axios.get(`${BASE_URL}/weather`, { params: weatherParams }),
            axios.get(`${BASE_URL}/forecast`, { params: forecastParams })
        ]);

        const currentData = weatherResponse.data;
        const forecastData = forecastResponse.data;

        // --- Step 3: Process the 5-day forecast to get one unique entry per day ---
        const dailyForecasts = [];
        const seenDays = new Set();
        
        for (const forecast of forecastData.list) {
            const day = new Date(forecast.dt * 1000).toISOString().split('T')[0];
            if (!seenDays.has(day) && seenDays.size < 5) { // Get up to 5 unique days
                dailyForecasts.push({
                    timestamp: new Date(forecast.dt * 1000).toISOString(),
                    temperature: {
                        min: forecast.main.temp_min,
                        max: forecast.main.temp_max,
                    },
                    icon: forecast.weather[0]?.icon || '01d',
                });
                seenDays.add(day);
            }
        }
        
        // --- Step 4: Combine into the final, clean data structure ---
        const formattedData = {
            location: {
                name: currentData.name,
            },
            current: {
                temperature: currentData.main.temp,
                condition_desc: currentData.weather[0]?.description || 'No description',
                icon: currentData.weather[0]?.icon || '01d',
                humidity: currentData.main.humidity,
                windSpeed: currentData.wind.speed,
            },
            daily: dailyForecasts,
            hourly: forecastData.list.slice(0, 8).map(hour => ({ // Get next 8 timestamps (24 hours)
                time: new Date(hour.dt * 1000).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
                temp: hour.main.temp,
                humidity: hour.main.humidity,
            }))
        };

        console.log("Successfully fetched and combined weather data from free API endpoints.");
        return formattedData;

    } catch (error) {
        console.error("--- Axios Request Failed (Free Tier) ---");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error Message:", error.message);
        }
        console.error("--------------------------------------");
        throw new Error('Failed to fetch weather data from external provider.');
    }
};

module.exports = { getWeatherData };