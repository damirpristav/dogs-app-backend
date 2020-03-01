const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// Protect private routes
exports.protect = handleAsync(async (req, res, next) => {
  // Get token
  let token;

  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }else if(req.cookies.token) {
    // Set token from cookie
    token = req.cookies.token.split(' ')[1];
  }

  // Check if token exists
  if(!token) {
    return next(new AppError('Not authorized to access this page!', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Get id from decoded token and return error if user with this id does not exist
  const user = await User.findById(decoded._id);
  if(!user) {
    return next(new AppError('User does not exist.', 404));
  }

  // Check if user changed password after the token was issued
  if(user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('Recently changed password. Please login again!', 401));
  }

  // Set user
  req.user = user;
  next();
});

// Restrict access to only to specified roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if(!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403));
    }
    next();
  }
} 