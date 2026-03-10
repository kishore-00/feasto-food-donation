const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: String,
        required: true // e.g., "5 meals", "2kg rice"
    },
    price: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        enum: ['veg', 'non-veg', 'bakery', 'cooked', 'raw', 'other'],
        default: 'other'
    },
    expiryDate: {
        type: Date,
        required: true
    },
    donor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'claimed', 'picked_up', 'delivered', 'expired'],
        default: 'available'
    },
    pickupInstructions: {
        type: String,
        trim: true
    },
    // GeoJSON Schema for Location
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number], // Format: [longitude, latitude]
            required: true
        },
        address: {
            type: String,
            required: true // Human-readable address
        }
    },
    expiryNotified: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create a geospatial index on the location field to enable $near queries
listingSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Listing', listingSchema);
