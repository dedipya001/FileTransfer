const mongoose = require('mongoose');

const LocationSchema = mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  description: String,
  latitude: Number,
  longitude: Number,
  mainImage: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Location', LocationSchema);
