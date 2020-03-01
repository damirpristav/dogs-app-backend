const mongoose = require('mongoose');

const breedSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Breed name is required!']
  },
  origin: {
    type: String,
    required: [true, 'Origin is required.']
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Breed', breedSchema);