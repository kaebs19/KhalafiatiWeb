const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearReadNotifications,
  createNotification,
  saveDeviceToken,
  removeDeviceToken
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/auth');

// User routes (all require authentication)
router.get('/', protect, getNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/:id/read', protect, markAsRead);
router.patch('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/clear-read', protect, clearReadNotifications);

// Device token routes (for push notifications)
router.post('/device-token', protect, saveDeviceToken);
router.delete('/device-token', protect, removeDeviceToken);

// Admin route for creating notifications
router.post('/', protect, authorize('admin'), createNotification);

module.exports = router;
