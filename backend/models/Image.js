const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: false,  // Made optional
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: ''
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: ''
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  views: {
    type: Number,
    default: 0
  },
  downloads: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
imageSchema.index({ category: 1, createdAt: -1 });
imageSchema.index({ uploadedBy: 1, createdAt: -1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ isActive: 1, isFeatured: 1 });

// Virtual for full image URL
imageSchema.virtual('imageUrl').get(function() {
  return `/uploads/images/${this.filename}`;
});

// Virtual for thumbnail URL (you can implement thumbnail generation later)
imageSchema.virtual('thumbnailUrl').get(function() {
  return `/uploads/thumbnails/${this.filename}`;
});

// Ensure virtuals are included in JSON
imageSchema.set('toJSON', { virtuals: true });
imageSchema.set('toObject', { virtuals: true });

const Image = mongoose.model('Image', imageSchema);

module.exports = Image;
