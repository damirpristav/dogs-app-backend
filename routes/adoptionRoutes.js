const express = require('express');
const router = express.Router();

const adoptionController = require('../controllers/adoptionController');
const auth = require('../middlewares/auth');
const adoption = require('../middlewares/adoption');
const admin = require('../middlewares/admin');

router
  .route('/')
  .get(auth.protect, adoptionController.getAdoptions);

router.post(
  '/dog/:dogId',
  auth.protect, 
  auth.restrictTo('user'), 
  adoption.isAvailable, 
  admin.getAdminsEmails, 
  adoptionController.adopt
);

router
  .route('/:adoptionId')
  .get(auth.protect, auth.restrictTo('admin'), adoptionController.getAdoption)
  .patch(auth.protect, auth.restrictTo('admin'), adoptionController.updateAdoption);

module.exports = router;