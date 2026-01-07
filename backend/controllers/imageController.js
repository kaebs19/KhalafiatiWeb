const Image = require('../models/Image');
const Category = require('../models/Category');
const User = require('../models/User');
const fs = require('fs').promises;
const path = require('path');

// @desc    Get all images
// @route   GET /api/images
// @access  Public
exports.getAllImages = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      category = '',
      uploadedBy = '',
      isActive = '',
      isFeatured = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags = ''
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search by title or description
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by uploader
    if (uploadedBy) {
      query.uploadedBy = uploadedBy;
    }

    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Filter by featured status
    if (isFeatured !== '') {
      query.isFeatured = isFeatured === 'true';
    }

    // Filter by tags
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Build sort object
    const sort = {};

    // Handle different sorting options
    switch (sortBy) {
      case 'newest':
        sort.createdAt = -1;
        break;
      case 'oldest':
        sort.createdAt = 1;
        break;
      case 'mostLiked':
        sort.likesCount = -1;
        break;
      case 'mostViewed':
        sort.views = -1;
        break;
      default:
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query
    const images = await Image.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    // Get total count
    const total = await Image.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        images,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get All Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching images',
      error: error.message
    });
  }
};

// @desc    Get image by ID
// @route   GET /api/images/:id
// @access  Public
exports.getImageById = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar bio');

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Increment view count
    image.views += 1;
    await image.save();

    // Get related images from same category
    const relatedImages = await Image.find({
      category: image.category._id,
      _id: { $ne: image._id },
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('uploadedBy', 'username fullName');

    res.status(200).json({
      success: true,
      data: {
        image,
        relatedImages
      }
    });

  } catch (error) {
    console.error('Get Image By ID Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching image',
      error: error.message
    });
  }
};

// @desc    Upload new image
// @route   POST /api/images
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    // Accept both 'category' and 'categoryId' from request
    const { title, description, category, categoryId, tags } = req.body;
    const selectedCategory = category || categoryId;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Image title is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Verify category exists if provided
    let categoryExists = null;
    if (selectedCategory) {
      categoryExists = await Category.findById(selectedCategory);
      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: 'Category not found'
        });
      }
    }

    // Parse tags if provided
    let tagArray = [];
    if (tags) {
      tagArray = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Create image record
    const image = await Image.create({
      title,
      description: description || '',
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: `/uploads/images/${req.file.filename}`, // Store relative URL path instead of full filesystem path
      size: req.file.size,
      mimetype: req.file.mimetype,
      category: selectedCategory || null,
      uploadedBy: req.user._id,
      tags: tagArray
    });

    // Update category image count if category was selected
    if (categoryExists) {
      categoryExists.imageCount += 1;
      await categoryExists.save();
    }

    // Update user upload count
    const user = await User.findById(req.user._id);
    user.uploadCount += 1;
    await user.save();

    // Populate image data
    const populatedImage = await Image.findById(image._id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: populatedImage
      }
    });

  } catch (error) {
    console.error('Upload Image Error:', error);

    // Delete uploaded file if image creation failed
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
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
      message: 'Error uploading image',
      error: error.message
    });
  }
};

// @desc    Update image
// @route   PUT /api/images/:id
// @access  Private
exports.updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags, isActive, isFeatured } = req.body;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if user is owner or admin
    if (image.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this image'
      });
    }

    // Update fields
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (tags !== undefined) {
      image.tags = typeof tags === 'string'
        ? tags.split(',').map(tag => tag.trim()).filter(tag => tag)
        : tags;
    }

    // Only admin can update these fields
    if (req.user.role === 'admin') {
      if (isActive !== undefined) image.isActive = isActive;
      if (isFeatured !== undefined) image.isFeatured = isFeatured;
    }

    await image.save();

    // Populate image data
    const populatedImage = await Image.findById(image._id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: {
        image: populatedImage
      }
    });

  } catch (error) {
    console.error('Update Image Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
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
      message: 'Error updating image',
      error: error.message
    });
  }
};

// @desc    Move image to different category
// @route   PATCH /api/images/:id/move
// @access  Private/Admin
exports.moveImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryId } = req.body;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Category ID is required'
      });
    }

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const newCategory = await Category.findById(categoryId);

    if (!newCategory) {
      return res.status(404).json({
        success: false,
        message: 'New category not found'
      });
    }

    // Don't move if already in the category
    if (image.category.toString() === categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Image is already in this category'
      });
    }

    const oldCategoryId = image.category;

    // Update image category
    image.category = categoryId;
    await image.save();

    // Update old category count
    const oldCategory = await Category.findById(oldCategoryId);
    if (oldCategory) {
      oldCategory.imageCount = Math.max(0, oldCategory.imageCount - 1);
      await oldCategory.save();
    }

    // Update new category count
    newCategory.imageCount += 1;
    await newCategory.save();

    // Populate image data
    const populatedImage = await Image.findById(image._id)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      message: 'Image moved successfully',
      data: {
        image: populatedImage
      }
    });

  } catch (error) {
    console.error('Move Image Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error moving image',
      error: error.message
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/images/:id
// @access  Private
exports.deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Check if user is owner or admin
    if (image.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this image'
      });
    }

    // Delete physical file
    try {
      await fs.unlink(image.path);
    } catch (fileError) {
      console.error('Error deleting file:', fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Update category count
    const category = await Category.findById(image.category);
    if (category) {
      category.imageCount = Math.max(0, category.imageCount - 1);
      await category.save();
    }

    // Update user upload count
    const user = await User.findById(image.uploadedBy);
    if (user) {
      user.uploadCount = Math.max(0, user.uploadCount - 1);
      await user.save();
    }

    // Delete image from database
    await Image.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete Image Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

// @desc    Toggle image featured status
// @route   PATCH /api/images/:id/feature
// @access  Private/Admin
exports.toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Toggle featured status
    image.isFeatured = !image.isFeatured;
    await image.save();

    res.status(200).json({
      success: true,
      message: `Image ${image.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: {
        image
      }
    });

  } catch (error) {
    console.error('Toggle Featured Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error toggling featured status',
      error: error.message
    });
  }
};

// @desc    Download image
// @route   GET /api/images/:id/download
// @access  Public
exports.downloadImage = async (req, res) => {
  try {
    const { id } = req.params;

    const image = await Image.findById(id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    if (!image.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This image is not available for download'
      });
    }

    // Increment download count
    image.downloads += 1;
    await image.save();

    // Send file
    res.download(image.path, image.originalName, (err) => {
      if (err) {
        console.error('Download Error:', err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading image'
          });
        }
      }
    });

  } catch (error) {
    console.error('Download Image Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid image ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error downloading image',
      error: error.message
    });
  }
};

// @desc    Get featured images
// @route   GET /api/images/featured
// @access  Public
exports.getFeaturedImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;

    const images = await Image.find({
      isFeatured: true,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      data: {
        images
      }
    });

  } catch (error) {
    console.error('Get Featured Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured images',
      error: error.message
    });
  }
};

// @desc    Get popular images (most viewed/downloaded)
// @route   GET /api/images/popular
// @access  Public
exports.getPopularImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const sortBy = req.query.sortBy || 'views'; // views or downloads

    const images = await Image.find({ isActive: true })
      .sort({ [sortBy]: -1 })
      .limit(limit)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      data: {
        images
      }
    });

  } catch (error) {
    console.error('Get Popular Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular images',
      error: error.message
    });
  }
};

// @desc    Search images by tags
// @route   GET /api/images/search/tags
// @access  Public
exports.searchByTags = async (req, res) => {
  try {
    const { tags } = req.query;

    if (!tags) {
      return res.status(400).json({
        success: false,
        message: 'Tags parameter is required'
      });
    }

    const tagArray = tags.split(',').map(tag => tag.trim());

    const images = await Image.find({
      tags: { $in: tagArray },
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      data: {
        images,
        count: images.length
      }
    });

  } catch (error) {
    console.error('Search By Tags Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching images by tags',
      error: error.message
    });
  }
};

// @desc    Get most liked images
// @route   GET /api/images/most-liked
// @access  Public
exports.getMostLikedImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const images = await Image.find({ isActive: true })
      .sort({ likesCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    const total = await Image.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        images,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get Most Liked Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching most liked images',
      error: error.message
    });
  }
};

// @desc    Get latest images
// @route   GET /api/images/latest
// @access  Public
exports.getLatestImages = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    const images = await Image.find({ isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('category', 'name slug')
      .populate('uploadedBy', 'username fullName avatar');

    const total = await Image.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        images,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get Latest Images Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching latest images',
      error: error.message
    });
  }
};
