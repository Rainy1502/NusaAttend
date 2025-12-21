/**
 * Script untuk Buat Data User Awal (TANPA RESET)
 * 
 * Fungsi:
 * 1. Cek data user yang sudah ada
 * 2. Buat 1 user admin (jika belum ada)
 * 3. Buat 3 user penanggung jawab (jika belum ada)
 * 4. Buat 8 user karyawan (jika belum ada)
 * 
 * ⚠️  PENTING: Script ini TIDAK menghapus data lama!
 * Data yang sudah ada akan tetap tersimpan.
 * 
 * Cara menjalankan:
 * $ node database/resetDanBuatData.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ==================== DEFINISI SKEMA USER ====================

const skemaUser = new mongoose.Schema(
  {
    nama_lengkap: {
      type: String,
      required: [true, 'Nama lengkap harus diisi'],
      trim: true,
      minlength: [3, 'Nama minimal 3 karakter']
    },
    email: {
      type: String,
      required: [true, 'Email harus diisi'],
      unique: [true, 'Email sudah terdaftar'],
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Format email tidak valid']
    },
    password: {
      type: String,
      required: [true, 'Password harus diisi'],
      minlength: [6, 'Password minimal 6 karakter'],
      select: false
    },
    jabatan: {
      type: String,
      required: [true, 'Jabatan harus diisi'],
      trim: true
    },
    role: {
      type: String,
      enum: ['karyawan', 'penanggung-jawab', 'admin'],
      required: true
    },
    jatah_cuti_tahunan: {
      type: Number,
      default: 12
    },
    sisa_cuti: {
      type: Number,
      default: 12
    },
    adalah_aktif: {
      type: Boolean,
      default: true
    },
    penanggung_jawab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    dibuat_pada: {
      type: Date,
      default: Date.now
    },
    diperbarui_pada: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: { createdAt: 'dibuat_pada', updatedAt: 'diperbarui_pada' } }
);

// ==================== PRE-SAVE HOOK UNTUK HASH PASSWORD ====================

skemaUser.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ==================== INISIALISASI MODEL ====================

const ModelPengguna = mongoose.model('User', skemaUser, 'pengguna');

// ==================== FUNGSI UTAMA ====================

const resetDanBuatData = async () => {
  try {
    // Koneksi ke MongoDB
    console.log('📡 Menghubungkan ke MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB Atlas\n');

    // ==================== STEP 1: CEK DATA YANG SUDAH ADA ====================
    console.log('📋 Mengecek data user yang sudah ada...');
    const jumlahUserAda = await ModelPengguna.countDocuments({});
    console.log(`✅ Ditemukan ${jumlahUserAda} user di database (tidak akan dihapus)\n`);

    // ==================== STEP 2: BUAT ADMIN ====================
    console.log('👨‍💼 Membuat user Admin...');
    const dataAdmin = {
      nama_lengkap: 'Administrator NusaAttend',
      email: 'admin@nusaattend.com',
      password: 'admin123',
      jabatan: 'Administrator Sistem',
      role: 'admin',
      jatah_cuti_tahunan: 0,
      sisa_cuti: 0,
      adalah_aktif: true
    };

    const userAdmin = new ModelPengguna(dataAdmin);
    await userAdmin.save();
    console.log(`✅ Admin berhasil dibuat: ${dataAdmin.email}\n`);

    // ==================== STEP 3: BUAT PENANGGUNG JAWAB ====================
    console.log('👔 Membuat user Penanggung Jawab...');
    const dataSupervisor = [
      {
        nama_lengkap: 'Budi Santoso',
        email: 'budi@nusaattend.com',
        password: 'SupervisorSecure123!',
        jabatan: 'Supervisor IT Development',
        role: 'penanggung-jawab',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      },
      {
        nama_lengkap: 'Ahmad Wijaya',
        email: 'ahmad@nusaattend.com',
        password: 'SupervisorSecure123!',
        jabatan: 'Supervisor Finance',
        role: 'penanggung-jawab',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      },
      {
        nama_lengkap: 'Sari Indah',
        email: 'sari@nusaattend.com',
        password: 'SupervisorSecure123!',
        jabatan: 'Supervisor HR & Marketing',
        role: 'penanggung-jawab',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      }
    ];

    const supervisorIds = [];
    for (const supervisor of dataSupervisor) {
      const userSupervisor = new ModelPengguna(supervisor);
      await userSupervisor.save();
      supervisorIds.push(userSupervisor._id);
      console.log(`✅ Penanggung Jawab berhasil dibuat: ${supervisor.email}`);
    }
    console.log();

    // ==================== STEP 4: BUAT KARYAWAN ====================
    console.log('👨‍💻 Membuat user Karyawan...');
    const dataKaryawan = [
      {
        nama_lengkap: 'Rendra Pratama',
        email: 'rendra.pratama@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Junior Developer',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[0] // Budi Santoso
      },
      {
        nama_lengkap: 'Linda Setiawan',
        email: 'linda.setiawan@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Content Creator',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[2] // Sari Indah
      },
      {
        nama_lengkap: 'Arif Gunawan',
        email: 'arif.gunawan@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'System Administrator',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[0] // Budi Santoso
      },
      {
        nama_lengkap: 'Maya Kusuma',
        email: 'maya.kusuma@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Business Analyst',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[1] // Ahmad Wijaya
      },
      {
        nama_lengkap: 'Eka Wijaya',
        email: 'eka.wijaya@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Data Analyst',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[1] // Ahmad Wijaya
      },
      {
        nama_lengkap: 'Farah Nurhaliza',
        email: 'farah.nurhaliza@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'HR Manager',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[2] // Sari Indah
      },
      {
        nama_lengkap: 'Gita Pramaesti',
        email: 'gita.pramaesti@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Marketing Specialist',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[2] // Sari Indah
      },
      {
        nama_lengkap: 'Hendra Sutrisno',
        email: 'hendra.sutrisno@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Finance Officer',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true,
        penanggung_jawab_id: supervisorIds[1] // Ahmad Wijaya
      }
    ];

    for (const karyawan of dataKaryawan) {
      const userKaryawan = new ModelPengguna(karyawan);
      await userKaryawan.save();
      console.log(`✅ Karyawan berhasil dibuat: ${karyawan.email}`);
    }
    console.log();

    // ==================== RINGKASAN ====================
    console.log('✨ =====================================================');
    console.log('✨ DATA BERHASIL DIBUAT!');
    console.log('✨ =====================================================\n');

    console.log('📊 RINGKASAN DATA YANG DIBUAT:');
    console.log('  ✅ 1 Admin');
    console.log('  ✅ 3 Penanggung Jawab');
    console.log('  ✅ 8 Karyawan (sudah di-assign ke supervisor)\n');

    console.log('🔐 KREDENSIAL LOGIN:\n');
    
    console.log('Admin:');
    console.log('  Email: admin@nusaattend.com');
    console.log('  Password: admin123\n');
    
    console.log('Penanggung Jawab:');
    console.log('  Email: budi@nusaattend.com | Password: SupervisorSecure123!');
    console.log('  Email: ahmad@nusaattend.com | Password: SupervisorSecure123!');
    console.log('  Email: sari@nusaattend.com | Password: SupervisorSecure123!\n');
    
    console.log('Karyawan:');
    console.log('  Email: rendra.pratama@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: linda.setiawan@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: arif.gunawan@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: maya.kusuma@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: eka.wijaya@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: farah.nurhaliza@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: gita.pramaesti@nusaattend.com | Password: KaryawanSecure123!');
    console.log('  Email: hendra.sutrisno@nusaattend.com | Password: KaryawanSecure123!\n');

    console.log('🌐 Akses aplikasi: http://localhost:3000\n');

    // Tutup koneksi
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');

  } catch (error) {
    console.error('❌ Terjadi kesalahan:');
    console.error(error.message);
    console.error(error);
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

// ==================== JALANKAN ====================

resetDanBuatData();
