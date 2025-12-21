const express = require('express');
const router = express.Router();
const middlewareAuntenfikasi = require('../middleware/auth');
const {
  buatPengajuan,
  ambilPengajuanKaryawan,
  ambilDetailPengajuan
} = require('../controllers/pengajuanController');

/**
 * Routes untuk API Pengajuan (Surat Izin)
 * Semua routes memerlukan autentikasi
 */

/**
 * POST /api/karyawan/pengajuan
 * Membuat pengajuan surat izin baru
 * 
 * Autentikasi: Ya (karyawan)
 * Body: jenis_izin, tanggal_mulai, tanggal_selesai, alasan, tanda_tangan_base64
 * 
 * Validasi Backend:
 * - Tanggal mulai >= hari ini
 * - Tanggal selesai >= tanggal mulai
 * - Durasi <= 365 hari (1 tahun)
 */
router.post('/pengajuan', middlewareAuntenfikasi, buatPengajuan);

/**
 * GET /api/karyawan/pengajuan
 * Ambil daftar semua pengajuan dari karyawan yang login
 * 
 * Autentikasi: Ya (karyawan)
 */
router.get('/pengajuan', middlewareAuntenfikasi, ambilPengajuanKaryawan);

/**
 * GET /api/karyawan/pengajuan/:id
 * Ambil detail pengajuan tertentu
 * 
 * Autentikasi: Ya (karyawan atau admin)
 * Param: id (Pengajuan ID)
 */
router.get('/pengajuan/:id', middlewareAuntenfikasi, ambilDetailPengajuan);

module.exports = router;
