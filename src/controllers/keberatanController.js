const Keberatan = require('../models/Keberatan');
const User = require('../models/User');

/**
 * Controller untuk mengelola Keberatan Administratif
 * Berisi fungsi-fungsi untuk CRUD keberatan dan perubahan status
 */

/**
 * Fungsi: ambilSemuaKeberatan
 * 
 * Mengambil seluruh data keberatan dari database
 * Diurutkan berdasarkan tanggal pengajuan (terbaru dulu)
 * Data dikembalikan dengan informasi pengaju dan penanggung jawab
 * 
 * Digunakan oleh: Halaman Log Keberatan Admin (GET /api/admin/keberatan)
 * 
 * @param {Object} req - Request object dari Express
 * @param {Object} res - Response object dari Express
 */
exports.ambilSemuaKeberatan = async (req, res) => {
  try {
    /**
     * Query keberatan dengan populate referensi User
     * select() untuk membatasi field yang ditampilkan (security)
     */
    const daftarKeberatan = await Keberatan.find()
      .populate('pengaju', 'nama_lengkap jabatan email')
      .populate('penanggung_jawab', 'nama_lengkap email')
      .sort({ tanggal_pengajuan: -1 }) // Terbaru dulu
      .lean(); // Gunakan lean() untuk query lebih cepat (read-only)

    /**
     * Hitung statistik keberatan berdasarkan status
     * Digunakan untuk menampilkan kartu statistik di halaman admin
     */
    const statistik = {
      total: daftarKeberatan.length,
      menunggu: daftarKeberatan.filter(k => k.status_keberatan === 'menunggu').length,
      ditinjau: daftarKeberatan.filter(k => k.status_keberatan === 'ditinjau').length,
      selesai: daftarKeberatan.filter(k => k.status_keberatan === 'selesai').length
    };

    // Response sukses dengan format konsisten
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil semua data keberatan',
      data: daftarKeberatan,
      statistik: statistik
    });
  } catch (error) {
    // Error handling yang aman (tidak expose MongoDB error mentah)
    console.error('Error ambilSemuaKeberatan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data keberatan',
      error: error.message
    });
  }
};

/**
 * Fungsi: ambilKeberatanById
 * 
 * Mengambil satu data keberatan berdasarkan ID
 * Digunakan untuk menampilkan detail keberatan di modal atau page terpisah
 * Validasi ObjectId untuk memastikan format ID valid
 * 
 * @param {Object} req - Request object (req.params.id berisi keberatan ID)
 * @param {Object} res - Response object
 */
exports.ambilKeberatanById = async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Validasi format ObjectId
     * Mencegah error query jika format ID tidak valid
     */
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID keberatan tidak valid'
      });
    }

    /**
     * Query keberatan dengan populate data pengaju dan penanggung jawab
     */
    const keberatan = await Keberatan.findById(id)
      .populate('pengaju', 'nama_lengkap jabatan email')
      .populate('penanggung_jawab', 'nama_lengkap email');

    // Handle jika keberatan tidak ditemukan
    if (!keberatan) {
      return res.status(404).json({
        success: false,
        message: 'Data keberatan tidak ditemukan'
      });
    }

    // Response sukses
    res.status(200).json({
      success: true,
      message: 'Berhasil mengambil detail keberatan',
      data: keberatan
    });
  } catch (error) {
    console.error('Error ambilKeberatanById:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil detail keberatan',
      error: error.message
    });
  }
};

/**
 * Fungsi: tambahKeberatan
 * 
 * Menambahkan data keberatan baru ke database
 * Dipanggil oleh karyawan yang ingin mengajukan keberatan
 * Status awal selalu "menunggu" hingga ditinjau admin
 * 
 * Request body harus berisi:
 * - jenis_keberatan: string (dari enum)
 * - keterangan: string (minimal 10 karakter)
 * 
 * @param {Object} req - Request object (req.body berisi data keberatan baru)
 * @param {Object} res - Response object
 */
exports.tambahKeberatan = async (req, res) => {
  try {
    const { jenis_keberatan, keterangan } = req.body;

    /**
     * Validasi input dari request body
     * Memastikan field wajib tersedia
     */
    if (!jenis_keberatan || !keterangan) {
      return res.status(400).json({
        success: false,
        message: 'Jenis keberatan dan keterangan harus diisi'
      });
    }

    /**
     * Validasi enum untuk jenis_keberatan
     */
    const jenisKeberatanValid = [
      'Izin Tidak Masuk',
      'Cuti Tahunan',
      'Izin Sakit',
      'Work From Home',
      'Izin Khusus'
    ];

    if (!jenisKeberatanValid.includes(jenis_keberatan)) {
      return res.status(400).json({
        success: false,
        message: 'Jenis keberatan tidak valid'
      });
    }

    /**
     * Buat dokumen keberatan baru
     * Pengaju diambil dari session user yang login
     * Status awal selalu "menunggu"
     */
    const keberatanBaru = new Keberatan({
      pengaju: req.session.userId, // Dari session user yang login
      jenis_keberatan: jenis_keberatan,
      keterangan: keterangan,
      status_keberatan: 'menunggu', // Status awal selalu menunggu
      tanggal_pengajuan: new Date(),
      tanggal_pembaruan: new Date()
    });

    /**
     * Simpan ke database
     * Validasi Mongoose schema akan berjalan otomatis
     */
    await keberatanBaru.save();

    // Populate data pengaju sebelum response
    await keberatanBaru.populate('pengaju', 'nama_lengkap jabatan email');

    // Response sukses dengan data keberatan yang baru dibuat
    res.status(201).json({
      success: true,
      message: 'Keberatan berhasil diajukan',
      data: keberatanBaru
    });
  } catch (error) {
    console.error('Error tambahKeberatan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengajukan keberatan',
      error: error.message
    });
  }
};

/**
 * Fungsi: perbaruiStatusKeberatan
 * 
 * Mengubah status keberatan (ditinjau / selesai)
 * Hanya bisa dilakukan oleh admin atau penanggung jawab
 * Status yang valid: "menunggu", "ditinjau", "selesai"
 * 
 * Request body harus berisi:
 * - status_keberatan: string (dari enum)
 * - catatan_admin: string (opsional, alasan keputusan)
 * 
 * @param {Object} req - Request object (req.params.id + req.body)
 * @param {Object} res - Response object
 */
exports.perbaruiStatusKeberatan = async (req, res) => {
  try {
    const { id } = req.params;
    const { status_keberatan, catatan_admin } = req.body;

    /**
     * Validasi format ObjectId
     */
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID keberatan tidak valid'
      });
    }

    /**
     * Validasi status yang dikirim
     * Hanya status yang ada di enum yang diterima
     */
    const statusValid = ['menunggu', 'ditinjau', 'selesai'];
    if (!status_keberatan || !statusValid.includes(status_keberatan)) {
      return res.status(400).json({
        success: false,
        message: 'Status keberatan tidak valid. Gunakan: menunggu, ditinjau, atau selesai'
      });
    }

    /**
     * Cari keberatan berdasarkan ID
     * Gunakan findByIdAndUpdate untuk update dan return dalam satu operasi
     */
    const keberatanDiupdate = await Keberatan.findByIdAndUpdate(
      id,
      {
        status_keberatan: status_keberatan,
        tanggal_pembaruan: new Date(),
        catatan_admin: catatan_admin || null,
        penanggung_jawab: req.session.userId // Set penanggung jawab yang update
      },
      { new: true, runValidators: true } // Return dokumen yang sudah diupdate
    ).populate('pengaju', 'nama_lengkap jabatan email')
      .populate('penanggung_jawab', 'nama_lengkap email');

    // Handle jika keberatan tidak ditemukan
    if (!keberatanDiupdate) {
      return res.status(404).json({
        success: false,
        message: 'Data keberatan tidak ditemukan'
      });
    }

    // Response sukses
    res.status(200).json({
      success: true,
      message: 'Status keberatan berhasil diperbarui',
      data: keberatanDiupdate
    });
  } catch (error) {
    console.error('Error perbaruiStatusKeberatan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat memperbarui status keberatan',
      error: error.message
    });
  }
};

/**
 * Fungsi: hapusKeberatan
 * 
 * Menghapus data keberatan dari database
 * Digunakan untuk kebutuhan administratif (cleanup data)
 * Hanya admin yang bisa menghapus keberatan
 * 
 * @param {Object} req - Request object (req.params.id)
 * @param {Object} res - Response object
 */
exports.hapusKeberatan = async (req, res) => {
  try {
    const { id } = req.params;

    /**
     * Validasi format ObjectId
     */
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Format ID keberatan tidak valid'
      });
    }

    /**
     * Hapus keberatan berdasarkan ID
     */
    const keberatanDihapus = await Keberatan.findByIdAndDelete(id);

    // Handle jika keberatan tidak ditemukan
    if (!keberatanDihapus) {
      return res.status(404).json({
        success: false,
        message: 'Data keberatan tidak ditemukan'
      });
    }

    // Response sukses
    res.status(200).json({
      success: true,
      message: 'Keberatan berhasil dihapus',
      data: { id: keberatanDihapus._id }
    });
  } catch (error) {
    console.error('Error hapusKeberatan:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menghapus keberatan',
      error: error.message
    });
  }
};
