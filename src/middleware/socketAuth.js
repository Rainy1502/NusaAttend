/**
 * ==================== MIDDLEWARE AUTENTIKASI SOCKET.IO ====================
 * 
 * File: socketAuth.js
 * Tujuan: Validasi token JWT untuk koneksi Socket.IO
 * 
 * Alur:
 * 1. Periksa keberadaan token di handshake authentication
 * 2. Verifikasi integritas & masa berlaku token JWT
 * 3. Jika valid, ambil data pengguna dari database
 * 4. Attach informasi pengguna ke object socket untuk digunakan di event handlers
 * 
 * Catatan Akademik:
 * - Middleware ini memastikan hanya pengguna yang ter-autentikasi dapat berkomunikasi via Socket.IO
 * - Fungsi ini bersifat auxiliary (pembantu) untuk sistem keamanan sesi
 * - Tidak melakukan keputusan bisnis atau modifikasi data utama
 */

const jwt = require("jsonwebtoken");
const Pengguna = require("../models/Pengguna");

module.exports = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;

    /* ================= VALIDASI KEBERADAAN TOKEN ================= */
    if (!token) {
      console.error("❌ Socket Auth: Token tidak ditemukan");
      return next(new Error("Token diperlukan untuk socket connection"));
    }

    /* ================= VERIFIKASI INTEGRITAS TOKEN JWT ================= */
    let dekodeToken;
    try {
      dekodeToken = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      console.log("✅ Token verified:", dekodeToken);
    } catch (err) {
      console.error("❌ Socket Auth: Verifikasi token gagal:", err.message);
      return next(new Error("Token tidak valid atau sudah expired"));
    }

    /* ================= HANDLE TOKEN SOCKET-ONLY (GUEST) ================= */
    // Jika token hanya untuk socket auth tanpa id pengguna (guest token)
    if (dekodeToken.socketAuth && !dekodeToken.id) {
      console.log("✅ Socket auth granted (guest token)");
      socket.user = {
        id: "anonymous",
        nama: "Guest User",
        role: "guest",
      };
      return next();
    }

    /* ================= AMBIL DATA PENGGUNA DARI DATABASE ================= */
    // Token berisi id pengguna, maka cari di database untuk validasi tambahan
    const pengguna = await Pengguna.findById(dekodeToken.id);

    if (!pengguna) {
      console.error("❌ Socket Auth: Pengguna tidak ditemukan di database");
      return next(new Error("Pengguna tidak ditemukan"));
    }

    /* ================= ATTACH INFORMASI PENGGUNA KE SOCKET ================= */
    // Simpan informasi pengguna di object socket untuk digunakan di event handlers
    socket.user = {
      id: pengguna._id,
      nama: pengguna.nama || pengguna.nama_lengkap,
      role: pengguna.role,
    };

    console.log(
      `✅ Autentikasi Socket berhasil: ${socket.user.nama} (${socket.user.role})`
    );
    next();
  } catch (error) {
    console.error("❌ Socket Auth Error:", error.message);
    next(new Error("Autentikasi socket gagal: " + error.message));
  }
};
