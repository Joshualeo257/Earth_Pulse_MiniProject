const mongoose = require('mongoose');

// Sensor Reading Schema
const sensorReadingSchema = new mongoose.Schema({
  sensorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sensor',
    required: true
  },
  readings: {
    soilMoisture: {
      type: Number,
      min: 0,
      max: 100 // Percentage
    },
    temperature: {
      type: Number,
      min: -50,
      max: 100 // Celsius
    },
    humidity: {
      type: Number,
      min: 0,
      max: 100 // Percentage
    },
    lightIntensity: {
      type: Number,
      min: 0,
      max: 100000 // Lux
    },
    pH: {
      type: Number,
      min: 0,
      max: 14
    },
    nutrients: {
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  quality: {
    type: String,
    enum: ['Good', 'Fair', 'Poor'],
    default: 'Good'
  }
}, {
  timestamps: true
});

// Sensor Schema
const sensorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['SoilMoisture', 'Temperature', 'Humidity', 'pH', 'Light', 'Nutrient', 'Multi'],
    required: true
  },
  location: {
    section: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    depth: Number // for soil sensors
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Error'],
    default: 'Active'
  },
  lastReading: {
    type: Date,
    default: null
  },
  batteryLevel: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  calibrationDate: {
    type: Date,
    default: Date.now
  },
  alertThresholds: {
    soilMoisture: {
      min: { type: Number, default: 20 },
      max: { type: Number, default: 80 }
    },
    temperature: {
      min: { type: Number, default: 5 },
      max: { type: Number, default: 35 }
    },
    humidity: {
      min: { type: Number, default: 40 },
      max: { type: Number, default: 90 }
    },
    pH: {
      min: { type: Number, default: 6.0 },
      max: { type: Number, default: 7.5 }
    }
  },
  associatedCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Weather Data Schema
const weatherSchema = new mongoose.Schema({
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  current: {
    temperature: Number,
    humidity: Number,
    windSpeed: Number,
    windDirection: Number,
    pressure: Number,
    visibility: Number,
    uvIndex: Number,
    cloudCover: Number,
    condition: String,
    precipitation: Number
  },
  forecast: [{
    date: Date,
    temperature: {
      min: Number,
      max: Number
    },
    humidity: Number,
    precipitation: {
      probability: Number,
      amount: Number
    },
    windSpeed: Number,
    condition: String
  }],
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Virtual for sensor health status
sensorSchema.virtual('healthStatus').get(function() {
  if (this.status === 'Error') return 'Critical';
  if (this.batteryLevel < 20) return 'Low Battery';
  if (this.lastReading && (Date.now() - this.lastReading.getTime()) > 24 * 60 * 60 * 1000) {
    return 'No Recent Data';
  }
  return 'Good';
});

// Methods
sensorSchema.methods.addReading = function(readings) {
  this.lastReading = new Date();
  
  // Create new sensor reading
  const SensorReading = mongoose.model('SensorReading');
  const newReading = new SensorReading({
    sensorId: this._id,
    readings: readings
  });
  
  return newReading.save();
};

sensorSchema.methods.getLatestReading = function() {
  const SensorReading = mongoose.model('SensorReading');
  return SensorReading.findOne({ sensorId: this._id }).sort({ timestamp: -1 });
};

sensorSchema.methods.getReadingsInRange = function(startDate, endDate) {
  const SensorReading = mongoose.model('SensorReading');
  return SensorReading.find({
    sensorId: this._id,
    timestamp: { $gte: startDate, $lte: endDate }
  }).sort({ timestamp: -1 });
};

sensorSchema.methods.checkAlerts = async function() {
  const latestReading = await this.getLatestReading();
  if (!latestReading) return [];
  
  const alerts = [];
  const readings = latestReading.readings;
  const thresholds = this.alertThresholds;
  
  // Check soil moisture
  if (readings.soilMoisture !== undefined) {
    if (readings.soilMoisture < thresholds.soilMoisture.min) {
      alerts.push({
        type: 'SoilMoisture',
        message: `Low soil moisture: ${readings.soilMoisture}%`,
        severity: 'High',
        value: readings.soilMoisture
      });
    } else if (readings.soilMoisture > thresholds.soilMoisture.max) {
      alerts.push({
        type: 'SoilMoisture',
        message: `High soil moisture: ${readings.soilMoisture}%`,
        severity: 'Medium',
        value: readings.soilMoisture
      });
    }
  }
  
  // Check temperature
  if (readings.temperature !== undefined) {
    if (readings.temperature < thresholds.temperature.min || 
        readings.temperature > thresholds.temperature.max) {
      alerts.push({
        type: 'Temperature',
        message: `Temperature out of range: ${readings.temperature}°C`,
        severity: 'Medium',
        value: readings.temperature
      });
    }
  }
  
  // Check pH
  if (readings.pH !== undefined) {
    if (readings.pH < thresholds.pH.min || readings.pH > thresholds.pH.max) {
      alerts.push({
        type: 'pH',
        message: `pH out of range: ${readings.pH}`,
        severity: 'Medium',
        value: readings.pH
      });
    }
  }
  
  return alerts;
};

// Static methods
sensorSchema.statics.getActiveSensors = function() {
  return this.find({ status: 'Active' });
};

sensorSchema.statics.getSensorsByLocation = function(section) {
  return this.find({ 'location.section': section, status: 'Active' });
};

// Indexes
sensorSchema.index({ 'location.section': 1, status: 1 });
sensorSchema.index({ type: 1, status: 1 });
sensorReadingSchema.index({ sensorId: 1, timestamp: -1 });
sensorReadingSchema.index({ timestamp: -1 });
weatherSchema.index({ timestamp: -1 });

const Sensor = mongoose.model('Sensor', sensorSchema);
const SensorReading = mongoose.model('SensorReading', sensorReadingSchema);
const Weather = mongoose.model('Weather', weatherSchema);

module.exports = { Sensor, SensorReading, Weather };