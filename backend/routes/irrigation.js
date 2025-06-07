const express = require('express');
const router = express.Router();
const { IrrigationRecommendation, IrrigationSchedule, IrrigationSystem } = require('../models/Irrigation');
const Crop = require('../models/Crop');
const { generateIrrigationRecommendation, updateIrrigationRecommendations } = require('../services/irrigationService');

// GET /api/irrigation/recommendations - Get all irrigation recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const { status, priority, cropId, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (priority) query['recommendation.priority'] = priority;
    if (cropId) query.cropId = cropId;
    
    const recommendations = await IrrigationRecommendation.find(query)
      .populate('cropId', 'name stage waterNeeds location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await IrrigationRecommendation.countDocuments(query);
    
    res.json({
      success: true,
      count: recommendations.length,
      total,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation recommendations',
      error: error.message
    });
  }
});

// GET /api/irrigation/recommendations/pending - Get pending recommendations
router.get('/recommendations/pending', async (req, res) => {
  try {
    const recommendations = await IrrigationRecommendation.getPendingRecommendations();
    
    res.json({
      success: true,
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching pending recommendations',
      error: error.message
    });
  }
});

// POST /api/irrigation/recommendations/:id/approve - Approve recommendation
router.post('/recommendations/:id/approve', async (req, res) => {
  try {
    const { notes = '' } = req.body;
    
    const recommendation = await IrrigationRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }
    
    await recommendation.approve(notes);
    
    // Create irrigation schedule if approved
    const schedule = new IrrigationSchedule({
      cropId: recommendation.cropId,
      scheduledDate: recommendation.scheduledDate || new Date(),
      waterAmount: recommendation.recommendation.waterAmount,
      duration: recommendation.recommendation.duration,
      method: recommendation.recommendation.method,
      autoExecute: true
    });
    
    await schedule.save();
    
    res.json({
      success: true,
      message: 'Recommendation approved and scheduled',
      data: {
        recommendation,
        schedule
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error approving recommendation',
      error: error.message
    });
  }
});

// POST /api/irrigation/recommendations/:id/reject - Reject recommendation
router.post('/recommendations/:id/reject', async (req, res) => {
  try {
    const { reason = '' } = req.body;
    
    const recommendation = await IrrigationRecommendation.findById(req.params.id);
    
    if (!recommendation) {
      return res.status(404).json({
        success: false,
        message: 'Recommendation not found'
      });
    }
    
    await recommendation.reject(reason);
    
    res.json({
      success: true,
      message: 'Recommendation rejected',
      data: recommendation
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error rejecting recommendation',
      error: error.message
    });
  }
});

// POST /api/irrigation/recommendations/refresh - Refresh all recommendations
router.post('/recommendations/refresh', async (req, res) => {
  try {
    await updateIrrigationRecommendations();
    
    const recommendations = await IrrigationRecommendation.getPendingRecommendations();
    
    res.json({
      success: true,
      message: 'Recommendations refreshed successfully',
      count: recommendations.length,
      data: recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error refreshing recommendations',
      error: error.message
    });
  }
});

// GET /api/irrigation/schedule - Get irrigation schedules
router.get('/schedule', async (req, res) => {
  try {
    const { status, date, cropId, limit = 50, offset = 0 } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (cropId) query.cropId = cropId;
    if (date) {
      const targetDate = new Date(date);
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
      const endOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1);
      query.scheduledDate = { $gte: startOfDay, $lt: endOfDay };
    }
    
    const schedules = await IrrigationSchedule.find(query)
      .populate('cropId', 'name location')
      .sort({ scheduledDate: 1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));
    
    const total = await IrrigationSchedule.countDocuments(query);
    
    res.json({
      success: true,
      count: schedules.length,
      total,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation schedules',
      error: error.message
    });
  }
});

// GET /api/irrigation/schedule/today - Get today's irrigation schedule
router.get('/schedule/today', async (req, res) => {
  try {
    const schedules = await IrrigationSchedule.getTodaysSchedule();
    
    res.json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching today\'s schedule',
      error: error.message
    });
  }
});

// GET /api/irrigation/schedule/upcoming - Get upcoming irrigation schedule
router.get('/schedule/upcoming', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    const schedules = await IrrigationSchedule.getUpcomingSchedule(parseInt(days));
    
    res.json({
      success: true,
      count: schedules.length,
      data: schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming schedule',
      error: error.message
    });
  }
});

// POST /api/irrigation/schedule - Create new irrigation schedule
router.post('/schedule', async (req, res) => {
  try {
    const scheduleData = req.body;
    
    const schedule = new IrrigationSchedule(scheduleData);
    await schedule.save();
    
    res.status(201).json({
      success: true,
      message: 'Irrigation schedule created successfully',
      data: schedule
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating irrigation schedule',
      error: error.message
    });
  }
});

// POST /api/irrigation/schedule/:id/execute - Execute irrigation schedule
router.post('/schedule/:id/execute', async (req, res) => {
  try {
    const schedule = await IrrigationSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    if (schedule.status !== 'Scheduled') {
      return res.status(400).json({
        success: false,
        message: 'Schedule cannot be executed in current status'
      });
    }
    
    await schedule.execute();
    
    res.json({
      success: true,
      message: 'Irrigation executed successfully',
      data: schedule
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error executing irrigation',
      error: error.message
    });
  }
});

// POST /api/irrigation/schedule/:id/cancel - Cancel irrigation schedule
router.post('/schedule/:id/cancel', async (req, res) => {
  try {
    const { reason = '' } = req.body;
    
    const schedule = await IrrigationSchedule.findById(req.params.id);
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }
    
    await schedule.cancel(reason);
    
    res.json({
      success: true,
      message: 'Schedule cancelled successfully',
      data: schedule
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error cancelling schedule',
      error: error.message
    });
  }
});

// GET /api/irrigation/systems - Get irrigation systems
router.get('/systems', async (req, res) => {
  try {
    const { status, type, section } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (section) query['location.section'] = section;
    
    const systems = await IrrigationSystem.find(query)
      .populate('connectedCrops', 'name location');
    
    res.json({
      success: true,
      count: systems.length,
      data: systems
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching irrigation systems',
      error: error.message
    });
  }
});

// POST /api/irrigation/systems - Create new irrigation system
router.post('/systems', async (req, res) => {
  try {
    const system = new IrrigationSystem(req.body);
    await system.save();
    
    res.status(201).json({
      success: true,
      message: 'Irrigation system created successfully',
      data: system
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error creating irrigation system',
      error: error.message
    });
  }
});

// PUT /api/irrigation/systems/:id - Update irrigation system
router.put('/systems/:id', async (req, res) => {
  try {
    const system = await IrrigationSystem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!system) {
      return res.status(404).json({
        success: false,
        message: 'Irrigation system not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Irrigation system updated successfully',
      data: system
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Error updating irrigation system',
      error: error.message
    });
  }
});

// GET /api/irrigation/dashboard - Get irrigation dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    // Get pending recommendations
    const pendingRecommendations = await IrrigationRecommendation.getPendingRecommendations();
    
    // Get today's schedule
    const todaySchedule = await IrrigationSchedule.getTodaysSchedule();
    
    // Get upcoming schedule
    const upcomingSchedule = await IrrigationSchedule.getUpcomingSchedule(7);
    
    // Get crops needing water
    const cropsNeedingWater = await Crop.getCropsNeedingWater(1);
    
    // Get system status
    const activeSystems = await IrrigationSystem.find({ status: 'Active' });
    
    res.json({
      success: true,
      data: {
        pendingRecommendations: pendingRecommendations.slice(0, 5),
        todaySchedule: todaySchedule.slice(0, 10),
        upcomingSchedule: upcomingSchedule.slice(0, 10),
        cropsNeedingWater: cropsNeedingWater.slice(0, 5),
        systemsStatus: {
          active: activeSystems.length,
          total: await IrrigationSystem.countDocuments()
        },
        summary: {
          pendingCount: pendingRecommendations.length,
          todayCount: todaySchedule.length,
          upcomingCount: upcomingSchedule.length,
          urgentCount: cropsNeedingWater.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data',
      error: error.message
    });
  }
});

module.exports = router;