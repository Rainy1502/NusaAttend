const express = require('express');
const { ambilDataDashboardPenanggungJawab } = require('../controllers/dashboardPenanggungJawabController');

/**
 * ==================== ROUTER: DASHBOARD PENANGGUNG JAWAB ====================
 * 
 * Router ini menyediakan endpoint READ-ONLY untuk halaman Dashboard Penanggung Jawab.
 * 
 * BASE PATH: /api/pengguna (didefinisikan di app.js)
 * 
 * SIFAT: ADMINISTRATIF PASIF (view-only)
 * - Hanya mengambil dan menampilkan ringkasan data
 * - TIDAK ada operasi approval, rejection, atau perubahan status
 * - TIDAK ada create/update/delete operations
 * 
 * ENDPOINT YANG DISEDIAKAN:
 * - GET /api/pengguna/dashboard-penanggung-jawab (READ-ONLY)
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/pengguna/dashboard-penanggung-jawab
 * 
 * Mengambil data dashboard administratif untuk Penanggung Jawab
 * 
 * SIFAT:
 * - READ-ONLY: Hanya mengambil data, tidak ada perubahan
 * - ADMINISTRATIF: Untuk tampilan informasional saja
 * - TIDAK ADA APPROVAL/REJECTION LOGIC
 * 
 * DATA YANG DIKEMBALIKAN (per kategori):
 * 
 * 1. Ringkasan (ringkasan):
 *    - menunggu_review: Jumlah pengajuan menunggu review
 *    - disetujui_bulan_ini: Jumlah pengajuan disetujui bulan ini
 *    - ditolak_bulan_ini: Jumlah pengajuan ditolak bulan ini
 *    - total_karyawan: Total karyawan di sistem
 * 
 * 2. Pengajuan Mendesak (pengajuan_mendesak):
 *    - Array maksimal 5 item (untuk tampilan visual)
 *    - Berisi: nama_pengguna, judul_pengajuan, tanggal_pengajuan, waktu_relatif, label_prioritas
 * 
 * 3. Kehadiran Hari Ini (kehadiran_hari_ini):
 *    - hadir: Jumlah yang hadir
 *    - izin_cuti: Jumlah yang cuti/izin
 *    - belum_absen: Jumlah yang belum absen
 * 
 * 4. Statistik Bulanan (statistik_bulanan):
 *    - total_pengajuan: Total pengajuan bulan ini
 *    - rata_rata_waktu_review: Rata-rata hari untuk review
 *    - tingkat_persetujuan: Persentase pengajuan yang disetujui
 * 
 * RESPONSE FORMAT (WAJIB SESUAI FRONTEND):
 * {
 *   "success": true,
 *   "message": "Data dashboard penanggung jawab berhasil diambil",
 *   "data": {
 *     "ringkasan": { ... },
 *     "pengajuan_mendesak": [],
 *     "kehadiran_hari_ini": { ... },
 *     "statistik_bulanan": { ... }
 *   }
 * }
 * 
 * HTTP STATUS:
 * - 200 OK: Berhasil mengambil data
 * - 500 Internal Server Error: Terjadi error
 * 
 * @route   GET /api/pengguna/dashboard-penanggung-jawab
 * @access  Private (semua pengguna yang sudah autentikasi)
 * - Middleware autentikasi diterapkan di level router express (di app.js)
 * 
 * Catatan Teknis:
 * - Angka bersifat indikatif & administratif
 * - Sistem pengajuan & kehadiran formal belum terimplementasi lengkap
 * - Mengembalikan nilai safe (0 & array kosong) yang valid secara akademik
 * - Siap untuk integrasi data real ketika sistem lengkap
 */
router.get('/dashboard-penanggung-jawab', ambilDataDashboardPenanggungJawab);

// ==================== EXPORT ====================
module.exports = router;
