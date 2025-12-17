const express = require('express');
const router = express.Router();

// Admin routes
router.get('/pengajuan', (req, res) => {
  res.json({ message: 'Get all pengajuan' });
});

router.put('/pengajuan/:id/approve', (req, res) => {
  res.json({ message: 'Approve pengajuan' });
});

router.put('/pengajuan/:id/reject', (req, res) => {
  res.json({ message: 'Reject pengajuan' });
});

router.get('/pengguna', (req, res) => {
  res.json({ message: 'Get all pengguna' });
});

module.exports = router;
