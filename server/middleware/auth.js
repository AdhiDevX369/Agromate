const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallbacksecret');
        
        // Get user from database to check current status
        const user = await User.findById(decoded.user.id).select('-password');
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // If user is a farmer (role 0), check approval status
        if (user.role === 0 && user.status !== 'approved') {
            return res.status(403).json({ message: 'Account pending approval' });
        }

        req.user = {
            user: {
                id: user._id,
                role: user.role,
                status: user.status
            }
        };
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const roleCheck = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = { authMiddleware, roleCheck };