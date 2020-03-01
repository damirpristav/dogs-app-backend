const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  image: {
    type: String,
    required: [true, 'Image is required.']
  },
  uploadedAt: {
    type: Date,
    default: Date.now()
  }
});

module.exports = mongoose.model('Gallery', gallerySchema);