const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRE, MIN_PASSWORD_LENGTH } = require('../config');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  role: {
    type: String,
    enum: ['farmer', 'admin', 'super_admin'],
    default: 'farmer',
    immutable: function() { return this.role === 'super_admin'; } // Super admin role cannot be changed
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked'],
    default: 'pending'
  },
  statusReason: {
    type: String,
    maxlength: [200, 'Status reason cannot be more than 200 characters']
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`],
    select: false // Don't return password in queries by default
  },
  phone: {
    type: String,
    maxlength: [20, 'Phone number cannot be longer than 20 characters']
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastPasswordChange: {
    type: Date,
    default: Date.now
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

// Encrypt password using bcrypt
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (this.isModified('password')) {
    this.lastPasswordChange = Date.now();
  }
  
  this.updatedAt = Date.now();
});

// Update the updatedAt field on update
UserSchema.pre('findOneAndUpdate', function() {
  this.set({ updatedAt: Date.now() });
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { 
      id: this._id,
      role: this.role,
      status: this.status,
      lastPasswordChange: this.lastPasswordChange
    },
    JWT_SECRET,
    {
      expiresIn: JWT_EXPIRE
    }
  );
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Increment login attempts
UserSchema.methods.incrementLoginAttempts = async function() {
  // If lock has expired, reset attempts and remove lock
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }

  // Otherwise increment attempts
  const updates = { $inc: { loginAttempts: 1 } };

  // Lock account if attempts >= 5
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 3600000 }; // Lock for 1 hour
  }

  return await this.updateOne(updates);
};

// Reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1 }
  });
};

module.exports = mongoose.model('User', UserSchema);