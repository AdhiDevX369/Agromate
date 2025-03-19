const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const { authMiddleware, roleCheck } = require('../middleware/auth');

// Register route
router.post('/register', async (req, res) => {
    try {
        const { 
            email, 
            password, 
            name, 
            location,
            farmName,
            farmSize,
            cropsGrown,
            contactNumber,
            address
        } = req.body;

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        user = new User({
            email,
            password: hashedPassword,
            name,
            location,
            role: 0, // Default role is farmer
            status: 'pending'
        });

        await user.save();

        // Create farmer profile
        const farmer = new Farmer({
            userId: user._id,
            farmName,
            farmSize,
            cropsGrown,
            contactNumber,
            address
        });

        await farmer.save();

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallbacksecret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check if user is approved (only for farmers)
        if (user.role === 0 && user.status !== 'approved') {
            return res.status(403).json({ message: 'Account pending approval' });
        }

        // Create and return JWT token
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'fallbacksecret',
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get current user route
router.get('/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get pending registrations (Admin & Super Admin only)
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

// Approve/Reject farmer registration (Admin & Super Admin only)
router.put('/approve-registration/:userId', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        const { status } = req.body; // 'approved' or 'rejected'
        
        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const user = await User.findById(req.params.userId);
        
        if (!user || user.role !== 0) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        user.status = status;
        await user.save();

        res.json({ message: `Registration ${status}`, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;