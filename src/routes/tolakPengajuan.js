const express = require('express');
const { tolakPengajuan, setujuiPengajuan } = require('../controllers/tolakPengajuanController');

/**
 * ==================== ROUTER: TOLAK & SETUJUI PENGAJUAN ====================
 * 
 * Router ini menyediakan endpoint WRITE TERBATAS untuk proses review pengajuan.
 * 
 * KONTEKS:
 * - Tolak Pengajuan: Menolak pengajuan dengan alasan administratif
 * - Setujui Pengajuan: Menyetujui pengajuan secara langsung
 * 
 * SIFAT:
 * - ADMINISTRATIF: Keputusan internal penanggung jawab
 * - NON-HUKUM: Tidak ada implikasi legal atau compliance
 * - TERBATAS: HANYA mengubah status, alasan, dan tanggal review
 * - DEFENSIF: Validasi ketat input, error handling yang baik
 * 
 * BASE PATH: /api/pengguna (didefinisikan di app.js)
 * 
 * ENDPOINT YANG DISEDIAKAN:
 * - POST /api/pengguna/pengajuan-tolak/:id
 * - POST /api/pengguna/pengajuan-setujui/:id
 */
const router = express.Router();

/**
 * ==================== POST ENDPOINTS ====================
 */

/**
 * Endpoint: POST /api/pengguna/pengajuan-tolak/:id
 * 
 * Menolak pengajuan dengan menyimpan alasan penolakan
 * 
 * KONTEKS PENOLAKAN:
 * - Tindakan administratif internal
 * - Penanggung jawab memberikan alasan penolakan
 * - Status berubah menjadi "ditolak"
 * - Bersifat non-hukum dan informatif
 * 
 * PARAMETER:
 * - id (URL): ID pengajuan dari MongoDB
 * 
 * REQUEST BODY:
 * {
 *   "alasan_penolakan": "string (wajib, minimal 5 karakter)"
 * }
 * 
 * OPERASI YANG DILAKUKAN:
 * - Validasi ID pengajuan
 * - Validasi alasan penolakan (tidak kosong, minimal 5 karakter)
 * - Update status → "ditolak"
 * - Update keterangan_review ← alasan penolakan
 * - Set tanggal_direview ← sekarang
 * - Simpan ke database
 * 
 * RESPONSE FORMAT (WAJIB SESUAI FRONTEND):
 * SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Pengajuan berhasil ditolak",
 *   "data": {
 *     "tanggal_ditolak": "ISO 8601 timestamp"
 *   }
 * }
 * 
 * ERROR (400):
 * {
 *   "success": false,
 *   "message": "Alasan penolakan tidak boleh kosong"
 * }
 * 
 * ERROR (404):
 * {
 *   "success": false,
 *   "message": "Pengajuan tidak ditemukan"
 * }
 * 
 * ERROR (500):
 * {
 *   "success": false,
 *   "message": "Terjadi kesalahan saat memproses penolakan pengajuan"
 * }
 * 
 * CATATAN PENTING:
 * - Backend HANYA menerima: alasan_penolakan
 * - Backend HANYA mengubah: status, keterangan_review, tanggal_direview
 * - Backend TIDAK mengubah: data karyawan, sisa cuti, atau field lainnya
 * - Penolakan bersifat administratif, bukan keputusan hukum
 * - Setiap perubahan dicatat dengan tanggal_direview untuk audit trail
 */
router.post('/pengajuan-tolak/:id', tolakPengajuan);

/**
 * Endpoint: POST /api/pengguna/pengajuan-setujui/:id
 * 
 * Menyetujui pengajuan secara langsung (tanpa alasan)
 * 
 * KONTEKS APPROVAL:
 * - Tindakan administratif internal
 * - Penanggung jawab menyetujui pengajuan
 * - Status berubah menjadi "disetujui"
 * - Bersifat approval sederhana (tidak ada form reason)
 * 
 * PARAMETER:
 * - id (URL): ID pengajuan dari MongoDB
 * 
 * REQUEST BODY:
 * {} (kosong)
 * 
 * OPERASI YANG DILAKUKAN:
 * - Validasi ID pengajuan
 * - Update status → "disetujui"
 * - Set tanggal_direview ← sekarang
 * - Simpan ke database
 * 
 * RESPONSE FORMAT (WAJIB SESUAI FRONTEND):
 * SUCCESS (200):
 * {
 *   "success": true,
 *   "message": "Pengajuan berhasil disetujui",
 *   "data": {
 *     "tanggal_disetujui": "ISO 8601 timestamp"
 *   }
 * }
 * 
 * ERROR (404):
 * {
 *   "success": false,
 *   "message": "Pengajuan tidak ditemukan"
 * }
 * 
 * ERROR (500):
 * {
 *   "success": false,
 *   "message": "Terjadi kesalahan saat memproses persetujuan pengajuan"
 * }
 * 
 * CATATAN PENTING:
 * - Backend HANYA mengubah: status, tanggal_direview
 * - Backend TIDAK menerima alasan (approval adalah keputusan langsung)
 * - Backend TIDAK mengubah: data karyawan, sisa cuti, atau field lainnya
 * - Approval bersifat administratif internal
 * - Tanggal review disimpan untuk audit trail
 */
router.post('/pengajuan-setujui/:id', setujuiPengajuan);

module.exports = router;
