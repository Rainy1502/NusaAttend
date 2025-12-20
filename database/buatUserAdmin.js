/**
 * Script untuk membuat user admin secara langsung ke MongoDB Atlas
 * Dijalankan satu kali untuk inisialisasi data admin
 * 
 * Penggunaan:
 * node database/buatUserAdmin.js
 * atau
 * cd database && node buatUserAdmin.js
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
      default: 'admin'
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
 * Fungsi untuk membuat user admin di MongoDB Atlas
 */
const buatUserAdmin = async () => {
  try {
    // Koneksi ke MongoDB Atlas
    console.log('📡 Menghubungkan ke MongoDB Atlas...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Terhubung ke MongoDB Atlas');

    // ==================== DATA USER ADMIN ====================
    /**
     * Data admin yang akan dimasukkan ke database
     * Ubah password sesuai kebutuhan
     */
    const dataUserAdmin = {
      nama_lengkap: 'Administrator NusaAttend',
      email: 'admin@nusaattend.com',
      password: 'admin123', // Password akan di-hash otomatis oleh pre-save hook
      jabatan: 'Administrator Sistem',
      role: 'admin',
      jatah_cuti_tahunan: 0,
      sisa_cuti: 0,
      adalah_aktif: true
    };

    // ==================== CEK USER ADMIN SUDAH ADA ATAU BELUM ====================

    /**
     * Cek apakah user admin dengan email ini sudah terdaftar
     */
    const userSudahAda = await ModelUser.findOne({ email: dataUserAdmin.email });
    
    if (userSudahAda) {
      console.log('⚠️  User admin dengan email ini sudah terdaftar');
      console.log('📧 Email: ' + userSudahAda.email);
      console.log('👤 Nama: ' + userSudahAda.nama_lengkap);
      console.log('\n💡 Jika ingin membuat user baru, ubah email atau jalankan script dengan email berbeda');
      process.exit(0);
    }

    // ==================== BUAT USER ADMIN BARU ====================

    /**
     * Buat dan simpan user admin baru ke database
     */
    const userAdminBaru = new ModelUser(dataUserAdmin);
    await userAdminBaru.save();

    console.log('✅ User admin berhasil dibuat!');
    console.log('\n========== DATA USER ADMIN ==========');
    console.log('📧 Email:     ' + dataUserAdmin.email);
    console.log('🔐 Password:  ' + dataUserAdmin.password);
    console.log('👤 Nama:      ' + dataUserAdmin.nama_lengkap);
    console.log('💼 Jabatan:   ' + dataUserAdmin.jabatan);
    console.log('🔑 Role:      ' + dataUserAdmin.role);
    console.log('=====================================\n');

    console.log('💾 Data telah disimpan ke MongoDB Atlas');
    console.log('🌐 Silakan login di http://localhost:3000 menggunakan kredensial di atas');

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
 * Panggil fungsi untuk membuat user admin
 */
buatUserAdmin();
