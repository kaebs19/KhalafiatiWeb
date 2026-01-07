/**
 * Fix Image Paths Script
 *
 * This script updates all existing images in the database to use
 * relative URL paths instead of full filesystem paths
 */

const mongoose = require('mongoose');
const Image = require('../models/Image');
require('dotenv').config();

async function fixImagePaths() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/khalafiati');
    console.log('✅ Connected to MongoDB');

    // Find all images
    const images = await Image.find({});
    console.log(`📊 Found ${images.length} images to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const image of images) {
      // Check if path contains full filesystem path
      if (image.path && image.path.includes('/var/www/') || image.path.includes('backend/uploads/')) {
        const oldPath = image.path;

        // Extract filename from path
        const filename = image.filename;

        // Create new relative path
        const newPath = `/uploads/images/${filename}`;

        // Update the image
        image.path = newPath;
        await image.save();

        console.log(`✅ Updated: ${oldPath} -> ${newPath}`);
        updatedCount++;
      } else if (image.path && image.path.startsWith('/uploads/')) {
        console.log(`⏭️  Skipped (already correct): ${image.path}`);
        skippedCount++;
      } else {
        console.log(`⚠️  Warning: Unusual path format: ${image.path}`);
        skippedCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Updated: ${updatedCount} images`);
    console.log(`⏭️  Skipped: ${skippedCount} images`);
    console.log(`📊 Total: ${images.length} images`);
    console.log('='.repeat(50));

    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the script
fixImagePaths();
