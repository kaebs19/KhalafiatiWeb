const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['user', 'image'],
    required: [true, 'Report type is required']
  },
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() {
      return this.reportType === 'user';
    }
  },
  reportedImage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: function() {
      return this.reportType === 'image';
    }
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Reporter is required']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    enum: [
      'spam',
      'inappropriate',
      'harassment',
      'copyright',
      'fake',
      'violence',
      'other'
    ]
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'rejected'],
    default: 'pending'
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  reviewedAt: {
    type: Date,
    default: null
  },
  adminNotes: {
    type: String,
    maxlength: [500, 'Admin notes cannot exceed 500 characters'],
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for better query performance
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ reportedBy: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ reportedImage: 1 });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
