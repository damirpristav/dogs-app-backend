const express = require('express');
const router = express.Router();

const galleryController = require('../controllers/galleryController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router
  .route('/')
  .get(auth.protect, auth.restrictTo('admin'), galleryController.getAllImages)
  .post(auth.protect, auth.restrictTo('admin'), upload.uploadDogPhoto, galleryController.addImage);

router 
  .route('/:id')
  .delete(auth.protect, auth.restrictTo('admin'), galleryController.deleteImage);

module.exports = router;