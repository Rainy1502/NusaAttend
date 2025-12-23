const express = require('express');
const keberatanController = require('../controllers/keberatanController');

/**
 * ⚠️ ROUTER KEBERATAN ADMINISTRATIF - STATUS LEGACY / TIDAK AKTIF DI UI
 * 
 * Router ini dipertahankan sebagai ARTEFAK BACKEND untuk alasan:
 * 1. Stabilitas sistem - Backend tetap lengkap & fungsional
 * 2. Referensi akademik - Dokumentasi implementasi fitur yang dihilangkan dari UI
 * 3. Kemungkinan pengembangan lanjutan - Fitur bisa diaktifkan kembali jika diperlukan
 * 
 * ⚠️ PENTING:
 * - UI TIDAK LAGI MEMANGGIL endpoint ini (halaman Log Keberatan Admin dihilangkan)
 * - Menu "Tinjauan Keberatan" dihilangkan dari dashboard Penanggung Jawab
 * - Tombol "Ajukan Keberatan" dihilangkan dari halaman Riwayat Pengajuan
 * - Endpoint tetap aktif di backend untuk referensi dan stabilitas sistem
 * 
 * Fitur keberatan dalam NusaAttend adalah controlled feature deprecation,
 * bukan technical debt atau incomplete feature.
 */

/**
 * Router untuk API Keberatan Administratif
 * Menangani semua endpoint terkait keberatan
 * Base path: /api/admin (didefinisikan di app.js)
 */
const router = express.Router();

/**
 * ==================== GET ENDPOINTS ====================
 */

/**
 * Endpoint: GET /api/admin/keberatan
 * 
 * Status: LEGACY - Tidak digunakan oleh UI aktif
 * Mengambil semua data keberatan dari database
 * 
 * Alasan dipertahankan:
 * - Backend menyimpan data keberatan untuk integritas sistem
 * - Endpoint tetap aktif untuk debugging & audit
 * - Memungkinkan reaktivasi fitur jika diperlukan di masa depan
 * 
 * Sebelumnya digunakan oleh: Halaman Log Keberatan Admin (dihilangkan)
 * 
 * @route GET /api/admin/keberatan
 * @returns {Object} { success, message, data: [], statistik: {} }
 */
router.get('/keberatan', keberatanController.ambilSemuaKeberatan);

/**
 * Endpoint: GET /api/admin/keberatan/:id
 * 
 * Status: LEGACY - Tidak digunakan oleh UI aktif
 * Mengambil satu data keberatan berdasarkan ID
 * 
 * Sebelumnya digunakan oleh: Modal detail keberatan (dihilangkan)
 * Response: Satu object keberatan
 * 
 * @route GET /api/admin/keberatan/:id
 * @param {String} id - MongoDB ObjectId dari keberatan
 * @returns {Object} { success, message, data: {} }
 */
router.get('/keberatan/:id', keberatanController.ambilKeberatanById);

/**
 * ==================== POST ENDPOINTS ====================
 */

/**
 * Endpoint: POST /api/keberatan
 * 
 * Membuat keberatan baru (dipanggil oleh karyawan)
 * Status awal selalu "menunggu"
 * Pengaju diambil dari session user yang login
 * 
 * Request body:
 * {
 *   "jenis_keberatan": "Izin Tidak Masuk",
 *   "keterangan": "Deskripsi detail keberatan..."
 * }
 * 
 * @route POST /api/keberatan
 * @returns {Object} { success, message, data: {} }
 */
router.post('/keberatan', keberatanController.tambahKeberatan);

/**
 * ==================== PUT ENDPOINTS ====================
 */

/**
 * Endpoint: PUT /api/admin/keberatan/:id
 * 
 * Mengubah status keberatan (ditinjau / selesai)
 * Hanya admin/penanggung jawab yang bisa update
 * Memperbarui tanggal_pembaruan otomatis
 * 
 * Request body:
 * {
 *   "status_keberatan": "ditinjau" | "selesai",
 *   "catatan_admin": "Alasan keputusan..." (opsional)
 * }
 * 
 * Status yang valid:
 * - "menunggu": Keberatan baru, belum ditinjau
 * - "ditinjau": Sedang diproses oleh penanggung jawab
 * - "selesai": Sudah mendapat keputusan (disetujui/ditolak)
 * 
 * @route PUT /api/admin/keberatan/:id
 * @param {String} id - MongoDB ObjectId dari keberatan
 * @returns {Object} { success, message, data: {} }
 */
router.put('/keberatan/:id', keberatanController.perbaruiStatusKeberatan);

/**
 * ==================== DELETE ENDPOINTS ====================
 */

/**
 * Endpoint: DELETE /api/admin/keberatan/:id
 * 
 * Menghapus data keberatan dari database
 * Digunakan untuk kebutuhan administratif
 * Hanya admin yang bisa menghapus
 * 
 * @route DELETE /api/admin/keberatan/:id
 * @param {String} id - MongoDB ObjectId dari keberatan
 * @returns {Object} { success, message, data: { id } }
 */
router.delete('/keberatan/:id', keberatanController.hapusKeberatan);

/**
 * Export router untuk digunakan di app.js
 * Dipasang dengan: app.use('/api/admin', routerKeberatan)
 */
module.exports = router;
