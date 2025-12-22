const jwt = require("jsonwebtoken");
const Pengguna = require("../models/Pengguna");

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      console.error("❌ Socket Auth: Token tidak ditemukan");
      return next(new Error("Token diperlukan untuk socket connection"));
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token verified:", decoded);
    } catch (err) {
      console.error("❌ Socket Auth: Token verification gagal:", err.message);
      return next(new Error("Token tidak valid atau sudah expired"));
    }

    // Jika token untuk socket auth saja (simple socket connection)
    if (decoded.socketAuth && !decoded.id) {
      console.log("✅ Socket auth granted (socket-only token)");
      socket.user = {
        id: "anonymous",
        nama: "Guest User",
        role: "guest",
      };
      return next();
    }

    // Jika token memiliki user id, cari user berdasarkan id dari token
    const user = await Pengguna.findById(decoded.id);

    if (!user) {
      console.error("❌ Socket Auth: User tidak ditemukan");
      return next(new Error("User tidak ditemukan"));
    }

    // Set user info di socket object
    socket.user = {
      id: user._id,
      nama: user.nama || user.nama_lengkap,
      role: user.role,
    };

    console.log(
      `✅ Socket Auth Success: ${socket.user.nama} (${socket.user.role})`
    );
    next();
  } catch (error) {
    console.error("❌ Socket Auth Error:", error.message);
    next(new Error("Socket authentication failed: " + error.message));
  }
};
