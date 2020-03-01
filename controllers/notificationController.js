const handleAsync = require('../utils/handleAsync');
const AppError = require('../utils/AppError');
const Notification = require('../models/Notification');

// @desc     Get all notifications
// @route    GET /api/v1/notifications
// @access   Private/only show logged in user notifications
exports.getAllNotifications = handleAsync(async (req, res, next) => {
  const notifications = await Notification.find({ sendTo: { $in: req.user._id } }).select('-sendTo');

  res.status(200).json({
    success: true,
    results: notifications.length,
    data: notifications
  });
});

// @desc     Get single notification
// @route    GET /api/v1/notifications/:notificationId
// @access   Private/only show logged in user notification
exports.getNotification = handleAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.notificationId);

  if(!notification) {
    return next(new AppError('Notification with this id does not exists!', 404));
  }

  if(!notification.sendTo.includes(req.user._id)) {
    return next(new AppError('You are not allowed to see this notification!', 403));
  }

  res.status(200).json({
    success: true,
    data: notification
  });
});

// @desc     Delete notification
// @route    DELETE /api/v1/notifications/:notificationId
// @access   Private/only delete logged in user notifications
exports.deleteNotification = handleAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.notificationId);

  if(!notification) {
    return next(new AppError('Notification with this id does not exists!', 404));
  }

  if(!notification.sendTo.includes(req.user._id)) {
    return next(new AppError('You are not allowed to delete this notification!', 403));
  }

  await notification.remove();

  res.status(200).json({
    success: true,
    message: 'Notification deleted!',
    data: notification
  });
});

// @desc     Delete All User notifications
// @route    DELETE /api/v1/notifications
// @access   Private/only delete all logged in user notifications
exports.deleteAllNotifications = handleAsync(async (req, res, next) => {
  const notifications = await Notification.find({ sendTo: { $in: req.user._id } });

  const ids = notifications.map(n => n._id);

  if( ids.length > 0 ){
    await Notification.deleteMany({ _id: { $in: ids } });
  
    return res.status(200).json({
      success: true,
      message: 'All notifications deleted!',
      data: null
    });
  }

  return res.status(200).json({
    success: true,
    message: 'No notifications to delete!',
    data: null
  });
});

// @desc     Mark as seen when user request for single notification
// @route    PATCH /api/v1/notifications/seen/:notificationId
// @access   Private/only logged in user
exports.seen = handleAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const notification = await Notification.findById(notificationId);

  if(!notification) {
    return next(new AppError('Notification not found!', 404));
  }

  if(!notification.sendTo.includes(req.user._id)) {
    return next(new AppError('You are not allowed to edit this notification!', 403));
  }

  notification.seen = true;
  await notification.save();

  res.status(200).json({
    success: true,
    message: 'Notification marked as seen!',
    data: notification
  });
});