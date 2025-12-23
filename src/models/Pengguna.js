const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

/**
 * Schema untuk model User (Pengguna)
 * Menyimpan informasi pengguna, kredensial, dan data cuti
 */
const skemaUser = new mongoose.Schema(
  {
    nama_lengkap: {
      type: String,
      required: [true, "Nama lengkap harus diisi"],
      trim: true,
      minlength: [3, "Nama minimal 3 karakter"],
    },
    email: {
      type: String,
      required: [true, "Email harus diisi"],
      unique: [true, "Email sudah terdaftar"],
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Format email tidak valid"],
    },
    password: {
      type: String,
      required: [true, "Password harus diisi"],
      minlength: [6, "Password minimal 6 karakter"],
      select: false, // Jangan include password saat query default
    },
    jabatan: {
      type: String,
      required: [true, "Jabatan harus diisi"],
      trim: true,
    },
    role: {
      type: String,
      enum: ["karyawan", "penanggung-jawab", "admin"],
      default: "karyawan",
    },
    jatah_cuti_tahunan: {
      type: Number,
      default: 12,
    },
    sisa_cuti: {
      type: Number,
      default: 12,
    },
    adalah_aktif: {
      type: Boolean,
      default: true,
    },
    penanggung_jawab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: function () {
        // Hanya wajib untuk role 'karyawan', tidak untuk penanggung-jawab/admin
        return this.role === "karyawan";
      },
      validate: {
        async: true,
        validator: async function (value) {
          // Skip validation jika tidak required (penanggung-jawab/admin)
          if (this.role !== "karyawan") return true;
          if (!value) return false;

          const supervisor = await mongoose.model("User").findById(value);
          return supervisor && supervisor.role === "penanggung-jawab";
        },
        message: "Penanggung jawab harus memiliki role penanggung-jawab",
      },
    },
    dibuat_pada: {
      type: Date,
      default: Date.now,
    },
    diperbarui_pada: {
      type: Date,
      default: Date.now,
    },
    /**
     * [FITUR BARU - Tanda Tangan Administratif]
     * Menyimpan tanda tangan digital administratif dari pengajuan surat izin
     *
     * CATATAN: Bersifat administratif, bukan bukti hukum
     */
    tanda_tangan_digital: {
      data_base64: {
        type: String,
        default: null,
      },
      tanggal_ditandatangani: {
        type: Date,
        default: null,
      },
      keterangan: {
        type: String,
        default: null,
      },
      adalah_administratif: {
        type: Boolean,
        default: true,
      },
    },
    /**
     * [FITUR BARU - Pemulihan Password]
     * Menyimpan informasi untuk reset password via email link
     * - Token reset dikirim ke email pengguna
     * - Token berlaku 30 menit
     * - Brute force protection: max 5 percobaan per jam
     */
    pemulihan_password: {
      token_reset: {
        type: String,
        default: null,
        select: false, // Jangan include token saat query default untuk keamanan
      },
      token_reset_kadaluarsa_pada: {
        type: Date,
        default: null,
      },
      percobaan_pemulihan: {
        type: Number,
        default: 0,
      },
      percobaan_terakhir_pada: {
        type: Date,
        default: null,
      },
    },
  },
  { timestamps: true }
);

/**
 * Pre-save hook untuk hash password sebelum disimpan ke database
 * Menggunakan bcrypt untuk keamanan password
 */
skemaUser.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

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
skemaUser.methods.bandingkanPassword = async function (passwordInput) {
  if (!this.password) {
    throw new Error("Password pengguna tidak ditemukan di database");
  }
  return await bcrypt.compare(passwordInput, this.password);
};

/**
 * Method untuk konversi document ke JSON tanpa password
 * Digunakan agar password tidak case ketika mengirim data ke client
 */
skemaUser.methods.keJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", skemaUser, "pengguna");
