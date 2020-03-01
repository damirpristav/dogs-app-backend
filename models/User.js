const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required.']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required.']
  },
  email: {
    type: String,
    required: [true, 'Email is required.'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Email is invalid.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    minlength: 6,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  active: {
    type: Boolean,
    default: false,
    select: false
  },
  activationToken: {
    type: String,
    select: false
  },
  passwordChangedAt: Date
});

// ***** MIDDLEWARES *****
// encrypt password before save
userSchema.pre('save', async function(next){
  if(!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ***** METHODS *****
// check if entered password(from login form) matches encrypted password in database
userSchema.methods.checkPassword = async function(pass){
  return bcrypt.compare(pass, this.password);
}

// Sign jwt and return it
userSchema.methods.getSignedJWT = function() {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: 3600
  });
}

// Check if password is changed after the jwt was signed and sent 
userSchema.methods.changedPasswordAfter = function(jwtIat) {
  if(this.passwordChangedAt) {
    const passChangeTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    
    return jwtIat < passChangeTime;
  }

  // False means not changed
  return false;
}

// Reset password token
userSchema.methods.getResetPasswordToken = function() {
  // Create random string
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash previously created random string and save it to database field resetPasswordToken
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Set expiration date for token
  this.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

  // return non hashed token
  return resetToken;
}

module.exports = mongoose.model('User', userSchema);