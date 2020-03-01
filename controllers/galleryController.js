const fs = require('fs');
const { promisify } = require('util');

const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Gallery = require('../models/Gallery');

const unlinkAsync = promisify(fs.unlink);

// @desc     Add new image
// @route    POST /api/v1/gallery
// @access   Private/only admin
exports.addImage = handleAsync(async (req, res, next) => {
  const body = { ...req.body };
  if(req.file) {
    body.image = req.file.filename;
  }
  
  const gallery = await Gallery.create(body);

  res.status(201).json({
    success: true,
    message: 'Image successfully added.',
    data: gallery
  });
});

// @desc     Get all images
// @route    GET /api/v1/gallery
// @access   Private/only admin
exports.getAllImages = handleAsync(async (req, res, next) => {
  const images = await Gallery.find();

  res.status(200).json({
    success: true,
    results: images.length,
    data: images
  });
});

// @desc     Delete image
// @route    DELETE /api/v1/gallery/:id
// @access   Private/only admin
exports.deleteImage = handleAsync(async (req, res, next) => {
  const image = await Gallery.findByIdAndDelete(req.params.id);

  if(!image) {
    return next(new AppError('Image not found!'));
  }

  if(image.image) {
    await unlinkAsync(`${__dirname}/../uploads/${image.image}`);
  }

  res.status(200).json({
    success: true,
    message: `Image "${image.image}" successfully deleted!`,
    data: image
  });
});