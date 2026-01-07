const express = require('express');
const router = express.Router();
const {
  toggleLike,
  getMyLikes,
  checkLikeStatus,
  getImageLikes
} = require('../controllers/likeController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// User routes
router.get('/my-likes', getMyLikes);
router.post('/images/:id/like', toggleLike);
router.get('/images/:id/like/status', checkLikeStatus);
router.get('/images/:id/likes', getImageLikes);

module.exports = router;
