// backend/routes/ai.js

const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');

/**
 * POST /api/ai/schedule/:cropId
 * Simulates calling an AI model to generate a more realistic 14-day irrigation schedule.
 */
router.post('/schedule/:cropId', async (req, res, next) => {
    try {
        const { cropId } = req.params;
        const crop = await Crop.findById(cropId);

        if (!crop) {
            return res.status(404).json({ success: false, message: 'Crop not found.' });
        }

        // --- NEW REALISTIC AI MODEL SIMULATION ---

        const schedule = new Array(14).fill(0);
        const quantity = new Array(14).fill(0);

        // 1. Define base "moisture depletion" per day. Higher needs = depletes faster.
        const waterNeedsDepletion = {
            'Low': 15,
            'Medium': 25,
            'Medium-High': 35,
            'High': 45
        };
        const baseDepletion = waterNeedsDepletion[crop.waterNeeds];

        // 2. Set the irrigation trigger threshold. Water when moisture drops below this.
        const triggerThreshold = 30;

        // 3. Start with a "full" soil moisture level.
        let soilMoisture = 100; 
        
        for (let i = 0; i < 14; i++) {
            // Simulate a daily weather factor (1.0 = normal, >1.0 = hot/dry, <1.0 = cool/humid)
            const weatherFactor = 0.8 + Math.random() * 0.6; // Creates values between 0.8 and 1.4

            // Deplete soil moisture for the day
            soilMoisture -= baseDepletion * weatherFactor;

            // 4. Check if we need to irrigate
            if (soilMoisture < triggerThreshold) {
                // It's a watering day!
                schedule[i] = 1;
                
                // Refill the "moisture bucket". High-need crops get a bigger refill.
                soilMoisture = 100; 
                
                // Calculate water quantity based on crop's needs, with slight variation
                const waterAmount = parseFloat(
                    (crop.waterRequirement.dailyAmount * crop.waterRequirement.frequency * (0.9 + Math.random() * 0.2)).toFixed(1)
                );
                quantity[i] = waterAmount;

            } else {
                // No watering needed today
                schedule[i] = 0;
                quantity[i] = 0;
            }
        }
        // --- End of New Simulation ---

        const aiSchedule = {
            schedule,
            quantity,
            generatedAt: new Date(),
            source: 'ViT-Model-Simulated-v2' // Version 2 of our simulation
        };

        // Update the crop document with the new AI schedule
        crop.aiSchedule = aiSchedule;
        await crop.save();

        console.log(`Generated Realistic AI schedule for crop: ${crop.name}`);

        res.json({ success: true, message: 'AI schedule generated successfully.', data: aiSchedule });

    } catch (error) {
        // Pass error to the global error handler
        next(error);
    }
});

module.exports = router;