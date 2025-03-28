const express = require('express');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const MarketPrices = require('../models/MarketPrices');
const { protect, authorize } = require('../middleware/auth');
const { createResponse, createErrorResponse, validateRequiredFields } = require('../utils');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

/**
 * @route   GET /api/dashboard/farmer
 * @desc    Get farmer dashboard data
 * @access  Private (Farmer only)
 */
router.get('/farmer', authorize('farmer'), async (req, res) => {
  try {
    // Find farmer profile
    const farmer = await Farmer.findOne({ user: req.user.id });
    
    if (!farmer) {
      return res.status(404).json(
        createResponse(false, 'Farmer profile not found')
      );
    }

    // Get farmer's crops
    const crops = await Crop.find({ farmer: farmer._id });
    
    // Get farmer's recent transactions
    const recentTransactions = await Transaction.find({ farmer: farmer._id })
      .sort({ date: -1 })
      .limit(5);
    
    // Calculate statistics
    const totalCrops = crops.length;
    const activeCrops = crops.filter(crop => 
      ['Planted', 'Growing'].includes(crop.status)
    ).length;
    
    const harvestedCrops = crops.filter(crop => 
      crop.status === 'Harvested'
    ).length;
    
    // Get total income and expenses
    const transactions = await Transaction.find({ farmer: farmer._id });
    
    const incomeTotal = transactions
      .filter(t => ['Sale', 'Income'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expenseTotal = transactions
      .filter(t => ['Purchase', 'Expense'].includes(t.type))
      .reduce((sum, t) => sum + t.amount, 0);

    res.status(200).json(
      createResponse(true, 'Dashboard data retrieved successfully', {
        farmer,
        stats: {
          totalCrops,
          activeCrops,
          harvestedCrops,
          incomeTotal,
          expenseTotal,
          profit: incomeTotal - expenseTotal
        },
        recentCrops: crops.slice(0, 5),
        recentTransactions
      })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/dashboard/farmer/crops
 * @desc    Get all farmer crops
 * @access  Private (Farmer only)
 */
router.get('/farmer/crops', authorize('farmer'), async (req, res) => {
  try {
    const farmer = await Farmer.findOne({ user: req.user.id });
    
    if (!farmer) {
      return res.status(404).json(
        createResponse(false, 'Farmer profile not found')
      );
    }

    const crops = await Crop.find({ farmer: farmer._id });

    res.status(200).json(
      createResponse(true, 'Crops retrieved successfully', { crops })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/dashboard/farmer/crops
 * @desc    Add a new crop
 * @access  Private (Farmer only)
 */
router.post('/farmer/crops', authorize('farmer'), async (req, res) => {
  try {
    const { name, variety, plantingDate, harvestDate, fieldLocation, estimatedYield } = req.body;
    
    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['name', 'plantingDate']);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    const farmer = await Farmer.findOne({ user: req.user.id });
    
    if (!farmer) {
      return res.status(404).json(
        createResponse(false, 'Farmer profile not found')
      );
    }

    const crop = await Crop.create({
      name,
      variety,
      farmer: farmer._id,
      plantingDate,
      harvestDate,
      status: 'Planning',
      fieldLocation,
      estimatedYield
    });

    // Update farmer's crops array
    await Farmer.findByIdAndUpdate(
      farmer._id,
      { $push: { crops: crop._id } }
    );

    res.status(201).json(
      createResponse(true, 'Crop added successfully', { crop })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/dashboard/farmer/profile
 * @desc    Update farmer profile
 * @access  Private (Farmer only)
 */
router.put('/farmer/profile', authorize('farmer'), async (req, res) => {
  try {
    const { farmName, farmSize, farmingType, location, bio } = req.body;
    
    const farmer = await Farmer.findOne({ user: req.user.id });
    
    if (!farmer) {
      return res.status(404).json(
        createResponse(false, 'Farmer profile not found')
      );
    }

    // Update farmer profile
    const updatedFarmer = await Farmer.findByIdAndUpdate(
      farmer._id,
      {
        farmName,
        farmSize,
        farmingType,
        location,
        bio
      },
      { new: true }
    );

    // Update user profile if needed
    if (req.body.name || req.body.phone || req.body.address) {
      await User.findByIdAndUpdate(
        req.user.id,
        {
          name: req.body.name,
          phone: req.body.phone,
          address: req.body.address
        }
      );
    }

    res.status(200).json(
      createResponse(true, 'Profile updated successfully', { farmer: updatedFarmer })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/dashboard/market-prices
 * @desc    Get market prices for farmers
 * @access  Private (Farmer only)
 */
router.get('/market-prices', authorize('farmer'), async (req, res) => {
  try {
    const prices = await MarketPrices.find()
      .sort({ category: 1, cropType: 1 });
    
    res.status(200).json(
      createResponse(true, 'Market prices retrieved successfully', { prices })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/dashboard/market-prices/category/:category
 * @desc    Get market prices by category for farmers
 * @access  Private (Farmer only)
 */
router.get('/market-prices/category/:category', authorize('farmer'), async (req, res) => {
  try {
    const prices = await MarketPrices.find({ category: req.params.category })
      .sort({ cropType: 1 });
    
    res.status(200).json(
      createResponse(true, 'Market prices retrieved successfully', { prices })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

module.exports = router;