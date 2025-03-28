const mongoose = require('mongoose');

const CropCatalogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a crop name'],
    trim: true,
    unique: true
  },
  sinhalaName: {
    type: String,
    required: [true, 'Please add the Sinhala name'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Grains', 'Fruits', 'Cash Crops', 'Spices'],
    required: [true, 'Please specify the crop category']
  },
  varieties: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: String,
    typicalYield: {
      value: Number,
      unit: {
        type: String,
        enum: ['kg/acre', 'tons/acre'],
        default: 'kg/acre'
      }
    },
    growingSeasons: [String],
    avgGrowingPeriod: Number // in days
  }],
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
CropCatalogSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CropCatalog', CropCatalogSchema);