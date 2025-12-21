const express = require('express');
const router = express.Router();
const kontrolerKaryawan = require('../controllers/karyawanController');

/**
 * Router untuk menangani semua endpoint API manajemen karyawan
 * Prefix: /api/admin (didaftarkan di app.js)
 * 
 * Semua route di file ini akan menjadi:
 * - GET    /api/admin/karyawan
 * - POST   /api/admin/karyawan
 * - DELETE /api/admin/karyawan/:id
 */

/**
 * GET /api/admin/karyawan
 * Mengambil semua data karyawan (User dengan role = 'employee')
 * Response: JSON dengan format { success, message, data, total }
 */
router.get('/karyawan', kontrolerKaryawan.ambilSemuaKaryawan);

/**
 * GET /api/admin/supervisors
 * Mengambil semua data supervisor untuk dropdown penanggung jawab
 * Response: JSON dengan format { success, message, data }
 */
router.get('/supervisors', kontrolerKaryawan.ambilSemuaSupervisor);

/**
 * POST /api/admin/karyawan
 * Menambah karyawan baru ke database
 * 
 * Expected body:
 * {
 *   "nama_lengkap": "string",
 *   "email": "string@example.com",
 *   "jabatan": "string",
 *   "jatah_cuti_tahunan": 12,  // optional, default 12
 *   "password": "string",       // optional, default 'password123'
 *   "generatePassword": false   // optional, jika true generate random password
 * }
 * 
 * Response: JSON dengan format { success, message, data }
 */
router.post('/karyawan', kontrolerKaryawan.tambahKaryawanBaru);

/**
 * DELETE /api/admin/karyawan/:id
 * Menghapus karyawan berdasarkan ID
 * 
 * Expected parameter:
 * - id: MongoDB ObjectId dari karyawan yang akan dihapus
 * 
 * Response: JSON dengan format { success, message, data }
 */
router.delete('/karyawan/:id', kontrolerKaryawan.hapusKaryawanById);

/**
 * GET /api/admin/karyawan/:id
 * Mengambil data karyawan berdasarkan ID untuk keperluan edit
 * 
 * Expected parameter:
 * - id: MongoDB ObjectId dari karyawan
 * 
 * Response: JSON dengan format { success, message, data }
 * Data akan include penanggung_jawab_id yang di-populate dengan nama dan email supervisor
 */
router.get('/karyawan/:id', kontrolerKaryawan.ambilKaryawanById);

/**
 * PUT /api/admin/karyawan/:id
 * Mengupdate data karyawan berdasarkan ID
 * 
 * Expected parameter:
 * - id: MongoDB ObjectId dari karyawan yang akan diupdate
 * 
 * Expected body (minimal salah satu field):
 * {
 *   "nama_lengkap": "string",        // optional
 *   "email": "string@example.com",   // optional
 *   "jabatan": "string",             // optional
 *   "jatah_cuti_tahunan": 12,        // optional
 *   "penanggung_jawab_id": "ObjectId" // optional
 * }
 * 
 * Response: JSON dengan format { success, message, data }
 */
router.put('/karyawan/:id', kontrolerKaryawan.perbaruiDataKaryawan);

module.exports = router;
