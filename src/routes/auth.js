const express = require('express');
const router = express.Router();
const kontrolerAuntenfikasi = require('../controllers/authController');
const { validasiDaftar } = require('../middleware/validation');

// ==================== RUTE PUBLIK AUTENTIKASI ====================

// Endpoint untuk registrasi pengguna baru
router.post('/daftar', validasiDaftar, kontrolerAuntenfikasi.daftar);

// Endpoint untuk login pengguna
router.post('/login', kontrolerAuntenfikasi.masuk);

// Endpoint untuk logout pengguna
router.post('/keluar', kontrolerAuntenfikasi.keluar);

module.exports = router;
