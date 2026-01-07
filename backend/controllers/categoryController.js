const Category = require('../models/Category');
const Image = require('../models/Image');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
exports.getAllCategories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      isActive = '',
      sortBy = 'order',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search by name or slug
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by active status
    if (isActive !== '') {
      query.isActive = isActive === 'true';
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const categories = await Category.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip);

    // Get total count
    const total = await Category.countDocuments(query);

    res.status(200).json({
      success: true,
      data: {
        categories,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get All Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Get active categories (simplified list)
// @route   GET /api/categories/active
// @access  Public
exports.getActiveCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .select('name slug description thumbnail imageCount');

    res.status(200).json({
      success: true,
      data: {
        categories
      }
    });

  } catch (error) {
    console.error('Get Active Categories Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching active categories',
      error: error.message
    });
  }
};

// @desc    Get category by ID
// @route   GET /api/categories/:id
// @access  Public
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get recent images in this category
    const recentImages = await Image.find({
      category: id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(8)
      .populate('uploadedBy', 'username fullName avatar');

    res.status(200).json({
      success: true,
      data: {
        category,
        recentImages
      }
    });

  } catch (error) {
    console.error('Get Category By ID Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// @desc    Get category by slug
// @route   GET /api/categories/slug/:slug
// @access  Public
exports.getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const category = await Category.findOne({ slug });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get images in this category with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const images = await Image.find({
      category: category._id,
      isActive: true
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('uploadedBy', 'username fullName avatar');

    const totalImages = await Image.countDocuments({
      category: category._id,
      isActive: true
    });

    res.status(200).json({
      success: true,
      data: {
        category,
        images,
        pagination: {
          current: page,
          pages: Math.ceil(totalImages / limit),
          total: totalImages,
          limit
        }
      }
    });

  } catch (error) {
    console.error('Get Category By Slug Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
  try {
    const { name, description, thumbnail, order, isActive } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    // Trim the name
    const trimmedName = name.trim();

    // Check if category already exists by name (case-insensitive)
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'فئة بهذا الاسم موجودة مسبقاً'
      });
    }

    // Create category
    const category = await Category.create({
      name: trimmedName,
      description,
      thumbnail,
      order,
      isActive
    });

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الفئة بنجاح',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Create Category Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      // Check which field caused the duplicate
      const duplicateField = error.keyPattern;
      let message = 'فئة بهذا الاسم أو الرابط موجودة مسبقاً';

      if (duplicateField.name) {
        message = 'فئة بهذا الاسم موجودة مسبقاً';
      } else if (duplicateField.slug) {
        message = 'فئة بهذا الرابط (slug) موجودة مسبقاً. يرجى اختيار اسم مختلف';
      }

      return res.status(400).json({
        success: false,
        message: message
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الفئة',
      error: error.message
    });
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private/Admin
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, thumbnail, order, isActive } = req.body;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'الفئة غير موجودة'
      });
    }

    // Check if new name already exists (excluding current category)
    if (name && name.trim() !== category.name) {
      const trimmedName = name.trim();
      const existingCategory = await Category.findOne({
        name: { $regex: new RegExp(`^${trimmedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'فئة بهذا الاسم موجودة مسبقاً'
        });
      }
      category.name = trimmedName;
    }

    // Update other fields
    if (description !== undefined) category.description = description;
    if (thumbnail !== undefined) category.thumbnail = thumbnail;
    if (order !== undefined) category.order = order;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();

    res.status(200).json({
      success: true,
      message: 'تم تحديث الفئة بنجاح',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Update Category Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'معرف الفئة غير صحيح'
      });
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    if (error.code === 11000) {
      const duplicateField = error.keyPattern;
      let message = 'فئة بهذا الاسم أو الرابط موجودة مسبقاً';

      if (duplicateField.name) {
        message = 'فئة بهذا الاسم موجودة مسبقاً';
      } else if (duplicateField.slug) {
        message = 'فئة بهذا الرابط (slug) موجودة مسبقاً. يرجى اختيار اسم مختلف';
      }

      return res.status(400).json({
        success: false,
        message: message
      });
    }

    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الفئة',
      error: error.message
    });
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has images
    const imageCount = await Image.countDocuments({ category: id });

    if (imageCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${imageCount} images. Please move or delete the images first.`
      });
    }

    // Delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    console.error('Delete Category Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
};

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
// @access  Private/Admin
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Toggle active status
    category.isActive = !category.isActive;
    await category.save();

    res.status(200).json({
      success: true,
      message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Toggle Category Status Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error toggling category status',
      error: error.message
    });
  }
};

// @desc    Get category statistics
// @route   GET /api/categories/:id/stats
// @access  Private/Admin
exports.getCategoryStats = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get image statistics
    const totalImages = await Image.countDocuments({ category: id });
    const activeImages = await Image.countDocuments({
      category: id,
      isActive: true
    });
    const featuredImages = await Image.countDocuments({
      category: id,
      isFeatured: true
    });

    // Get total views and downloads
    const imageStats = await Image.aggregate([
      { $match: { category: category._id } },
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

    // Get top uploaders in this category
    const topUploaders = await Image.aggregate([
      { $match: { category: category._id } },
      {
        $group: {
          _id: '$uploadedBy',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
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
          count: 1,
          username: '$userInfo.username',
          fullName: '$userInfo.fullName',
          avatar: '$userInfo.avatar'
        }
      }
    ]);

    // Get images uploaded over time (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const uploadTimeline = await Image.aggregate([
      {
        $match: {
          category: category._id,
          createdAt: { $gte: thirtyDaysAgo }
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
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        category,
        statistics: {
          totalImages,
          activeImages,
          featuredImages,
          totalViews: stats.totalViews,
          totalDownloads: stats.totalDownloads,
          totalSize: stats.totalSize,
          topUploaders,
          uploadTimeline
        }
      }
    });

  } catch (error) {
    console.error('Get Category Stats Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching category statistics',
      error: error.message
    });
  }
};

// @desc    Update category image count (utility function)
// @route   PATCH /api/categories/:id/update-count
// @access  Private/Admin
exports.updateCategoryImageCount = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Recalculate image count
    const imageCount = await Image.countDocuments({ category: id });

    category.imageCount = imageCount;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category image count updated successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Update Category Count Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating category count',
      error: error.message
    });
  }
};

// @desc    Upload category thumbnail/cover image
// @route   POST /api/categories/:id/thumbnail
// @access  Private/Admin
exports.uploadCategoryThumbnail = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image file'
      });
    }

    // Delete old thumbnail if exists
    if (category.thumbnail) {
      const fs = require('fs').promises;
      const path = require('path');
      const oldImagePath = path.join(__dirname, '..', 'uploads', 'categories', category.thumbnail);
      try {
        await fs.unlink(oldImagePath);
      } catch (error) {
        console.error('Error deleting old thumbnail:', error);
      }
    }

    // Update category with new thumbnail
    category.thumbnail = req.file.filename;
    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category thumbnail uploaded successfully',
      data: {
        category
      }
    });

  } catch (error) {
    console.error('Upload Category Thumbnail Error:', error);

    // Delete uploaded file if category update failed
    if (req.file) {
      const fs = require('fs').promises;
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting file:', unlinkError);
      }
    }

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid category ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error uploading category thumbnail',
      error: error.message
    });
  }
};
