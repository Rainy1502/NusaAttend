const mongoose = require('mongoose');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import User model
const User = require('../src/models/User');

/**
 * Script untuk membuat data supervisor di database NusaAttend
 * 
 * Daftar supervisor yang akan dibuat:
 * 1. Budi Santoso (budi@nusaattend.com)
 * 2. Ahmad Wijaya (ahmad@nusaattend.com)
 * 3. Sari Indah (sari@nusaattend.com)
 */

// Data supervisor yang akan dibuat
const daftarSupervisor = [
  {
    nama_lengkap: 'Budi Santoso',
    email: 'budi@nusaattend.com',
    password: 'SupervisorSecure123!',
    jabatan: 'Supervisor IT Development',
    role: 'supervisor',
    jatah_cuti_tahunan: 12,
    sisa_cuti: 12,
    adalah_aktif: true
  },
  {
    nama_lengkap: 'Ahmad Wijaya',
    email: 'ahmad@nusaattend.com',
    password: 'SupervisorSecure123!',
    jabatan: 'Supervisor Finance',
    role: 'supervisor',
    jatah_cuti_tahunan: 12,
    sisa_cuti: 12,
    adalah_aktif: true
  },
  {
    nama_lengkap: 'Sari Indah',
    email: 'sari@nusaattend.com',
    password: 'SupervisorSecure123!',
    jabatan: 'Supervisor HR & Marketing',
    role: 'supervisor',
    jatah_cuti_tahunan: 12,
    sisa_cuti: 12,
    adalah_aktif: true
  }
];

async function buatSupervisor() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB: ' + process.env.MONGODB_URI);

    // Buat setiap supervisor
    let berhasilDibuat = 0;
    let sudahAda = 0;

    for (const dataSupervisor of daftarSupervisor) {
      try {
        // Cek apakah supervisor sudah ada
        const supervisorAda = await User.findOne({
          email: dataSupervisor.email
        });

        if (supervisorAda) {
          console.log(`⚠️  User supervisor dengan email ${dataSupervisor.email} sudah terdaftar`);
          sudahAda++;
          continue;
        }

        // Buat supervisor baru
        const supervisorBaru = new User(dataSupervisor);
        await supervisorBaru.save();

        console.log(
          `✅ Supervisor berhasil dibuat:\n` +
          `   Nama: ${dataSupervisor.nama_lengkap}\n` +
          `   Email: ${dataSupervisor.email}\n` +
          `   Password: ${dataSupervisor.password}`
        );
        berhasilDibuat++;
      } catch (error) {
        console.error(
          `❌ Gagal membuat supervisor ${dataSupervisor.nama_lengkap}:`,
          error.message
        );
      }
    }

    console.log(`\n📊 Ringkasan:
  ✅ Berhasil dibuat: ${berhasilDibuat}
  ⚠️  Sudah ada: ${sudahAda}
  📅 Total diproses: ${daftarSupervisor.length}`);

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run script
buatSupervisor();
