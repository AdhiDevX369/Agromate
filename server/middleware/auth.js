const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { createResponse } = require('../utils');
const { JWT_SECRET } = require('../config');

// Role hierarchy definition
const roleHierarchy = {
  super_admin: ['super_admin', 'admin', 'farmer'],
  admin: ['admin', 'farmer'],
  farmer: ['farmer']
};

/**
 * Middleware to protect routes that require authentication
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json(
        createResponse(false, 'Please login to access this resource')
      );
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);

      // Find user by id
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json(
          createResponse(false, 'User no longer exists')
        );
      }

      // Check if user status matches token status
      if (user.status !== decoded.status) {
        return res.status(401).json(
          createResponse(false, 'Session expired. Please login again')
        );
      }

      // Check if user is blocked
      if (user.status === 'blocked') {
        return res.status(403).json(
          createResponse(false, 'Your account has been blocked. Please contact support')
        );
      }

      // Check if user is pending approval
      if (user.status === 'pending') {
        return res.status(403).json(
          createResponse(false, 'Your account is pending approval')
        );
      }

      // Add user and role hierarchy to request object
      req.user = user;
      req.userRoles = roleHierarchy[user.role] || [user.role];
      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json(
          createResponse(false, 'Invalid token. Please login again')
        );
      }
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(
          createResponse(false, 'Token expired. Please login again')
        );
      }
      return res.status(401).json(
        createResponse(false, 'Not authorized to access this resource')
      );
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to authorize specific roles with hierarchy support
 * @param {...String} roles - Allowed roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createResponse(false, 'User not authenticated')
      );
    }

    // Check if user has any of the required roles based on hierarchy
    const hasRequiredRole = roles.some(role => req.userRoles.includes(role));
    
    if (!hasRequiredRole) {
      return res.status(403).json(
        createResponse(false, `User role ${req.user.role} is not authorized to access this resource`)
      );
    }
    
    next();
  };
};

/**
 * Middleware to ensure user can only access their own resources unless they're super_admin/admin
 */
exports.checkResourceOwnership = () => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(
        createResponse(false, 'User not authenticated')
      );
    }

    // Super admin and admin can access all resources
    if (req.user.role === 'super_admin' || req.user.role === 'admin') {
      return next();
    }

    // For farmers, check if they're accessing their own resource
    if (req.params.id && req.params.id !== req.user.id) {
      return res.status(403).json(
        createResponse(false, 'Not authorized to access this resource')
      );
    }

    next();
  };
};