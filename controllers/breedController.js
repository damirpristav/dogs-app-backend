const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Breed = require('../models/Breed');

// @desc     Get all breeds
// @route    GET /api/v1/breed
// @access   Public
exports.getAllBreeds = handleAsync(async (req, res, next) => {
  const breeds = await Breed.find();

  res.status(200).json({
    success: true,
    results: breeds.length,
    data: breeds
  });
});

// @desc     Get single breed
// @route    GET /api/v1/breed/:breedId
// @access   Public
exports.getBreed = handleAsync(async (req, res, next) => {
  const breed = await Breed.findById(req.params.breedId);

  if(!breed) {
    return next(new AppError('Breed with this id does not exist!', 404));
  }

  res.status(200).json({
    success: true,
    data: breed
  });
});

// @desc     Create new breed
// @route    POST /api/v1/breed
// @access   Private/only admin
exports.createBreed = handleAsync(async (req, res, next) => {
  const { name, origin } = req.body;

  const breed = await Breed.create({
    name,
    origin,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    message: 'New breed created!',
    data: breed
  });
});

// @desc     UPDATE breed
// @route    PATCH /api/v1/breed/:breedId
// @access   Private/only admin
exports.updateBreed = handleAsync(async (req, res, next) => {
  const breed = await Breed.findByIdAndUpdate(req.params.breedId, req.body, {
    runValidators: true,
    new: true
  });

  if(!breed) {
    return next(new AppError('Breed not found!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Breed updated!',
    data: breed
  });
});

// @desc     Delete breed
// @route    DELETE /api/v1/breed/:breedId
// @access   Private/only admin
exports.deleteBreed = handleAsync(async (req, res, next) => {
  const breed = await Breed.findByIdAndDelete(req.params.breedId);

  if(!breed) {
    return next(new AppError('Breed not found!', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Breed deleted!',
    data: breed
  });
});