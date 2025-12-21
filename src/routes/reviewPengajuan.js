const express = require('express');
const reviewPengajuanController = require('../controllers/reviewPengajuanController');

/**
 * Router untuk API Review Pengajuan (Penanggung Jawab)
 * Menangani endpoint pengambilan daftar pengajuan yang menunggu review
 * 
 * Tujuan: Menyuplai data untuk halaman review pengajuan yang berfungsi
 * sebagai tampilan administratif daftar pengajuan surat izin dari karyawan
 * 
 * Base path: /api/penanggung-jawab (didefinisikan di app.js)
 * Sifat: Read-only (tidak ada operasi create/update/delete)
 * Status: Implementasi fase 1 dengan data mock aman secara akademik
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/penanggung-jawab/review-pengajuan
 * 
 * Mengambil daftar pengajuan izin yang sedang menunggu review dari penanggung jawab
 * 
 * Data yang dikembalikan:
 * Array pengajuan dengan struktur:
 * - nama_karyawan: Nama lengkap karyawan yang mengajukan
 * - jabatan_karyawan: Jabatan/posisi karyawan
 * - jenis_izin: Tipe izin (Cuti Tahunan, Izin Sakit, Work From Home, dll)
 * - periode: Rentang tanggal izin berlaku (format: DD MMM - DD MMM YYYY)
 * - durasi: Jumlah hari izin yang diminta
 * - tanggal_diajukan: Tanggal pengajuan dibuat (format: DD MMM)
 * - status_pengajuan: Status saat ini (selalu "Menunggu Review")
 * 
 * Response Format:
 * {
 *   "success": true,
 *   "message": "Daftar pengajuan menunggu review berhasil diambil",
 *   "data": {
 *     "daftar_pengajuan": [...]
 *   }
 * }
 * 
 * HTTP Status:
 * - 200 OK: Berhasil mengambil data pengajuan
 * - 500 Internal Server Error: Terjadi error saat mengambil data
 * 
 * Kontrol Akses:
 * - Endpoint ini dipanggil dari halaman yang sudah ter-autentikasi
 * - Middleware autentikasi diterapkan di level router express (di app.js)
 * 
 * Catatan Teknis:
 * - Saat ini mengembalikan data mock (fase 1)
 * - Akan diupdate ke query MongoDB saat model Pengajuan diimplementasikan
 */
router.get('/review-pengajuan', reviewPengajuanController.ambilDaftarPengajuanMenunggu);

module.exports = router;
