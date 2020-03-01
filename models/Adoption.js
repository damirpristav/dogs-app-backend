const mongoose = require('mongoose');

const adoptionSchema = new mongoose.Schema({
  dog: {
    type: mongoose.Schema.ObjectId,
    ref: 'Dog',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  progress: {
    type: String,
    enum: ['in progress', 'visit', 'completed', 'canceled'],
    default: 'in progress',
    required: true
  },
  adoptionFor: String,
  adoptionBy: String
});

module.exports = mongoose.model('Adoption', adoptionSchema);