const mongoose = require('mongoose');

const MarketPricesSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: [true, 'Please add a crop type'],
    trim: true
  },
  sinhalaName: {
    type: String,
    required: [true, 'Please add Sinhala name'],
    trim: true
  },
  category: {
    type: String,
    enum: ['vegetables', 'fruits', 'rice', 'spices'],
    required: [true, 'Please specify category']
  },
  price: {
    type: Number,
    required: [true, 'Please add price'],
    min: [0, 'Price cannot be negative']
  },
  unit: {
    type: String,
    enum: ['kg', 'g', 'unit'],
    default: 'kg'
  },
  priceHistory: [{
    price: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  }],
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

// Update the updatedAt field on update
MarketPricesSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Add price to history before saving
MarketPricesSchema.pre('save', function(next) {
  if (this.isModified('price')) {
    this.priceHistory.push({
      price: this.price,
      updatedBy: this.updatedBy
    });
  }
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('MarketPrices', MarketPricesSchema);