const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

exports.getAdminsEmails = handleAsync(async (req, res, next) => {
  const users = await User.find({ role: 'admin' });
  // if(!users) {
  //   return next(new AppError('Cannot get admins!', 404));
  // }

  req.adminEmails = users.map(user => user.email).join();
  req.adminIds = users.map(user => user._id);
  next();
});