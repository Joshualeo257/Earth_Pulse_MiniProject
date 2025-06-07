const express = require('express');
const router = express.Router();
const { Sensor, SensorReading } = require('../models/Sensor');

// GET /api/sensors - Get all sensors
router.get('/', async (req, res) => {
  try {
    const { status, type, section } = req.query;
    let query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (section) query['location.section'] = section;

    const sensors = await Sensor.find(query);
    res.json({ success: true, count: sensors.length, data: sensors });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sensors', error: error.message });
  }
});

// GET /api/sensors/:id - Get a single sensor
router.get('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }
    res.json({ success: true, data: sensor });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sensor', error: error.message });
  }
});

// POST /api/sensors - Create a new sensor
router.post('/', async (req, res) => {
  try {
    const sensor = new Sensor(req.body);
    await sensor.save();
    res.status(201).json({ success: true, message: 'Sensor created successfully', data: sensor });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error creating sensor', error: error.message });
  }
});

// PUT /api/sensors/:id - Update a sensor
router.put('/:id', async (req, res) => {
  try {
    const sensor = await Sensor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sensor) {
      return res.status(404).json({ success: false, message: 'Sensor not found' });
    }
    res.json({ success: true, message: 'Sensor updated successfully', data: sensor });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Error updating sensor', error: error.message });
  }
});

// GET /api/sensors/:id/readings - Get sensor readings for a specific sensor
router.get('/:id/readings', async (req, res) => {
  try {
    const { limit = 100, sort = 'desc' } = req.query;
    const sensor = await Sensor.findById(req.params.id);
    if (!sensor) {
        return res.status(404).json({ success: false, message: 'Sensor not found' });
    }

    const readings = await SensorReading.find({ sensorId: req.params.id })
        .sort({ timestamp: sort === 'asc' ? 1 : -1 })
        .limit(parseInt(limit));
        
    res.json({ success: true, count: readings.length, data: readings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching sensor readings', error: error.message });
  }
});

const { generateSensorData } = require('../services/sensorService');

router.post('/generate-test-data', async (req, res) => {
    try {
        console.log('Manual trigger for generateSensorData received.');
        await generateSensorData();
        res.status(200).json({ 
            success: true, 
            message: 'Sensor data generation task completed successfully.' 
        });
    } catch (error) {
        console.error('Error during manual data generation trigger:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to generate sensor data.',
            error: error.message
        });
    }
});

module.exports = router;