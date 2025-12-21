/**
 * Routes untuk Tanda Tangan Administratif
 * 
 * Endpoint untuk simpan dan ambil tanda tangan digital karyawan.
 * 
 * CATATAN:
 * - Tanda tangan bersifat administratif (bukan hukum)
 * - Hanya karyawan yang dapat menyimpan tanda tangan
 * - Read-only untuk review (Penanggung Jawab)
 */

const express = require('express');
const routerTandaTangan = express.Router();
const tandaTanganController = require('../controllers/tandaTanganController');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/karyawan/tanda-tangan
 * 
 * Endpoint untuk menyimpan tanda tangan digital administratif
 * 
 * Body:
 * {
 *   "tanda_tangan_data": "data:image/png;base64,..."
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Tanda tangan administratif berhasil disimpan",
 *   "data": {
 *     "tanggal_ditandatangani": "2025-12-21T..."
 *   }
 * }
 * 
 * Protected: Ya (memerlukan autentikasi)
 * Role: Karyawan
 */
routerTandaTangan.post(
  '/tanda-tangan',
  authMiddleware,
  tandaTanganController.simpanTandaTanganAdministratif
);

/**
 * GET /api/karyawan/tanda-tangan/:userId
 * 
 * Endpoint untuk mengambil tanda tangan administratif (read-only)
 * Digunakan oleh Penanggung Jawab untuk melihat tanda tangan di review pengajuan
 * 
 * Params:
 * - userId: ID user yang akan diambil tanda tangannya
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "tanda_tangan_digital": "data:image/png;base64,...",
 *     "tanggal_ditandatangani": "2025-12-21T...",
 *     "keterangan": "Tanda tangan digital administratif..."
 *   }
 * }
 * 
 * Protected: Ya (memerlukan autentikasi)
 * Role: Penanggung Jawab atau Admin
 */
routerTandaTangan.get(
  '/tanda-tangan/:userId',
  authMiddleware,
  tandaTanganController.ambilTandaTanganAdministratif
);

module.exports = routerTandaTangan;
