const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

/**
 * Schema untuk model User (Pengguna)
 * Menyimpan informasi pengguna, kredensial, dan data cuti
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
      select: false // Jangan include password saat query default
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
    penanggung_jawab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() {
        // Hanya wajib untuk role 'karyawan', tidak untuk supervisor/admin
        return this.role === 'karyawan';
      },
      validate: {
        async: true,
        validator: async function(value) {
          // Skip validation jika tidak required (supervisor/admin)
          if (this.role !== 'karyawan') return true;
          if (!value) return false;
          
          const supervisor = await mongoose.model('User').findById(value);
          return supervisor && supervisor.role === 'supervisor';
        },
        message: 'Penanggung jawab harus memiliki role supervisor'
      }
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

/**
 * Pre-save hook untuk hash password sebelum disimpan ke database
 * Menggunakan bcrypt untuk keamanan password
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

/**
 * Method untuk membandingkan password input dengan password di database
 * Digunakan saat login untuk verifikasi password
 */
skemaUser.methods.bandingkanPassword = async function(passwordInput) {
  if (!this.password) {
    throw new Error('Password pengguna tidak ditemukan di database');
  }
  return await bcrypt.compare(passwordInput, this.password);
};

/**
 * Method untuk konversi document ke JSON tanpa password
 * Digunakan agar password tidak case ketika mengirim data ke client
 */
skemaUser.methods.keJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', skemaUser);
