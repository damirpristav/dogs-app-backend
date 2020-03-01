const express = require('express');
const router = express.Router();

const breedController = require('../controllers/breedController');
const auth = require('../middlewares/auth');

router
  .route('/')
  .get(breedController.getAllBreeds)
  .post(auth.protect, auth.restrictTo('admin'), breedController.createBreed);

router
  .route('/:breedId')
  .get(breedController.getBreed)
  .patch(auth.protect, auth.restrictTo('admin'), breedController.updateBreed)
  .delete(auth.protect, auth.restrictTo('admin'), breedController.deleteBreed);

module.exports = router;