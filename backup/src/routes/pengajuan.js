const express = require('express');
const router = express.Router();
const pengajuanController = require('../controllers/pengajuanController');
const { validatePengajuan } = require('../middleware/validation');

// Get semua pengajuan user
router.get('/', pengajuanController.getPengajuan);

// Get detail pengajuan
router.get('/:id', pengajuanController.getPengajuanDetail);

// Buat pengajuan baru
router.post('/', validatePengajuan, pengajuanController.createPengajuan);

module.exports = router;
