const Report = require('../models/Report');
const User = require('../models/User');
const Image = require('../models/Image');

// @desc    Create new report
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    // Support both formats: iOS (targetType, targetId) and Web (reportType, reportedImageId)
    let { reportType, reportedUserId, reportedImageId, reason, description, targetType, targetId } = req.body;

    // Convert iOS format to backend format
    if (targetType && targetId) {
      reportType = targetType.toLowerCase(); // "Image" -> "image"
      if (reportType === 'image') {
        reportedImageId = targetId;
      } else if (reportType === 'user') {
        reportedUserId = targetId;
      }
    }

    // Validation
    if (!reportType || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Report type and reason are required'
      });
    }

    // Validate reported item exists
    if (reportType === 'user') {
      if (!reportedUserId) {
        return res.status(400).json({
          success: false,
          message: 'Reported user ID is required'
        });
      }

      const userExists = await User.findById(reportedUserId);
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: 'Reported user not found'
        });
      }

      // Prevent self-reporting
      if (reportedUserId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot report yourself'
        });
      }
    } else if (reportType === 'image') {
      if (!reportedImageId) {
        return res.status(400).json({
          success: false,
          message: 'Reported image ID is required'
        });
      }

      const imageExists = await Image.findById(reportedImageId);
      if (!imageExists) {
        return res.status(404).json({
          success: false,
          message: 'Reported image not found'
        });
      }
    }

    // Check if user already reported this item
    const existingReport = await Report.findOne({
      reportType,
      ...(reportType === 'user' ? { reportedUser: reportedUserId } : { reportedImage: reportedImageId }),
      reportedBy: req.user._id,
      status: { $in: ['pending', 'reviewed'] }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        message: 'You have already reported this item'
      });
    }

    // Create report
    const report = await Report.create({
      reportType,
      ...(reportType === 'user' ? { reportedUser: reportedUserId } : { reportedImage: reportedImageId }),
      reportedBy: req.user._id,
      reason,
      description: description || ''
    });

    // Populate report data
    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'username fullName')
      .populate('reportedUser', 'username fullName avatar')
      .populate({
        path: 'reportedImage',
        populate: { path: 'uploadedBy', select: 'username fullName' }
      });

    res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Our team will review it shortly.',
      data: {
        report: populatedReport
      }
    });

  } catch (error) {
    console.error('Create Report Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating report',
      error: error.message
    });
  }
};

// @desc    Get all reports (Admin)
// @route   GET /api/reports
// @access  Private/Admin
exports.getAllReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = '',
      reportType = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    if (status) {
      query.status = status;
    }

    if (reportType) {
      query.reportType = reportType;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute query
    const reports = await Report.find(query)
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate('reportedBy', 'username fullName avatar')
      .populate('reportedUser', 'username fullName avatar status')
      .populate({
        path: 'reportedImage',
        populate: { path: 'uploadedBy', select: 'username fullName' }
      })
      .populate('reviewedBy', 'username fullName');

    // Get total count
    const total = await Report.countDocuments(query);

    // Get counts by status
    const statusCounts = await Report.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        },
        statistics: {
          byStatus: statusCounts.reduce((acc, curr) => {
            acc[curr._id] = curr.count;
            return acc;
          }, {})
        }
      }
    });

  } catch (error) {
    console.error('Get All Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reports',
      error: error.message
    });
  }
};

// @desc    Get report by ID
// @route   GET /api/reports/:id
// @access  Private/Admin
exports.getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate('reportedBy', 'username fullName avatar email')
      .populate('reportedUser', 'username fullName avatar email status')
      .populate({
        path: 'reportedImage',
        populate: { path: 'uploadedBy', select: 'username fullName avatar' }
      })
      .populate('reviewedBy', 'username fullName');

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        report
      }
    });

  } catch (error) {
    console.error('Get Report By ID Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching report',
      error: error.message
    });
  }
};

// @desc    Update report status
// @route   PATCH /api/reports/:id/status
// @access  Private/Admin
exports.updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    // Update report
    report.status = status;
    report.reviewedBy = req.user._id;
    report.reviewedAt = new Date();
    if (adminNotes !== undefined) {
      report.adminNotes = adminNotes;
    }

    await report.save();

    // Populate report data
    const populatedReport = await Report.findById(report._id)
      .populate('reportedBy', 'username fullName')
      .populate('reportedUser', 'username fullName avatar')
      .populate({
        path: 'reportedImage',
        populate: { path: 'uploadedBy', select: 'username fullName' }
      })
      .populate('reviewedBy', 'username fullName');

    res.status(200).json({
      success: true,
      message: 'Report status updated successfully',
      data: {
        report: populatedReport
      }
    });

  } catch (error) {
    console.error('Update Report Status Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating report status',
      error: error.message
    });
  }
};

// @desc    Delete report
// @route   DELETE /api/reports/:id
// @access  Private/Admin
exports.deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({
        success: false,
        message: 'Report not found'
      });
    }

    await Report.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully'
    });

  } catch (error) {
    console.error('Delete Report Error:', error);

    if (error.kind === 'ObjectId') {
      return res.status(400).json({
        success: false,
        message: 'Invalid report ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error deleting report',
      error: error.message
    });
  }
};

// @desc    Get user's reports
// @route   GET /api/reports/my-reports
// @access  Private
exports.getMyReports = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get user's reports
    const reports = await Report.find({ reportedBy: req.user._id })
      .sort(sort)
      .limit(limitNum)
      .skip(skip)
      .populate('reportedUser', 'username fullName avatar')
      .populate({
        path: 'reportedImage',
        populate: { path: 'uploadedBy', select: 'username fullName' }
      });

    const total = await Report.countDocuments({ reportedBy: req.user._id });

    res.status(200).json({
      success: true,
      data: {
        reports,
        pagination: {
          current: pageNum,
          pages: Math.ceil(total / limitNum),
          total,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    console.error('Get My Reports Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching your reports',
      error: error.message
    });
  }
};
