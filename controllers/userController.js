const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

// @desc     Get all users
// @route    GET /api/v1/users
// @access   Private/only admin
exports.getAllUsers = handleAsync(async (req, res, next) => {
  const users = await User.find({ role: 'user' }).select('+active');

  res.status(200).json({
    success: true,
    results: users.length,
    data: users
  });
});

// @desc     Get single user
// @route    GET /api/v1/users/:userId
// @access   Private/only admin
exports.getUser = handleAsync(async (req, res, next) => {
  const user = await User.findById(req.params.userId).select('+active');

  if(!user) {
    return next(new AppError('User with this id cannot be found!', 404));
  }

  res.status(200).json({
    success: true,
    data: user
  });
});

// @desc     Delete user
// @route    DELETE /api/v1/users/:userId
// @access   Private/only admin
exports.deleteUser = handleAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.userId);

  if(!user) {
    return next(new AppError('User with this id does not exist!', 404));
  }

  res.status(200).json({
    success: true,
    message: `User ${user.firstName} ${user.lastName} deleted!`,
    data: user
  });
});