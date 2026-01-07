const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Simple User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  fullName: String,
  role: String,
  status: String,
  avatar: String,
  bio: String,
  uploadCount: Number,
  lastLogin: Date
}, {
  timestamps: true
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Error comparing passwords');
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

const User = mongoose.model('User', userSchema);

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Login Admin
const loginAdmin = async () => {
  try {
    const user = await User.findOne({ email: 'admin@khalafiati.com' }).select('+password');

    if (!user) {
      console.log('❌ Admin user not found!');
      process.exit(1);
    }

    console.log('✅ Admin user found!');
    console.log('Username:', user.username);
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Status:', user.status);

    // Verify password
    const isPasswordValid = await user.comparePassword('admin123');

    if (!isPasswordValid) {
      console.log('❌ Password is invalid!');
      process.exit(1);
    }

    console.log('✅ Password is valid!');

    // Generate token
    const token = generateToken(user._id);

    console.log('\n🎉 Login successful!');
    console.log('\n📝 Token:');
    console.log(token);
    console.log('\n📋 User Data:');
    console.log(JSON.stringify(user.getPublicProfile(), null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

loginAdmin();
