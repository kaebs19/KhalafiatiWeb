const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config();

const runTests = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Test 1: Count documents
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}));
    const Category = mongoose.model('Category', new mongoose.Schema({}, {strict: false}));
    const Image = mongoose.model('Image', new mongoose.Schema({}, {strict: false}));

    console.log('📊 Database Stats:');
    console.log(`Users: ${await User.countDocuments()}`);
    console.log(`Categories: ${await Category.countDocuments()}`);
    console.log(`Images: ${await Image.countDocuments()}\n`);

    // Test 2: List users
    console.log('👥 Users List:');
    const users = await User.find({}, {username: 1, email: 1, role: 1});
    users.forEach(u => console.log(`- ${u.username} (${u.email}) - ${u.role}`));
    console.log();

    // Test 3: List categories
    console.log('📁 Categories List:');
    const categories = await Category.find({}, {name: 1, slug: 1});
    categories.forEach(c => console.log(`- ${c.name} (${c.slug})`));
    console.log();

    mongoose.disconnect();
    console.log('✅ Tests completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

runTests();
