const express = require('express');
const router = express.Router();
const { getWeatherData } = require('../services/weatherService');

// GET /api/weather/bangalore - Get the latest weather for Bangalore
router.get('/bangalore', async (req, res, next) => {
    try {
        const weatherData = await getWeatherData(); // Uses default Bangalore coordinates
        res.json({ success: true, data: weatherData });
    } catch (error) {
        // Pass the error to the global error handler
        next(error);
    }
});

// GET /api/weather/by-coords?lat=...&lon=... - Get weather for specific coordinates
router.get('/by-coords', async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ success: false, message: 'Latitude (lat) and Longitude (lon) are required query parameters.' });
        }
        const weatherData = await getWeatherData(parseFloat(lat), parseFloat(lon));
        res.json({ success: true, data: weatherData });
    } catch (error) {
        next(error);
    }
});

module.exports = router;