const mongoose = require('mongoose');

/**
 * Fungsi untuk menghubungkan ke database MongoDB
 * Menggunakan URI dari environment variable atau default ke localhost
 */
const hubungkanDB = async () => {
  try {
    const uriMongo = process.env.MONGODB_URI || 'mongodb://localhost:27017/nusaattend';
    
    // Koneksi ke MongoDB dengan options modern
    const koneksi = await mongoose.connect(uriMongo, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✓ MongoDB Terhubung: ${koneksi.connection.host}`);
    return koneksi;
  } catch (error) {
    console.error(`✗ Gagal Koneksi MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = hubungkanDB;
