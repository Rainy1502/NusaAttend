/**
 * Seed Script - Membuat admin account awal untuk NusaAttend
 * Run: npm run seed
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./src/models/User');

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nusaattend';
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✓ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@nusaattend.com' });
    if (existingAdmin) {
      console.log('⚠️  Admin sudah ada: admin@nusaattend.com');
      console.log('   Password: admin123456');
      await mongoose.disconnect();
      return;
    }

    // Create admin user
    const adminUser = new User({
      nama_lengkap: 'Admin NusaAttend',
      email: 'admin@nusaattend.com',
      password: 'admin123456', // Will be hashed by schema pre-save
      jabatan: 'Administrator',
      role: 'admin'
    });

    await adminUser.save();

    console.log('\n✅ Admin account berhasil dibuat!');
    console.log('\n📧 Email: admin@nusaattend.com');
    console.log('🔐 Password: admin123456');
    console.log('\n⚠️  Jangan lupa ubah password setelah login pertama kali!');

    // Create test supervisor account
    const existingSupervisor = await User.findOne({ email: 'supervisor@nusaattend.com' });
    if (!existingSupervisor) {
      const supervisorUser = new User({
        nama_lengkap: 'Supervisor Test',
        email: 'supervisor@nusaattend.com',
        password: 'supervisor123456',
        jabatan: 'Team Lead',
        role: 'supervisor'
      });

      await supervisorUser.save();
      console.log('\n✅ Supervisor account berhasil dibuat!');
      console.log('📧 Email: supervisor@nusaattend.com');
      console.log('🔐 Password: supervisor123456');
    }

    // Create test employee account
    const existingEmployee = await User.findOne({ email: 'employee@nusaattend.com' });
    if (!existingEmployee) {
      const employeeUser = new User({
        nama_lengkap: 'Employee Test',
        email: 'employee@nusaattend.com',
        password: 'employee123456',
        jabatan: 'Staff',
        role: 'employee'
      });

      await employeeUser.save();
      console.log('\n✅ Employee account berhasil dibuat!');
      console.log('📧 Email: employee@nusaattend.com');
      console.log('🔐 Password: employee123456');
    }

    console.log('\n🚀 Database seeding selesai!\n');

    await mongoose.disconnect();
    console.log('✓ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedDatabase();
