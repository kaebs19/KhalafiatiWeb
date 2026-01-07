const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Schemas
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  thumbnail: { type: String, default: null },
  imageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const seedCategories = async () => {
  try {
    // Check if categories already exist
    const count = await Category.countDocuments();
    if (count > 0) {
      console.log('✅ Categories already exist!');
      console.log('Total categories:', count);
      const categories = await Category.find();
      categories.forEach(cat => {
        console.log(`- ${cat.name} (${cat.slug})`);
      });
      process.exit(0);
    }

    // Get admin user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const admin = await User.findOne({ role: 'admin' });

    if (!admin) {
      console.error('❌ Admin user not found. Please create admin first.');
      process.exit(1);
    }

    // Sample categories
    const categories = [
      {
        name: 'طبيعة',
        slug: 'nature',
        description: 'صور المناظر الطبيعية والجبال والبحار',
        createdBy: admin._id
      },
      {
        name: 'مدن',
        slug: 'cities',
        description: 'صور المدن والمباني والعمارة',
        createdBy: admin._id
      },
      {
        name: 'فن',
        slug: 'art',
        description: 'الفنون والتصاميم الإبداعية',
        createdBy: admin._id
      },
      {
        name: 'تقنية',
        slug: 'technology',
        description: 'التكنولوجيا والأجهزة الإلكترونية',
        createdBy: admin._id
      },
      {
        name: 'طعام',
        slug: 'food',
        description: 'صور الأطعمة والمشروبات',
        createdBy: admin._id
      },
      {
        name: 'رياضة',
        slug: 'sports',
        description: 'الرياضات والأنشطة البدنية',
        createdBy: admin._id
      },
      {
        name: 'سفر',
        slug: 'travel',
        description: 'صور السفر والوجهات السياحية',
        createdBy: admin._id
      },
      {
        name: 'حيوانات',
        slug: 'animals',
        description: 'صور الحيوانات والحياة البرية',
        createdBy: admin._id
      }
    ];

    // Insert categories
    const result = await Category.insertMany(categories);

    console.log('✅ Sample categories created successfully!');
    console.log(`Total: ${result.length} categories`);
    console.log('\nCategories:');
    result.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug}) - ${cat.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error.message);
    process.exit(1);
  }
};

seedCategories();
