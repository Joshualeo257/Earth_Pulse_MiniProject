const Crop = require('../models/Crop');
const { IrrigationRecommendation } = require('../models/Irrigation');
const { Sensor, SensorReading, Weather } = require('../models/Sensor');

/**
 * Generates or updates an irrigation recommendation for a single crop.
 * @param {string} cropId - The ID of the crop to generate a recommendation for.
 */
const generateIrrigationRecommendation = async (cropId) => {
  try {
    const crop = await Crop.findById(cropId);
    if (!crop || !crop.isActive) {
      // If crop not found or inactive, do nothing.
      return null;
    }

    // --- Gather Data ---
    // 1. Get latest sensor reading near the crop
    const sensor = await Sensor.findOne({ 'location.section': crop.location.section, type: 'SoilMoisture', status: 'Active' });
    const latestReading = sensor ? await SensorReading.findOne({ sensorId: sensor._id }).sort({ timestamp: -1 }) : null;
    const soilMoisture = latestReading ? latestReading.readings.soilMoisture : 50; // Default if no sensor

    // 2. Get latest weather forecast
    const weather = await Weather.findOne().sort({ timestamp: -1 });
    const rainProbability = weather?.forecast[0]?.precipitation?.probability || 0;

    // --- Decision Logic ---
    let recommendation = {};
    let confidence = 75; // Base confidence
    const daysUntilWatering = crop.daysUntilWatering;

    if (daysUntilWatering <= 0) {
      recommendation = { action: 'Water today', priority: 'Critical' };
      confidence = 95;
    } else if (daysUntilWatering === 1) {
      recommendation = { action: 'Water tomorrow', priority: 'High' };
      confidence = 90;
    } else if (daysUntilWatering === 2) {
      recommendation = { action: 'Water in 2 days', priority: 'Medium' };
    } else {
      recommendation = { action: 'No watering needed', priority: 'Low' };
    }

    // Adjust based on soil moisture
    if (soilMoisture < 25 && recommendation.priority !== 'Critical') {
        recommendation.priority = 'High';
        recommendation.action = 'Water tomorrow';
        confidence = Math.min(100, confidence + 15);
    }
    
    // Adjust based on weather forecast (e.g., if high chance of rain, postpone)
    if (rainProbability > 60 && ['High', 'Medium'].includes(recommendation.priority)) {
        recommendation.action = 'No watering needed';
        recommendation.priority = 'Low';
        confidence = 85;
    }

    // Finalize recommendation details
    recommendation.waterAmount = crop.waterRequirement.dailyAmount;
    recommendation.duration = crop.waterRequirement.dailyAmount * 5; // Example: 5 mins per liter
    recommendation.method = 'Drip';

    const recommendationData = {
      cropId: crop._id,
      recommendation,
      factors: {
        soilMoisture,
        weatherForecast: `Rain probability: ${rainProbability}%`,
        cropStage: crop.stage,
        lastWatered: crop.lastWatered,
      },
      confidence: Math.round(confidence),
      scheduledDate: crop.nextWatering,
      status: 'Pending'
    };
    
    // Use findOneAndUpdate with upsert to create or update the pending recommendation for this crop
    const result = await IrrigationRecommendation.findOneAndUpdate(
        { cropId: crop._id, status: 'Pending' }, // Find existing pending recommendation
        recommendationData, // The new data
        { new: true, upsert: true, runValidators: true } // Options: return new doc, create if not found
    );
    
    console.log(`Generated recommendation for crop ${crop.name}: ${result.recommendation.action}`);
    return result;

  } catch (error) {
    console.error(`Error generating recommendation for crop ${cropId}:`, error);
  }
};

/**
 * Iterates through all active crops and updates their irrigation recommendations.
 * This is used by a cron job.
 */
const updateIrrigationRecommendations = async () => {
  try {
    const activeCrops = await Crop.find({ isActive: true });
    console.log(`Updating recommendations for ${activeCrops.length} active crops.`);

    for (const crop of activeCrops) {
      await generateIrrigationRecommendation(crop._id);
    }
    
    console.log('Finished updating all irrigation recommendations.');
  } catch (error) {
    console.error('Error in updateIrrigationRecommendations service:', error);
  }
};

module.exports = {
  generateIrrigationRecommendation,
  updateIrrigationRecommendations
};