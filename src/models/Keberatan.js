const mongoose = require('mongoose');

/**
 * Schema untuk model Keberatan Administratif
 * Menyimpan data keberatan yang diajukan oleh karyawan
 * untuk ditinjau oleh admin/penanggung jawab
 */
const skemaKeberatan = new mongoose.Schema(
  {
    /**
     * Referensi ke User yang mengajukan keberatan
     * Berisi ObjectId dari pengguna yang membuat pengajuan
     */
    pengaju: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Pengaju harus diisi'],
      index: true
    },

    /**
     * Jenis keberatan yang diajukan
     * Contoh: "Izin Tidak Masuk", "Cuti Tahunan", "Work From Home"
     */
    jenis_keberatan: {
      type: String,
      required: [true, 'Jenis keberatan harus diisi'],
      trim: true,
      enum: [
        'Izin Tidak Masuk',
        'Cuti Tahunan',
        'Izin Sakit',
        'Work From Home',
        'Izin Khusus'
      ]
    },

    /**
     * Deskripsi detail keberatan
     * Penjelasan alasan atau keterangan tambahan
     */
    keterangan: {
      type: String,
      required: [true, 'Keterangan keberatan harus diisi'],
      trim: true,
      minlength: [10, 'Keterangan minimal 10 karakter'],
      maxlength: [1000, 'Keterangan maksimal 1000 karakter']
    },

    /**
     * Status keberatan saat ini
     * menunggu: keberatan baru yang belum ditinjau
     * ditinjau: sedang diproses oleh penanggung jawab
     * selesai: sudah mendapat keputusan (disetujui/ditolak)
     */
    status_keberatan: {
      type: String,
      enum: ['menunggu', 'ditinjau', 'selesai'],
      default: 'menunggu',
      required: true
    },

    /**
     * Tanggal dan waktu keberatan diajukan
     * Otomatis diisi saat dokumen dibuat
     */
    tanggal_pengajuan: {
      type: Date,
      required: true,
      default: Date.now
    },

    /**
     * Tanggal dan waktu pembaruan terakhir
     * Diperbarui setiap kali ada perubahan status
     */
    tanggal_pembaruan: {
      type: Date,
      required: true,
      default: Date.now
    },

    /**
     * Catatan dari admin/penanggung jawab (opsional)
     * Digunakan untuk memberikan alasan keputusan
     */
    catatan_admin: {
      type: String,
      trim: true,
      default: null
    },

    /**
     * Penanggung jawab yang menangani keberatan
     * Referensi ke User dengan role penanggung-jawab
     */
    penanggung_jawab: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    }
  },
  {
    /**
     * Opsi schema untuk tracking waktu
     * timestamps: true akan menambah createdAt dan updatedAt otomatis
     */
    timestamps: false,
    collection: 'keberatan_administratif'
  }
);

/**
 * Pre-save hook untuk memperbarui tanggal_pembaruan
 * Setiap kali dokumen disimpan, tanggal_pembaruan otomatis diupdate
 */
skemaKeberatan.pre('save', function (next) {
  this.tanggal_pembaruan = new Date();
  next();
});

/**
 * Virtual untuk format tanggal yang lebih readable
 * Digunakan di frontend untuk menampilkan tanggal dalam format yang lebih baik
 */
skemaKeberatan.virtual('tanggal_pengajuan_format').get(function () {
  return this.tanggal_pengajuan?.toLocaleDateString('id-ID');
});

// Aktifkan virtual properties saat JSON conversion
skemaKeberatan.set('toJSON', { virtuals: true });

/**
 * Export model Keberatan
 * Menggunakan singular name 'Keberatan' (Mongoose otomatis pluralize ke 'keberatan_administratif')
 */
module.exports = mongoose.model('Keberatan', skemaKeberatan);
