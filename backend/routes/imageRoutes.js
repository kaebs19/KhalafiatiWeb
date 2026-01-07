const express = require('express');
const router = express.Router();
const {
  getAllImages,
  getImageById,
  uploadImage,
  updateImage,
  moveImage,
  deleteImage,
  toggleFeatured,
  downloadImage,
  getFeaturedImages,
  getPopularImages,
  searchByTags,
  getMostLikedImages,
  getLatestImages
} = require('../controllers/imageController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');
const { uploadImage: uploadMiddleware, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getAllImages);
router.get('/featured', getFeaturedImages);
router.get('/popular', getPopularImages);
router.get('/most-liked', getMostLikedImages);
router.get('/latest', getLatestImages);
router.get('/search/tags', searchByTags);
router.get('/:id', getImageById);
router.get('/:id/download', downloadImage);

// Protected routes (require authentication)
router.post('/', protect, uploadMiddleware, handleUploadError, uploadImage);
router.put('/:id', protect, updateImage);
router.delete('/:id', protect, deleteImage);

// Admin only routes
router.patch('/:id/move', protect, authorize('admin'), moveImage);
router.patch('/:id/feature', protect, authorize('admin'), toggleFeatured);

module.exports = router;