const mongoose = require('mongoose');
const slugify = require('slugify');

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required.']
  },
  breed: {
    type: mongoose.Schema.ObjectId,
    ref: 'Breed',
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required.']
  },
  age: {
    type: String,
    required: [true, 'Age is required.']
  },
  size: {
    type: String,
    enum: ['small', 'medium', 'large'],
    required: [true, 'Size is required.']
  },
  description: {
    type: String,
    required: [true, 'Description is required.']
  },
  trained: {
    type: Boolean,
    default: false,
    required: true
  },
  goodWithDogs: {
    type: Boolean,
    default: false,
    required: true
  },
  goodWithCats: {
    type: Boolean,
    default: false,
    required: true
  },
  location: {
    type: String,
    required: [true, 'Location is required.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  active: { // Used to deactivate/delete adopted dogs, this way they will stay in database
    type: Boolean,
    default: true,
    select: false
  },
  adoption: {
    type: String,
    enum: ['none', 'in progress', 'adopted', 'visit arranged', 'canceled'],
    default: 'none',
    required: true
  },
  slug: {
    type: String,
    unique: true
  },
  image: {
    type: mongoose.Schema.ObjectId,
    ref: 'Gallery',
    required: [true, 'Image is required.']
  }
});

// DOCUMENT MIDDLEWARE
dogSchema.pre('save', function(next){
  this.slug = slugify(this.name, {lower: true});
  next();
});

module.exports = mongoose.model('Dog', dogSchema);