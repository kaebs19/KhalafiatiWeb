const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password, fullName } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({
          success: false,
          message: 'Email already registered'
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Create new user
    const user = await User.create({
      username,
      email,
      password,
      fullName: fullName || username // Use username as fullName if not provided
    });

    // Generate token
    const token = generateToken(user._id);

    // Get user data without password
    const userData = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Register Error:', error);

    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user with password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login without triggering pre-save hooks
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Generate token
    const token = generateToken(user._id);

    // Get user data without password
    const userData = user.getPublicProfile();

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    console.error('Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
      stack: error.stack
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Get Me Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile',
      error: error.message
    });
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
exports.updateMe = async (req, res) => {
  try {
    const { fullName, bio, avatar } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    if (fullName !== undefined) user.fullName = fullName;
    if (bio !== undefined) user.bio = bio;
    if (avatar !== undefined) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message
    });
  }
};

// @desc    Verify token
// @route   GET /api/auth/verify
// @access  Private
exports.verifyToken = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: {
        user: req.user.getPublicProfile()
      }
    });
  } catch (error) {
    console.error('Verify Token Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error verifying token',
      error: error.message
    });
  }
};

// @desc    Quick login (DEV ONLY - bypasses password check)
// @route   POST /api/auth/quick-login
// @access  Public
exports.quickLogin = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been banned'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Update last login without triggering hooks
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // Get user data
    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Quick login successful (DEV MODE)',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Quick Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in quick login',
      error: error.message
    });
  }
};

// @desc    Update profile (comprehensive)
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, fullName, bio, socialMedia } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if username is being changed and if it's available
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

    // Check if email is being changed and if it's available
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
    if (bio !== undefined) user.bio = bio;
    if (socialMedia !== undefined) {
      user.socialMedia = {
        facebook: socialMedia.facebook || '',
        twitter: socialMedia.twitter || '',
        instagram: socialMedia.instagram || '',
        linkedin: socialMedia.linkedin || '',
        website: socialMedia.website || ''
      };
    }

    // Handle file uploads (avatar and cover)
    if (req.files) {
      const fs = require('fs').promises;
      const path = require('path');

      // Handle avatar upload
      if (req.files.avatar && req.files.avatar[0]) {
        // Delete old avatar if exists
        if (user.avatar) {
          const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
          try {
            await fs.unlink(oldAvatarPath);
          } catch (error) {
            console.error('Error deleting old avatar:', error);
          }
        }
        // Delete old thumbnail if exists
        if (user.avatarThumbnail) {
          const oldThumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', user.avatarThumbnail);
          try {
            await fs.unlink(oldThumbnailPath);
          } catch (error) {
            console.error('Error deleting old thumbnail:', error);
          }
        }
        user.avatar = req.files.avatar[0].filename;
        if (req.avatarThumbnail) {
          user.avatarThumbnail = req.avatarThumbnail;
        }
      }

      // Handle cover upload
      if (req.files.cover && req.files.cover[0]) {
        // Delete old cover if exists
        if (user.coverImage) {
          const oldCoverPath = path.join(__dirname, '..', 'uploads', 'covers', user.coverImage);
          try {
            await fs.unlink(oldCoverPath);
          } catch (error) {
            console.error('Error deleting old cover:', error);
          }
        }
        user.coverImage = req.files.cover[0].filename;
        user.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;
      }
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Update Profile Error:', error);

    // Delete uploaded files if update failed
    if (req.files) {
      const fs = require('fs').promises;
      if (req.files.avatar && req.files.avatar[0]) {
        try {
          await fs.unlink(req.files.avatar[0].path);
        } catch (unlinkError) {
          console.error('Error deleting avatar file:', unlinkError);
        }
      }
      if (req.files.cover && req.files.cover[0]) {
        try {
          await fs.unlink(req.files.cover[0].path);
        } catch (unlinkError) {
          console.error('Error deleting cover file:', unlinkError);
        }
      }
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
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Upload avatar
// @route   POST /api/auth/avatar
// @access  Private
exports.uploadAvatar = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old avatar if exists
    if (user.avatar) {
      const fs = require('fs').promises;
      const path = require('path');
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error('Error deleting old avatar:', error);
      }
    }

    // Update user with new avatar and thumbnail
    user.avatar = req.file.filename;
    if (req.thumbnailFilename) {
      user.avatarThumbnail = req.thumbnailFilename;
    }
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Upload Avatar Error:', error);

    // Delete uploaded file if update failed
    if (req.file) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading avatar',
      error: error.message
    });
  }
};

// @desc    Upload cover image
// @route   POST /api/auth/cover
// @access  Private
exports.uploadCoverImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old cover image if exists
    if (user.coverImage) {
      const fs = require('fs').promises;
      const path = require('path');
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'covers', user.coverImage);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error('Error deleting old cover image:', error);
      }
    }

    // Update user with new cover image
    user.coverImage = req.file.filename;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Cover image uploaded successfully',
      data: {
        user: user.getPublicProfile()
      }
    });

  } catch (error) {
    console.error('Upload Cover Image Error:', error);

    // Delete uploaded file if update failed
    if (req.file) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading cover image',
      error: error.message
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    // Find user with password field
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email'
      });
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // In production, you would send an email with the reset token
    // For now, we'll return it in the response (DEV ONLY)
    res.status(200).json({
      success: true,
      message: 'Password reset token generated',
      data: {
        resetToken, // DEV ONLY - remove in production
        message: 'In production, check your email for reset instructions'
      }
    });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing password reset request',
      error: error.message
    });
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password is required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash token to compare with database
    const crypto = require('crypto');
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password and clear reset token
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset Password Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/auth/users/:userId/stats
// @access  Private
exports.getUserStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const Image = require('../models/Image');

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get total images count
    const totalImages = await Image.countDocuments({ uploadedBy: userId });

    // Get stats aggregation
    const imageStats = await Image.aggregate([
      { $match: { uploadedBy: user._id } },
      {
        $group: {
          _id: null,
          totalLikes: { $sum: '$likes' },
          totalViews: { $sum: '$views' },
          totalDownloads: { $sum: '$downloads' }
        }
      }
    ]);

    const stats = imageStats[0] || {
      totalLikes: 0,
      totalViews: 0,
      totalDownloads: 0
    };

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalImages,
          totalLikes: stats.totalLikes,
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads
        }
      }
    });

  } catch (error) {
    console.error('Get User Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};

// @desc    Delete user account
// @route   DELETE /api/auth/account
// @access  Private
exports.deleteAccount = async (req, res) => {
  try {
    const { password, confirmation } = req.body;

    // Validation
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required to delete account'
      });
    }

    if (confirmation !== 'DELETE') {
      return res.status(400).json({
        success: false,
        message: 'Please type DELETE to confirm account deletion'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const fs = require('fs').promises;
    const path = require('path');

    // Delete user's avatar
    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
      try {
        await fs.unlink(avatarPath);
      } catch (error) {
        console.error('Error deleting avatar:', error);
      }
    }

    // Delete user's avatar thumbnail
    if (user.avatarThumbnail) {
      const thumbnailPath = path.join(__dirname, '..', 'uploads', 'thumbnails', user.avatarThumbnail);
      try {
        await fs.unlink(thumbnailPath);
      } catch (error) {
        console.error('Error deleting thumbnail:', error);
      }
    }

    // Delete user's cover image
    if (user.coverImage) {
      const coverPath = path.join(__dirname, '..', 'uploads', 'covers', user.coverImage);
      try {
        await fs.unlink(coverPath);
      } catch (error) {
        console.error('Error deleting cover:', error);
      }
    }

    // Delete user's uploaded images
    const Image = require('../models/Image');
    const userImages = await Image.find({ uploadedBy: user._id });

    for (const image of userImages) {
      // Delete image file
      if (image.filename) {
        const imagePath = path.join(__dirname, '..', 'uploads', 'images', image.filename);
        try {
          await fs.unlink(imagePath);
        } catch (error) {
          console.error('Error deleting image:', error);
        }
      }

      // Delete thumbnail
      if (image.thumbnail) {
        const thumbPath = path.join(__dirname, '..', 'uploads', 'thumbnails', image.thumbnail);
        try {
          await fs.unlink(thumbPath);
        } catch (error) {
          console.error('Error deleting image thumbnail:', error);
        }
      }
    }

    // Delete all user's images from database
    await Image.deleteMany({ uploadedBy: user._id });

    // Delete user from database
    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully. We\'re sorry to see you go.'
    });

  } catch (error) {
    console.error('Delete Account Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting account',
      error: error.message
    });
  }
};
