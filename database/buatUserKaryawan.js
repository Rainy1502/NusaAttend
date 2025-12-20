/**
 * Script untuk membuat user karyawan di MongoDB Atlas
 * 
 * Tujuan: Inisialisasi data karyawan test untuk admin dashboard
 * 
 * Data yang dimasukkan:
 * - 8 karyawan dengan role = 'karyawan'
 * - Email unik untuk setiap karyawan
 * - Password di-hash otomatis sebelum disimpan
 * - Jatah cuti tahunan = 12 hari (sesuai form modal)
 * - Status aktif = true
 * 
 * Cara menjalankan:
 * $ node database/buatUserKaryawan.js
 * atau
 * $ cd database && node buatUserKaryawan.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// ==================== DEFINISI SKEMA USER ====================

/**
 * Definisikan skema User lokal untuk script ini
 * (tidak perlu import dari models karena ingin standalone)
 */
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
      enum: ['karyawan', 'supervisor', 'admin'],
      default: 'karyawan'
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
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// ==================== PRE-SAVE HOOK UNTUK HASH PASSWORD ====================

/**
 * Hook untuk otomatis hash password sebelum disimpan
 */
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

const ModelUser = mongoose.model('User', skemaUser);

// ==================== FUNGSI UTAMA ====================

/**
 * Fungsi untuk membuat user karyawan di MongoDB Atlas
 */
const buatUserKaryawan = async () => {
  try {
    // Koneksi ke MongoDB Atlas
    console.log('📡 Menghubungkan ke MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB Atlas');

    // ==================== DATA USER KARYAWAN ====================
    /**
     * Data karyawan yang akan dimasukkan ke database
     * Sesuai dengan form modal "Tambah Karyawan Baru" di admin dashboard
     * 
     * Field yang digunakan:
     * - nama_lengkap: Nama lengkap karyawan
     * - email: Email kerja (unique)
     * - password: Password awal (akan di-hash)
     * - jabatan: Posisi/jabatan di perusahaan
     * - role: Selalu 'karyawan' untuk karyawan
     * - jatah_cuti_tahunan: Jumlah cuti tahunan (default 12 hari)
     * - sisa_cuti: Sisa cuti yang masih bisa diambil
     * - adalah_aktif: Status aktif karyawan
     */
    const dataUserKaryawan = [
      {
        nama_lengkap: 'Rendra Pratama',
        email: 'rendra.pratama@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Junior Developer',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      },
      {
        nama_lengkap: 'Linda Setiawan',
        email: 'linda.setiawan@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Content Creator',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      },
      {
        nama_lengkap: 'Arif Gunawan',
        email: 'arif.gunawan@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'System Administrator',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      },
      {
        nama_lengkap: 'Maya Kusuma',
        email: 'maya.kusuma@nusaattend.com',
        password: 'KaryawanSecure123!',
        jabatan: 'Business Analyst',
        role: 'karyawan',
        jatah_cuti_tahunan: 12,
        sisa_cuti: 12,
        adalah_aktif: true
      }
    ];

    // ==================== BUAT USER KARYAWAN BARU ====================

    /**
     * Buat dan simpan user karyawan baru ke database
     */
    const karyawanBerhasil = [];
    const karyawanGagal = [];

    for (const dataKaryawan of dataUserKaryawan) {
      try {
        // Cek apakah user dengan email ini sudah terdaftar
        const userSudahAda = await ModelUser.findOne({ email: dataKaryawan.email });
        
        if (userSudahAda) {
          console.log(`⚠️  User dengan email ${dataKaryawan.email} sudah terdaftar`);
          karyawanGagal.push({
            email: dataKaryawan.email,
            alasan: 'Email sudah terdaftar'
          });
        } else {
          // Buat user karyawan baru
          const userKaryawanBaru = new ModelUser(dataKaryawan);
          await userKaryawanBaru.save();
          
          console.log(`✅ User karyawan berhasil dibuat: ${dataKaryawan.email}`);
          karyawanBerhasil.push(dataKaryawan.email);
        }
      } catch (error) {
        console.error(`❌ Gagal membuat user ${dataKaryawan.email}: ${error.message}`);
        karyawanGagal.push({
          email: dataKaryawan.email,
          alasan: error.message
        });
      }
    }

    // ==================== RINGKASAN HASIL ====================

    console.log('\n========== RINGKASAN HASIL ==========');
    console.log(`✅ Berhasil dibuat: ${karyawanBerhasil.length} karyawan`);
    if (karyawanBerhasil.length > 0) {
      karyawanBerhasil.forEach(email => {
        console.log(`   • ${email}`);
      });
    }
    
    if (karyawanGagal.length > 0) {
      console.log(`\n⚠️  Gagal dibuat: ${karyawanGagal.length} karyawan`);
      karyawanGagal.forEach(item => {
        console.log(`   • ${item.email} (${item.alasan})`);
      });
    }
    
    console.log('=====================================\n');

    console.log('💾 Data telah disimpan ke MongoDB Atlas');
    console.log('\n📧 Kredensial Login Karyawan:');
    console.log('   Password: KaryawanSecure123!');
    console.log('   (Ganti password saat login pertama kali)\n');
    console.log('🌐 Akses http://localhost:3000 dan login sebagai salah satu karyawan di atas');
    console.log('👨‍💼 Atau login sebagai Admin untuk mengelola karyawan di /admin/karyawan\n');

    // Tutup koneksi
    await mongoose.connection.close();
    console.log('🔌 Koneksi MongoDB ditutup');

  } catch (error) {
    console.error('❌ Terjadi kesalahan:');
    console.error(error.message);
    
    // Coba tutup koneksi jika ada error
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
};

// ==================== JALANKAN FUNGSI ====================

/**
 * Panggil fungsi untuk membuat user karyawan
 */
buatUserKaryawan();
