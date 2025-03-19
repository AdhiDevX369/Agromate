const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: Number,
        default: 0,  // 0: Farmer, 1: Admin, 2: Super Admin
        required: true,
        enum: [0, 1, 2]
    },
    adminType: {
        type: String,
        enum: ['general', 'market', 'approval'],
        required: function() { return this.role === 1; }  // Required only for admins
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: function() { return this.role === 1; }  // Required only for admins
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);