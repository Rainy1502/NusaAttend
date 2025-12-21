const express = require('express');
const router = express.Router();

const middlewareAuntenfikasi = require('../middleware/auth');
const absensiController = require('../controllers/absensiController');


// ===== ABSEN MASUK =====
router.post('/masuk', middlewareAuntenfikasi, absensiController.absenMasuk);

// ===== ABSEN PULANG =====
router.post('/pulang', middlewareAuntenfikasi, absensiController.absenPulang);

// ===== GET ABSENSI HARI INI =====
router.get('/', middlewareAuntenfikasi, absensiController.getAbsensiHariIni);



module.exports = router;
