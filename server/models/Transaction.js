const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true
  },
  type: {
    type: String,
    enum: ['Sale', 'Purchase', 'Expense', 'Income'],
    required: true
  },
  category: {
    type: String,
    enum: ['Seeds', 'Fertilizer', 'Pesticides', 'Tools', 'Machinery', 'Labor', 'Crop Sale', 'Subsidy', 'Other'],
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please add a transaction amount'],
    min: [0, 'Amount cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  date: {
    type: Date,
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Bank Transfer', 'Mobile Money', 'Credit', 'Other'],
    default: 'Cash'
  },
  relatedCrop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop'
  },
  receipt: {
    hasReceipt: {
      type: Boolean,
      default: false
    },
    receiptNumber: String,
    imageUrl: String
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Completed'
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
TransactionSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Middleware to update the updatedAt field
TransactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Transaction', TransactionSchema);