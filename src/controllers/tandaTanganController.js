/**
 * Controller untuk Tanda Tangan Digital Administratif
 * 
 * Tujuan:
 * Menyimpan tanda tangan digital sebagai bukti persetujuan visual administratif
 * dari pengajuan surat izin karyawan.
 * 
 * CATATAN PENTING:
 * - Tanda tangan adalah bukti ADMINISTRATIF, bukan bukti hukum
 * - Tidak mengklaim keabsahan hukum atau kriptografi
 * - Hanya untuk dokumentasi dan review pengajuan
 * - Validitas pengajuan ditentukan oleh proses review Penanggung Jawab
 */

const Pengguna = require('../models/Pengguna');

/**
 * Fungsi: Simpan Tanda Tangan Administratif
 * 
 * Menerima data tanda tangan dari frontend (Base64 string dari canvas)
 * dan menyimpannya ke database MongoDB Atlas.
 * 
 * Data yang disimpan:
 * - tanda_tangan_digital (Base64 string)
 * - tanggal_ditandatangani (timestamp)
 * - keterangan ("Tanda tangan digital administratif")
 * 
 * @param {Object} req - Express request object
 * @param {string} req.body.tanda_tangan_data - Base64 string dari canvas
 * @param {string} req.user.id - User ID dari session/JWT
 * 
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Success response atau error message
 */
async function simpanTandaTanganAdministratif(req, res) {
  try {
    // Ambil data dari request body
    const { tanda_tangan_data } = req.body;
    const userId = req.user.id; // Dari middleware autentikasi
    
    // Validasi input
    if (!tanda_tangan_data) {
      return res.status(400).json({
        success: false,
        message: 'Data tanda tangan harus diisi'
      });
    }
    
    // Validasi format Base64 (sanity check minimal)
    if (typeof tanda_tangan_data !== 'string' || tanda_tangan_data.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Format tanda tangan tidak valid'
      });
    }
    
    // Cari user berdasarkan ID
    const user = await Pengguna.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    // Pastikan user adalah karyawan (hanya karyawan yang bisa menandatangani)
    if (user.role !== 'karyawan') {
      return res.status(403).json({
        success: false,
        message: 'Hanya karyawan yang dapat menyimpan tanda tangan'
      });
    }
    
    // Simpan tanda tangan ke field user
    // Struktur data yang disimpan:
    user.tanda_tangan_digital = {
      data_base64: tanda_tangan_data,
      tanggal_ditandatangani: new Date(),
      keterangan: 'Tanda tangan digital administratif untuk pengajuan surat izin',
      adalah_administratif: true // Flag untuk menunjukkan ini bukan hukum
    };
    
    // Simpan ke database
    await user.save();
    
    // Return success response
    res.json({
      success: true,
      message: 'Tanda tangan administratif berhasil disimpan',
      data: {
        tanggal_ditandatangani: user.tanda_tangan_digital.tanggal_ditandatangani
      }
    });
    
  } catch (error) {
    console.error('Error menyimpan tanda tangan:', error);
    
    // Jangan expose error mentah MongoDB
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat menyimpan tanda tangan. Silakan coba lagi.'
    });
  }
}

/**
 * Fungsi: Ambil Tanda Tangan Administratif (Read-only)
 * 
 * Mengambil data tanda tangan dari database untuk ditampilkan
 * di halaman review pengajuan (Penanggung Jawab).
 * 
 * Hanya menampilkan:
 * - tanda_tangan_digital (Base64)
 * - tanggal_ditandatangani
 * 
 * @param {Object} req - Express request object
 * @param {string} req.params.userId - User ID untuk ambil tanda tangan
 * 
 * @param {Object} res - Express response object
 * 
 * @returns {JSON} Tanda tangan data atau 404
 */
async function ambilTandaTanganAdministratif(req, res) {
  try {
    const { userId } = req.params;
    
    // Cari user
    const user = await Pengguna.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan'
      });
    }
    
    // Cek apakah user memiliki tanda tangan
    if (!user.tanda_tangan_digital || !user.tanda_tangan_digital.data_base64) {
      return res.status(404).json({
        success: false,
        message: 'Tanda tangan tidak ditemukan untuk pengguna ini'
      });
    }
    
    // Return tanda tangan (read-only)
    res.json({
      success: true,
      data: {
        tanda_tangan_digital: user.tanda_tangan_digital.data_base64,
        tanggal_ditandatangani: user.tanda_tangan_digital.tanggal_ditandatangani,
        keterangan: user.tanda_tangan_digital.keterangan
      }
    });
    
  } catch (error) {
    console.error('Error mengambil tanda tangan:', error);
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil tanda tangan'
    });
  }
}

module.exports = {
  simpanTandaTanganAdministratif,
  ambilTandaTanganAdministratif
};
