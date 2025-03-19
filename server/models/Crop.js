const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    cropType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    expectedHarvestDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['growing', 'harvested', 'sold'],
        default: 'growing'
    },
    plantedDate: {
        type: Date,
        default: Date.now
    },
    notes: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema);