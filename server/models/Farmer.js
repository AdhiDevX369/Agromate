const mongoose = require('mongoose');

const FarmerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  farmName: {
    type: String,
    trim: true,
    maxlength: [100, 'Farm name cannot be more than 100 characters']
  },
  farmSize: {
    value: {
      type: Number,
      min: [0, 'Farm size cannot be negative']
    },
    unit: {
      type: String,
      enum: ['acres', 'hectares', 'sqm'],
      default: 'acres'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    address: String,
    district: String,
    state: String,
    country: String
  },
  crops: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  }],
  farmingType: {
    type: String,
    enum: ['Organic', 'Conventional', 'Mixed', 'Other'],
    default: 'Conventional'
  },
  memberSince: {
    type: Date,
    default: Date.now
  },
  profileComplete: {
    type: Boolean,
    default: false
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters']
  },
  transactions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
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
FarmerSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Middleware to check if profile is complete
FarmerSchema.pre('save', function(next) {
  // Check if all required fields are filled
  if (
    this.farmName && 
    this.farmSize?.value && 
    this.location?.address &&
    this.farmingType
  ) {
    this.profileComplete = true;
  }
  
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Farmer', FarmerSchema);