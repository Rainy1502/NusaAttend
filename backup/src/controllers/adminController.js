/**
 * Admin Controller
 * Handle semua operasi admin untuk manajemen pengajuan dan pengguna
 */

const Pengajuan = require('../models/Pengajuan');
const User = require('../models/User');
const Absensi = require('../models/Absensi');
const emailService = require('../services/emailService');

const adminController = {
  /**
   * Get all pengajuan dengan filtering
   * Query: status, jenis, tanggal, user_id
   */
  async getAllPengajuan(req, res) {
    try {
      const { status, jenis, tanggal, page = 1, limit = 10 } = req.query;

      // Build filter
      let filter = {};
      if (status) filter.status = status;
      if (jenis) filter.jenis_pengajuan = jenis;
      if (tanggal) {
        const date = new Date(tanggal);
        filter.createdAt = {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        };
      }

      // Pagination
      const skip = (page - 1) * limit;

      // Query dengan populate user info
      const pengajuan = await Pengajuan.find(filter)
        .populate('id_pengguna', 'nama_lengkap email jabatan')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Pengajuan.countDocuments(filter);

      res.json({
        success: true,
        data: pengajuan,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get pengajuan detail untuk review
   */
  async getPengajuanDetail(req, res) {
    try {
      const pengajuan = await Pengajuan.findById(req.params.id)
        .populate('id_pengguna', 'nama_lengkap email jabatan');

      if (!pengajuan) {
        return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
      }

      res.json({ success: true, data: pengajuan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Approve pengajuan
   */
  async approvePengajuan(req, res) {
    try {
      const { ttd_supervisor } = req.body;

      const pengajuan = await Pengajuan.findByIdAndUpdate(
        req.params.id,
        {
          status: 'disetujui',
          ttd_penanggung_jawab: ttd_supervisor
        },
        { new: true }
      ).populate('id_pengguna', 'email nama_lengkap');

      if (!pengajuan) {
        return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
      }

      // Jika cuti, kurangi sisa cuti pengguna
      if (pengajuan.jenis_pengajuan === 'cuti') {
        await User.findByIdAndUpdate(
          pengajuan.id_pengguna._id,
          { $inc: { sisa_cuti: -pengajuan.jumlah_hari } }
        );
      }

      // Kirim email notifikasi
      await emailService.sendStatusChangeEmail(
        pengajuan.id_pengguna.email,
        pengajuan,
        'disetujui'
      );

      // Emit socket event
      const io = req.app.locals.io;
      io.of('/socket').emit('status_pengajuan_diubah_notifikasi', {
        pengajuan_id: pengajuan._id,
        status: 'disetujui',
        user_id: pengajuan.id_pengguna._id
      });

      res.json({
        success: true,
        message: 'Pengajuan berhasil disetujui',
        data: pengajuan
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Reject pengajuan
   */
  async rejectPengajuan(req, res) {
    try {
      const { catatan_penolakan, ttd_supervisor } = req.body;

      if (!catatan_penolakan) {
        return res.status(400).json({ error: 'Catatan penolakan harus diisi' });
      }

      const pengajuan = await Pengajuan.findByIdAndUpdate(
        req.params.id,
        {
          status: 'ditolak',
          catatan_penolakan,
          ttd_penanggung_jawab: ttd_supervisor
        },
        { new: true }
      ).populate('id_pengguna', 'email nama_lengkap');

      if (!pengajuan) {
        return res.status(404).json({ error: 'Pengajuan tidak ditemukan' });
      }

      // Kirim email notifikasi
      await emailService.sendStatusChangeEmail(
        pengajuan.id_pengguna.email,
        pengajuan,
        'ditolak'
      );

      // Emit socket event
      const io = req.app.locals.io;
      io.of('/socket').emit('status_pengajuan_diubah_notifikasi', {
        pengajuan_id: pengajuan._id,
        status: 'ditolak',
        user_id: pengajuan.id_pengguna._id
      });

      res.json({
        success: true,
        message: 'Pengajuan berhasil ditolak',
        data: pengajuan
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get semua user untuk management
   */
  async getAllUsers(req, res) {
    try {
      const { role, page = 1, limit = 10 } = req.query;

      let filter = {};
      if (role) filter.role = role;

      const skip = (page - 1) * limit;

      const users = await User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

      const total = await User.countDocuments(filter);

      res.json({
        success: true,
        data: users,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update user role
   */
  async updateUserRole(req, res) {
    try {
      const { role } = req.body;

      if (!['employee', 'supervisor', 'admin'].includes(role)) {
        return res.status(400).json({ error: 'Role tidak valid' });
      }

      const user = await User.findByIdAndUpdate(
        req.params.id,
        { role },
        { new: true }
      ).select('-password');

      res.json({
        success: true,
        message: 'Role berhasil diupdate',
        data: user
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(req, res) {
    try {
      const totalUsers = await User.countDocuments();
      const totalPengajuan = await Pengajuan.countDocuments();
      const totalDisetujui = await Pengajuan.countDocuments({ status: 'disetujui' });
      const totalDitolak = await Pengajuan.countDocuments({ status: 'ditolak' });
      const totalMenunggu = await Pengajuan.countDocuments({ status: 'menunggu_persetujuan' });

      // Get pengajuan terbaru
      const pengajuanTerbaru = await Pengajuan.find()
        .populate('id_pengguna', 'nama_lengkap')
        .sort({ createdAt: -1 })
        .limit(5);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalPengajuan,
          totalDisetujui,
          totalDitolak,
          totalMenunggu,
          pengajuanTerbaru
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = adminController;
