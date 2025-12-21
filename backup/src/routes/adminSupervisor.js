const express = require('express');
const router = express.Router();
const kontrolerSupervisor = require('../controllers/supervisorController');

/**
 * Router untuk menangani semua endpoint API manajemen supervisor (penanggung jawab)
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
 * Mengambil semua data supervisor (User dengan role = 'penanggung-jawab')
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Data supervisor berhasil diambil",
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
router.get('/supervisor', kontrolerSupervisor.ambilSemuaSupervisor);

/**
 * GET /api/admin/supervisors
 * Mengambil semua data supervisor untuk dropdown/select penanggung jawab
 * (Alias untuk endpoint di atas, untuk compatibility dengan frontend)
 * 
 * Response: Sama seperti GET /api/admin/supervisor
 */
router.get('/supervisors', kontrolerSupervisor.ambilSemuaSupervisor);

/**
 * GET /api/admin/supervisor/:id
 * Mengambil data supervisor tunggal berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari supervisor
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Data supervisor berhasil diambil",
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
router.get('/supervisor/:id', kontrolerSupervisor.ambilSupervisorById);

/**
 * POST /api/admin/supervisor
 * Menambah supervisor baru ke database
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
 *   "message": "Supervisor berhasil ditambahkan",
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
router.post('/supervisor', kontrolerSupervisor.tambahSupervisorBaru);

/**
 * PUT /api/admin/supervisor/:id
 * Mengubah data supervisor berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari supervisor
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
 *   "message": "Data supervisor berhasil diubah",
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
router.put('/supervisor/:id', kontrolerSupervisor.ubahSupervisorById);

/**
 * DELETE /api/admin/supervisor/:id
 * Menghapus supervisor berdasarkan ID
 * 
 * Parameter:
 * - id: MongoDB ObjectId dari supervisor
 * 
 * Catatan: Supervisor hanya bisa dihapus jika tidak ada karyawan yang di-supervisi
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Supervisor berhasil dihapus",
 *   "data": null
 * }
 */
router.delete('/supervisor/:id', kontrolerSupervisor.hapusSupervisorById);

module.exports = router;
