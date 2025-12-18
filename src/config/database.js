/**
 * Konfigurasi koneksi MongoDB
 * Menggunakan MongoDB Atlas (Cloud)
 * Untuk keperluan akademik - NusaAttend
 */

const mongoose = require('mongoose');

const koneksiDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('✅ Koneksi MongoDB Atlas berhasil');
  } catch (error) {
    console.error('❌ Gagal koneksi MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = koneksiDatabase;