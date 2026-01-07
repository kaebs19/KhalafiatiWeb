const express = require('express');
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportById,
  updateReportStatus,
  deleteReport,
  getMyReports
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

// Public/User routes (require authentication only)
router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);

// Admin routes (require admin role)
router.get('/', protect, authorize('admin'), getAllReports);
router.get('/:id', protect, authorize('admin'), getReportById);
router.patch('/:id/status', protect, authorize('admin'), updateReportStatus);
router.delete('/:id', protect, authorize('admin'), deleteReport);

module.exports = router;
