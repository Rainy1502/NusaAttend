const nodemailer = require('../config/email');

const emailService = {
  // Send email konfirmasi pengajuan
  async sendConfirmationEmail(email, pengajuan) {
    try {
      if (!process.env.SMTP_USER) {
        console.log('Email service not configured, skipping send email');
        return;
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@nusaattend.com',
        to: email,
        subject: 'Konfirmasi Pengajuan Surat Izin - NusaAttend',
        html: `
          <h2>Konfirmasi Pengajuan Surat Izin</h2>
          <p>Pengajuan Anda telah diterima dan sedang menunggu persetujuan.</p>
          <p><strong>Jenis Pengajuan:</strong> ${pengajuan.jenis_pengajuan}</p>
          <p><strong>Tanggal Mulai:</strong> ${pengajuan.tanggal_mulai}</p>
          <p><strong>Tanggal Selesai:</strong> ${pengajuan.tanggal_selesai}</p>
          <p>Anda akan menerima notifikasi ketika pengajuan telah diproses.</p>
        `
      };

      await nodemailer.sendMail(mailOptions);
      console.log('Confirmation email sent to:', email);
    } catch (error) {
      console.error('Send email error:', error);
    }
  },

  // Send email status berubah
  async sendStatusChangeEmail(email, pengajuan, status) {
    try {
      if (!process.env.SMTP_USER) {
        console.log('Email service not configured, skipping send email');
        return;
      }

      const statusLabel = status === 'disetujui' ? 'Disetujui' : 'Ditolak';
      const statusColor = status === 'disetujui' ? '#28a745' : '#dc3545';

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@nusaattend.com',
        to: email,
        subject: `Pengajuan Surat Izin ${statusLabel} - NusaAttend`,
        html: `
          <h2>Pengajuan Surat Izin ${statusLabel}</h2>
          <p>Pengajuan surat izin Anda telah diproses.</p>
          <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${statusLabel}</span></p>
          <p><strong>Jenis Pengajuan:</strong> ${pengajuan.jenis_pengajuan}</p>
          ${pengajuan.catatan_penolakan ? `<p><strong>Catatan:</strong> ${pengajuan.catatan_penolakan}</p>` : ''}
          <p>Login ke NusaAttend untuk melihat detail lengkap.</p>
        `
      };

      await nodemailer.sendMail(mailOptions);
      console.log('Status change email sent to:', email);
    } catch (error) {
      console.error('Send email error:', error);
    }
  }
};

module.exports = emailService;
