const express = require('express');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');
const MarketPrices = require('../models/MarketPrices');
const CropCatalog = require('../models/CropCatalog');
const { protect, authorize, checkResourceOwnership } = require('../middleware/auth');
const { createResponse, createErrorResponse, validateRequiredFields } = require('../utils');
const { MIN_PASSWORD_LENGTH } = require('../config');

const router = express.Router();

// Protect all routes in this router
router.use(protect);

/**
 * @route   GET /api/admin/dashboard
 * @desc    Get admin dashboard data
 * @access  Private (Admin and Super Admin)
 */
router.get('/dashboard', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    // Super admin sees all data, admin sees limited data
    const query = req.user.role === 'admin' ? { role: { $ne: 'super_admin' } } : {};
    
    const usersCount = await User.countDocuments(query);
    const farmersCount = await Farmer.countDocuments();
    const cropsCount = await Crop.countDocuments();
    const pendingUsersCount = await User.countDocuments({ ...query, status: 'pending' });
    
    // Get recent users with role-based filtering
    const recentUsers = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(5)
      .select('-password');

    // Get crops by status
    const cropStats = {
      planning: await Crop.countDocuments({ status: 'Planning' }),
      planted: await Crop.countDocuments({ status: 'Planted' }),
      growing: await Crop.countDocuments({ status: 'Growing' }),
      harvested: await Crop.countDocuments({ status: 'Harvested' }),
      failed: await Crop.countDocuments({ status: 'Failed' })
    };

    res.status(200).json(
      createResponse(true, 'Admin dashboard data retrieved successfully', {
        stats: {
          users: usersCount,
          farmers: farmersCount,
          crops: cropsCount,
          pendingUsers: pendingUsersCount,
          cropsByStatus: cropStats
        },
        recentUsers
      })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/users
 * @desc    Get all users
 * @access  Private (Admin and Super Admin)
 */
router.get('/users', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    // Super admin sees all users, admin sees non-super-admin users
    const query = req.user.role === 'admin' ? { role: { $ne: 'super_admin' } } : {};
    const users = await User.find(query).select('-password');
    
    res.status(200).json(
      createResponse(true, 'Users retrieved successfully', { users })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user
 * @access  Private (Admin and Super Admin)
 */
router.get('/users/:id', authorize('admin', 'super_admin'), checkResourceOwnership(), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json(
        createResponse(false, 'User not found')
      );
    }

    // Prevent admin from accessing super admin details
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Not authorized to access super admin details')
      );
    }
    
    let userData = { ...user._doc };
    
    // Include farmer data if applicable
    if (user.role === 'farmer') {
      const farmer = await Farmer.findOne({ user: user._id });
      if (farmer) {
        userData.farmer = farmer;
      }
    }
    
    res.status(200).json(
      createResponse(true, 'User retrieved successfully', { user: userData })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/admin/users
 * @desc    Create new admin user
 * @access  Private (Super Admin only)
 */
router.post('/users', authorize('super_admin'), async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;
    
    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['name', 'email', 'password']);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }
    
    // Only super_admin can create admin users
    if (role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Cannot create super admin users through this route')
      );
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
    
    // Create user with active status
    const user = await User.create({
      name,
      email,
      password,
      role,
      status: 'active'
    });

    res.status(201).json(
      createResponse(true, 'User created successfully', { user })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (approve/block)
 * @access  Private (Super Admin and Admin)
 */
router.put('/users/:id/status', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'blocked'].includes(status)) {
      return res.status(400).json(
        createResponse(false, 'Invalid status. Must be either active or blocked')
      );
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(
        createResponse(false, 'User not found')
      );
    }

    // Only super_admin can modify admin accounts
    if (user.role === 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Only super admin can modify admin accounts')
      );
    }

    // Cannot modify super_admin accounts at all
    if (user.role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Cannot modify super admin accounts')
      );
    }

    // Additional check for admin role
    if (req.user.role === 'admin' && status === 'blocked') {
      // Admins need to provide a reason when blocking users
      if (!req.body.reason) {
        return res.status(400).json(
          createResponse(false, 'Please provide a reason for blocking the user')
        );
      }
    }

    user.status = status;
    if (req.body.reason) {
      user.statusReason = req.body.reason;
    }
    await user.save();

    res.status(200).json(
      createResponse(true, 'User status updated successfully', { user })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Private (Super Admin only)
 */
router.put('/users/:id/role', authorize('super_admin'), async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['farmer', 'admin'].includes(role)) {
      return res.status(400).json(
        createResponse(false, 'Invalid role. Must be either farmer or admin')
      );
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(
        createResponse(false, 'User not found')
      );
    }

    // Cannot modify super_admin roles
    if (user.role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Cannot modify super admin roles')
      );
    }

    // If changing from farmer to admin, clean up farmer profile
    if (user.role === 'farmer' && role === 'admin') {
      await Farmer.findOneAndDelete({ user: user._id });
    }

    user.role = role;
    await user.save();

    res.status(200).json(
      createResponse(true, 'User role updated successfully', { user })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Admin and Super Admin)
 */
router.put('/users/:id', authorize('admin', 'super_admin'), checkResourceOwnership(), async (req, res) => {
  try {
    const { name, email, phone, address } = req.body;
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json(
        createResponse(false, 'User not found')
      );
    }

    // Prevent admin from updating super admin
    if (req.user.role === 'admin' && user.role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Not authorized to modify super admin')
      );
    }
    
    // Update user
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    await user.save();
    
    res.status(200).json(
      createResponse(true, 'User updated successfully', { user })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Super Admin only)
 */
router.delete('/users/:id', authorize('super_admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json(
        createResponse(false, 'User not found')
      );
    }

    // Cannot delete super_admin accounts
    if (user.role === 'super_admin') {
      return res.status(403).json(
        createResponse(false, 'Cannot delete super admin accounts')
      );
    }
    
    // Clean up associated data
    if (user.role === 'farmer') {
      await Farmer.findOneAndDelete({ user: user._id });
      // Delete associated crops
      await Crop.deleteMany({ farmer: user._id });
    }
    
    await user.deleteOne();
    
    res.status(200).json(
      createResponse(true, 'User and associated data deleted successfully')
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/crops
 * @desc    Get all crops
 * @access  Private (Admin and Super Admin)
 */
router.get('/crops', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crops = await Crop.find().populate('farmer', 'farmName');
    
    res.status(200).json(
      createResponse(true, 'Crops retrieved successfully', { crops })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/crops/category/:category
 * @desc    Get crops by category
 * @access  Private (Admin and Super Admin)
 */
router.get('/crops/category/:category', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crops = await Crop.find({ 
      cropCategory: req.params.category 
    }).populate({
      path: 'farmer',
      select: 'farmName name'
    });

    res.status(200).json(
      createResponse(true, 'Crops retrieved successfully', { crops })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/crops/:id
 * @desc    Update crop details
 * @access  Private (Admin and Super Admin)
 */
router.put('/crops/:id', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json(
        createResponse(false, 'Crop not found')
      );
    }

    res.status(200).json(
      createResponse(true, 'Crop updated successfully', { crop })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   DELETE /api/admin/crops/:id
 * @desc    Delete crop
 * @access  Private (Super Admin only)
 */
router.delete('/crops/:id', authorize('super_admin'), async (req, res) => {
  try {
    const crop = await Crop.findByIdAndDelete(req.params.id);

    if (!crop) {
      return res.status(404).json(
        createResponse(false, 'Crop not found')
      );
    }

    res.status(200).json(
      createResponse(true, 'Crop deleted successfully')
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/admin/crops
 * @desc    Create a new crop
 * @access  Private (Admin and Super Admin)
 */
router.post('/crops', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { 
      name, 
      variety, 
      farmerId, 
      cropCategory,
      season,
      plantingDate, 
      harvestDate, 
      fieldLocation, 
      estimatedYield,
      status = 'Planning'
    } = req.body;
    
    // Validate required fields
    const missingFields = validateRequiredFields(req.body, [
      'name',
      'farmerId',
      'cropCategory',
      'season',
      'plantingDate',
      'fieldLocation'
    ]);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) {
      return res.status(404).json(
        createResponse(false, 'Farmer not found')
      );
    }

    const crop = await Crop.create({
      name,
      variety,
      farmer: farmerId,
      cropCategory,
      season,
      plantingDate,
      harvestDate,
      status,
      fieldLocation,
      estimatedYield
    });

    // Update farmer's crops array
    await Farmer.findByIdAndUpdate(
      farmerId,
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
 * @route   GET /api/admin/market-prices
 * @desc    Get all market prices
 * @access  Private (Admin and Super Admin)
 */
router.get('/market-prices', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const prices = await MarketPrices.find()
      .sort({ category: 1, cropType: 1 })
      .populate('updatedBy', 'name');
    
    res.status(200).json(
      createResponse(true, 'Market prices retrieved successfully', { prices })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/market-prices/category/:category
 * @desc    Get market prices by category
 * @access  Private (Admin and Super Admin)
 */
router.get('/market-prices/category/:category', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const prices = await MarketPrices.find({ category: req.params.category })
      .sort({ cropType: 1 })
      .populate('updatedBy', 'name');
    
    res.status(200).json(
      createResponse(true, 'Market prices retrieved successfully', { prices })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/admin/market-prices
 * @desc    Add new market price
 * @access  Private (Admin and Super Admin)
 */
router.post('/market-prices', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { cropType, sinhalaName, category, price, unit = 'kg' } = req.body;

    // Validate required fields
    const missingFields = validateRequiredFields(req.body, ['cropType', 'sinhalaName', 'category', 'price']);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    // Check if crop price already exists
    const existingPrice = await MarketPrices.findOne({ cropType, category });
    if (existingPrice) {
      return res.status(409).json(
        createResponse(false, 'Price for this crop already exists')
      );
    }

    const marketPrice = await MarketPrices.create({
      cropType,
      sinhalaName,
      category,
      price,
      unit,
      updatedBy: req.user.id,
      priceHistory: [{
        price,
        updatedBy: req.user.id
      }]
    });

    res.status(201).json(
      createResponse(true, 'Market price added successfully', { marketPrice })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/market-prices/:id
 * @desc    Update market price
 * @access  Private (Admin and Super Admin)
 */
router.put('/market-prices/:id', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { price } = req.body;

    if (!price && price !== 0) {
      return res.status(400).json(
        createResponse(false, 'Please provide a price')
      );
    }

    const marketPrice = await MarketPrices.findById(req.params.id);
    if (!marketPrice) {
      return res.status(404).json(
        createResponse(false, 'Market price not found')
      );
    }

    marketPrice.price = price;
    marketPrice.updatedBy = req.user.id;
    await marketPrice.save();

    res.status(200).json(
      createResponse(true, 'Market price updated successfully', { marketPrice })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   DELETE /api/admin/market-prices/:id
 * @desc    Delete market price
 * @access  Private (Super Admin only)
 */
router.delete('/market-prices/:id', authorize('super_admin'), async (req, res) => {
  try {
    const marketPrice = await MarketPrices.findById(req.params.id);
    
    if (!marketPrice) {
      return res.status(404).json(
        createResponse(false, 'Market price not found')
      );
    }

    await marketPrice.deleteOne();

    res.status(200).json(
      createResponse(true, 'Market price deleted successfully')
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/pending-registrations
 * @desc    Get pending farmer registrations
 * @access  Private (Admin and Super Admin)
 */
router.get('/pending-registrations', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const pendingUsers = await User.find({ 
      status: 'pending',
      role: 'farmer'
    }).select('-password');

    const pendingFarmers = [];
    for (const user of pendingUsers) {
      const farmer = await Farmer.findOne({ user: user._id });
      if (farmer) {
        pendingFarmers.push({
          ...user.toObject(),
          farmer: farmer.toObject()
        });
      }
    }
    
    res.status(200).json(
      createResponse(true, 'Pending registrations retrieved successfully', { 
        pendingRegistrations: pendingFarmers 
      })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/crop-catalog
 * @desc    Get all crops in the catalog
 * @access  Private (Admin and Super Admin)
 */
router.get('/crop-catalog', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crops = await CropCatalog.find()
      .sort({ category: 1, name: 1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.status(200).json(
      createResponse(true, 'Crop catalog retrieved successfully', { crops })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   GET /api/admin/crop-catalog/category/:category
 * @desc    Get crops by category from catalog
 * @access  Private (Admin and Super Admin)
 */
router.get('/crop-catalog/category/:category', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crops = await CropCatalog.find({ 
      category: req.params.category 
    })
      .sort({ name: 1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');

    res.status(200).json(
      createResponse(true, 'Crop catalog retrieved successfully', { crops })
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   POST /api/admin/crop-catalog
 * @desc    Add a new crop to the catalog
 * @access  Private (Admin and Super Admin)
 */
router.post('/crop-catalog', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const { 
      name,
      sinhalaName,
      category,
      description,
      varieties
    } = req.body;
    
    // Validate required fields
    const missingFields = validateRequiredFields(req.body, [
      'name',
      'sinhalaName',
      'category'
    ]);
    if (missingFields) {
      return res.status(400).json(createResponse(false, missingFields));
    }

    const crop = await CropCatalog.create({
      name,
      sinhalaName,
      category,
      description,
      varieties: varieties || [],
      createdBy: req.user.id,
      updatedBy: req.user.id
    });

    res.status(201).json(
      createResponse(true, 'Crop added to catalog successfully', { crop })
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json(
        createResponse(false, 'A crop with this name already exists in the catalog')
      );
    }
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   PUT /api/admin/crop-catalog/:id
 * @desc    Update a crop in the catalog
 * @access  Private (Admin and Super Admin)
 */
router.put('/crop-catalog/:id', authorize('admin', 'super_admin'), async (req, res) => {
  try {
    const crop = await CropCatalog.findByIdAndUpdate(
      req.params.id,
      { 
        ...req.body,
        updatedBy: req.user.id
      },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json(
        createResponse(false, 'Crop not found in catalog')
      );
    }

    res.status(200).json(
      createResponse(true, 'Crop updated successfully', { crop })
    );
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json(
        createResponse(false, 'A crop with this name already exists in the catalog')
      );
    }
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

/**
 * @route   DELETE /api/admin/crop-catalog/:id
 * @desc    Delete a crop from the catalog
 * @access  Private (Super Admin only)
 */
router.delete('/crop-catalog/:id', authorize('super_admin'), async (req, res) => {
  try {
    const crop = await CropCatalog.findById(req.params.id);

    if (!crop) {
      return res.status(404).json(
        createResponse(false, 'Crop not found in catalog')
      );
    }

    await crop.deleteOne();

    res.status(200).json(
      createResponse(true, 'Crop deleted from catalog successfully')
    );
  } catch (error) {
    const { statusCode, response } = createErrorResponse(error);
    res.status(statusCode).json(response);
  }
});

module.exports = router;