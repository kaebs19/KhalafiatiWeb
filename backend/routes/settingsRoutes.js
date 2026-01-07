const express = require('express');
const router = express.Router();
const {
  getAllSettings,
  getSettingByKey,
  updateSetting,
  deleteSetting,
  initializeSettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middleware/auth');

// Public routes
router.get('/', getAllSettings);
router.get('/:key', getSettingByKey);

// Admin routes
router.post('/init', protect, admin, initializeSettings);
router.put('/:key', protect, admin, updateSetting);
router.delete('/:key', protect, admin, deleteSetting);

module.exports = router;
