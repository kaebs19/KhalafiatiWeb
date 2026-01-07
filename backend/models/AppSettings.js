const mongoose = require('mongoose');

const appSettingsSchema = new mongoose.Schema({
  // نوع الإعداد (فريد)
  key: {
    type: String,
    required: true,
    unique: true,
    enum: ['privacy-policy', 'terms-of-service', 'about-us', 'contact-us']
  },

  // العنوان
  title: {
    ar: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: false,
      default: ''
    }
  },

  // المحتوى
  content: {
    ar: {
      type: String,
      required: true
    },
    en: {
      type: String,
      required: false,
      default: ''
    }
  },

  // معلومات إضافية للاتصال
  contactInfo: {
    email: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    address: {
      type: String,
      default: ''
    },
    socialMedia: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    }
  },

  // حالة النشر
  isPublished: {
    type: Boolean,
    default: true
  },

  // آخر تحديث بواسطة
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }

}, {
  timestamps: true
});

// Index للبحث السريع
appSettingsSchema.index({ key: 1 });

const AppSettings = mongoose.model('AppSettings', appSettingsSchema);

module.exports = AppSettings;
