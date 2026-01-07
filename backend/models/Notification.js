const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  type: {
    type: String,
    enum: ['like', 'comment', 'follow', 'report_update', 'image_featured', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    default: null
  },
  relatedReport: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Report',
    default: null
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  actionUrl: {
    type: String,
    default: null
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  }
}, {
  timestamps: true
});

// Indexes for performance
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Method to mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save();
  }
};

// Static method to create notification
notificationSchema.statics.createNotification = async function({
  recipient,
  sender,
  type,
  title,
  message,
  relatedImage,
  relatedReport,
  actionUrl,
  metadata
}) {
  try {
    const notification = await this.create({
      recipient,
      sender,
      type,
      title,
      message,
      relatedImage,
      relatedReport,
      actionUrl,
      metadata
    });

    return notification;
  } catch (error) {
    console.error('Create Notification Error:', error);
    throw error;
  }
};

// Static method to get unread count
notificationSchema.statics.getUnreadCount = async function(userId) {
  return await this.countDocuments({
    recipient: userId,
    isRead: false
  });
};

// Virtual for formatted time
notificationSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  if (hours > 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  if (minutes > 0) return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  return 'Just now';
});

// Ensure virtuals are included in JSON
notificationSchema.set('toJSON', { virtuals: true });
notificationSchema.set('toObject', { virtuals: true });

// Auto-delete old read notifications (older than 30 days)
notificationSchema.pre('save', function(next) {
  if (this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
