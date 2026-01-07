const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateUser,
  toggleBanUser,
  deleteUser,
  getUserStats
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/profile/:username', getUserProfile);
router.get('/:id', getUserById); // Public access to user info (without sensitive data)

// Protected routes (Admin only)
router.use(protect);
router.use(authorize('admin'));

router.get('/', getAllUsers);
router.get('/:id/stats', getUserStats);
router.put('/:id', updateUser);
router.patch('/:id/ban', toggleBanUser);
router.delete('/:id', deleteUser);

module.exports = router;