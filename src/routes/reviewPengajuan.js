const express = require('express');
const { ambilDaftarPengajuanReview } = require('../controllers/reviewPengajuanController');

/**
 * ==================== ROUTER: REVIEW PENGAJUAN ====================
 * 
 * Router ini menyediakan endpoint READ-ONLY untuk halaman Review Pengajuan.
 * 
 * BASE PATH: /api/pengguna (didefinisikan di app.js)
 * 
 * SIFAT: ADMINISTRATIF PASIF (view-only)
 * - Hanya mengambil dan menampilkan data
 * - TIDAK ada operasi approval, rejection, atau perubahan status
 * - TIDAK ada create/update/delete operations
 * 
 * ENDPOINT YANG DISEDIAKAN:
 * - GET /api/pengguna/review-pengajuan
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/pengguna/review-pengajuan
 * 
 * Mengambil daftar pengajuan untuk review (READ-ONLY)
 * 
 * SIFAT:
 * - READ-ONLY: Hanya mengambil data, tidak ada perubahan
 * - ADMINISTRATIF: Untuk tampilan informasional saja
 * - TIDAK ADA APPROVAL/REJECTION LOGIC
 * 
 * DATA YANG DIKEMBALIKAN (per item):
 * - nama_pengguna: Nama lengkap pengaju
 * - jabatan_pengguna: Jabatan di perusahaan
 * - jenis_izin: Tipe izin (Cuti, Sakit, WFH, dll)
 * - periode: Rentang tanggal izin
 * - durasi: Jumlah hari izin
 * - tanggal_diajukan: Kapan pengajuan dibuat
 * 
 * RESPONSE FORMAT (WAJIB SESUAI FRONTEND):
 * {
 *   "success": true,
 *   "message": "Daftar pengajuan menunggu review berhasil diambil",
 *   "data": {
 *     "daftar_pengajuan": []
 *   }
 * }
 * 
 * HTTP STATUS:
 * - 200 OK: Berhasil mengambil data
 * - 500 Internal Server Error: Terjadi error
 * 
 * @route   GET /api/pengguna/review-pengajuan
 * @access  Private (semua pengguna yang sudah autentikasi)
 * - Middleware autentikasi diterapkan di level router express (di app.js)
 * 
 * Catatan Teknis:
 * - Saat ini mengembalikan data mock (fase 1)
 * - Akan diupdate ke query MongoDB saat model Pengajuan diimplementasikan
 */
router.get('/review-pengajuan', ambilDaftarPengajuanReview);

// ==================== EXPORT ====================
module.exports = router;
