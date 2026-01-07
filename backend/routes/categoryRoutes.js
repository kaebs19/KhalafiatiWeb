const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getActiveCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  getCategoryStats,
  updateCategoryImageCount,
  uploadCategoryThumbnail: uploadThumbnailController
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/auth');
const { uploadCategoryThumbnail, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', getAllCategories);
router.get('/active', getActiveCategories);
router.get('/slug/:slug', getCategoryBySlug);
router.get('/:id', getCategoryById);

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.post('/', createCategory);
router.put('/:id', updateCategory);
router.post('/:id/thumbnail', uploadCategoryThumbnail, handleUploadError, uploadThumbnailController);
router.delete('/:id', deleteCategory);
router.patch('/:id/toggle', toggleCategoryStatus);
router.get('/:id/stats', getCategoryStats);
router.patch('/:id/update-count', updateCategoryImageCount);

module.exports = router;