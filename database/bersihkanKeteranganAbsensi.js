const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import Absensi model
const Absensi = require('../src/models/Absensi');

/**
 * Script untuk membersihkan keterangan absensi yang lama
 * Menghapus "- Pengajuan #..." dari keterangan absensi
 * Sehingga hanya tersisa jenis izin (cuti-tahunan, izin-sakit, dll)
 */

async function bersihkanKeteranganAbsensi() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Cari semua record absensi yang memiliki "Pengajuan #" di keterangan
    const recordLama = await Absensi.find({
      keterangan: { $regex: 'Pengajuan #' }
    });

    console.log(`📋 Ditemukan ${recordLama.length} record dengan "Pengajuan #"`);

    if (recordLama.length === 0) {
      console.log('✅ Semua record sudah bersih!');
      await mongoose.connection.close();
      return;
    }

    // Update setiap record
    let berhasilDiupdate = 0;

    for (const record of recordLama) {
      try {
        // Extract jenis izin dari keterangan (sebelum " - Pengajuan")
        const jenis_izin = record.keterangan.split(' - Pengajuan')[0];

        // Update keterangan
        record.keterangan = jenis_izin;
        await record.save();

        console.log(`✅ Updated: ${record.keterangan} (${record.tanggal.toDateString()})`);
        berhasilDiupdate++;
      } catch (error) {
        console.error(`❌ Gagal update record:`, error.message);
      }
    }

    console.log(`\n📊 Ringkasan:
  ✅ Berhasil diupdate: ${berhasilDiupdate}
  📅 Total diproses: ${recordLama.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run script
bersihkanKeteranganAbsensi();
