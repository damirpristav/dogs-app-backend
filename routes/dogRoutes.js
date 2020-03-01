const express = require('express');
const router = express.Router();

const dogController = require('../controllers/dogController');
const auth = require('../middlewares/auth');
const upload = require('../middlewares/upload');

router
  .route('/')
  .get(dogController.getAllDogs)
  .post(auth.protect, auth.restrictTo('admin'), upload.uploadDogPhoto, dogController.addDog);

router
  .route('/:slug')
  .get(dogController.getDog);

router
  .route('/:dogId')
  .patch(auth.protect, auth.restrictTo('admin'), upload.uploadDogPhoto, dogController.updateDog)
  .delete(auth.protect, auth.restrictTo('admin'), dogController.deleteDog);

module.exports = router;