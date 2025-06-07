// backend/services/irrigationAIService.js (REVERTED to simpler, stable version)

const axios = require('axios');
const Crop = require('../models/Crop');
const { getWeatherData } = require('./weatherService');

const ML_SERVICE_URL = 'http://127.0.0.1:5002/predict';
const NORMALIZATION_RANGES = {
    Soil_Moisture: { min: 10, max: 95 }, Temperature: { min: 10, max: 40 },
    Humidity: { min: 20, max: 95 }, Rainfall: { min: 0, max: 15 },
    crop_age: { min: 5, max: 100 }, crop_stage: { min: 0.25, max: 1.0 },
    water_needs: { min: 0.2, max: 0.9 },
};
const STAGE_MAP = {'Seedling': 0.25, 'Growing': 0.5, 'Mature': 0.75, 'Harvesting': 1.0};
const NEEDS_MAP = {'Low': 0.2, 'Medium': 0.5, 'Medium-High': 0.7, 'High': 0.9};

const normalize = (value, featureName) => {
    if (value == null || isNaN(value)) return 0;
    const range = NORMALIZATION_RANGES[featureName];
    if (!range) return 0;
    const result = (value - range.min) / (range.max - range.min);
    return Math.max(0, Math.min(1, result));
};

const generateAISchedule = async (cropId) => {
    const crop = await Crop.findById(cropId);
    if (!crop) throw new Error('Crop not found');

    const weatherData = await getWeatherData(
        crop.location.coordinates?.latitude,
        crop.location.coordinates?.longitude
    );

    const imageData = [];
    const cropWaterNeeds = NEEDS_MAP[crop.waterNeeds] || 0.5;
    const cropStage = STAGE_MAP[crop.stage] || 0.5;

    for (let i = 0; i < 14; i++) {
        const forecastDay = weatherData.daily[Math.min(i, weatherData.daily.length - 1)];
        const dayTemp = forecastDay?.temperature?.max || 25;

        // Using simpler, more predictable placeholders for the input tensor
        const dailyValues = [
            normalize(40, 'Soil_Moisture'), // Placeholder for slightly dry soil
            normalize(dayTemp, 'Temperature'),
            normalize(60, 'Humidity'),      // Placeholder for average humidity
            normalize(0, 'Rainfall'),
            normalize(crop.daysSincePlanted + i, 'crop_age'),
            normalize(cropStage, 'crop_stage'),
            normalize(cropWaterNeeds, 'water_needs')
        ];
        imageData.push(dailyValues);
    }

    try {
        const response = await axios.post(ML_SERVICE_URL, { image_data: imageData });
        if (response.data && response.data.success) {
            const { schedule, quantity } = response.data.prediction;
            const newSchedule = { schedule, quantity, generatedAt: new Date() };
            crop.aiSchedule = newSchedule;
            await crop.save();
            return newSchedule;
        } else {
            throw new Error(response.data.error || 'ML service returned non-success.');
        }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        throw new Error(`AI prediction service failed: ${errorMessage}`);
    }
};

module.exports = { generateAISchedule };