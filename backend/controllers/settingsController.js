const AppSettings = require('../models/AppSettings');

// @desc    Get all app settings (public pages)
// @route   GET /api/settings
// @access  Public
exports.getAllSettings = async (req, res) => {
  try {
    const settings = await AppSettings.find({ isPublished: true })
      .select('-updatedBy -__v')
      .sort('key');

    res.status(200).json({
      success: true,
      data: {
        settings
      }
    });

  } catch (error) {
    console.error('Get All Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
};

// @desc    Get specific setting by key
// @route   GET /api/settings/:key
// @access  Public
exports.getSettingByKey = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await AppSettings.findOne({
      key,
      isPublished: true
    }).select('-updatedBy -__v');

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        setting
      }
    });

  } catch (error) {
    console.error('Get Setting By Key Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching setting',
      error: error.message
    });
  }
};

// @desc    Create or update setting
// @route   PUT /api/settings/:key
// @access  Private (Admin only)
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { title, content, contactInfo, isPublished } = req.body;

    // Validation
    if (!title || !title.ar) {
      return res.status(400).json({
        success: false,
        message: 'Arabic title is required'
      });
    }

    if (!content || !content.ar) {
      return res.status(400).json({
        success: false,
        message: 'Arabic content is required'
      });
    }

    // Check if setting exists
    let setting = await AppSettings.findOne({ key });

    if (setting) {
      // Update existing setting
      setting.title = title;
      setting.content = content;
      if (contactInfo) setting.contactInfo = contactInfo;
      if (isPublished !== undefined) setting.isPublished = isPublished;
      setting.updatedBy = req.user._id;

      await setting.save();

      res.status(200).json({
        success: true,
        message: 'Setting updated successfully',
        data: {
          setting
        }
      });

    } else {
      // Create new setting
      setting = await AppSettings.create({
        key,
        title,
        content,
        contactInfo: contactInfo || {},
        isPublished: isPublished !== undefined ? isPublished : true,
        updatedBy: req.user._id
      });

      res.status(201).json({
        success: true,
        message: 'Setting created successfully',
        data: {
          setting
        }
      });
    }

  } catch (error) {
    console.error('Update Setting Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error updating setting',
      error: error.message
    });
  }
};

// @desc    Delete setting
// @route   DELETE /api/settings/:key
// @access  Private (Admin only)
exports.deleteSetting = async (req, res) => {
  try {
    const { key } = req.params;

    const setting = await AppSettings.findOneAndDelete({ key });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Setting deleted successfully'
    });

  } catch (error) {
    console.error('Delete Setting Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting setting',
      error: error.message
    });
  }
};

// @desc    Initialize default settings
// @route   POST /api/settings/init
// @access  Private (Admin only)
exports.initializeSettings = async (req, res) => {
  try {
    const defaultSettings = [
      {
        key: 'privacy-policy',
        title: {
          ar: 'سياسة الخصوصية',
          en: 'Privacy Policy'
        },
        content: {
          ar: 'محتوى سياسة الخصوصية هنا...',
          en: 'Privacy policy content here...'
        }
      },
      {
        key: 'terms-of-service',
        title: {
          ar: 'شروط الاستخدام',
          en: 'Terms of Service'
        },
        content: {
          ar: 'محتوى شروط الاستخدام هنا...',
          en: 'Terms of service content here...'
        }
      },
      {
        key: 'about-us',
        title: {
          ar: 'حول التطبيق',
          en: 'About Us'
        },
        content: {
          ar: 'معلومات عن التطبيق هنا...',
          en: 'About us content here...'
        }
      },
      {
        key: 'contact-us',
        title: {
          ar: 'اتصل بنا',
          en: 'Contact Us'
        },
        content: {
          ar: 'يمكنك التواصل معنا عبر البريد الإلكتروني أو الهاتف.',
          en: 'You can contact us via email or phone.'
        },
        contactInfo: {
          email: 'info@khalafiati.com',
          phone: '+966 XX XXX XXXX',
          address: '',
          socialMedia: {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: ''
          }
        }
      }
    ];

    const createdSettings = [];

    for (const settingData of defaultSettings) {
      const existingSetting = await AppSettings.findOne({ key: settingData.key });

      if (!existingSetting) {
        const setting = await AppSettings.create({
          ...settingData,
          updatedBy: req.user._id
        });
        createdSettings.push(setting);
      }
    }

    res.status(201).json({
      success: true,
      message: `Initialized ${createdSettings.length} default settings`,
      data: {
        created: createdSettings.length,
        settings: createdSettings
      }
    });

  } catch (error) {
    console.error('Initialize Settings Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing settings',
      error: error.message
    });
  }
};
