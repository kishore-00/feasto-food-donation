const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['donor', 'volunteer', 'recipient'],
    default: 'donor'
  },
  phone: {
    type: String,
    trim: true
  },
  // Optional: Default location for the user
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for verifying uniqueness is usually handled by the 'unique: true' option,
// but explicit compound indexes can be added here if needed.

// Create a geospatial index on user location for proximity queries
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
