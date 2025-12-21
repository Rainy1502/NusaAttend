const Pengguna = require('../models/Pengguna');

/**
 * Controller untuk menghandle semua proses autentikasi (register, login, logout)
 */
const kontrolerAuntenfikasi = {
  /**
   * Fungsi registrasi pengguna baru
   * Validasi email belum terdaftar, hash password, simpan ke database
   */
  async daftar(req, res) {
    try {
      const { nama_lengkap, email, jabatan, password } = req.body;

      // Cek apakah email sudah terdaftar di database
      const penggunaExisting = await User.findOne({ email });
      if (penggunaExisting) {
        return res.status(400).json({ error: 'Email sudah terdaftar' });
      }

      // Buat user baru dengan data dari request body
      const pengguna = new User({
        nama_lengkap,
        email,
        jabatan,
        password
      });

      // Simpan user ke database (password akan di-hash otomatis via pre-save hook)
      await pengguna.save();

      // Return user data tanpa password field
      const responseUser = pengguna.keJSON();

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        user: responseUser
      });
    } catch (error) {
      console.error('Kesalahan registrasi:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Fungsi login pengguna
   * Validasi email dan password, buat session, return token jika API request
   */
  async masuk(req, res) {
    try {
      const { email, password } = req.body;

      // Cari user berdasarkan email dan include password field (default di-exclude)
      const pengguna = await Pengguna.findOne({ email }).select('+password');
      if (!pengguna) {
        return res.status(401).json({ error: 'Email atau password salah' });
      }

      // Validasi password dengan membandingkan input password dengan hashed password
      const isPasswordValid = await pengguna.bandingkanPassword(password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Email atau password salah' });
      }

      // Buat session untuk pengguna
      req.session.userId = pengguna._id;
      req.session.user = {
        id: pengguna._id,
        nama_lengkap: pengguna.nama_lengkap,
        email: pengguna.email,
        jabatan: pengguna.jabatan,
        role: pengguna.role,
        sisa_cuti: pengguna.sisa_cuti
      };

      // Jika request dari API (JSON), return token JWT
      if (req.accepts('json')) {
        const token = require('jsonwebtoken').sign(
          { id: pengguna._id, email: pengguna.email },
          process.env.JWT_SECRET || 'your_jwt_secret',
          { expiresIn: '24h' }
        );

        return res.json({
          success: true,
          message: 'Login berhasil',
          token,
          user: req.session.user
        });
      }

      // Jika request dari form HTML, redirect ke dashboard sesuai role
      const urlDashboard = pengguna.role === 'admin' 
        ? '/admin/dashboard' 
        : pengguna.role === 'penanggung-jawab' 
        ? '/supervisor/dashboard' 
        : '/karyawan/dashboard';

      res.redirect(urlDashboard);
    } catch (error) {
      console.error('Kesalahan login:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Fungsi logout pengguna
   * Hapus session dan redirect ke halaman login
   */
  keluar(req, res) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout gagal' });
      }
      
      // Jika request minta JSON, return JSON response
      if (req.accepts('json')) {
        return res.json({ success: true, message: 'Logout berhasil' });
      }
      
      // Jika request minta HTML, redirect ke halaman login
      res.redirect('/login');
    });
  }
};

module.exports = kontrolerAuntenfikasi;
