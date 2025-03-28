const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true
  },
  variety: {
    type: String,
    trim: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  cropCategory: {
    type: String,
    enum: ['Grains', 'Fruits', 'Cash Crops', 'Spices'],
    required: [true, 'Please specify the crop category']
  },
  season: {
    type: String,
    required: [true, 'Please specify the growing season']
  },
  plantingDate: {
    type: Date,
    required: [true, 'Please add a planting date']
  },
  harvestDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['Planning', 'Planted', 'Growing', 'Harvested', 'Failed'],
    default: 'Planning'
  },
  fieldLocation: {
    type: String,
    required: [true, 'Please specify the field location']
  },
  estimatedYield: {
    value: {
      type: Number,
      min: [0, 'Estimated yield cannot be negative']
    },
    unit: {
      type: String,
      enum: ['kg', 'ton', 'lb'],
      default: 'kg'
    }
  },
  expenses: [{
    type: {
      type: String,
      enum: ['Seed', 'Fertilizer', 'Labor', 'Transportation', 'Other'],
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Expense amount cannot be negative']
    },
    date: {
      type: Date,
      default: Date.now
    },
    description: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on update
CropSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Middleware to update the updatedAt field
CropSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Virtual for days to harvest
CropSchema.virtual('daysToHarvest').get(function() {
  if (!this.harvestDate) return null;
  const today = new Date();
  const harvest = new Date(this.harvestDate);
  const diffTime = Math.abs(harvest - today);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

CropSchema.set('toJSON', { virtuals: true });
CropSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Crop', CropSchema);