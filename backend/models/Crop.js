const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  stage: {
    type: String,
    enum: ['Seedling', 'Growing', 'Mature', 'Harvesting'],
    required: true
  },
  waterNeeds: {
    type: String,
    enum: ['Low', 'Medium', 'Medium-High', 'High'],
    required: true
  },
  plantedDate: {
    type: Date,
    required: true
  },
  nextWatering: {
    type: Date,
    required: true
  },
  lastWatered: {
    type: Date,
    default: null
  },
  waterRequirement: {
    // Water requirement in liters per day
    dailyAmount: {
      type: Number,
      required: true
    },
    // Frequency in days
    frequency: {
      type: Number,
      required: true
    }
  },
  location: {
    section: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  soilType: {
    type: String,
    enum: ['Sandy', 'Clay', 'Loamy', 'Silty'],
    default: 'Loamy'
  },
  cropType: {
    type: String,
    required: true
  },
  variety: {
    type: String,
    default: ''
  },
  expectedHarvestDate: {
    type: Date
  },
  growthStageHistory: [{
    stage: String,
    date: Date,
    notes: String
  }],
  irrigationHistory: [{
    date: Date,
    amount: Number, // in liters
    method: {
      type: String,
      enum: ['Manual', 'Automatic', 'Scheduled'],
      default: 'Manual'
    },
    duration: Number, // in minutes
    notes: String
  }],
  healthStatus: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'],
    default: 'Good'
  },
  notes: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  alerts: [{
    type: {
      type: String,
      enum: ['WaterDeficit', 'Overwatering', 'StageChange', 'Maintenance', 'Harvest']
    },
    message: String,
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium'
    },
    isRead: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  aiSchedule: {
    schedule: [Number], // Array of 14 0s and 1s
    quantity: [Number], // Array of 14 numbers for water quantity
    generatedAt: Date,
    source: {
        type: String,
        default: 'ViT-Model'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for days since planted
cropSchema.virtual('daysSincePlanted').get(function() {
  return Math.floor((Date.now() - this.plantedDate.getTime()) / (1000 * 60 * 60 * 24));
});

// Virtual for days until next watering
cropSchema.virtual('daysUntilWatering').get(function() {
  return Math.ceil((this.nextWatering.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for irrigation status
cropSchema.virtual('irrigationStatus').get(function() {
  const now = new Date();
  const timeDiff = this.nextWatering.getTime() - now.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  if (hoursDiff < 0) return 'Overdue';
  if (hoursDiff < 24) return 'Due Soon';
  if (hoursDiff < 48) return 'Upcoming';
  return 'Scheduled';
});

// Methods
cropSchema.methods.waterCrop = function(amount, method = 'Manual', duration = 0, notes = '') {
  this.lastWatered = new Date();
  this.irrigationHistory.push({
    date: new Date(),
    amount,
    method,
    duration,
    notes
  });
  
  // Calculate next watering date based on crop requirements
  this.calculateNextWatering();
  
  return this.save();
};

cropSchema.methods.calculateNextWatering = function() {
  const baseFrequency = this.waterRequirement.frequency;
  let adjustedFrequency = baseFrequency;
  
  // Adjust frequency based on crop stage
  switch(this.stage) {
    case 'Seedling':
      adjustedFrequency = Math.max(1, baseFrequency - 1); // More frequent watering
      break;
    case 'Growing':
      adjustedFrequency = baseFrequency;
      break;
    case 'Mature':
      adjustedFrequency = baseFrequency + 1; // Less frequent watering
      break;
    case 'Harvesting':
      adjustedFrequency = baseFrequency + 1;
      break;
  }
  
  const nextWateringDate = new Date();
  nextWateringDate.setDate(nextWateringDate.getDate() + adjustedFrequency);
  this.nextWatering = nextWateringDate;
};

cropSchema.methods.updateStage = function(newStage, notes = '') {
  const oldStage = this.stage;
  this.stage = newStage;
  
  this.growthStageHistory.push({
    stage: newStage,
    date: new Date(),
    notes: notes || `Stage changed from ${oldStage} to ${newStage}`
  });
  
  // Recalculate watering schedule for new stage
  this.calculateNextWatering();
  
  return this.save();
};

// Static methods
cropSchema.statics.getCropsNeedingWater = function(daysAhead = 1) {
  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + daysAhead);
  
  return this.find({
    nextWatering: { $lte: targetDate },
    isActive: true
  });
};

cropSchema.statics.getCropsByStage = function(stage) {
  return this.find({ stage, isActive: true });
};

// Indexes for better performance
cropSchema.index({ nextWatering: 1, isActive: 1 });
cropSchema.index({ stage: 1, isActive: 1 });
cropSchema.index({ plantedDate: 1 });
cropSchema.index({ 'location.section': 1 });

module.exports = mongoose.model('Crop', cropSchema);