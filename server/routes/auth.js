const express = require('express');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const { createResponse, createErrorResponse, validateRequiredFields } = require('../utils');
const { protect } = require('../middleware/auth');
const { MIN_PASSWORD_LENGTH } = require('../config');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['name', 'email', 'password']);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    // Check if password meets requirements
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json(
        createResponse(false, `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
      );
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json(
        createResponse(false, 'User with that email already exists')
      );
    }

    // Create user (only farmers can register through this route)
    const user = await User.create({
      name,
      email,
      password,
      role: 'farmer',
      status: 'pending' // All new registrations need admin approval
    });

    // Create farmer profile
    await Farmer.create({
      user: user._id
    });

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(201).json(
      createResponse(true, 'Registration successful. Please wait for admin approval.', { token })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['email', 'password']);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json(
        createResponse(false, 'Invalid email or password')
      );
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const waitTime = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
      return res.status(423).json(
        createResponse(false, `Account is locked. Please try again in ${waitTime} minutes`)
      );
    }

    // Check if account is blocked by admin
    if (user.status === 'blocked') {
      return res.status(403).json(
        createResponse(false, 'Your account has been blocked. Please contact support.')
      );
    }

    // Check if account is pending approval
    if (user.status === 'pending') {
      return res.status(403).json(
        createResponse(false, 'Your account is pending approval from admin.')
      );
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      
      // Check if account should be locked after this attempt
      if (user.loginAttempts + 1 >= 5) {
        return res.status(423).json(
          createResponse(false, 'Too many failed attempts. Account is locked for 1 hour.')
        );
      }

      return res.status(401).json(
        createResponse(false, `Invalid email or password. ${5 - (user.loginAttempts + 1)} attempts remaining.`)
      );
    }

    // Reset login attempts on successful login
    await user.resetLoginAttempts();

    // Generate JWT token
    const token = user.getSignedJwtToken();

    res.status(200).json(
      createResponse(true, 'Login successful', { 
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
  try {
    const user = req.user;
    let userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address
    };

    // If user is a farmer, get farmer data
    if (user.role === 'farmer') {
      const farmer = await Farmer.findOne({ user: user._id });
      if (farmer) {
        userData.farmer = farmer;
      }
    }

    res.status(200).json(
      createResponse(true, 'User data retrieved successfully', userData)
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

module.exports = router;