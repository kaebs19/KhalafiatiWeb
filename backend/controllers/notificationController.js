const Notification = require('../models/Notification');
const DeviceToken = require('../models/DeviceToken');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      isRead = '',
      type = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = { recipient: req.user._id };

    if (isRead !== '') {
      query.isRead = isRead === 'true';
    }

    if (type) {
      query.type = type;
    }

    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .populate('sender', 'username fullName avatar')
      .populate('relatedImage', 'title filename')
      .populate('relatedReport', 'reason status');

    // Get total count
    const total = await Notification.countDocuments(query);

    // Get unread count
    const unreadCount = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        notifications,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        },
        unreadCount
      }
    });

  } catch (error) {
    console.error('Get Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message
    });
  }
};

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.getUnreadCount(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        unreadCount: count  // iOS expects 'unreadCount' not 'count'
      }
    });

  } catch (error) {
    console.error('Get Unread Count Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.markAsRead();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        notification
      }
    });

  } catch (error) {
    console.error('Mark As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false
      },
      {
        isRead: true,
        readAt: new Date()
      }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: {
        modifiedCount: result.modifiedCount
      }
    });

  } catch (error) {
    console.error('Mark All As Read Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });

  } catch (error) {
    console.error('Delete Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message
    });
  }
};

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/clear-read
// @access  Private
exports.clearReadNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user._id,
      isRead: true
    });

    res.status(200).json({
      success: true,
      message: 'Read notifications cleared successfully',
      data: {
        deletedCount: result.deletedCount
      }
    });

  } catch (error) {
    console.error('Clear Read Notifications Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing read notifications',
      error: error.message
    });
  }
};

// @desc    Create notification (for testing or admin use)
// @route   POST /api/notifications
// @access  Private (Admin)
exports.createNotification = async (req, res) => {
  try {
    const {
      recipient,
      type,
      title,
      message,
      relatedImage,
      relatedReport,
      actionUrl,
      metadata
    } = req.body;

    const notification = await Notification.createNotification({
      recipient: recipient || req.user._id,
      sender: req.user._id,
      type,
      title,
      message,
      relatedImage,
      relatedReport,
      actionUrl,
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      data: {
        notification
      }
    });

  } catch (error) {
    console.error('Create Notification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating notification',
      error: error.message
    });
  }
};

// @desc    Save/Update device token for push notifications
// @route   POST /api/notifications/device-token
// @access  Private
exports.saveDeviceToken = async (req, res) => {
  try {
    const { token, platform = 'ios' } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Device token is required'
      });
    }

    // Check if token already exists for another user and deactivate it
    await DeviceToken.updateMany(
      { token, userId: { $ne: req.user._id } },
      { isActive: false }
    );

    // Create or update device token for this user
    const deviceToken = await DeviceToken.findOneAndUpdate(
      { userId: req.user._id, platform },
      {
        token,
        platform,
        isActive: true,
        lastUsed: Date.now()
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Device token saved successfully',
      data: {
        deviceToken
      }
    });

  } catch (error) {
    console.error('Save Device Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving device token',
      error: error.message
    });
  }
};

// @desc    Remove device token (on logout)
// @route   DELETE /api/notifications/device-token
// @access  Private
exports.removeDeviceToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      await DeviceToken.findOneAndUpdate(
        { token, userId: req.user._id },
        { isActive: false }
      );
    } else {
      // Deactivate all tokens for this user
      await DeviceToken.updateMany(
        { userId: req.user._id },
        { isActive: false }
      );
    }

    res.status(200).json({
      success: true,
      message: 'Device token removed successfully'
    });

  } catch (error) {
    console.error('Remove Device Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing device token',
      error: error.message
    });
  }
};
