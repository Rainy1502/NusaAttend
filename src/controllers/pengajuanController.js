const Pengajuan = require('../models/Pengajuan');
const Pengguna = require('../models/Pengguna');

/**
 * Controller untuk mengelola pengajuan surat izin (Pengajuan)
 * Menangani CRUD dan validasi pengajuan dari karyawan
 */

/**
 * POST /api/karyawan/pengajuan
 * Membuat pengajuan surat izin baru dengan validasi tanggal
 * 
 * Request Body:
 * {
 *   jenis_izin: "cuti-tahunan|izin-tidak-masuk|izin-sakit|wfh",
 *   tanggal_mulai: "YYYY-MM-DD",
 *   tanggal_selesai: "YYYY-MM-DD",
 *   alasan: "Alasan izin...",
 *   tanda_tangan_base64: "data:image/png;base64,..."
 * }
 * 
 * Validasi yang dilakukan:
 * - Tanggal mulai tidak boleh di masa lalu
 * - Tanggal selesai tidak boleh sebelum tanggal mulai
 * - Durasi tidak boleh lebih dari 365 hari (1 tahun)
 * - Semua field harus terisi
 */
async function buatPengajuan(req, res) {
  try {
    // Ambil user ID dari session atau JWT (set oleh middleware auth)
    const userId = req.userId || (req.user && req.user.id) || (req.user && req.user._id);
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Autentikasi gagal: user ID tidak ditemukan'
      });
    }

    const { jenis_izin, tanggal_mulai, tanggal_selesai, alasan, tanda_tangan_base64 } = req.body;

    // ==================== VALIDASI INPUT ====================
    
    // Cek field required
    if (!jenis_izin || !tanggal_mulai || !tanggal_selesai || !alasan || !tanda_tangan_base64) {
      return res.status(400).json({
        success: false,
        message: 'Semua field harus diisi (jenis_izin, tanggal_mulai, tanggal_selesai, alasan, tanda_tangan_base64)'
      });
    }

    // Parse tanggal dari string YYYY-MM-DD
    const mulai = new Date(tanggal_mulai);
    const selesai = new Date(tanggal_selesai);

    // Cek apakah tanggal valid
    if (isNaN(mulai.getTime()) || isNaN(selesai.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Format tanggal tidak valid. Gunakan format YYYY-MM-DD'
      });
    }

    // ==================== VALIDASI TANGGAL ====================

    // Set waktu ke 00:00:00 untuk perbandingan hari
    mulai.setHours(0, 0, 0, 0);
    selesai.setHours(0, 0, 0, 0);

    // Cek 1: Tanggal mulai tidak boleh di masa lalu
    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);

    if (mulai < hariIni) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal mulai tidak boleh di masa lalu. Pilih tanggal mulai dari hari ini atau yang akan datang.',
        tanggal_hari_ini: hariIni.toISOString().split('T')[0]
      });
    }

    // Cek 2: Tanggal selesai harus >= tanggal mulai
    if (selesai < mulai) {
      return res.status(400).json({
        success: false,
        message: 'Tanggal selesai harus sama dengan atau setelah tanggal mulai'
      });
    }

    // Cek 3: Durasi izin tidak boleh lebih dari 365 hari (1 tahun)
    const durasi = Math.ceil((selesai - mulai) / (1000 * 60 * 60 * 24));
    
    if (durasi > 365) {
      return res.status(400).json({
        success: false,
        message: `Durasi izin tidak boleh lebih dari 365 hari. Durasi yang Anda ajukan: ${durasi} hari`,
        max_durasi_hari: 365,
        durasi_ajukan: durasi
      });
    }

    // ==================== VALIDASI TANDA TANGAN ====================

    // Cek format Base64 untuk tanda tangan
    if (!tanda_tangan_base64.startsWith('data:image/')) {
      return res.status(400).json({
        success: false,
        message: 'Tanda tangan harus dalam format Base64 gambar (data:image/...)'
      });
    }

    // ==================== VALIDASI JENIS IZIN ====================

    const jenis_izin_valid = ['cuti-tahunan', 'izin-tidak-masuk', 'izin-sakit', 'wfh'];
    if (!jenis_izin_valid.includes(jenis_izin)) {
      return res.status(400).json({
        success: false,
        message: `Jenis izin tidak valid. Pilih salah satu: ${jenis_izin_valid.join(', ')}`
      });
    }

    // ==================== CARI PENANGGUNG JAWAB DARI USER ====================

    const user = await Pengguna.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User tidak ditemukan'
      });
    }

    if (user.role !== 'karyawan') {
      return res.status(403).json({
        success: false,
        message: 'Hanya karyawan yang dapat membuat pengajuan'
      });
    }

    // ==================== BUAT PENGAJUAN ====================

    const pengajuan = new Pengajuan({
      karyawan_id: userId,
      jenis_izin,
      tanggal_mulai: mulai,
      tanggal_selesai: selesai,
      alasan: alasan.trim(),
      tanda_tangan_base64,
      penanggung_jawab_id: user.penanggung_jawab_id
    });

    await pengajuan.save();

    console.log(`✓ Pengajuan baru dibuat oleh karyawan ${user.nama_lengkap} (${userId})`);
    console.log(`  Jenis: ${jenis_izin}, Periode: ${tanggal_mulai} s/d ${tanggal_selesai}, Durasi: ${durasi} hari`);

    return res.status(201).json({
      success: true,
      message: 'Pengajuan berhasil dikirim',
      data: {
        pengajuan_id: pengajuan._id,
        jenis_izin: pengajuan.jenis_izin,
        tanggal_mulai: pengajuan.tanggal_mulai,
        tanggal_selesai: pengajuan.tanggal_selesai,
        durasi_hari: durasi,
        status: pengajuan.status,
        dibuat_pada: pengajuan.dibuat_pada
      }
    });

  } catch (error) {
    console.error('Error saat membuat pengajuan:', error.message);

    // Handle validation errors dari Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validasi gagal',
        errors: messages
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server saat membuat pengajuan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * GET /api/karyawan/pengajuan
 * Ambil daftar pengajuan dari karyawan yang login
 */
async function ambilPengajuanKaryawan(req, res) {
  try {
    const userId = req.user._id;

    const pengajuan = await Pengajuan.find({ karyawan_id: userId })
      .populate('karyawan_id', 'nama_lengkap email jabatan')
      .populate('penanggung_jawab_id', 'nama_lengkap email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: 'Data pengajuan berhasil diambil',
      data: pengajuan
    });

  } catch (error) {
    console.error('Error saat mengambil pengajuan:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}

/**
 * GET /api/karyawan/pengajuan/:id
 * Ambil detail pengajuan tertentu
 */
async function ambilDetailPengajuan(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const pengajuan = await Pengajuan.findById(id)
      .populate('karyawan_id', 'nama_lengkap email jabatan')
      .populate('penanggung_jawab_id', 'nama_lengkap email');

    if (!pengajuan) {
      return res.status(404).json({
        success: false,
        message: 'Pengajuan tidak ditemukan'
      });
    }

    // Hanya karyawan pemilik atau admin yang bisa lihat
    if (pengajuan.karyawan_id._id.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Anda tidak memiliki akses ke pengajuan ini'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Detail pengajuan berhasil diambil',
      data: pengajuan
    });

  } catch (error) {
    console.error('Error saat mengambil detail pengajuan:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server'
    });
  }
}

module.exports = {
  buatPengajuan,
  ambilPengajuanKaryawan,
  ambilDetailPengajuan
};
