const mongoose = require('mongoose');

const pengajuanSchema = new mongoose.Schema(
  {
    id_pengguna: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'ID pengguna harus diisi']
    },
    jenis_pengajuan: {
      type: String,
      enum: ['cuti', 'izin_tidak_masuk', 'izin_sakit', 'wfh'],
      required: [true, 'Jenis pengajuan harus dipilih']
    },
    tanggal_mulai: {
      type: Date,
      required: [true, 'Tanggal mulai harus diisi']
    },
    tanggal_selesai: {
      type: Date,
      required: [true, 'Tanggal selesai harus diisi']
    },
    alasan: {
      type: String,
      required: [true, 'Alasan harus diisi'],
      minlength: [10, 'Alasan minimal 10 karakter']
    },
    status: {
      type: String,
      enum: ['menunggu_persetujuan', 'disetujui', 'ditolak'],
      default: 'menunggu_persetujuan'
    },
    surat_izin: {
      type: String,
      default: null
    },
    ttd_karyawan: {
      type: String,
      default: null
    },
    ttd_penanggung_jawab: {
      type: String,
      default: null
    },
    catatan_penolakan: {
      type: String,
      default: null
    },
    jumlah_hari: {
      type: Number,
      default: 1
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

// Index untuk query yang lebih cepat
pengajuanSchema.index({ id_pengguna: 1, status: 1 });
pengajuanSchema.index({ tanggal_mulai: 1 });

module.exports = mongoose.model('Pengajuan', pengajuanSchema);
