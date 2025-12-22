/**
 * ==================== ROUTES DASHBOARD PENGGUNA ====================
 * 
 * Routes untuk API Dashboard Pengguna (Karyawan)
 * Endpoint ini menyediakan data ringkasan administratif
 * 
 * Sifat: READ-ONLY
 * Tidak ada operasi write atau modifikasi data
 */

const express = require('express');
const router = express.Router();

// Import controller
const { ambilDataDashboardPengguna } = require('../controllers/dashboardPenggunaController');

/**
 * GET /api/pengguna/dashboard
 * 
 * Ambil data dashboard pengguna (ringkasan kehadiran & pengajuan terbaru)
 * 
 * Middleware: Autentikasi dipasang di app.js
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Data dashboard pengguna berhasil diambil",
 *   "data": {
 *     "nama_pengguna": string,
 *     "ringkasan": {
 *       "sisa_cuti": number,
 *       "kehadiran_bulan_ini": number,
 *       "menunggu_persetujuan": number,
 *       "tidak_hadir": number
 *     },
 *     "pengajuan_terbaru": array
 *   }
 * }
 */
router.get('/dashboard', ambilDataDashboardPengguna);

module.exports = router;
