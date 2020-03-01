const crypto = require('crypto');

const User = require('../models/User');
const Email = require('../utils/Email');
const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');

// @desc     Register User
// @route    POST /api/v1/auth/register
// @access   Public
exports.register = handleAsync(async (req, res, next) => {
  const { password, confirmPassword, firstName, lastName, email } = req.body;

  if( password !== confirmPassword ) {
    return next(new AppError('Passwords does not match!', 400));
  }

  const findUser = await User.findOne({ email });

  if( findUser ) {
    return next(new AppError('Email already in use!', 400));
  }

  const activationToken = crypto.randomBytes(20).toString('hex');

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    activationToken: crypto.createHash('sha256').update(activationToken).digest('hex')
  });


  try {
    const newEmail = new Email(newUser, `${process.env.FRONTEND_URL}/activateAccount/${activationToken}`);
    await newEmail.send('activateAccount', 'Activate your account');
  
    res.status(200).json({
      success: true,
      message: 'User successfully created! Please check your email to activate your account!',
      data: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });  
  } catch (err) {
    console.log(err);
    return next(new AppError('There was an error sending an email. Please contact admin to activate your account!', 500));
  }
});

// @desc     Activate Users account
// @route    GET /api/v1/auth/activateAccount/:token
// @access   Public
exports.activateAccount = handleAsync(async (req, res, next) => {
  const { token } = req.params;
  const activationToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ activationToken });

  if(!user) {
    return next(new AppError('Invalid activation token!', 400));
  }

  user.active = true;
  user.activationToken = undefined;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'User activated! Please login to your account.',
    data: null
  });
});

// @desc     Login User
// @route    POST /api/v1/auth/login
// @access   Public
exports.login = handleAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if(!email || !password) {
    return next(new AppError('Email and password fields are required.', 400));
  }

  const user = await User.findOne({ email }).select('+password +active');

  if(!user) {
    return next(new AppError('Invalid credentials!', 401));
  }

  const passCheck = await user.checkPassword(password);

  if(!passCheck) {
    return next(new AppError('Invalid credentials', 401));
  }

  if(!user.active) {
    return next(new AppError('User is not active. Please activate your account and try again.', 400));
  }

  tokenResponse(user, res);
});

// @desc     Logout User
// @route    GET /api/v1/auth/logout
// @access   Private
exports.logout = handleAsync(async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 1 * 1000),
    secure: true,
    httpOnly: true,
    domain: process.env.COOKIE_SET_DOMAIN,
    sameSite: true
  });

  res.status(200).json({
    success: true,
    message: 'You are now logged out',
    data: null
  });
});

// @desc     Get logged in user data
// @route    GET /api/v1/auth/me
// @access   Private
exports.me = handleAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Logged in user data',
    data: req.user
  })
});

// @desc     Forgot Password
// @route    POST /api/v1/auth/forgotPassword
// @access   Public
exports.forgotPassword = handleAsync(async (req, res, next) => {
  const { email } = req.body;

  // Check if user with this email exists and if user is active
  const user = await User.findOne({ email }).select('+active');

  if(!user) {
    return next(new AppError('User with this email is not registered. Please register!', 400));
  }

  if(!user.active) {
    return next(new AppError('User is not yet active. Please activate your account!', 400));
  }

  const token = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    // Create new mail from template and send it to users email address
    const newEmail = new Email(user, `${process.env.FRONTEND_URL}/resetPassword/${token}`);
    await newEmail.send('resetPassword', 'Reset your password');
  
    res.status(200).json({
      success: true,
      message: 'Please check your email to reset your password. Your token is valid only for 10 minutes.',
      data: null
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending an email. Try again later!', 500));
  }
});

// @desc     Reset Password
// @route    PUT /api/v1/auth/resetPassword/:token
// @access   Public
exports.resetPassword = handleAsync(async (req, res, next) => {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;
  
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });

  if(!user) {
    return next(new AppError('Your token is not valid or has expired!', 400));
  }

  if(!password || !confirmPassword) {
    return next(new AppError('Password and Confirm password fields are required!', 400));
  }

  if(password !== confirmPassword) {
    return next(new AppError('Passwords must be equal!', 400));
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.passwordChangedAt = Date.now() - 1000;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'You password was changed! You can now login with your new password!',
    data: null
  });
});

// @desc     Delete account
// @route    DELETE /api/v1/auth/deleteMe
// @access   Private
exports.deleteMe = handleAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.user._id);

  if(!user) {
    return next(new AppError('No user found with this id!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Your account was successfully deleted!',
    data: null
  });
});

// @desc     Resend activation token
// @route    POST /api/v1/auth/resendActivationToken
// @access   Private/only admin
exports.resendActivationToken = handleAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email }).select('+active');

  if(!user) {
    return next(new AppError('User with this email does not exist!', 400));
  }

  if(user.active) {
    return next(new AppError('User is already active.', 400));
  }

  const activationToken = crypto.randomBytes(20).toString('hex');
  user.activationToken = crypto.createHash('sha256').update(activationToken).digest('hex');
  await user.save({ validateBeforeSave: false });

  try {
    const newEmail = new Email(user, `${req.protocol}://${req.get('host')}/api/v1/auth/activateAccount/${activationToken}`);
    await newEmail.send('activateAccount', 'Activate your account');

    res.status(200).json({
      success: true,
      message: 'Email sent with new activation token!',
      data: null
    });
  } catch (err) {
    user.activationToken = undefined;
    await user.save();
    
    return next(new AppError('Email could not be sent. Please try again!', 500));
  }
});

// @desc     Check if token cookie exists
// @route    GET /api/v1/auth/checkToken
// @access   Private
exports.checkToken = handleAsync(async (req, res, next) => {
  if(req.user) {
    return res.status(200).json({
      success: true,
      data: req.user
    });
  }

  res.status(401).json({
    success: false
  });
});

// Token response - sign jwt and set cookie to this jwt and return jwt in response
const tokenResponse = (user, res) => {
  const token = user.getSignedJWT();

  res.setHeader('X-Access-Token', `Bearer ${token}`);

  let updatedUser = {...user._doc};
  delete updatedUser.password;
  delete updatedUser.active;

  const cookieOptions = {
    expires: new Date(Date.now() + 3600 * 1000),
    secure: true,
    httpOnly: true,
    domain: process.env.COOKIE_SET_DOMAIN,
    sameSite: true
  };

  return res.status(200).cookie('token', `Bearer ${token}`, cookieOptions).json({
    success: true,
    message: 'Login successfull!',
    data: updatedUser
  });
}