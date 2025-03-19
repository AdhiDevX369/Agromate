const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { authMiddleware, roleCheck } = require('../middleware/auth');
const User = require('../models/User');
const Farmer = require('../models/Farmer');

// Get pending registrations (Admin & Super Admin)
router.get('/pending-registrations', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        const pendingUsers = await User.find({ 
            role: 0, 
            status: 'pending' 
        }).select('-password');

        const pendingFarmers = await Promise.all(
            pendingUsers.map(async (user) => {
                const farmerDetails = await Farmer.findOne({ userId: user._id });
                return {
                    ...user.toObject(),
                    farmerDetails
                };
            })
        );

        res.json(pendingFarmers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Approve/Reject farmer registration (Admin & Super Admin)
router.put('/registration-status/:userId', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.userId);
        if (!user || user.role !== 0) {
            return res.status(404).json({ message: 'User not found or not a farmer' });
        }

        user.status = status;
        await user.save();

        res.json({ message: `Registration ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new admin (Super Admin only)
router.post('/create-admin', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const { email, password, name } = req.body;

        // Check if admin already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin user
        user = new User({
            email,
            password: hashedPassword,
            name,
            role: 1, // Admin role
            status: 'approved'
        });

        await user.save();
        res.json({ message: 'Admin created successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all admins (Super Admin only)
router.get('/admins', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const admins = await User.find({ role: 1 }).select('-password');
        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update admin status (Super Admin only)
router.put('/admin-status/:adminId', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'inactive'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const admin = await User.findById(req.params.adminId);
        if (!admin || admin.role !== 1) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.status = status;
        await admin.save();

        res.json({ message: `Admin status updated to ${status}` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get farmer details (Admin & Super Admin)
router.get('/farmer/:farmerId', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        const farmer = await Farmer.findById(req.params.farmerId);
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const user = await User.findById(farmer.userId).select('-password');
        res.json({
            ...farmer.toObject(),
            userDetails: user
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update market prices (Admin & Super Admin)
router.put('/market-prices/:productId', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        const { price } = req.body;
        // TODO: Implement market price update logic when the Market model is created
        res.json({ message: 'Price updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;