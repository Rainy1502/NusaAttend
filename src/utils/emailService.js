const nodemailer = require('nodemailer');

/**
 * ==================== LAYANAN EMAIL (NODEMAILER) ====================
 * 
 * File: src/utils/emailService.js
 * Purpose: Menangani pengiriman email notifikasi untuk akun baru
 * 
 * Scope: 
 * - Email hanya dikirim SETELAH data pengguna berhasil disimpan ke database
 * - Email bersifat INFORMASIONAL (bukan verifikasi atau OTP)
 * - Jika email gagal, TIDAK MEMBLOK proses pembuatan akun
 * 
 * Catatan Akademik:
 * - Integrasi Nodemailer menggunakan SMTP (Gmail atau provider lainnya)
 * - Konfigurasi SMTP ada di .env (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD)
 * - Email tidak menyertakan password plaintext untuk keamanan
 */

// ==================== KONFIGURASI TRANSPORTER EMAIL ====================

/**
 * Inisialisasi transporter Nodemailer dengan konfigurasi dari .env
 * Menggunakan SMTP untuk pengiriman email yang dapat diandalkan
 * 
 * Kompatibel dengan 2 format konfigurasi:
 * 1. SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD (standard)
 * 2. EMAIL, PASSWORD (legacy Gmail setup)
 */
const pengirimeEmail = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false, // true untuk 465, false untuk 587
  auth: {
    user: process.env.SMTP_USER || process.env.EMAIL,
    pass: process.env.SMTP_PASSWORD || process.env.PASSWORD
  }
});

/**
 * Verifikasi koneksi transporter saat service diinisialisasi
 * Berguna untuk debugging saat startup
 */
pengirimeEmail.verify((error, success) => {
  if (error) {
    console.error('❌ [EMAIL SERVICE] Konfigurasi SMTP tidak valid:', error.message);
  } else {
    console.log('✅ [EMAIL SERVICE] SMTP siap untuk pengiriman email');
  }
});

// ==================== FUNGSI PENGIRIMAN EMAIL ====================

/**
 * Fungsi: kirimEmailAkunBaru
 * 
 * Tujuan:
 * Mengirim email notifikasi pemberitahuan ke pengguna yang akun barunya
 * telah berhasil dibuat di sistem
 * 
 * Parameter:
 * @param {string} emailPenerima - Alamat email penerima
 * @param {string} namaLengkap - Nama lengkap pengguna baru
 * @param {string} namaPeranGender - Peran pengguna (e.g., "Karyawan", "Penanggung Jawab")
 * @param {string} websiteUrl - URL website/domain (untuk link login)
 * 
 * Return:
 * @returns {Promise<boolean>} true jika email berhasil dikirim, false jika gagal
 * 
 * Catatan:
 * - Fungsi ini bersifat async dan dapat dipanggil dengan await
 * - Jika pengiriman gagal, hanya console.error tanpa throw error
 * - Proses pembuatan akun TIDAK terpengaruh jika email gagal
 */
async function kirimEmailAkunBaru(emailPenerima, namaLengkap, namaPeran = 'Pengguna', websiteUrl = 'http://localhost:3000/login', passwordAkunBaru = null) {
  try {
    // Validasi input minimal
    if (!emailPenerima || !namaLengkap) {
      console.warn('⚠️ [EMAIL SERVICE] Email tidak dikirim: parameter tidak lengkap');
      return false;
    }

    // ==================== SUSUN ISI EMAIL ====================

    // Subject email
    const subjekEmail = 'Akun Anda Berhasil Dibuat - NusaAttend';

    // HTML body email
    const isiEmailHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4f39f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background-color: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; }
            .info-box { background-color: #dcfce7; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; border-radius: 4px; }
            .button-container { text-align: center; margin-top: 15px; }
            .button { display: inline-block; background-color: #4f39f6; color: #ffffff !important; padding: 12px 30px; text-decoration: none !important; border-radius: 4px; font-weight: bold; font-size: 16px; }
            .button:hover { background-color: #3f2fd6; }
            .footer { font-size: 12px; color: #666; margin-top: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Akun Anda Berhasil Dibuat</h1>
            </div>
            <div class="content">
              <p>Halo <strong>${namaLengkap}</strong>,</p>
              
              <p>Selamat! Akun Anda sebagai <strong>${namaPeran}</strong> telah berhasil dibuat di sistem NusaAttend.</p>
              
              <div class="info-box">
                <p><strong>📌 Informasi Akun:</strong></p>
                <p><strong>Email:</strong> ${emailPenerima}</p>
                <p><strong>Peran:</strong> ${namaPeran}</p>
                <p><strong>Status:</strong> Aktif</p>
                ${passwordAkunBaru ? `<hr style="border: none; border-top: 1px solid #999; margin: 10px 0;">
                <p><strong>🔐 Password Sementara:</strong></p>
                <p style="background-color: #fff; padding: 8px; border-radius: 3px; font-family: monospace; word-break: break-all;"><strong>${passwordAkunBaru}</strong></p>
                <p style="color: #d32f2f; font-size: 12px; margin-top: 8px;">⚠️ <strong>PENTING:</strong> Ubah password Anda segera setelah login pertama!</p>` : ''}
              </div>
              
              <p><strong>Langkah Selanjutnya:</strong></p>
              <ol>
                <li>Klik tombol di bawah atau buka <a href="${websiteUrl}/login">halaman login</a></li>
                <li>Gunakan email Anda untuk login</li>
                <li>Password akan diberikan oleh Administrator</li>
                <li>Ubah password Anda di pengaturan akun setelah login pertama</li>
              </ol>
              
              <div class="button-container">
                <a href="${websiteUrl}/login" class="button">Login ke NusaAttend →</a>
              </div>
              
              <p style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666;">
                Jika Anda mengalami masalah atau memiliki pertanyaan, silakan hubungi Tim Administrasi.
              </p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} NusaAttend - Sistem Manajemen Absensi & Pengajuan Izin</p>
              <p style="color: #999;">Email ini dikirim otomatis. Jangan balas email ini.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Plain text version sebagai fallback
    const isiEmailTeks = `
Halo ${namaLengkap},

Selamat! Akun Anda sebagai ${namaPeran} telah berhasil dibuat di sistem NusaAttend.

INFORMASI AKUN:
- Email: ${emailPenerima}
- Peran: ${namaPeran}
- Status: Aktif
${passwordAkunBaru ? `
PASSWORD SEMENTARA:
${passwordAkunBaru}

⚠️  PENTING: Ubah password Anda segera setelah login pertama!` : ''}

LANGKAH SELANJUTNYA:
1. Login ke ${websiteUrl}/login
2. Gunakan email Anda untuk login
3. Password akan diberikan oleh Administrator
4. Ubah password Anda di pengaturan akun setelah login pertama

Jika Anda mengalami masalah atau memiliki pertanyaan, silakan hubungi Tim Administrasi.

---
© ${new Date().getFullYear()} NusaAttend - Sistem Manajemen Absensi & Pengajuan Izin
Email ini dikirim otomatis. Jangan balas email ini.
    `.trim();

    // ==================== PENGIRIMAN EMAIL ====================

    /**
     * Opsi pengiriman email
     * - from: Alamat pengirim (dari .env SMTP_FROM, EMAIL, atau fallback)
     * - to: Alamat penerima
     * - subject: Subjek email
     * - text: Plain text version
     * - html: HTML version (lebih bagus untuk tampilan)
     */
    const opsiEmail = {
      from: process.env.SMTP_FROM || process.env.EMAIL || 'noreply@nusaattend.com',
      to: emailPenerima,
      subject: subjekEmail,
      text: isiEmailTeks,
      html: isiEmailHTML
    };

    // Kirim email menggunakan transporter
    console.log(`📧 [EMAIL SERVICE] Mengirim email ke ${emailPenerima}...`);
    const hasil = await pengirimeEmail.sendMail(opsiEmail);

    console.log(`✅ [EMAIL SERVICE] Email berhasil dikirim ke ${emailPenerima} (Message ID: ${hasil.messageId})`);
    return true;

  } catch (error) {
    /**
     * Error handling:
     * - Email gagal dikirim tidak menyebabkan rollback data
     * - Hanya log error untuk debugging
     * - Return false untuk indikasi gagal
     * 
     * Alasan: Email adalah fitur pendukung, bukan bagian inti validasi
     * 
     * Debugging tips:
     * - Check .env EMAIL dan PASSWORD valid
     * - Gmail App Password harus digunakan (bukan plain password)
     * - Pastikan "Less Secure Apps" enabled jika menggunakan plain password
     */
    console.error(`❌ [EMAIL SERVICE] GAGAL mengirim email ke ${emailPenerima}`);
    console.error(`   Error Code: ${error.code}`);
    console.error(`   Error Message: ${error.message}`);
    console.error(`   Response: ${error.response}`);
    console.error(`   SMTP Host: ${process.env.SMTP_HOST || 'smtp.gmail.com'}`);
    console.error(`   SMTP User: ${process.env.SMTP_USER || process.env.EMAIL}`);
    
    return false;
  }
}

// ==================== EXPORT ====================

module.exports = {
  kirimEmailAkunBaru
};
