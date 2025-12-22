/* ==================== DETAIL PENGAJUAN ROUTES ==================== */
/* 
 * Routes untuk endpoint detail pengajuan dan approval workflow
 * 
 * Endpoints:
 * - GET /detail-pengajuan/:id - Ambil detail pengajuan (READ-ONLY)
 * - POST /pengajuan-setujui/:id - Setujui pengajuan
 * - POST /pengajuan-tolak/:id - Tolak pengajuan
 * 
 * Catatan:
 * - Router ini akan di-mount ke path /api/pengguna di app.js
 * - Semua endpoint memerlukan authentication middleware
 * - Endpoints approval mengupdate status pengajuan di database
 */

const express = require('express');
const router = express.Router();

// Import controller functions
const { 
    ambilDetailPengajuan,
    setujuiPengajuan,
    tolakPengajuan
} = require('../controllers/detailPengajuanController');

/**
 * GET /detail-pengajuan/:id
 * 
 * Mengambil detail pengajuan berdasarkan ID (READ-ONLY)
 * 
 * URL lengkap: GET /api/pengguna/detail-pengajuan/:id
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     detail_pengajuan: { ... }
 *   }
 * }
 */
router.get('/detail-pengajuan/:id', ambilDetailPengajuan);

/**
 * POST /pengajuan-setujui/:id
 * 
 * Menyetujui pengajuan dan mengupdate statusnya menjadi 'disetujui'
 * 
 * URL lengkap: POST /api/pengguna/pengajuan-setujui/:id
 * 
 * Request Body: {} (kosong)
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     status: 'disetujui',
 *     tanggal_keputusan: ISO date string
 *   }
 * }
 */
router.post('/pengajuan-setujui/:id', setujuiPengajuan);

/**
 * POST /pengajuan-tolak/:id
 * 
 * Menolak pengajuan dan mengupdate statusnya menjadi 'ditolak'
 * 
 * URL lengkap: POST /api/pengguna/pengajuan-tolak/:id
 * 
 * Request Body:
 * {
 *   alasan_penolakan: string (optional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   message: string,
 *   data: {
 *     status: 'ditolak',
 *     tanggal_keputusan: ISO date string
 *   }
 * }
 */
router.post('/pengajuan-tolak/:id', tolakPengajuan);

// Export router
module.exports = router;
