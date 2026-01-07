const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  verifyToken,
  quickLogin,
  updateProfile,
  uploadAvatar: uploadAvatarController,
  uploadCoverImage: uploadCoverController,
  forgotPassword,
  resetPassword,
  getUserStats,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { uploadAvatar, uploadCoverImage, uploadProfileImages, handleUploadError } = require('../middleware/upload');
const { processAvatar, processCover, processProfileImages } = require('../middleware/imageProcessor');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/quick-login', quickLogin); // DEV ONLY
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// Protected routes (require authentication)
router.get('/me', protect, getMe);
router.get('/profile', protect, getMe); // Alias for /me
router.put('/me', protect, updateMe);
router.put('/profile', protect, uploadProfileImages, handleUploadError, processProfileImages, updateProfile); // Comprehensive profile update
router.put('/profile/avatar', protect, uploadAvatar, handleUploadError, processAvatar, uploadAvatarController); // iOS upload
router.put('/change-password', protect, changePassword);
router.post('/avatar', protect, uploadAvatar, handleUploadError, processAvatar, uploadAvatarController);
router.post('/cover', protect, uploadCoverImage, handleUploadError, processCover, uploadCoverController);
router.post('/logout', protect, logout);
router.get('/verify', protect, verifyToken);
router.get('/users/:userId/stats', protect, getUserStats);
router.delete('/account', protect, deleteAccount);

module.exports = router;