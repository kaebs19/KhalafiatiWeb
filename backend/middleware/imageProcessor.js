const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * ضغط وتحسين الصورة الشخصية (Avatar)
 * - ضغط الصورة للحفاظ على المساحة
 * - تحويل إلى JPEG بجودة عالية
 * - إنشاء thumbnail صغير
 */
exports.processAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const fileBaseName = path.parse(filename).name;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'avatars');
    const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');

    // التأكد من وجود مجلد thumbnails
    try {
      await fs.access(thumbnailsDir);
    } catch {
      await fs.mkdir(thumbnailsDir, { recursive: true });
    }

    // معالجة الصورة الأساسية
    const processedFilename = `${fileBaseName}.jpg`;
    const processedPath = path.join(uploadsDir, processedFilename);

    await sharp(originalPath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(processedPath);

    // إنشاء thumbnail صغير
    const thumbnailFilename = `thumb-${fileBaseName}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    await sharp(originalPath)
      .resize(150, 150, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(thumbnailPath);

    // حذف الملف الأصلي إذا كان مختلفاً
    if (originalPath !== processedPath) {
      try {
        await fs.unlink(originalPath);
      } catch (error) {
        console.error('Error deleting original file:', error);
      }
    }

    // تحديث معلومات الملف في req
    req.file.filename = processedFilename;
    req.file.path = processedPath;
    req.thumbnailFilename = thumbnailFilename;

    console.log(`✅ Avatar processed: ${processedFilename} + thumbnail`);
    next();

  } catch (error) {
    console.error('Error processing avatar:', error);
    // في حالة فشل المعالجة، نكمل بدون ضغط
    next();
  }
};

/**
 * ضغط وتحسين صورة الغلاف (Cover)
 * - ضغط أكبر للصور الكبيرة
 * - الحفاظ على نسبة العرض إلى الارتفاع
 */
exports.processCover = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const fileBaseName = path.parse(filename).name;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'covers');

    // معالجة صورة الغلاف
    const processedFilename = `${fileBaseName}.jpg`;
    const processedPath = path.join(uploadsDir, processedFilename);

    await sharp(originalPath)
      .resize(1920, 1080, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 85,
        progressive: true
      })
      .toFile(processedPath);

    // حذف الملف الأصلي إذا كان مختلفاً
    if (originalPath !== processedPath) {
      try {
        await fs.unlink(originalPath);
      } catch (error) {
        console.error('Error deleting original file:', error);
      }
    }

    // تحديث معلومات الملف
    req.file.filename = processedFilename;
    req.file.path = processedPath;

    console.log(`✅ Cover processed: ${processedFilename}`);
    next();

  } catch (error) {
    console.error('Error processing cover:', error);
    next();
  }
};

/**
 * معالجة صور متعددة (للملف الشخصي الشامل)
 */
exports.processProfileImages = async (req, res, next) => {
  try {
    if (!req.files || Object.keys(req.files).length === 0) {
      return next();
    }

    const uploadsAvatarDir = path.join(__dirname, '..', 'uploads', 'avatars');
    const uploadsCoverDir = path.join(__dirname, '..', 'uploads', 'covers');
    const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');

    // التأكد من وجود مجلد thumbnails
    try {
      await fs.access(thumbnailsDir);
    } catch {
      await fs.mkdir(thumbnailsDir, { recursive: true });
    }

    // معالجة Avatar إن وجد
    if (req.files.avatar && req.files.avatar[0]) {
      const avatarFile = req.files.avatar[0];
      const originalPath = avatarFile.path;
      const fileBaseName = path.parse(avatarFile.filename).name;

      // معالجة الصورة الأساسية
      const processedFilename = `${fileBaseName}.jpg`;
      const processedPath = path.join(uploadsAvatarDir, processedFilename);

      await sharp(originalPath)
        .resize(800, 800, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(processedPath);

      // إنشاء thumbnail
      const thumbnailFilename = `thumb-${fileBaseName}.jpg`;
      const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

      await sharp(originalPath)
        .resize(150, 150, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({
          quality: 80,
          progressive: true
        })
        .toFile(thumbnailPath);

      // حذف الأصلي
      if (originalPath !== processedPath) {
        try {
          await fs.unlink(originalPath);
        } catch (error) {
          console.error('Error deleting original avatar:', error);
        }
      }

      // تحديث المعلومات
      req.files.avatar[0].filename = processedFilename;
      req.files.avatar[0].path = processedPath;
      req.avatarThumbnail = thumbnailFilename;

      console.log(`✅ Avatar processed in profile update: ${processedFilename}`);
    }

    // معالجة Cover إن وجد
    if (req.files.cover && req.files.cover[0]) {
      const coverFile = req.files.cover[0];
      const originalPath = coverFile.path;
      const fileBaseName = path.parse(coverFile.filename).name;

      const processedFilename = `${fileBaseName}.jpg`;
      const processedPath = path.join(uploadsCoverDir, processedFilename);

      await sharp(originalPath)
        .resize(1920, 1080, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({
          quality: 85,
          progressive: true
        })
        .toFile(processedPath);

      // حذف الأصلي
      if (originalPath !== processedPath) {
        try {
          await fs.unlink(originalPath);
        } catch (error) {
          console.error('Error deleting original cover:', error);
        }
      }

      req.files.cover[0].filename = processedFilename;
      req.files.cover[0].path = processedPath;

      console.log(`✅ Cover processed in profile update: ${processedFilename}`);
    }

    next();

  } catch (error) {
    console.error('Error processing profile images:', error);
    next();
  }
};

/**
 * معالجة صور المعرض/Gallery
 * - ضغط متوازن بين الجودة والحجم
 * - إنشاء thumbnails للعرض السريع
 */
exports.processGalleryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next();
    }

    const originalPath = req.file.path;
    const filename = req.file.filename;
    const fileBaseName = path.parse(filename).name;
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'images');
    const thumbnailsDir = path.join(__dirname, '..', 'uploads', 'thumbnails');

    // التأكد من وجود مجلد thumbnails
    try {
      await fs.access(thumbnailsDir);
    } catch {
      await fs.mkdir(thumbnailsDir, { recursive: true });
    }

    // معالجة الصورة الأساسية
    const processedFilename = `${fileBaseName}.jpg`;
    const processedPath = path.join(uploadsDir, processedFilename);

    await sharp(originalPath)
      .resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 90,
        progressive: true
      })
      .toFile(processedPath);

    // إنشاء thumbnail
    const thumbnailFilename = `thumb-${fileBaseName}.jpg`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

    await sharp(originalPath)
      .resize(400, 400, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toFile(thumbnailPath);

    // حذف الأصلي
    if (originalPath !== processedPath) {
      try {
        await fs.unlink(originalPath);
      } catch (error) {
        console.error('Error deleting original file:', error);
      }
    }

    // تحديث المعلومات
    req.file.filename = processedFilename;
    req.file.path = processedPath;
    req.thumbnailFilename = thumbnailFilename;

    console.log(`✅ Gallery image processed: ${processedFilename} + thumbnail`);
    next();

  } catch (error) {
    console.error('Error processing gallery image:', error);
    next();
  }
};

/**
 * التحقق من أبعاد الصورة
 */
exports.validateImageDimensions = (maxWidth = 5000, maxHeight = 5000) => {
  return async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }

      const metadata = await sharp(req.file.path).metadata();

      if (metadata.width > maxWidth || metadata.height > maxHeight) {
        // حذف الملف المرفوع
        await fs.unlink(req.file.path);

        return res.status(400).json({
          success: false,
          message: `Image dimensions too large. Maximum: ${maxWidth}x${maxHeight}px. Your image: ${metadata.width}x${metadata.height}px`
        });
      }

      next();
    } catch (error) {
      console.error('Error validating image dimensions:', error);
      next();
    }
  };
};

/**
 * الحصول على معلومات الصورة
 */
exports.getImageInfo = async (imagePath) => {
  try {
    const metadata = await sharp(imagePath).metadata();
    const stats = await fs.stat(imagePath);

    return {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: stats.size,
      sizeFormatted: formatBytes(stats.size)
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

/**
 * تنسيق حجم الملف
 */
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
