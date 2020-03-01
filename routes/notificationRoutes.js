const express = require('express');
const router = express.Router();

const notificationController = require('../controllers/notificationController');
const auth = require('../middlewares/auth');

router
  .route('/')
  .get(auth.protect, notificationController.getAllNotifications)
  .delete(auth.protect, notificationController.deleteAllNotifications);

router
  .route('/:notificationId')
  .get(auth.protect, notificationController.getNotification)
  .delete(auth.protect, notificationController.deleteNotification);

router.patch('/seen/:notificationId', auth.protect, notificationController.seen);

module.exports = router;