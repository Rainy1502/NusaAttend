const Pengajuan = require('../models/Pengajuan');
const User = require('../models/User');
const emailService = require('../services/emailService');
const letterGenerator = require('../utils/letterGenerator');

const pengajuanController = {
  // Get semua pengajuan user
  async getPengajuan(req, res) {
    try {
      const pengajuan = await Pengajuan.find({ id_pengguna: req.userId })
        .sort({ createdAt: -1 });

      res.json({ success: true, data: pengajuan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get detail pengajuan
  async getPengajuanDetail(req, res) {
    try {
      const pengajuan = await Pengajuan.findById(req.params.id)
        .populate('id_pengguna', 'nama_lengkap email jabatan');

      if (!pengajuan) {
        return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
      }

      // Verify ownership
      if (pengajuan.id_pengguna._id.toString() !== req.userId && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses ditolak' });
      }

      res.json({ success: true, data: pengajuan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Buat pengajuan baru
  async createPengajuan(req, res) {
    try {
      const { jenis_pengajuan, tanggal_mulai, tanggal_selesai, alasan, ttd_karyawan } = req.body;

      // Get user untuk mendapatkan data lengkap
      const user = await User.findById(req.userId);

      // Hitung jumlah hari
      const mulai = new Date(tanggal_mulai);
      const selesai = new Date(tanggal_selesai);
      const jumlah_hari = Math.ceil((selesai - mulai) / (1000 * 60 * 60 * 24)) + 1;

      // Validasi sisa cuti jika jenis cuti
      if (jenis_pengajuan === 'cuti' && user.sisa_cuti < jumlah_hari) {
        return res.status(400).json({ error: 'Sisa cuti tidak mencukupi' });
      }

      // Generate surat izin
      const surat_izin = letterGenerator.generateLetterHTML({
        nama: user.nama_lengkap,
        jabatan: user.jabatan,
        jenis_pengajuan,
        tanggal_mulai,
        tanggal_selesai,
        alasan,
        jumlah_hari
      });

      // Buat pengajuan
      const pengajuan = new Pengajuan({
        id_pengguna: req.userId,
        jenis_pengajuan,
        tanggal_mulai,
        tanggal_selesai,
        alasan,
        surat_izin,
        ttd_karyawan,
        jumlah_hari,
        status: 'menunggu_persetujuan'
      });

      await pengajuan.save();

      // Kirim email konfirmasi
      await emailService.sendConfirmationEmail(user.email, pengajuan);

      res.status(201).json({
        success: true,
        message: 'Pengajuan berhasil dibuat',
        data: pengajuan
      });
    } catch (error) {
      console.error('Create pengajuan error:', error);
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = pengajuanController;
