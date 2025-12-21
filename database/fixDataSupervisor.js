// Script untuk fix data supervisor yang sudah ada (update field jabatan yang missing)
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://admin:admin123@cluster0.6bqh9ti.mongodb.net/nusaattend';

async function fixDataSupervisor() {
  try {
    // Connect ke MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Terhubung ke MongoDB');

    // Import User model
    const User = require('../src/models/User');

    // Cari semua supervisor yang tidak memiliki jabatan
    const supervisorTanpaJabatan = await User.find({
      role: 'supervisor',
      $or: [
        { jabatan: { $exists: false } },
        { jabatan: null },
        { jabatan: '' }
      ]
    });

    console.log(`📊 Ditemukan ${supervisorTanpaJabatan.length} supervisor tanpa jabatan`);

    // Update setiap supervisor dengan jabatan default
    for (let supervisor of supervisorTanpaJabatan) {
      supervisor.jabatan = 'Supervisor/Penanggung Jawab';
      await supervisor.save();
      console.log(`✅ Updated: ${supervisor.nama_lengkap} (${supervisor.email})`);
    }

    console.log('✅ Semua data supervisor berhasil diupdate');

    // Tampilkan data supervisor setelah update
    const allSupervisor = await User.find({ role: 'supervisor' })
      .select('nama_lengkap email jabatan adalah_aktif createdAt');
    
    console.log('\n📋 Daftar supervisor setelah update:');
    console.table(allSupervisor);

    await mongoose.disconnect();
    console.log('\n✅ Selesai - Koneksi ditutup');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixDataSupervisor();
