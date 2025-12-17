/**
 * Middleware untuk validasi input dari request body
 * Memeriksa kelengkapan dan format data sebelum disimpan ke database
 */

/**
 * Middleware validasi untuk registrasi pengguna
 * Cek: nama_lengkap, email, password, jabatan tidak boleh kosong
 * Cek: password minimal 6 karakter
 * Cek: email format valid
 */
const validasiDaftar = (req, res, next) => {
  const { nama_lengkap, email, password, jabatan } = req.body;

  // Validasi field tidak kosong
  if (!nama_lengkap || !email || !password || !jabatan) {
    return res.status(400).json({
      success: false,
      error: 'Semua field harus diisi (nama_lengkap, email, password, jabatan)'
    });
  }

  // Validasi panjang password minimum 6 karakter
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: 'Password minimal 6 karakter'
    });
  }

  // Validasi format email dengan regex
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    return res.status(400).json({
      success: false,
      error: 'Format email tidak valid'
    });
  }

  // Jika semua validasi lolos, lanjut ke handler berikutnya
  next();
};

/**
 * Middleware validasi untuk login pengguna
 * Cek: email dan password tidak boleh kosong
 */
const validasiMasuk = (req, res, next) => {
  const { email, password } = req.body;

  // Validasi field tidak kosong
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email dan password harus diisi'
    });
  }

  // Jika validasi lolos, lanjut ke handler berikutnya
  next();
};

module.exports = {
  validasiDaftar,
  validasiMasuk
};
