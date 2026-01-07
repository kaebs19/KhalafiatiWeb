const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Category name must be at least 2 characters'],
    maxlength: [50, 'Category name cannot exceed 50 characters']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  thumbnail: {
    type: String,
    default: null
  },
  imageCount: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Helper function to create slug supporting Arabic text
function createSlug(text) {
  // Arabic to English transliteration map for common words
  const arabicToEnglish = {
    'طبيعة': 'nature',
    'تصميم': 'design',
    'فن': 'art',
    'تقنية': 'technology',
    'طعام': 'food',
    'رياضة': 'sports',
    'موضة': 'fashion',
    'سفر': 'travel',
    'حيوانات': 'animals',
    'هندسة': 'architecture',
    'موسيقى': 'music',
    'تعليم': 'education',
    'صحة': 'health',
    'أعمال': 'business',
    'ترفيه': 'entertainment'
  };

  // Check if the name is in the transliteration map
  const lowerText = text.trim().toLowerCase();
  if (arabicToEnglish[lowerText]) {
    return arabicToEnglish[lowerText];
  }

  // For Arabic text, keep Arabic characters and convert to slug
  // Remove special characters but keep Arabic letters, numbers, spaces and hyphens
  let slug = text
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '') // Keep Arabic letters, English letters, numbers, spaces, hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  return slug;
}

// Create slug from name before saving
categorySchema.pre('save', function(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = createSlug(this.name);
  }
  next();
});

// Also handle slug generation before validation
categorySchema.pre('validate', function(next) {
  if (this.name && !this.slug) {
    this.slug = createSlug(this.name);
  }
  next();
});

// Virtual for full image URL
categorySchema.virtual('thumbnailUrl').get(function() {
  if (this.thumbnail) {
    return `/uploads/categories/${this.thumbnail}`;
  }
  return null;
});

// Ensure virtuals are included in JSON
categorySchema.set('toJSON', { virtuals: true });
categorySchema.set('toObject', { virtuals: true });

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
