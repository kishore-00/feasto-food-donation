const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    listing: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    volunteer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
        // Optional at creation, populated when volunteer delivers to a specific recipient
    },
    status: {
        type: String,
        enum: ['claimed', 'picked_up', 'delivered', 'cancelled'],
        default: 'claimed'
    },
    // Track history of status changes
    history: [{
        status: {
            type: String,
            enum: ['claimed', 'picked_up', 'delivered', 'cancelled']
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        location: {
            // Optional: capture location where the status change happened
            type: { type: String, enum: ['Point'] },
            coordinates: [Number]
        }
    }],
    proofImage: {
        type: String // URL to an image proving pickup/delivery
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

transactionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
