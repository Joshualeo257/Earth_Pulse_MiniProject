const express = require('express');
const router = express.Router();
const Crop = require('../models/Crop');
const { IrrigationRecommendation } = require('../models/Irrigation');
const { generateIrrigationRecommendation } = require('../services/irrigationService');

// GET /api/crops - Get all crops
router.get('/', async (req, res) => {
  try {
    const { stage, waterNeeds, section, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = { isActive: true };
    
    // Apply filters
    if (stage) query.stage = stage;
    if (waterNeeds) query.waterNeeds = waterNeeds;
    if (section) query['location.section'] = section;
    
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    const crops = await Crop.find(query).sort(sortOptions);
    
    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching crops',
      error: error.message
    });
  }
});

// GET /api/crops/:id - Get single crop
router.get('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching crop',
      error: error.message
    });
  }
});

// POST /api/crops - Create new crop
router.post('/', async (req, res) => {
  try {
    const cropData = req.body;
    
    // Set water requirements based on crop type and water needs
    const waterRequirements = {
      'Low': { dailyAmount: 0.5, frequency: 5 },
      'Medium': { dailyAmount: 1.5, frequency: 3 },
      'Medium-High': { dailyAmount: 2.5, frequency: 2 },
      'High': { dailyAmount: 4, frequency: 1 }
    };
    
    cropData.waterRequirement = waterRequirements[cropData.waterNeeds] || waterRequirements['Medium'];
    
    const crop = new Crop(cropData);
    
    // Calculate initial next watering date
    crop.calculateNextWatering();
    
    await crop.save();
    
    // Generate initial irrigation recommendation
    await generateIrrigationRecommendation(crop._id);
    
    res.status(201).json({
      success: true,
      message: 'Crop created successfully',
      data: crop
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating crop',
      error: error.message
    });
  }
});

// PUT /api/crops/:id - Update crop
router.put('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    // Update crop fields
    Object.keys(req.body).forEach(key => {
      if (req.body[key] !== undefined) {
        crop[key] = req.body[key];
      }
    });
    
    // Recalculate watering if water needs changed
    if (req.body.waterNeeds) {
      const waterRequirements = {
        'Low': { dailyAmount: 0.5, frequency: 5 },
        'Medium': { dailyAmount: 1.5, frequency: 3 },
        'Medium-High': { dailyAmount: 2.5, frequency: 2 },
        'High': { dailyAmount: 4, frequency: 1 }
      };
      crop.waterRequirement = waterRequirements[req.body.waterNeeds];
      crop.calculateNextWatering();
    }
    
    await crop.save();
    
    res.json({
      success: true,
      message: 'Crop updated successfully',
      data: crop
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating crop',
      error: error.message
    });
  }
});

// DELETE /api/crops/:id - Delete crop (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    crop.isActive = false;
    await crop.save();
    
    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting crop',
      error: error.message
    });
  }
});

// POST /api/crops/:id/water - Water a crop
router.post('/:id/water', async (req, res) => {
  try {
    const { amount, method = 'Manual', duration = 0, notes = '' } = req.body;
    
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    await crop.waterCrop(amount, method, duration, notes);
    
    // Generate new irrigation recommendation after watering
    await generateIrrigationRecommendation(crop._id);
    
    res.json({
      success: true,
      message: 'Crop watered successfully',
      data: crop
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error watering crop',
      error: error.message
    });
  }
});

// POST /api/crops/:id/stage - Update crop stage
router.post('/:id/stage', async (req, res) => {
  try {
    const { stage, notes } = req.body;
    
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    await crop.updateStage(stage, notes);
    
    // Generate new irrigation recommendation after stage change
    await generateIrrigationRecommendation(crop._id);
    
    res.json({
      success: true,
      message: 'Crop stage updated successfully',
      data: crop
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating crop stage',
      error: error.message
    });
  }
});

// GET /api/crops/:id/history - Get crop irrigation history
router.get('/:id/history', async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;
    
    const crop = await Crop.findById(req.params.id);
    
    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }
    
    const history = crop.irrigationHistory
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(offset, offset + parseInt(limit));
    
    res.json({
      success: true,
      data: {
        history,
        total: crop.irrigationHistory.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation history',
      error: error.message
    });
  }
});

// GET /api/crops/needing-water - Get crops that need watering
router.get('/status/needing-water', async (req, res) => {
  try {
    const { days = 1 } = req.query;
    
    const crops = await Crop.getCropsNeedingWater(parseInt(days));
    
    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching crops needing water',
      error: error.message
    });
  }
});

// GET /api/crops/by-stage/:stage - Get crops by stage
router.get('/stage/:stage', async (req, res) => {
  try {
    const crops = await Crop.getCropsByStage(req.params.stage);
    
    res.json({
      success: true,
      count: crops.length,
      data: crops
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching crops by stage',
      error: error.message
    });
  }
});

// GET /api/crops/:id/recommendations - Get irrigation recommendations for crop
router.get('/:id/recommendations', async (req, res) => {
  try {
    const recommendations = await IrrigationRecommendation.getRecommendationsByCrop(req.params.id);
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
});

module.exports = router;