const mongoose = require('mongoose');

const PhotoSchema = mongoose.Schema({
  locationId: {
    type: Number,
    required: true,
    ref: 'Location'
  },
  captureDate: {
    type: Date,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  caption: String,
  metadata: {
    width: Number,
    height: Number,
    size: Number
  },
  stats: {
    peopleCount: {
      type: Number,
      default: 0
    },
    vehicleCount: {
      type: Number,
      default: 0
    },
    garbageLevel: {
      type: String,
      enum: ['low', 'medium', 'high', 'none'],
      default: 'none'
    },
    weatherCondition: {
      type: String,
      enum: ['sunny', 'cloudy', 'rainy', 'foggy', 'unknown'],
      default: 'unknown'
    }
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries by location and date
PhotoSchema.index({ locationId: 1, captureDate: 1 });

module.exports = mongoose.model('Photo', PhotoSchema);
