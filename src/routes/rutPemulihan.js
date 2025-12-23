const express = require("express");
const kontrolerPemulihan = require("../controllers/kontrolerPemulihan");

const router = express.Router();

/**
 * ==================== ROUTES PEMULIHAN PASSWORD ====================
 * Fitur password recovery via reset link email
 *
 * Catatan: Semua route adalah PUBLIC (tidak memerlukan autentikasi)
 * User dapat mengakses tanpa login untuk proses reset password
 */

/**
 * [GET /lupa-password]
 * Menampilkan halaman form untuk request reset password link
 *
 * Response: HTML page dengan form email input
 */
router.get("/lupa-password", kontrolerPemulihan.tampilkan_halaman_lupa);

/**
 * [POST /api/pemulihan/minta-reset-link]
 * API endpoint untuk memproses request reset password
 *
 * Request body:
 * {
 *   email: "user@example.com"
 * }
 *
 * Response:
 * {
 *   success: true|false,
 *   message: "..."
 * }
 *
 * Features:
 * - Kirim reset link ke email (30 menit expiry)
 * - Brute force protection (5 attempts per hour)
 * - Generic error message (security best practice)
 * - Email tidak reveal apakah terdaftar atau tidak
 */
router.post(
  "/api/pemulihan/minta-reset-link",
  kontrolerPemulihan.minta_reset_link
);

/**
 * [GET /reset-password-dengan-token/:token]
 * Menampilkan halaman form reset password dengan token validation
 *
 * URL params:
 * - token: reset token (64 karakter hex)
 *
 * Response: HTML page dengan form password input
 *
 * Validasi:
 * - Token harus ada
 * - Token harus cocok dengan database
 * - Token tidak boleh kadaluarsa (max 30 menit)
 */
router.get(
  "/reset-password/:token",
  kontrolerPemulihan.tampilkan_halaman_reset
);

/**
 * [POST /api/pemulihan/reset-password-dengan-token]
 * API endpoint untuk memproses reset password
 *
 * Request body:
 * {
 *   token_reset: "...",
 *   password_baru: "...",
 *   password_konfirmasi: "..."
 * }
 *
 * Response:
 * {
 *   success: true|false,
 *   message: "...",
 *   redirect: "/login"
 * }
 *
 * Features:
 * - Update password ke database
 * - Hash password dengan bcrypt
 * - Delete token setelah berhasil (one-time use)
 * - Kirim email konfirmasi
 * - Reset percobaan brute force counter
 */
router.post(
  "/api/pemulihan/reset-password-dengan-token",
  kontrolerPemulihan.reset_password
);

module.exports = router;
