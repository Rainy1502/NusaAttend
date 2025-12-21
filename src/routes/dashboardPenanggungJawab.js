const express = require('express');
const dashboardPenanggungJawabController = require('../controllers/dashboardPenanggungJawabController');

/**
 * Router untuk API Dashboard Penanggung Jawab
 * Menangani endpoint pengambilan data ringkasan dan aktivitas terbaru
 * 
 * Tujuan: Menyuplai data untuk halaman dashboard penanggung jawab yang berfungsi
 * sebagai ringkasan kondisi tim dan portal masuk ke halaman manajemen
 * 
 * Base path: /api/penanggung-jawab (didefinisikan di app.js)
 * Sifat: Read-only (tidak ada operasi create/update/delete)
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/penanggung-jawab/dashboard
 * 
 * Mengambil data dashboard penanggung jawab berupa ringkasan statistik dan aktivitas terbaru
 * 
 * Data yang dikembalikan:
 * 1. Ringkasan (summary):
 *    - total_karyawan: Jumlah user dengan role 'karyawan'
 *    - total_penanggung_jawab: Jumlah user dengan role 'penanggung-jawab'
 *    - total_akun_aktif: Jumlah user dengan status aktif (adalah_aktif: true)
 *    - total_aktivitas_hari_ini: Jumlah user yang dibuat atau diupdate hari ini
 * 
 * 2. Aktivitas Terbaru (maksimal 5 data):
 *    - Diambil dari user terakhir yang diupdate
 *    - Berisi: deskripsi, nama_pengguna, jabatan, waktu_relatif
 * 
 * Digunakan oleh: Halaman Dashboard Penanggung Jawab (GET /penanggung-jawab/dashboard)
 * 
 * @route GET /api/penanggung-jawab/dashboard
 * @returns {Object} { success, message, data: { ringkasan: {}, aktivitas_terbaru: [] } }
 * 
 * Response example:
 * {
 *   "success": true,
 *   "message": "Data dashboard penanggung jawab berhasil diambil",
 *   "data": {
 *     "ringkasan": {
 *       "total_karyawan": 24,
 *       "total_penanggung_jawab": 3,
 *       "total_akun_aktif": 27,
 *       "total_aktivitas_hari_ini": 2
 *     },
 *     "aktivitas_terbaru": [
 *       {
 *         "deskripsi": "Akun karyawan baru dibuat",
 *         "nama_pengguna": "Andi Pratama",
 *         "jabatan": "Staff IT",
 *         "waktu_relatif": "2 jam lalu"
 *       },
 *       ...
 *     ]
 *   }
 * }
 */
router.get(
  '/dashboard',
  dashboardPenanggungJawabController.ambilDataDashboardPenanggungJawab
);

module.exports = router;
