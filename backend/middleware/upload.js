const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const createUploadDirs = () => {
  const dirs = [
    'uploads',
    'uploads/images',
    'uploads/categories',
    'uploads/avatars',
    'uploads/covers',
    'uploads/thumbnails'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(__dirname, '..', dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration for images
const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'images'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

// Storage configuration for category thumbnails
const categoryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'categories'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'category-' + uniqueSuffix + ext);
  }
});

// Storage configuration for avatars
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'avatar-' + uniqueSuffix + ext);
  }
});

// File filter for images only
const imageFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
  }
};

// File size limits
const limits = {
  fileSize: 10 * 1024 * 1024 // 10MB
};

// Upload middleware configurations
exports.uploadImage = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: limits
}).single('image');

exports.uploadMultipleImages = multer({
  storage: imageStorage,
  fileFilter: imageFilter,
  limits: limits
}).array('images', 10);

exports.uploadCategoryThumbnail = multer({
  storage: categoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for category thumbnails
  }
}).single('thumbnail');

// Storage configuration for cover images
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'uploads', 'covers'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'cover-' + uniqueSuffix + ext);
  }
});

exports.uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB for avatars
  }
}).single('avatar');

exports.uploadCoverImage = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB for cover images
  }
}).single('coverImage');

// Upload both avatar and cover for profile update
exports.uploadProfileImages = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'avatar') {
        cb(null, path.join(__dirname, '..', 'uploads', 'avatars'));
      } else if (file.fieldname === 'cover') {
        cb(null, path.join(__dirname, '..', 'uploads', 'covers'));
      } else {
        cb(null, path.join(__dirname, '..', 'uploads'));
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      if (file.fieldname === 'avatar') {
        cb(null, 'avatar-' + uniqueSuffix + ext);
      } else if (file.fieldname === 'cover') {
        cb(null, 'cover-' + uniqueSuffix + ext);
      } else {
        cb(null, 'file-' + uniqueSuffix + ext);
      }
    }
  }),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  }
}).fields([
  { name: 'avatar', maxCount: 1 },
  { name: 'cover', maxCount: 1 }
]);

// Error handling middleware for multer
exports.handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    return res.status(400).json({
      success: false,
      message: err.message
    });
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};
