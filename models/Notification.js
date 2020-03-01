const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Subject is required.']
  },
  sendTo: {
    type: [mongoose.Schema.ObjectId],
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Message is required.']
  },
  createdAt: {
    type: Date,
    default: Date.now()
  },
  seen: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Notification', notificationSchema);