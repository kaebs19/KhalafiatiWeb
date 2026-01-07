const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getUserGrowth,
  getUploadTrends,
  getCategoryDistribution,
  getTopContributors,
  getRecentActivities,
  getPopularContent,
  getSystemHealth
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

// All dashboard routes require admin authentication
router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getDashboardStats);
router.get('/user-growth', getUserGrowth);
router.get('/upload-trends', getUploadTrends);
router.get('/category-distribution', getCategoryDistribution);
router.get('/top-contributors', getTopContributors);
router.get('/recent-activities', getRecentActivities);
router.get('/popular-content', getPopularContent);
router.get('/system-health', getSystemHealth);

module.exports = router;