const mongoose = require('mongoose');

const absensiSchema = new mongoose.Schema(
  {
    id_pengguna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID pengguna harus diisi']
    },
    tanggal: {
      type: Date,
      required: [true, 'Tanggal harus diisi']
    },
    jam_masuk: {
      type: String,
      default: null
    },
    jam_pulang: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['hadir', 'izin', 'cuti', 'tidak_hadir', 'sakit'],
      default: 'tidak_hadir'
    },
    keterangan: {
      type: String,
      default: null
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

// Composite index untuk query yang efisien
absensiSchema.index({ id_pengguna: 1, tanggal: -1 });
absensiSchema.index({ tanggal: 1 });

module.exports = mongoose.model('Absensi', absensiSchema);
