const mongoose = require('mongoose');
const User = require('../models/User');
const config = require('../config');

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(config.MONGO_URL);
    console.log('Connected to MongoDB');

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ role: 'super_admin' });
    if (existingSuperAdmin) {
      console.log('Super admin already exists');
      process.exit(0);
    }

    // Create super admin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPER_ADMIN_EMAIL || 'super@admin.com',
      password: process.env.SUPER_ADMIN_PASSWORD || 'superadmin123',
      role: 'super_admin'
    });

    console.log('Super admin created successfully:', superAdmin.email);
    process.exit(0);
  } catch (error) {
    console.error('Error creating super admin:', error);
    process.exit(1);
  }
};

createSuperAdmin();