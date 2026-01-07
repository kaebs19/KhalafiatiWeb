const User = require('../models/User');
const Category = require('../models/Category');
const Image = require('../models/Image');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total counts
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalImages = await Image.countDocuments();
    const activeImages = await Image.countDocuments({ isActive: true });
    const featuredImages = await Image.countDocuments({ isFeatured: true });

    // Get user statistics
    const activeUsers = await User.countDocuments({ status: 'active' });
    const bannedUsers = await User.countDocuments({ status: 'banned' });
    const adminUsers = await User.countDocuments({ role: 'admin' });

    // Get image statistics
    const imageStats = await Image.aggregate([
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalSize: { $sum: '$size' },
          avgViews: { $avg: '$views' },
          avgDownloads: { $avg: '$downloads' }
        }
      }
    ]);

    const stats = imageStats[0] || {
      totalViews: 0,
      totalDownloads: 0,
      totalSize: 0,
      avgViews: 0,
      avgDownloads: 0
    };

    // Get recent activity counts (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    const recentImages = await Image.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Get storage information
    const storageMB = (stats.totalSize / (1024 * 1024)).toFixed(2);
    const storageGB = (stats.totalSize / (1024 * 1024 * 1024)).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalUsers,
          totalCategories,
          totalImages,
          activeImages,
          featuredImages
        },
        users: {
          total: totalUsers,
          active: activeUsers,
          banned: bannedUsers,
          admins: adminUsers,
          recentSignups: recentUsers
        },
        images: {
          total: totalImages,
          active: activeImages,
          featured: featuredImages,
          inactive: totalImages - activeImages,
          recentUploads: recentImages
        },
        engagement: {
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads,
          averageViews: Math.round(stats.avgViews),
          averageDownloads: Math.round(stats.avgDownloads)
        },
        storage: {
          totalBytes: stats.totalSize,
          totalMB: storageMB,
          totalGB: storageGB
        }
      }
    });

  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// @desc    Get user growth over time
// @route   GET /api/dashboard/user-growth
// @access  Private/Admin
exports.getUserGrowth = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get cumulative total
    let cumulative = await User.countDocuments({
      createdAt: { $lt: startDate }
    });

    const growthData = userGrowth.map(item => {
      cumulative += item.count;
      return {
        date: item._id,
        newUsers: item.count,
        totalUsers: cumulative
      };
    });

    res.status(200).json({
      success: true,
      data: {
        period: `${daysNum} days`,
        growthData
      }
    });

  } catch (error) {
    console.error('Get User Growth Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user growth data',
      error: error.message
    });
  }
};

// @desc    Get image upload trends
// @route   GET /api/dashboard/upload-trends
// @access  Private/Admin
exports.getUploadTrends = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const daysNum = parseInt(days);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysNum);

    const uploadTrends = await Image.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          uploads: { $sum: 1 },
          totalSize: { $sum: '$size' }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const trendsData = uploadTrends.map(item => ({
      date: item._id,
      uploads: item.uploads,
      sizeMB: (item.totalSize / (1024 * 1024)).toFixed(2)
    }));

    res.status(200).json({
      success: true,
      data: {
        period: `${daysNum} days`,
        trendsData
      }
    });

  } catch (error) {
    console.error('Get Upload Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upload trends',
      error: error.message
    });
  }
};

// @desc    Get category distribution
// @route   GET /api/dashboard/category-distribution
// @access  Private/Admin
exports.getCategoryDistribution = async (req, res) => {
  try {
    const distribution = await Image.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          totalSize: { $sum: '$size' }
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
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          imageCount: '$count',
          totalViews: 1,
          totalDownloads: 1,
          sizeMB: {
            $round: [{ $divide: ['$totalSize', 1024 * 1024] }, 2]
          }
        }
      },
      {
        $sort: { imageCount: -1 }
      }
    ]);

    // Get categories with no images
    const categoriesWithImages = distribution.map(cat => cat._id);
    const emptyCategories = await Category.find({
      _id: { $nin: categoriesWithImages }
    }).select('name slug');

    res.status(200).json({
      success: true,
      data: {
        distribution,
        emptyCategories
      }
    });

  } catch (error) {
    console.error('Get Category Distribution Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category distribution',
      error: error.message
    });
  }
};

// @desc    Get top contributors
// @route   GET /api/dashboard/top-contributors
// @access  Private/Admin
exports.getTopContributors = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const limitNum = parseInt(limit);

    const topContributors = await Image.aggregate([
      {
        $group: {
          _id: '$uploadedBy',
          uploadCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 1,
          username: '$userInfo.username',
          fullName: '$userInfo.fullName',
          avatar: '$userInfo.avatar',
          uploadCount: 1,
          totalViews: 1,
          totalDownloads: 1
        }
      },
      {
        $sort: { uploadCount: -1 }
      },
      {
        $limit: limitNum
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        topContributors
      }
    });

  } catch (error) {
    console.error('Get Top Contributors Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top contributors',
      error: error.message
    });
  }
};

// @desc    Get recent activities
// @route   GET /api/dashboard/recent-activities
// @access  Private/Admin
exports.getRecentActivities = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit);

    // Get recent users
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('username fullName createdAt');

    // Get recent images
    const recentImages = await Image.find()
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    // Get recently updated categories
    const recentCategories = await Category.find()
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('name slug updatedAt');

    // Combine and format activities
    const activities = [];

    recentUsers.forEach(user => {
      activities.push({
        type: 'user_signup',
        description: `New user registered: ${user.username}`,
        timestamp: user.createdAt,
        user: {
          username: user.username,
          fullName: user.fullName
        }
      });
    });

    recentImages.forEach(image => {
      activities.push({
        type: 'image_upload',
        description: `New image uploaded: ${image.title}`,
        timestamp: image.createdAt,
        image: {
          id: image._id,
          title: image.title,
          category: image.category.name
        },
        user: {
          username: image.uploadedBy.username,
          fullName: image.uploadedBy.fullName
        }
      });
    });

    // Sort all activities by timestamp
    activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.status(200).json({
      success: true,
      data: {
        activities: activities.slice(0, limitNum),
        recentUsers,
        recentImages: recentImages.slice(0, 10),
        recentCategories
      }
    });

  } catch (error) {
    console.error('Get Recent Activities Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent activities',
      error: error.message
    });
  }
};

// @desc    Get popular content
// @route   GET /api/dashboard/popular-content
// @access  Private/Admin
exports.getPopularContent = async (req, res) => {
  try {
    // Most viewed images
    const mostViewedImages = await Image.find()
      .sort({ views: -1 })
      .limit(10)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName');

    // Most downloaded images
    const mostDownloadedImages = await Image.find()
      .sort({ downloads: -1 })
      .limit(10)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName');

    // Get popular categories by views
    const popularCategories = await Image.aggregate([
      {
        $group: {
          _id: '$category',
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' },
          imageCount: { $sum: 1 }
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
          name: '$categoryInfo.name',
          slug: '$categoryInfo.slug',
          totalViews: 1,
          totalDownloads: 1,
          imageCount: 1
        }
      },
      {
        $sort: { totalViews: -1 }
      },
      {
        $limit: 5
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        mostViewedImages,
        mostDownloadedImages,
        popularCategories
      }
    });

  } catch (error) {
    console.error('Get Popular Content Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular content',
      error: error.message
    });
  }
};

// @desc    Get system health
// @route   GET /api/dashboard/system-health
// @access  Private/Admin
exports.getSystemHealth = async (req, res) => {
  try {
    // Check for inactive images
    const inactiveImages = await Image.countDocuments({ isActive: false });

    // Check for empty categories
    const emptyCategories = await Category.countDocuments({ imageCount: 0 });

    // Check for banned users
    const bannedUsers = await User.countDocuments({ status: 'banned' });

    // Get images without categories (orphaned)
    const orphanedImages = await Image.countDocuments({
      category: { $exists: false }
    });

    // Get large files (> 10MB)
    const largeFiles = await Image.countDocuments({
      size: { $gt: 10 * 1024 * 1024 }
    });

    // Recent errors or issues
    const recentInactiveImages = await Image.find({ isActive: false })
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('uploadedBy', 'username');

    const health = {
      status: 'healthy',
      issues: []
    };

    if (inactiveImages > 10) {
      health.issues.push(`${inactiveImages} inactive images`);
      health.status = 'warning';
    }

    if (emptyCategories > 5) {
      health.issues.push(`${emptyCategories} empty categories`);
      health.status = 'warning';
    }

    if (orphanedImages > 0) {
      health.issues.push(`${orphanedImages} orphaned images`);
      health.status = 'critical';
    }

    res.status(200).json({
      success: true,
      data: {
        health,
        metrics: {
          inactiveImages,
          emptyCategories,
          bannedUsers,
          orphanedImages,
          largeFiles
        },
        recentInactiveImages
      }
    });

  } catch (error) {
    console.error('Get System Health Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching system health',
      error: error.message
    });
  }
};
