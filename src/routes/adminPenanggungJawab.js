const express = require('express');
const router = express.Router();
/**
 * [REFACTOR AKADEMIK]
 * Mengubah import dari supervisorController ke penanggungJawabController
 * untuk konsistensi terminologi lintas sistem sesuai ketentuan dosen
 */
const kontrolerPenanggungJawab = require('../controllers/penanggungJawabController');

/**
 * Router untuk menangani semua endpoint API manajemen penanggung jawab (supervisor)
 * Prefix: /api/admin (didaftarkan di app.js)
 * 
 * Semua route di file ini akan menjadi:
 * - GET    /api/admin/supervisor
 * - POST   /api/admin/supervisor
 * - GET    /api/admin/supervisor/:id
 * - PUT    /api/admin/supervisor/:id
 * - DELETE /api/admin/supervisor/:id
 */

/**
 * GET /api/admin/supervisor
 * Mengambil semua data penanggung jawab (User dengan role = 'penanggung-jawab')
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Data penanggung jawab berhasil diambil",
 *   "data": [
 *     {
 *       "_id": "...",
 *       "nama_lengkap": "...",
 *       "email": "...",
 *       "jabatan": "...",
 *       "role": "penanggung-jawab",
 *       "adalah_aktif": true,
 *       "createdAt": "...",
 *       "jumlahKaryawan": 12,
 *       "isAktif": true
 *     }
 *   ],
 *   "total": 1
 * }
 */
router.get('/penanggung-jawab', kontrolerPenanggungJawab.ambilSemuaPenanggungJawab);

/**
 * GET /api/admin/supervisors
 * Mengambil semua data penanggung jawab untuk dropdown/select
 * (Alias untuk endpoint di atas, untuk compatibility dengan frontend)
 * 
 * Response: Sama seperti GET /api/admin/supervisor
 */
router.get('/penanggung-jawab', kontrolerPenanggungJawab.ambilSemuaPenanggungJawab);

/**
 * GET /api/admin/supervisor/:id
 * Mengambil data penanggung jawab tunggal berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari penanggung jawab
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Data penanggung jawab berhasil diambil",
 *   "data": {
 *     "_id": "...",
 *     "nama_lengkap": "...",
 *     "email": "...",
 *     "jabatan": "...",
 *     "role": "penanggung-jawab",
 *     "adalah_aktif": true,
 *     "createdAt": "...",
 *     "jumlahKaryawan": 12,
 *     "isAktif": true
 *   }
 * }
 */
router.get('/penanggung-jawab/:id', kontrolerPenanggungJawab.ambilPenanggungJawabById);

/**
 * POST /api/admin/supervisor
 * Menambah penanggung jawab baru ke database
 * 
 * Expected body:
 * {
 *   "nama_lengkap": "string (required)",
 *   "email": "string@example.com (required, unique)",
 *   "jabatan": "string (required)",
 *   "password": "string (optional, default: 'password123')"
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Penanggung jawab berhasil ditambahkan",
 *   "data": {
 *     "_id": "...",
 *     "nama_lengkap": "...",
 *     "email": "...",
 *     "jabatan": "...",
 *     "role": "penanggung-jawab",
 *     "adalah_aktif": true,
 *     "createdAt": "..."
 *   }
 * }
 */
router.post('/penanggung-jawab', kontrolerPenanggungJawab.tambahPenanggungJawabBaru);

/**
 * PUT /api/admin/supervisor/:id
 * Mengubah data penanggung jawab berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari penanggung jawab
 * 
 * Expected body (semua opsional):
 * {
 *   "nama_lengkap": "string (optional)",
 *   "email": "string@example.com (optional, unique)",
 *   "jabatan": "string (optional)"
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Data penanggung jawab berhasil diubah",
 *   "data": {
 *     "_id": "...",
 *     "nama_lengkap": "...",
 *     "email": "...",
 *     "jabatan": "...",
 *     "role": "penanggung-jawab",
 *     "adalah_aktif": true,
 *     "updatedAt": "..."
 *   }
 * }
 */
router.put('/penanggung-jawab/:id', kontrolerPenanggungJawab.ubahPenanggungJawabById);

/**
 * DELETE /api/admin/supervisor/:id
 * Menghapus penanggung jawab berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari penanggung jawab
 * 
 * Catatan: Penanggung jawab hanya bisa dihapus jika tidak ada karyawan yang di-supervisi
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Penanggung jawab berhasil dihapus",
 *   "data": null
 * }
 */
router.delete('/penanggung-jawab/:id', kontrolerPenanggungJawab.hapusPenanggungJawabById);

/**
 * ==================== BACKWARD COMPATIBILITY ROUTES ====================
 * Routes lama untuk /supervisor tetap berfungsi untuk kompatibilitas dengan code lama
 * Semua routes di bawah ini menggunakan handler yang sama dengan /penanggung-jawab
 */

// Backward compatibility: GET /api/admin/supervisor (sama dengan /penanggung-jawab)
router.get('/supervisor', kontrolerPenanggungJawab.ambilSemuaPenanggungJawab);

// Backward compatibility: GET /api/admin/supervisors (sama dengan /penanggung-jawab)
router.get('/supervisors', kontrolerPenanggungJawab.ambilSemuaPenanggungJawab);

// Backward compatibility: GET /api/admin/supervisor/:id (sama dengan /penanggung-jawab/:id)
router.get('/supervisor/:id', kontrolerPenanggungJawab.ambilPenanggungJawabById);

// Backward compatibility: POST /api/admin/supervisor (sama dengan /penanggung-jawab)
router.post('/supervisor', kontrolerPenanggungJawab.tambahPenanggungJawabBaru);

// Backward compatibility: PUT /api/admin/supervisor/:id (sama dengan /penanggung-jawab/:id)
router.put('/supervisor/:id', kontrolerPenanggungJawab.ubahPenanggungJawabById);

// Backward compatibility: DELETE /api/admin/supervisor/:id (sama dengan /penanggung-jawab/:id)
router.delete('/supervisor/:id', kontrolerPenanggungJawab.hapusPenanggungJawabById);

module.exports = router;
