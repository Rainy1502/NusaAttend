/**
 * Temporary script to fix admin user password
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const fixAdminPassword = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nusaattend';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Find and delete the admin user if they exist
    const existingAdmin = await User.findOne({ email: 'admin@nusaattend.com' });
    
    if (existingAdmin) {
      console.log('🗑️  Deleting existing admin user...');
      await User.deleteOne({ email: 'admin@nusaattend.com' });
    }

    // Create new admin user with proper password hashing
    const adminUser = new User({
      nama_lengkap: 'Admin NusaAttend',
      email: 'admin@nusaattend.com',
      password: 'admin123456', // Will be hashed by schema pre-save
      jabatan: 'Administrator',
      role: 'admin'
    });

    await adminUser.save();

    console.log('\n✅ Admin user fixed!');
    console.log('\n📧 Email: admin@nusaattend.com');
    console.log('🔐 Password: admin123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

fixAdminPassword();
