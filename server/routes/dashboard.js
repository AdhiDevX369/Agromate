const router = require('express').Router();
const { authMiddleware, roleCheck } = require('../middleware/auth');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get farmer dashboard data
router.get('/farmer', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const farmer = await Farmer.findOne({ userId: req.user.user.id });
        if (!farmer) {
            return res.status(404).json({ message: 'Farmer profile not found' });
        }

        const crops = await Crop.find({ userId: req.user.user.id });
        const transactions = await Transaction.find({ userId: req.user.user.id })
            .sort({ date: -1 })
            .limit(10);

        res.json({
            farmer,
            crops,
            recentTransactions: transactions
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin dashboard data
router.get('/admin', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        // Get total farmers (only approved ones)
        const totalFarmers = await User.countDocuments({ 
            role: 0,
            status: 'approved'
        });

        // Get pending approvals count
        const pendingApprovals = await User.countDocuments({ 
            role: 0,
            status: 'pending'
        });

        // Get total transactions
        const totalTransactions = await Transaction.countDocuments();

        // Get crop statistics
        const cropStats = await Crop.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Convert crop stats array to object
        const cropStatsObject = cropStats.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
        }, {
            growing: 0,
            harvested: 0,
            sold: 0
        });

        res.json({
            totalFarmers,
            pendingApprovals,
            totalTransactions,
            cropStats: cropStatsObject
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update farmer profile
router.put('/farmer/profile', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { farmName, farmSize, cropsGrown, contactNumber, address } = req.body;
        const farmer = await Farmer.findOneAndUpdate(
            { userId: req.user.user.id },
            { farmName, farmSize, cropsGrown, contactNumber, address },
            { new: true }
        );
        res.json(farmer);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new crop
router.post('/farmer/crops', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { cropType, quantity, expectedHarvestDate } = req.body;
        const crop = new Crop({
            userId: req.user.user.id,
            cropType,
            quantity,
            expectedHarvestDate,
            status: 'growing'
        });
        await crop.save();
        res.json(crop);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update crop status
router.put('/farmer/crops/:id', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { status } = req.body;
        const crop = await Crop.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.user.id },
            { status },
            { new: true }
        );
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.json(crop);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a transaction
router.post('/farmer/transactions', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { type, amount, description } = req.body;
        const transaction = new Transaction({
            userId: req.user.user.id,
            type,
            amount,
            description,
            date: new Date()
        });
        await transaction.save();
        res.json(transaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get farmer's transaction history with filters
router.get('/farmer/transactions', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { startDate, endDate, type } = req.query;
        const query = { userId: req.user.user.id };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        if (type) {
            query.type = type;
        }

        const transactions = await Transaction.find(query)
            .sort({ date: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;