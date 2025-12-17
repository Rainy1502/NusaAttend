const express = require('express');
const router = express.Router();
const absensiController = require('../controllers/absensiController');

// Absen masuk
router.post('/masuk', absensiController.absenMasuk);

// Absen pulang
router.post('/pulang', absensiController.absenPulang);

// Get absensi
router.get('/', absensiController.getAbsensi);

module.exports = router;
