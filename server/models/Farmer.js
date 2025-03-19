const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    farmName: {
        type: String,
        required: true
    },
    farmSize: {
        type: Number,
        required: true
    },
    cropsGrown: [{
        type: String
    }],
    contactNumber: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    profileUpdatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Farmer', farmerSchema);