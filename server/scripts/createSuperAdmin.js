const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

const User = require('../models/User');

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Check if super admin already exists
        const existingSuperAdmin = await User.findOne({ role: 2 });
        if (existingSuperAdmin) {
            console.log('Super admin already exists');
            process.exit(0);
        }

        // Create super admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('superadmin123', salt);

        const superAdmin = new User({
            email: 'superadmin@agromate.lk',
            password: hashedPassword,
            name: 'Super Administrator',
            location: 'Colombo',
            role: 2,
            status: 'approved'
        });

        await superAdmin.save();
        console.log('Super admin created successfully');
        console.log('Email: superadmin@agromate.lk');
        console.log('Password: superadmin123');
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

createSuperAdmin();