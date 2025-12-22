const express = require('express');
const { ambilDataSetujuiPengajuan } = require('../controllers/setujuiPengajuanController');

/**
 * ==================== ROUTER: SETUJUI PENGAJUAN ====================
 * 
 * Router ini menyediakan endpoint READ-ONLY untuk modal "Setujui Pengajuan".
 * 
 * TUJUAN:
 * - Mengambil data administratif pengajuan untuk ditampilkan di modal setujui
 * - Menyediakan informasi identitas pengguna & jenis izin
 * - Menyediakan placeholder tanda tangan administratif
 * - Memberikan konteks visual SEBELUM aksi persetujuan dilakukan
 * 
 * SIFAT:
 * - READ-ONLY: Tidak ada perubahan data
 * - ADMINISTRATIF: Bersifat visual dan informasional
 * - NON-HUKUM: Tanda tangan adalah placeholder, bukan bukti hukum
 * - DEFENSIF: Validasi ketat input, error handling yang baik
 * 
 * BASE PATH: /api/pengguna (didefinisikan di app.js)
 * 
 * ENDPOINT YANG DISEDIAKAN:
 * - GET /api/pengguna/setujui-pengajuan/:id
 * 
 * MIDDLEWARE YANG DIGUNAKAN:
 * - middlewareAuntenfikasi: Memastikan user sudah login
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/pengguna/setujui-pengajuan/:id
 * 
 * Mengambil data pengajuan untuk modal "Setujui Pengajuan"
 * 
 * TUJUAN:
 * - Mengambil informasi pengajuan dari database
 * - Mengambil informasi pengguna pemohon
 * - Mengompilasi data untuk keperluan modal
 * - Memberikan placeholder tanda tangan administratif
 * 
 * SIFAT:
 * - READ-ONLY: Hanya membaca, tidak ada perubahan
 * - ADMINISTRATIF: Data untuk presentasi modal
 * - Bersifat kontekstual untuk user yang sudah autentikasi
 * 
 * PARAMETER:
 * - id (URL): ID pengajuan dari MongoDB ObjectId (24 karakter hex)
 * 
 * RESPONSE SUKSES (200):
 * {
 *   "success": true,
 *   "message": "Data setujui pengajuan berhasil diambil",
 *   "data": {
 *     "detail_setujui_pengajuan": {
 *       "jenis_izin": "Cuti Tahunan",
 *       "periode_izin": "15 Desember 2025 - 20 Desember 2025",
 *       "alasan_pengajuan": "Istirahat dan berkumpul dengan keluarga",
 *       "nama_pengguna": "Andi Pratama",
 *       "jabatan_pengguna": "Staff IT",
 *       "tanggal_diajukan": "10 Desember 2025",
 *       "durasi_pengajuan": "6 hari",
 *       "tanda_tangan_administratif": "[Placeholder Canvas - Bukan Penyimpanan Real]",
 *       "nama_penandatangan": "Budi Santoso (Manager HRD)"
 *     }
 *   }
 * }
 * 
 * RESPONSE ERROR:
 * - 400: ID pengajuan tidak valid
 * - 404: Pengajuan atau pengguna tidak ditemukan
 * - 500: Error server
 * 
 * CATATAN:
 * - Tanda tangan di sini adalah placeholder visual BUKAN penyimpanan real
 * - Data TIDAK ada yang diubah di database (READ-ONLY)
 * - Untuk persetujuan real, gunakan endpoint POST /api/pengguna/pengajuan-setujui/:id
 */
router.get('/setujui-pengajuan/:id', ambilDataSetujuiPengajuan);

/**
 * Export router
 */
module.exports = router;
