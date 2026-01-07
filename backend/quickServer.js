const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: true, // Allow all origins (including file://)
  credentials: true
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Error:', err);
    process.exit(1);
  });

// User Schema (simple)
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
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Quick Login Endpoint
app.post('/api/quick-login', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Account is banned'
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      success: true,
      message: 'Quick login successful',
      data: {
        user: userData,
        token
      }
    });

  } catch (error) {
    console.error('Quick Login Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error in quick login',
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Quick Server Running' });
});

// Start server
const PORT = 5001;
app.listen(PORT, () => {
  console.log(`\n✅ Quick Login Server running on port ${PORT}`);
  console.log(`🔗 Test: curl -X POST http://localhost:${PORT}/api/quick-login -H "Content-Type: application/json" -d '{"email":"admin@khalafiati.com"}'\n`);
});
