/**
 * ==================== ROUTES RIWAYAT PENGAJUAN ====================
 * Router untuk endpoint API riwayat pengajuan pengguna (karyawan)
 * 
 * Catatan:
 * - Semua endpoint dalam file ini bersifat READ-ONLY
 * - Tidak ada operasi penambahan, perubahan, atau penghapusan data
 * - Endpoint hanya melayani permintaan informasi administratif
 */

const express = require('express');
const router = express.Router();
const riwayatPengajuanController = require('../controllers/riwayatPengajuanController');

/**
 * Route: GET /api/pengguna/riwayat-pengajuan
 * 
 * Deskripsi:
 * Mengambil daftar riwayat pengajuan surat izin milik pengguna (karyawan) yang sedang login.
 * 
 * Method: GET
 * Path: /riwayat-pengajuan
 * 
 * Response Format:
 * {
 *   "success": true,
 *   "message": "Riwayat pengajuan pengguna berhasil diambil",
 *   "data": {
 *     "riwayat_pengajuan": [
 *       {
 *         "jenis_izin": "Cuti Tahunan",
 *         "periode": "15 Des - 20 Des 2025",
 *         "durasi": "6 hari",
 *         "tanggal_pengajuan": "10 Des 2025",
 *         "status_pengajuan": "Menunggu Persetujuan"
 *       },
 *       ...
 *     ]
 *   }
 * }
 * 
 * Status Code:
 * - 200: Request berhasil, data ditemukan atau kosong
 * - 401: Pengguna belum ter-autentikasi
 * - 403: Pengguna tidak memiliki akses (bukan karyawan)
 * - 500: Error server
 */
router.get('/riwayat-pengajuan', riwayatPengajuanController.ambilRiwayatPengajuanPengguna);

module.exports = router;
