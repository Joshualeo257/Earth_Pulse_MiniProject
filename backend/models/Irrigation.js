const mongoose = require('mongoose');

// Irrigation Recommendation Schema
const irrigationRecommendationSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  recommendation: {
    action: {
      type: String,
      enum: ['Water today', 'Water tomorrow', 'Water in 2 days', 'Water in 3 days', 'No watering needed'],
      required: true
    },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      required: true
    },
    waterAmount: {
      type: Number, // in liters
      required: true
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    method: {
      type: String,
      enum: ['Drip', 'Sprinkler', 'Manual', 'Flood'],
      default: 'Drip'
    }
  },
  factors: {
    soilMoisture: Number,
    weatherForecast: String,
    cropStage: String,
    lastWatered: Date,
    temperature: Number,
    humidity: Number
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Completed'],
    default: 'Pending'
  },
  scheduledDate: Date,
  completedDate: Date,
  notes: String,
  createdBy: {
    type: String,
    enum: ['System', 'User'],
    default: 'System'
  }
}, {
  timestamps: true
});

// Irrigation Schedule Schema
const irrigationScheduleSchema = new mongoose.Schema({
  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  waterAmount: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  method: {
    type: String,
    enum: ['Drip', 'Sprinkler', 'Manual', 'Flood'],
    default: 'Drip'
  },
  status: {
    type: String,
    enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled', 'Failed'],
    default: 'Scheduled'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['Daily', 'Weekly', 'BiWeekly', 'Custom']
    },
    interval: Number, // days
    endDate: Date
  },
  executionDetails: {
    startTime: Date,
    endTime: Date,
    actualWaterAmount: Number,
    actualDuration: Number,
    success: Boolean,
    errors: [String]
  },
  autoExecute: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String,
    default: 'System'
  },
  notes: String
}, {
  timestamps: true
});

// Irrigation System Schema
const irrigationSystemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['Drip', 'Sprinkler', 'Flood', 'Micro-sprinkler'],
    required: true
  },
  location: {
    section: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Maintenance', 'Error'],
    default: 'Active'
  },
  capacity: {
    flowRate: Number, // liters per minute
    pressure: Number, // bar
    coverage: Number  // square meters
  },
  connectedCrops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  maintenanceSchedule: {
    lastMaintenance: Date,
    nextMaintenance: Date,
    maintenanceInterval: Number // days
  },
  operationHistory: [{
    date: Date,
    operation: String,
    duration: Number,
    waterAmount: Number,
    status: String,
    notes: String
  }],
  settings: {
    autoMode: {
      type: Boolean,
      default: false
    },
    operatingHours: {
      start: String, // HH:MM
      end: String    // HH:MM
    },
    waterSource: String,
    filterType: String
  }
}, {
  timestamps: true
});

// Methods for IrrigationRecommendation
irrigationRecommendationSchema.methods.approve = function(notes = '') {
  this.status = 'Approved';
  this.notes = notes;
  return this.save();
};

irrigationRecommendationSchema.methods.reject = function(reason = '') {
  this.status = 'Rejected';
  this.notes = reason;
  return this.save();
};

irrigationRecommendationSchema.methods.complete = function() {
  this.status = 'Completed';
  this.completedDate = new Date();
  return this.save();
};

// Methods for IrrigationSchedule
irrigationScheduleSchema.methods.execute = async function() {
  this.status = 'InProgress';
  this.executionDetails.startTime = new Date();
  
  try {
    // Simulate irrigation execution
    // In real implementation, this would control actual irrigation hardware
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate execution time
    
    this.status = 'Completed';
    this.executionDetails.endTime = new Date();
    this.executionDetails.actualWaterAmount = this.waterAmount;
    this.executionDetails.actualDuration = this.duration;
    this.executionDetails.success = true;
    
    // Update crop's last watered date
    const Crop = mongoose.model('Crop');
    await Crop.findByIdAndUpdate(this.cropId, {
      lastWatered: new Date(),
      $push: {
        irrigationHistory: {
          date: new Date(),
          amount: this.waterAmount,
          method: 'Automatic',
          duration: this.duration,
          notes: 'Scheduled irrigation completed'
        }
      }
    });
    
    return this.save();
  } catch (error) {
    this.status = 'Failed';
    this.executionDetails.endTime = new Date();
    this.executionDetails.success = false;
    this.executionDetails.errors.push(error.message);
    return this.save();
  }
};

irrigationScheduleSchema.methods.cancel = function(reason = '') {
  this.status = 'Cancelled';
  this.notes = reason;
  return this.save();
};

// Static methods
irrigationRecommendationSchema.statics.getPendingRecommendations = function() {
  return this.find({ status: 'Pending' })
    .populate('cropId', 'name stage waterNeeds location')
    .sort({ 'recommendation.priority': 1, createdAt: 1 });
};

irrigationRecommendationSchema.statics.getRecommendationsByCrop = function(cropId) {
  return this.find({ cropId })
    .sort({ createdAt: -1 });
};

irrigationScheduleSchema.statics.getTodaysSchedule = function() {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  
  return this.find({
    scheduledDate: { $gte: startOfDay, $lt: endOfDay },
    status: { $in: ['Scheduled', 'InProgress'] }
  }).populate('cropId', 'name location');
};

irrigationScheduleSchema.statics.getUpcomingSchedule = function(days = 7) {
  const today = new Date();
  const futureDate = new Date(today.getTime() + (days * 24 * 60 * 60 * 1000));
  
  return this.find({
    scheduledDate: { $gte: today, $lte: futureDate },
    status: 'Scheduled'
  }).populate('cropId', 'name location').sort({ scheduledDate: 1 });
};

// Indexes
irrigationRecommendationSchema.index({ cropId: 1, status: 1 });
irrigationRecommendationSchema.index({ createdAt: -1 });
irrigationRecommendationSchema.index({ scheduledDate: 1 });

irrigationScheduleSchema.index({ cropId: 1, status: 1 });
irrigationScheduleSchema.index({ scheduledDate: 1, status: 1 });
irrigationScheduleSchema.index({ createdAt: -1 });

irrigationSystemSchema.index({ status: 1 });
irrigationSystemSchema.index({ 'location.section': 1 });

const IrrigationRecommendation = mongoose.model('IrrigationRecommendation', irrigationRecommendationSchema);
const IrrigationSchedule = mongoose.model('IrrigationSchedule', irrigationScheduleSchema);
const IrrigationSystem = mongoose.model('IrrigationSystem', irrigationSystemSchema);

module.exports = {
  IrrigationRecommendation,
  IrrigationSchedule,
  IrrigationSystem
};