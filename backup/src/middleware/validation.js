// Validasi untuk register
const validateRegister = (req, res, next) => {
  const { nama_lengkap, email, jabatan, password, confirm_password } = req.body;

  if (!nama_lengkap || !email || !jabatan || !password || !confirm_password) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Password tidak cocok' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  }

  next();
};

// Validasi untuk pengajuan
const validatePengajuan = (req, res, next) => {
  const { jenis_pengajuan, tanggal_mulai, tanggal_selesai, alasan } = req.body;

  if (!jenis_pengajuan || !tanggal_mulai || !tanggal_selesai || !alasan) {
    return res.status(400).json({ error: 'Semua field harus diisi' });
  }

  const mulai = new Date(tanggal_mulai);
  const selesai = new Date(tanggal_selesai);

  if (selesai < mulai) {
    return res.status(400).json({ error: 'Tanggal selesai harus setelah tanggal mulai' });
  }

  next();
};

module.exports = { validateRegister, validatePengajuan };
