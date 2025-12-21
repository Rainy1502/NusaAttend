const express = require('express');
const keberatanController = require('../controllers/keberatanController');

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
 * Mengambil semua data keberatan
 * Digunakan oleh: Halaman Log Keberatan Admin
 * Response: Array keberatan dengan statistik
 * 
 * @route GET /api/admin/keberatan
 * @returns {Object} { success, message, data: [], statistik: {} }
 */
router.get('/keberatan', keberatanController.ambilSemuaKeberatan);

/**
 * Endpoint: GET /api/admin/keberatan/:id
 * 
 * Mengambil satu data keberatan berdasarkan ID
 * Digunakan oleh: Modal detail keberatan
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
