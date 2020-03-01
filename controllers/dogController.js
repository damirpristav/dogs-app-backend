const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Dog = require('../models/Dog');

// @desc     Get all dogs
// @route    GET /api/v1/dogs
// @access   Public
exports.getAllDogs = handleAsync(async (req, res, next) => {
  let query;
  
  let reqQuery = {...req.query};

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach(param => delete reqQuery[param]);

  query = Dog.find(reqQuery).populate({
    path: 'breed',
    select: 'name origin'
  }).populate('image');

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 4;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Dog.countDocuments();

  // query = query.skip(startIndex).limit(limit);

  const dogs = await query;

  // Pagination result
  const pagination = {};

  if(endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }

  if(startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  pagination.count = total;
  pagination.pages = Math.ceil(total / limit);
  pagination.currentPage = page;

  res.status(200).json({
    success: true,
    results: dogs.length,
    data: dogs,
    pagination
  });
});

// @desc     Get single dog
// @route    GET /api/v1/dogs/:slug
// @access   Public
exports.getDog = handleAsync(async (req, res, next) => {
  const dog = await Dog.findOne({ slug: req.params.slug }).populate('breed').populate('image');

  if(!dog) {
    return next(new AppError('Dog with this id does not exist', 404));
  }

  res.status(200).json({
    success: true,
    data: dog
  });
});

// @desc     Add new dog
// @route    POST /api/v1/dogs
// @access   Private/only admin
exports.addDog = handleAsync(async (req, res, next) => {
  const body = { ...req.body };
  if(req.file) {
    body.photo = req.file.filename;
  }
  
  const dog = await Dog.create(body);

  res.status(201).json({
    success: true,
    message: 'Dog successfully added.',
    data: dog
  });
});

// @desc     Update dog
// @route    PATCH /api/v1/dogs/:dogId
// @access   Private/only admin
exports.updateDog = handleAsync(async (req, res, next) => {
  const body = { ...req.body };

  const dog = await Dog.findByIdAndUpdate(req.params.dogId, body, {
    new: true,
    runValidators: true
  }).populate('breed');

  if(!dog) {
    return next(new AppError('Dog with this id does not exist', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Dog successfully updated.',
    data: dog
  });
});

// @desc     Delete dog
// @route    DELETE /api/v1/dogs/:dogId
// @access   Private/only admin
exports.deleteDog = handleAsync(async (req, res, next) => {
  const dog = await Dog.findById(req.params.dogId);
  
  if(!dog) {
    return next(new AppError('Dog with this id does not exist', 404));
  }

  await dog.remove();

  res.status(200).json({
    success: true,
    message: `Dog ${dog.name} deleted!`,
    data: dog
  });
});