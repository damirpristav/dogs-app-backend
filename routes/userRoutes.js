const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const auth = require('../middlewares/auth');

router
  .route('/')
  .get(auth.protect, auth.restrictTo('admin'), userController.getAllUsers);

router
  .route('/:userId')
  .get(auth.protect, auth.restrictTo('admin'), userController.getUser)
  .delete(auth.protect, auth.restrictTo('admin'), userController.deleteUser);

module.exports = router;