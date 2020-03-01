const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Adoption = require('../models/Adoption');
const Dog = require('../models/Dog');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Email = require('../utils/Email');

// @desc     Create new adoption request
// @route    POST /api/v1/adoptions/dog/:dogId
// @access   Private/only users
exports.adopt = handleAsync(async (req, res, next) => {
  let adoption = await Adoption.create({
    dog: req.dog._id,
    user: req.user._id,
    adoptionFor: req.dog.name,
    adoptionBy: req.user.firstName + ' ' + req.user.lastName
  });

  await Notification.create({
    subject: 'New adoption request',
    message: `User ${req.user.firstName} ${req.user.lastName} wants to adopt ${req.dog.name}!`,
    sendTo: req.adminIds
  });

  try {
    const newEmail = new Email(req.user, '', req.dog.name);
    await newEmail.send('newAdoption', 'New adoption request', true, req.adminEmails);

    req.dog = undefined;
    req.adminEmails = undefined;
    req.adminIds = undefined;

    adoption = await adoption.populate('dog').populate('user').execPopulate();

    res.status(200).json({
      success: true,
      message: 'Adoption request successfully created. Admin is notified. Please wait for response!',
      data: adoption
    });
  } catch (err) {
    return next(new AppError('There was an error sending an email.', 500));
  }
});

// @desc     Get all adoption requests
// @route    GET /api/v1/adoptions
// @access   Private/only logged in user or admin
exports.getAdoptions = handleAsync(async (req, res, next) => {
  let adoptions;
  if(req.user.role === 'admin') {
    adoptions = await Adoption.find().populate({ 
      path: 'dog', select: 'name photo adoption' 
    }).populate({ path: 'user', select: 'firstName lastName email'});
  }else {
    adoptions = await Adoption.find({user: req.user._id}).populate({ 
      path: 'dog', select: 'name photo adoption' 
    }).populate({ path: 'user', select: 'firstName lastName email'});
  }

  res.status(200).json({
    success: true,
    results: adoptions.length,
    data: adoptions
  });
});

// @desc     Get single adoption request
// @route    GET /api/v1/adoptions/:adoptionId
// @access   Private/only admin
exports.getAdoption = handleAsync(async (req, res, next) => {
  const adoption = await Adoption.findById(req.params.adoptionId).populate({ 
    path: 'dog', select: 'name photo adoption' 
  }).populate({ path: 'user', select: 'firstName lastName email'});

  if(!adoption) {
    return next(new AppError('Adoption with this id cannot be found!', 404));
  }

  res.status(200).json({
    success: true,
    data: adoption
  });
});

// @desc     Update adoption request
// @route    PATCH /api/v1/adoptions/:adoptionId
// @access   Private/only admin
exports.updateAdoption = handleAsync(async (req, res, next) => {
  const adoption = await Adoption.findByIdAndUpdate(req.params.adoptionId, req.body, {
    new: true,
    runValidators: true
  }).populate({ 
    path: 'dog', select: 'name' 
  }).populate({ path: 'user', select: 'firstName lastName'});
  
  if(!adoption) {
    return next(new AppError('Adoption with this id cannot be found!', 404));
  }

  // Check if adoption is completed to remove dog from the list of dogs on frontend and 
  // to send Notification to the user
  const dog = await (await Dog.findById(adoption.dog).select('+active'));
  const user = await User.findById(adoption.user);

  if(adoption.progress === 'completed') {
    // Send Notification to user
    await Notification.create({
      subject: 'Adoption Completed',
      message: `You have successfully adopted ${dog.name}!`,
      sendTo: user._id
    });

    if(dog) {
      dog.active = false;
      dog.adoption = 'adopted';
      await dog.save({ validateBeforeSave: false });
    }
  }else if(adoption.progress === 'visit') {
    // Send Notification to user
    await Notification.create({
      subject: 'Visit arranged',
      message: `You can now visit ${dog.name}!`,
      sendTo: user._id
    });

    if(dog) {
      dog.active = false;
      dog.adoption = 'visit arranged';
      await dog.save({ validateBeforeSave: false });
    }
  }else if(adoption.progress === 'canceled'){
    // Send notification to user
    await Notification.create({
      subject: 'Adoption Canceled',
      message: `Your request to adopt ${dog.name} was canceled!`,
      sendTo: user._id
    });

    if(dog) {
      dog.active = true;
      dog.adoption = 'none';
      await dog.save({ validateBeforeSave: false });
    }
  }

  res.status(200).json({
    success: true,
    message: `Adoption "${adoption._id} - ${dog.name} to ${user.firstName} ${user.lastName}" updated!`,
    data: adoption
  });
});