const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, trim: true, lowercase: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true, trim: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'banned'], default: 'active' },
  avatar: { type: String, default: null },
  bio: { type: String, default: '' },
  uploadCount: { type: Number, default: 0 },
  lastLogin: { type: Date, default: null }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const seedUsers = async () => {
  try {
    const existingCount = await User.countDocuments({ role: 'user' });
    if (existingCount >= 3) {
      console.log('✅ Users already exist!');
      const users = await User.find({ role: 'user' });
      console.log(`Total users: ${users.length}`);
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email})`);
      });
      process.exit(0);
    }

    const salt = await bcrypt.genSalt(10);

    const users = [
      {
        username: 'ahmed',
        email: 'ahmed@example.com',
        password: await bcrypt.hash('123456', salt),
        fullName: 'أحمد محمد',
        role: 'user',
        bio: 'مصور فوتوغرافي محترف',
        uploadCount: 0
      },
      {
        username: 'sara',
        email: 'sara@example.com',
        password: await bcrypt.hash('123456', salt),
        fullName: 'سارة علي',
        role: 'user',
        bio: 'مصممة جرافيك',
        uploadCount: 0
      },
      {
        username: 'mohammed',
        email: 'mohammed@example.com',
        password: await bcrypt.hash('123456', salt),
        fullName: 'محمد خالد',
        role: 'user',
        bio: 'مهتم بالتصوير الطبيعي',
        uploadCount: 0
      }
    ];

    const result = await User.insertMany(users);

    console.log('✅ Sample users created successfully!');
    console.log(`Total: ${result.length} users`);
    console.log('\nUsers (all with password: 123456):');
    result.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - ${user.email} - ${user.fullName}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding users:', error.message);
    process.exit(1);
  }
};

seedUsers();
