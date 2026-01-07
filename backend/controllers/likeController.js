const Like = require('../models/Like');
const Image = require('../models/Image');
const Notification = require('../models/Notification');

// @desc    Toggle like on image
// @route   POST /api/images/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
  try {
    const { id: imageId } = req.params;
    const userId = req.user._id;

    // Check if image exists
    const image = await Image.findById(imageId);
    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if user already liked the image
    const existingLike = await Like.findOne({ user: userId, image: imageId });

    if (existingLike) {
      // Unlike - remove the like
      await Like.deleteOne({ _id: existingLike._id });

      // Decrement likes count
      image.likesCount = Math.max(0, image.likesCount - 1);
      await image.save();

      return res.status(200).json({
        success: true,
        message: 'Image unliked successfully',
        data: {
          liked: false,
          likesCount: image.likesCount
        }
      });
    } else {
      // Like - create new like
      await Like.create({ user: userId, image: imageId });

      // Increment likes count
      image.likesCount += 1;
      await image.save();

      // Create notification for image owner (if not liking own image)
      if (image.uploadedBy.toString() !== userId.toString()) {
        await Notification.createNotification({
          recipient: image.uploadedBy,
          sender: userId,
          type: 'like',
          title: 'New Like',
          message: `${req.user.username} liked your image "${image.title}"`,
          relatedImage: imageId,
          actionUrl: `/images/${imageId}`
        }).catch(err => console.error('Notification creation error:', err));
      }

      return res.status(201).json({
        success: true,
        message: 'Image liked successfully',
        data: {
          liked: true,
          likesCount: image.likesCount
        }
      });
    }

  } catch (error) {
    console.error('Toggle Like Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error toggling like',
      error: error.message
    });
  }
};

// @desc    Get liked images by user
// @route   GET /api/likes/my-likes
// @access  Private
exports.getMyLikes = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get user's likes with populated image data
    const likes = await Like.find({ user: req.user._id })
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate({
        path: 'image',
        populate: [
          { path: 'category', select: 'name slug' },
          { path: 'uploadedBy', select: 'username fullName avatar' }
        ]
      });

    // Filter out likes where image was deleted
    const validLikes = likes.filter(like => like.image !== null);

    // Get total count
    const total = await Like.countDocuments({ user: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        likes: validLikes,
        images: validLikes.map(like => like.image),
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get My Likes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching liked images',
      error: error.message
    });
  }
};

// @desc    Check if user liked an image
// @route   GET /api/images/:id/like/status
// @access  Private
exports.checkLikeStatus = async (req, res) => {
  try {
    const { id: imageId } = req.params;
    const userId = req.user._id;

    const like = await Like.findOne({ user: userId, image: imageId });

    res.status(200).json({
      success: true,
      data: {
        liked: !!like
      }
    });

  } catch (error) {
    console.error('Check Like Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking like status',
      error: error.message
    });
  }
};

// @desc    Get users who liked an image
// @route   GET /api/images/:id/likes
// @access  Public
exports.getImageLikes = async (req, res) => {
  try {
    const { id: imageId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get likes with user data
    const likes = await Like.find({ image: imageId })
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate('user', 'username fullName avatar');

    const total = await Like.countDocuments({ image: imageId });

    res.status(200).json({
      success: true,
      data: {
        likes,
        users: likes.map(like => like.user),
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get Image Likes Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching image likes',
      error: error.message
    });
  }
};
