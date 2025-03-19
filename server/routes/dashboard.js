const router = require('express').Router();
const { authMiddleware, roleCheck } = require('../middleware/auth');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const Crop = require('../models/Crop');
const Transaction = require('../models/Transaction');

// Get farmer dashboard data
router.get('/farmer', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const userId = req.user.user.id;

        // Fetch all required data in parallel
        const [farmerProfile, crops, transactions] = await Promise.all([
            Farmer.findOne({ userId }),
            Crop.find({ userId }).sort({ createdAt: -1 }).limit(5),
            Transaction.find({ userId })
                .sort({ date: -1 })
                .limit(10)
        ]);

        // Calculate financial summary
        const financialSummary = transactions.reduce((acc, transaction) => {
            if (transaction.type === 'income') {
                acc.totalIncome += transaction.amount;
            } else {
                acc.totalExpenses += transaction.amount;
            }
            return acc;
        }, { totalIncome: 0, totalExpenses: 0 });

        res.json({
            profile: farmerProfile,
            recentCrops: crops,
            recentTransactions: transactions,
            financialSummary
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get admin dashboard data
router.get('/admin', authMiddleware, roleCheck([1, 2]), async (req, res) => {
    try {
        // Fetch all required data in parallel
        const [
            totalFarmers,
            pendingUsers,
            recentTransactions,
            cropStats
        ] = await Promise.all([
            User.countDocuments({ role: 0 }),
            User.find({ role: 0, status: 'pending' })
                .select('-password')
                .sort({ createdAt: -1 }),
            Transaction.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('userId', 'name'),
            Crop.aggregate([
                { $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }}
            ])
        ]);

        // Get farmer details for pending registrations
        const pendingApprovals = await Promise.all(
            pendingUsers.map(async (user) => {
                const farmerDetails = await Farmer.findOne({ userId: user._id });
                return {
                    ...user.toObject(),
                    farmerDetails
                };
            })
        );

        const stats = {
            totalFarmers,
            pendingApprovals: pendingApprovals.length,
            totalTransactions: await Transaction.countDocuments(),
            cropStats: cropStats.reduce((acc, stat) => {
                acc[stat._id] = stat.count;
                return acc;
            }, {})
        };

        res.json({
            stats,
            pendingApprovals,
            recentTransactions,
            recentActivities: [] // TODO: Implement activity logging
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
        const userId = req.user.user.id;

        const updatedProfile = await Farmer.findOneAndUpdate(
            { userId },
            {
                farmName,
                farmSize,
                cropsGrown,
                contactNumber,
                address,
                profileUpdatedAt: Date.now()
            },
            { new: true, upsert: true }
        );

        res.json(updatedProfile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new crop
router.post('/farmer/crops', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { cropType, quantity, expectedHarvestDate, notes } = req.body;
        const userId = req.user.user.id;

        const newCrop = new Crop({
            userId,
            cropType,
            quantity,
            expectedHarvestDate,
            notes
        });

        await newCrop.save();
        res.json(newCrop);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add new transaction
router.post('/farmer/transactions', authMiddleware, roleCheck([0]), async (req, res) => {
    try {
        const { type, amount, description, category } = req.body;
        const userId = req.user.user.id;

        const newTransaction = new Transaction({
            userId,
            type,
            amount,
            description,
            category
        });

        await newTransaction.save();
        res.json(newTransaction);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;