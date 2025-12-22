/**
 * ==================== REVIEW PENGAJUAN CONTROLLER ====================
 * 
 * Controller ini menyediakan endpoint READ-ONLY untuk halaman Review Pengajuan.
 * 
 * SIFAT: ADMINISTRATIF & INFORMASIONAL SAJA (view-only)
 * - Mengambil daftar pengajuan untuk ditampilkan di frontend
 * - TIDAK melakukan approval atau rejection
 * - TIDAK mengubah status pengajuan
 * - TIDAK menyimpan keputusan
 * 
 * SUMBER DATA:
 * - Model Pengguna (MongoDB)
 * - Tidak ada model Pengajuan terpisah dalam sistem
 * - Data dikembalikan sebagai array kosong jika tidak ada
 * 
 * ALASAN TIDAK ADA APPROVAL:
 * - Review Pengajuan adalah TAMPILAN PASIF administratif
 * - Sistem approval formal belum ada di project ini
 * - Backend hanya bertanggung jawab menyuplai data untuk ditampilkan
 */

const Pengguna = require('../models/Pengguna');
const Pengajuan = require('../models/Pengajuan');

/**
 * Mengambil daftar pengajuan untuk review
 * 
 * READ-ONLY: Hanya mengambil dan menampilkan data
 * TIDAK ada logika approval atau perubahan status
 * 
 * @route   GET /api/pengguna/review-pengajuan
 * @access  Private (Admin/Penanggung Jawab)
 * @returns {Object} Response dengan struktur {success, message, data: {daftar_pengajuan}}
 */
async function ambilDaftarPengajuanReview(req, res) {
  try {
    console.log('📥 Mengambil daftar pengajuan untuk review...');

    // ==================== QUERY DATA PENGAJUAN ====================
    // Ambil semua pengajuan dengan status "menunggu" review
    // Populate karyawan_id untuk mendapat informasi nama dan jabatan
    
    const daftarPengajuan = await Pengajuan.find({ status: 'menunggu' })
      .populate('karyawan_id', 'nama_lengkap jabatan email')
      .sort({ dibuat_pada: -1 })
      .lean()
      .exec();

    // Transform data untuk frontend display
    const pengajuanFormatted = daftarPengajuan.map(pengajuan => {
      const durasi = Math.ceil(
        (new Date(pengajuan.tanggal_selesai) - new Date(pengajuan.tanggal_mulai)) / 
        (1000 * 60 * 60 * 24)
      );

      return {
        _id: pengajuan._id,
        nama_pengguna: pengajuan.karyawan_id?.nama_lengkap || 'Unknown',
        email_pengguna: pengajuan.karyawan_id?.email || 'Unknown',
        jabatan_pengguna: pengajuan.karyawan_id?.jabatan || 'Unknown',
        jenis_izin: pengajuan.jenis_izin,
        tanggal_mulai: pengajuan.tanggal_mulai,
        tanggal_selesai: pengajuan.tanggal_selesai,
        durasi_hari: durasi,
        alasan: pengajuan.alasan,
        tanggal_diajukan: pengajuan.dibuat_pada,
        status: pengajuan.status
      };
    });
    
    console.log(`✅ Daftar pengajuan siap: ${pengajuanFormatted.length} item`);

    // ==================== RESPONSE ====================
    // Format response HARUS sesuai dengan frontend requirement (WAJIB)
    res.status(200).json({
      success: true,
      message: 'Daftar pengajuan menunggu review berhasil diambil',
      data: {
        daftar_pengajuan: pengajuanFormatted
      }
    });

  } catch (error) {
    // Error handling yang defensif dan manusiawi
    console.error('❌ Error saat mengambil daftar pengajuan:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil daftar pengajuan',
      data: null
    });
  }
}

/**
 * Alias untuk ambilDaftarPengajuanReview
 * Nama lama untuk backward compatibility jika ada
 */
async function ambilDaftarPengajuanMenunggu(req, res) {
  return ambilDaftarPengajuanReview(req, res);
}

// ==================== EXPORT ====================
module.exports = {
  ambilDaftarPengajuanReview,
  ambilDaftarPengajuanMenunggu
};
