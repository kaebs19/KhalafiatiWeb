const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  image: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image',
    required: true
  }
}, {
  timestamps: true
});

// Compound index to ensure a user can only like an image once
likeSchema.index({ user: 1, image: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
