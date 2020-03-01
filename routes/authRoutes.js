const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const auth = require('../middlewares/auth');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', auth.protect, authController.logout);
router.get('/activateAccount/:token', authController.activateAccount);
router.get('/me', auth.protect, authController.me);
router.post('/forgotPassword', authController.forgotPassword);
router.put('/resetPassword/:token', authController.resetPassword);
router.post('/resendActivationToken', auth.protect, auth.restrictTo('admin'), authController.resendActivationToken);
router.delete('/deleteMe', auth.protect, authController.deleteMe);
router.get('/checkToken', auth.protect, authController.checkToken);

module.exports = router;