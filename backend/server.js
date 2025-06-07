const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

// Import routes
const cropRoutes = require('./routes/crops');
const sensorRoutes = require('./routes/sensors');
const weatherRoutes = require('./routes/weather');
const irrigationRoutes = require('./routes/irrigation');
const aiRoutes = require('./routes/ai');

// Import services
const { updateIrrigationRecommendations } = require('./services/irrigationService');
const { generateSensorData } = require('./services/sensorService');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/irrigation_system')
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('MongoDB connection error:', error));

// Routes
app.use('/api/crops', cropRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Irrigation System Backend is running'
  });
});

// Scheduled tasks
// Update irrigation recommendations every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled irrigation recommendations update...');
  try {
    await updateIrrigationRecommendations();
    console.log('Irrigation recommendations updated successfully');
  } catch (error) {
    console.error('Error updating irrigation recommendations:', error);
  }
});

// Generate sensor data every 5 minutes (for demo purposes)
cron.schedule('*/5 * * * *', async () => {
  try {
    await generateSensorData();
    console.log('Sensor data generated successfully');
  } catch (error) {
    console.error('Error generating sensor data:', error);
  }
});

// Error handling middleware
// --- NEW ROBUST ERROR HANDLING MIDDLEWARE ---
app.use((error, req, res, next) => {
  // Log the full error stack for debugging
  console.error("--- GLOBAL ERROR HANDLER ---");
  console.error("Error Status:", error.status);
  console.error("Error Message:", error.message);
  console.error("Request Body:", req.body); // See what body caused the error
  console.error(error.stack); // Full stack trace
  console.error("--------------------------");

  // If the error is from the body-parser (malformed JSON)
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON in request body.',
      error: error.message
    });
  }

  // General error response
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal Server Error',
    error: error.stack // Send stack in dev mode for easier debugging
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});