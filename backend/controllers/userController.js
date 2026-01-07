const User = require('../models/User');
const Image = require('../models/Image');

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      role = '',
      status = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search by username, email, or fullName
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { fullName: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by role
    if (role) {
      query.role = role;
    }

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const users = await User.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .select('-password');

    // Get total count
    const total = await User.countDocuments(query);

    // Get stats for each user (images count, total likes, total views)
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Get images count
        const imagesCount = await Image.countDocuments({ uploadedBy: user._id });

        // Get total likes and views
        const imageStats = await Image.aggregate([
          { $match: { uploadedBy: user._id } },
          {
            $group: {
              _id: null,
              totalLikes: { $sum: '$likes' },
              totalViews: { $sum: '$views' }
            }
          }
        ]);

        const stats = imageStats[0] || { totalLikes: 0, totalViews: 0 };

        return {
          ...user.toObject(),
          stats: {
            imagesCount,
            totalLikes: stats.totalLikes,
            totalViews: stats.totalViews
          }
        };
      })
    );

    res.status(200).json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get All Users Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
};

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Public (but excludes sensitive data)
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -email');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's images count
    const imageCount = await Image.countDocuments({ uploadedBy: id });

    // Get user's recent images
    const recentImages = await Image.find({ uploadedBy: id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          bio: user.bio,
          avatar: user.avatar,
          avatarUrl: user.avatarUrl,
          coverImage: user.coverImage,
          coverImageUrl: user.coverImageUrl,
          socialMedia: user.socialMedia,
          createdAt: user.createdAt,
          imageCount
        },
        recentImages
      }
    });

  } catch (error) {
    console.error('Get User By ID Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
};

// @desc    Get user profile by username
// @route   GET /api/users/profile/:username
// @access  Public
exports.getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username }).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user's images count
    const imageCount = await Image.countDocuments({
      uploadedBy: user._id,
      isActive: true
    });

    // Get user's public images
    const images = await Image.find({
      uploadedBy: user._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(12)
      .populate('category', 'name slug');

    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          fullName: user.fullName,
          avatar: user.avatar,
          bio: user.bio,
          uploadCount: user.uploadCount,
          createdAt: user.createdAt
        },
        imageCount,
        images
      }
    });

  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, fullName, role, status, bio, avatar } = req.body;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if trying to update username/email to existing one
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
      user.username = username;
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      user.email = email;
    }

    // Update other fields
    if (fullName !== undefined) user.fullName = fullName;
    if (role !== undefined) user.role = role;
    if (status !== undefined) user.status = status;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update User Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
};

// @desc    Ban/Unban user
// @route   PATCH /api/users/:id/ban
// @access  Private/Admin
exports.toggleBanUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from banning themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot ban yourself'
      });
    }

    // Toggle ban status
    user.status = user.status === 'active' ? 'banned' : 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.status === 'banned' ? 'banned' : 'unbanned'} successfully`,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Toggle Ban User Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating user status',
      error: error.message
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete yourself'
      });
    }

    // Delete all user's images
    const deletedImages = await Image.deleteMany({ uploadedBy: id });

    // Delete user
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
      data: {
        deletedImages: deletedImages.deletedCount
      }
    });

  } catch (error) {
    console.error('Delete User Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
};

// @desc    Get user statistics
// @route   GET /api/users/:id/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get image statistics
    const totalImages = await Image.countDocuments({ uploadedBy: id });
    const activeImages = await Image.countDocuments({ uploadedBy: id, isActive: true });
    const featuredImages = await Image.countDocuments({ uploadedBy: id, isFeatured: true });

    // Get total views and downloads
    const imageStats = await Image.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalSize: { $sum: '$size' }
        }
      }
    ]);

    const stats = imageStats[0] || {
      totalViews: 0,
      totalDownloads: 0,
      totalSize: 0
    };

    // Get images by category
    const imagesByCategory = await Image.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'categoryInfo'
        }
      },
      {
        $unwind: '$categoryInfo'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug'
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile(),
        statistics: {
          totalImages,
          activeImages,
          featuredImages,
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads,
          totalSize: stats.totalSize,
          imagesByCategory
        }
      }
    });

  } catch (error) {
    console.error('Get User Stats Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
};
