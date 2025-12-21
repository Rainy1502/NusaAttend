const mongoose = require('mongoose');

/**
 * Schema untuk model Pengajuan (Surat Izin)
 * Menyimpan pengajuan izin dari karyawan beserta status review
 */
const schemaPengajuan = new mongoose.Schema(
  {
    karyawan_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Karyawan ID harus diisi']
    },
    jenis_izin: {
      type: String,
      enum: ['cuti-tahunan', 'izin-tidak-masuk', 'izin-sakit', 'wfh'],
      required: [true, 'Jenis izin harus dipilih']
    },
    tanggal_mulai: {
      type: Date,
      required: [true, 'Tanggal mulai harus diisi'],
      validate: {
        validator: function(value) {
          // Tanggal mulai tidak boleh di masa lalu
          const hariIni = new Date();
          hariIni.setHours(0, 0, 0, 0);
          return value >= hariIni;
        },
        message: 'Tanggal mulai tidak boleh di masa lalu'
      }
    },
    tanggal_selesai: {
      type: Date,
      required: [true, 'Tanggal selesai harus diisi'],
      validate: {
        validator: function(value) {
          // Tanggal selesai harus >= tanggal mulai
          return value >= this.tanggal_mulai;
        },
        message: 'Tanggal selesai harus lebih besar atau sama dengan tanggal mulai'
      }
    },
    alasan: {
      type: String,
      required: [true, 'Alasan harus diisi'],
      minlength: [10, 'Alasan minimal 10 karakter'],
      maxlength: [500, 'Alasan maksimal 500 karakter']
    },
    tanda_tangan_base64: {
      type: String,
      required: [true, 'Tanda tangan harus disediakan']
    },
    status: {
      type: String,
      enum: ['menunggu', 'disetujui', 'ditolak'],
      default: 'menunggu'
    },
    penanggung_jawab_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    keterangan_review: {
      type: String,
      default: null
    },
    tanggal_direview: {
      type: Date,
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
  }
);

/**
 * Pre-save hook untuk validasi bisnis tambahan
 * Memastikan durasi izin tidak lebih dari 1 tahun
 */
schemaPengajuan.pre('save', function(next) {
  // Hitung durasi izin
  const durasi = Math.ceil((this.tanggal_selesai - this.tanggal_mulai) / (1000 * 60 * 60 * 24));
  
  // Validasi durasi maksimal (365 hari)
  if (durasi > 365) {
    return next(new Error('Durasi izin tidak boleh lebih dari 365 hari'));
  }
  
  next();
});

/**
 * Virtual field untuk menampilkan durasi dalam hari
 */
schemaPengajuan.virtual('durasi_hari').get(function() {
  return Math.ceil((this.tanggal_selesai - this.tanggal_mulai) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
schemaPengajuan.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Pengajuan', schemaPengajuan, 'pengajuan');
