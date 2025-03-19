const router = require('express').Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Create admin (Super Admin only)
router.post('/create', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const { email, password, name, location, adminType } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        user = new User({
            email,
            password: hashedPassword,
            name,
            location,
            role: 1,
            adminType,
            status: 'approved',
            createdBy: req.user.user.id
        });

        await user.save();

        res.json({ message: 'Admin created successfully', adminId: user._id });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all admins (Super Admin only)
router.get('/list', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const admins = await User.find({ role: 1 })
            .select('-password')
            .populate('createdBy', 'name email');
        res.json(admins);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update admin (Super Admin only)
router.put('/:id', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const { name, location, adminType } = req.body;
        const admin = await User.findById(req.params.id);

        if (!admin || admin.role !== 1) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        admin.name = name || admin.name;
        admin.location = location || admin.location;
        admin.adminType = adminType || admin.adminType;

        await admin.save();
        res.json({ message: 'Admin updated successfully', admin });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete admin (Super Admin only)
router.delete('/:id', authMiddleware, roleCheck([2]), async (req, res) => {
    try {
        const admin = await User.findById(req.params.id);

        if (!admin || admin.role !== 1) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        await admin.deleteOne();
        res.json({ message: 'Admin deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;