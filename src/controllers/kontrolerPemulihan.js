const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Pengguna = require("../models/Pengguna");

/**
 * ==================== KONFIGURASI EMAIL ====================
 * Menggunakan Nodemailer untuk mengirim email reset password
 *
 * PENTING: Pastikan .env memiliki:
 * - EMAIL_USER=your-email@gmail.com
 * - EMAIL_PASSWORD=your-app-password (16 karakter untuk Gmail)
 */
const pengiriman = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL || "your-email@gmail.com",
    pass: process.env.PASSWORD || "your-app-password",
  },
});

/**
 * ==================== CONTROLLER PEMULIHAN PASSWORD ====================
 * Menangani proses password recovery via reset link email
 */

/**
 * [GET /lupa-password]
 * Menampilkan halaman form lupa password
 * - User dapat memasukkan email untuk request reset link
 * - Halaman standalone (tidak perlu redirect dari halaman lain)
 */
exports.tampilkan_halaman_lupa = (req, res) => {
  res.render("lupa-password", {
    title: "Lupa Password - NusaAttend",
    layout: false,
  });
};

/**
 * [POST /api/pemulihan/minta-reset-link]
 * Memproses permintaan reset password link
 *
 * Flow:
 * 1. Validasi email format & keberadaan user
 * 2. Cek brute force protection (max 5 attempts per hour)
 * 3. Generate secure token (32-byte hex)
 * 4. Set token expiry (30 menit)
 * 5. Kirim email dengan reset link
 * 6. Response success
 */
exports.minta_reset_link = async (req, res) => {
  try {
    const { email } = req.body;

    // ==================== VALIDASI ====================
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email harus diisi",
      });
    }

    // Cari user berdasarkan email
    const pengguna = await Pengguna.findOne({ email: email.toLowerCase() });

    // Security: Jangan reveal apakah email ada atau tidak (prevent email enumeration)
    if (!pengguna) {
      return res.status(200).json({
        success: true,
        message:
          "Jika email terdaftar, Anda akan menerima link reset dalam 5 menit",
      });
    }

    // ==================== BRUTE FORCE PROTECTION ====================
    const sekarang = new Date();
    const satuJamLalu = new Date(sekarang.getTime() - 60 * 60 * 1000);

    // Jika percobaan terakhir lebih dari 1 jam lalu, reset counter
    if (pengguna.pemulihan_password.percobaan_terakhir_pada < satuJamLalu) {
      pengguna.pemulihan_password.percobaan_pemulihan = 0;
    }

    // Cek apakah sudah mencapai batas maksimal percobaan
    if (pengguna.pemulihan_password.percobaan_pemulihan >= 5) {
      const menitTersisa = Math.ceil(
        (pengguna.pemulihan_password.percobaan_terakhir_pada.getTime() +
          60 * 60 * 1000 -
          sekarang.getTime()) /
          60000
      );
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan. Silakan coba lagi dalam ${menitTersisa} menit`,
      });
    }

    // ==================== GENERATE TOKEN ====================
    const token_reset = crypto.randomBytes(32).toString("hex");
    const waktu_kadaluarsa = new Date(sekarang.getTime() + 30 * 60 * 1000); // 30 menit

    // Update data pemulihan di database
    pengguna.pemulihan_password.token_reset = token_reset;
    pengguna.pemulihan_password.token_reset_kadaluarsa_pada = waktu_kadaluarsa;
    pengguna.pemulihan_password.percobaan_pemulihan += 1;
    pengguna.pemulihan_password.percobaan_terakhir_pada = sekarang;

    await pengguna.save();

    // ==================== BUAT TEMPLATE EMAIL ====================
    const reset_link = `${
      process.env.APP_URL || "http://localhost:3000"
    }/reset-password/${token_reset}`;
    const template_email = buat_template_email_reset(
      pengguna.nama_lengkap,
      reset_link
    );

    // ==================== KIRIM EMAIL ====================
    try {
      await pengiriman.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "🔐 Reset Password NusaAttend - Link berlaku 30 menit",
        html: template_email,
      });

      console.log(`📧 Email reset password dikirim ke: ${email}`);
    } catch (emailError) {
      console.error("❌ Gagal mengirim email:", emailError);
      return res.status(500).json({
        success: false,
        message: "Gagal mengirim email reset. Silakan coba lagi",
      });
    }

    // ==================== RESPONSE SUCCESS ====================
    return res.status(200).json({
      success: true,
      message:
        "Jika email terdaftar, Anda akan menerima link reset dalam 5 menit",
    });
  } catch (error) {
    console.error("❌ Error dalam minta_reset_link:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

/**
 * [GET /reset-password-dengan-token/:token]
 * Menampilkan halaman form reset password dengan validasi token
 *
 * Flow:
 * 1. Cari user berdasarkan token
 * 2. Validasi token masih berlaku (tidak expired)
 * 3. Tampilkan form reset password
 */
exports.tampilkan_halaman_reset = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).render("error", {
        message: "Token tidak ditemukan",
        error: { status: 400, stack: "" },
      });
    }

    // Cari user dengan token ini
    const pengguna = await Pengguna.findOne({
      "pemulihan_password.token_reset": token,
    }).select("+pemulihan_password.token_reset");

    if (!pengguna) {
      return res.status(400).render("error", {
        message: "Token tidak valid atau telah kadaluarsa",
        error: { status: 400, stack: "" },
      });
    }

    // Validasi token belum kadaluarsa
    if (new Date() > pengguna.pemulihan_password.token_reset_kadaluarsa_pada) {
      return res.status(400).render("error", {
        message: "Token sudah kadaluarsa. Silakan request reset password baru",
        error: { status: 400, stack: "" },
      });
    }

    // Render halaman reset dengan token tersembunyi
    res.render("reset-password-dengan-token", {
      title: "Reset Password - NusaAttend",
      layout: false,
      token_reset: token,
      email: pengguna.email,
    });
  } catch (error) {
    console.error("❌ Error dalam tampilkan_halaman_reset:", error);
    return res.status(500).render("error", {
      message: "Terjadi kesalahan server",
      error: { status: 500, stack: error.toString() },
    });
  }
};

/**
 * [POST /api/pemulihan/reset-password-dengan-token]
 * Memproses reset password dengan token
 *
 * Flow:
 * 1. Validasi token dan password
 * 2. Cek password complexity
 * 3. Hash password baru
 * 4. Update password di database
 * 5. Delete token (one-time use)
 * 6. Kirim email konfirmasi
 * 7. Redirect ke login
 */
exports.reset_password = async (req, res) => {
  try {
    const { token_reset, password_baru, password_konfirmasi } = req.body;

    // ==================== VALIDASI ====================
    if (!token_reset || !password_baru || !password_konfirmasi) {
      return res.status(400).json({
        success: false,
        message: "Semua field harus diisi",
      });
    }

    if (password_baru !== password_konfirmasi) {
      return res.status(400).json({
        success: false,
        message: "Password tidak cocok",
      });
    }

    // Validasi kompleksitas password
    const regex_password =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{6,}$/;
    if (!regex_password.test(password_baru)) {
      return res.status(400).json({
        success: false,
        message:
          "Password harus minimal 6 karakter, mengandung huruf besar, huruf kecil, dan angka",
      });
    }

    // ==================== CARI USER DENGAN TOKEN ====================
    const pengguna = await Pengguna.findOne({
      "pemulihan_password.token_reset": token_reset,
    }).select("+pemulihan_password.token_reset");

    if (!pengguna) {
      return res.status(400).json({
        success: false,
        message: "Token tidak valid",
      });
    }

    // Validasi token belum kadaluarsa
    if (new Date() > pengguna.pemulihan_password.token_reset_kadaluarsa_pada) {
      return res.status(400).json({
        success: false,
        message: "Token sudah kadaluarsa",
      });
    }

    // ==================== UPDATE PASSWORD ====================
    pengguna.password = password_baru;

    // Hapus token setelah digunakan (one-time use)
    pengguna.pemulihan_password.token_reset = null;
    pengguna.pemulihan_password.token_reset_kadaluarsa_pada = null;
    pengguna.pemulihan_password.percobaan_pemulihan = 0;

    await pengguna.save();

    // ==================== KIRIM EMAIL KONFIRMASI ====================
    const template_email_sukses = buat_template_email_sukses(
      pengguna.nama_lengkap
    );

    try {
      await pengiriman.sendMail({
        from: process.env.EMAIL_USER,
        to: pengguna.email,
        subject: "✓ Password Berhasil Direset - NusaAttend",
        html: template_email_sukses,
      });

      console.log(`📧 Email konfirmasi reset dikirim ke: ${pengguna.email}`);
    } catch (emailError) {
      console.error("⚠️ Gagal mengirim email konfirmasi:", emailError);
      // Tidak return error karena password sudah berhasil direset
    }

    // ==================== RESPONSE SUCCESS ====================
    return res.status(200).json({
      success: true,
      message: "Password berhasil direset. Silakan login dengan password baru",
      redirect: "/login",
    });
  } catch (error) {
    console.error("❌ Error dalam reset_password:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server",
    });
  }
};

/**
 * ==================== HELPER FUNCTIONS ====================
 */

/**
 * Buat token reset password yang aman
 * Menggunakan crypto.randomBytes untuk generate token 32-byte hex
 * @returns {string} Token 64 karakter
 */
function buat_token_reset() {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Buat template HTML email untuk reset password
 * Email berisi reset link yang berlaku 30 menit
 * @param {string} nama_lengkap - Nama lengkap pengguna
 * @param {string} reset_link - URL link untuk reset password
 * @returns {string} HTML template email
 */
function buat_template_email_reset(nama_lengkap, reset_link) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background:  #4F39F6; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .greeting { font-size: 16px; margin-bottom: 20px; }
        .info-box { background: white; border-left: 4px solid #4F39F6; padding: 15px; margin: 20px 0; }
        .info-box strong { color: #4F39F6; }
        .button { display: inline-block; background: #ada2ffff; color: #4F39F6; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .button:hover { opacity: 0.9; }
        .warning { background: #fffbec; border: 1px solid #ffd699; color: #8b6914; padding: 15px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Reset Password NusaAttend</h1>
        </div>
        <div class="content">
          <p class="greeting">Halo <strong>${nama_lengkap}</strong>,</p>
          <p>Anda telah meminta untuk mereset password akun NusaAttend Anda. Klik tombol di bawah untuk melanjutkan:</p>
          
          <center>
            <a href="${reset_link}" class="button">Reset Password Saya</a>
          </center>

          <p>Atau copy link berikut ke browser Anda:</p>
          <div class="info-box">
            <small><strong>Link:</strong><br/>${reset_link}</small>
          </div>

          <div class="warning">
            ⏰ <strong>Perhatian:</strong> Link ini hanya berlaku selama <strong>30 menit</strong>. Setelah itu, Anda perlu meminta link reset password baru.
          </div>

          <p style="color: #999; font-size: 14px;">
            <strong>Keamanan:</strong> Jika Anda tidak meminta reset password ini, abaikan email ini. Password Anda tetap aman.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 NusaAttend - Portal Administrasi Kehadiran Tim</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Buat template HTML email konfirmasi sukses reset password
 * Email notifikasi bahwa password telah berhasil direset
 * @param {string} nama_lengkap - Nama lengkap pengguna
 * @returns {string} HTML template email
 */
function buat_template_email_sukses(nama_lengkap) {
  return `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-box { background: #d1fae5; border: 1px solid #6ee7b7; color: #065f46; padding: 15px; border-radius: 6px; margin: 20px 0; }
        .info-box { background: white; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; font-size: 14px; }
        .button { display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; padding: 20px; color: #999; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Password Berhasil Direset</h1>
        </div>
        <div class="content">
          <p>Halo <strong>${nama_lengkap}</strong>,</p>
          
          <div class="success-box">
            <strong>✓ Selamat!</strong> Password akun NusaAttend Anda telah berhasil direset.
          </div>

          <p>Anda sekarang dapat login dengan password baru Anda. Klik tombol di bawah untuk masuk:</p>
          
          <center>
            <a href="${
              process.env.APP_URL || "http://localhost:3000"
            }/login" class="button">Login ke NusaAttend</a>
          </center>

          <div class="info-box">
            <strong>💡 Tips Keamanan:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Gunakan password yang kuat dan unik</li>
              <li>Jangan bagikan password Anda kepada siapapun</li>
              <li>Logout setelah selesai menggunakan komputer bersama</li>
            </ul>
          </div>

          <p style="color: #999; font-size: 14px;">
            <strong>Pertanyaan?</strong> Jika ada yang tidak dimengerti, hubungi tim support kami.
          </p>
        </div>
        <div class="footer">
          <p>© 2025 NusaAttend - Portal Administrasi Kehadiran Tim</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
