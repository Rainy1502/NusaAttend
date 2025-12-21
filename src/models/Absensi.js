const mongoose = require('mongoose');

const skemaAbsensi = new mongoose.Schema(
  {
    // Relasi ke user
    id_pengguna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    // Tanggal absensi (hanya tanggal, tanpa jam)
    tanggal: {
      type: Date,
      required: true,
      index: true
    },

    // Jam masuk (HH:mm)
    jam_masuk: {
      type: String,
      default: null
    },

    // Jam pulang (HH:mm)
    jam_pulang: {
      type: String,
      default: null
    },

    // Status kehadiran
    status: {
      type: String,
      enum: ['hadir', 'izin', 'cuti', 'tidak_hadir'],
      default: 'hadir'
    },

    // Keterangan tambahan
    keterangan: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

/**
 * 🔒 Constraint penting:
 * Satu user hanya boleh punya SATU dokumen absensi per hari
 */
skemaAbsensi.index(
  { id_pengguna: 1, tanggal: 1 },
  { unique: true }
);

module.exports = mongoose.model('Absensi', skemaAbsensi);
