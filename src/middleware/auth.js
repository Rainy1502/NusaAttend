const jwt = require('jsonwebtoken');

/**
 * Middleware untuk autentikasi pengguna
 * Cek token di session atau header Authorization (JWT)
 * Jika valid, lanjut ke rute berikutnya, jika tidak return error 401
 */
const middlewareAuntenfikasi = async (req, res, next) => {
  try {
    // Cek di session terlebih dahulu (jika menggunakan session-based auth)
    if (req.session && req.session.userId) {
      req.userId = req.session.userId;
      req.user = req.session.user;
      return next();
    }

    // Cek di header Authorization untuk JWT token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    // Verifikasi JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    req.userId = decoded.id;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token tidak valid' });
  }
};

module.exports = middlewareAuntenfikasi;
