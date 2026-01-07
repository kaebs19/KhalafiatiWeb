const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// User Schema (without pre-save hook)
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'banned'],
    default: 'active'
  },
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  uploadCount: {
    type: Number,
    default: 0
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

// Create Admin User
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Username:', existingAdmin.username);
      console.log('Email:', existingAdmin.email);
      process.exit(0);
    }

    // Hash password manually
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    // Create admin user
    const admin = new User({
      username: 'admin',
      email: 'admin@khalafiati.com',
      password: hashedPassword,
      fullName: 'Administrator',
      role: 'admin',
      status: 'active'
    });

    await admin.save({ validateBeforeSave: false });

    console.log('✅ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@khalafiati.com');
    console.log('Password: admin123');
    console.log('Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
