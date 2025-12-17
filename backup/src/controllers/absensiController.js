const Absensi = require('../models/Absensi');
const Pengajuan = require('../models/Pengajuan');

const absensiController = {
  // Absen masuk
  async absenMasuk(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Cek apakah sudah absen hari ini
      let absensi = await Absensi.findOne({
        id_pengguna: req.userId,
        tanggal: today
      });

      if (!absensi) {
        // Buat record absensi baru
        absensi = new Absensi({
          id_pengguna: req.userId,
          tanggal: today,
          jam_masuk: new Date().toLocaleTimeString('id-ID'),
          status: 'hadir'
        });
      } else {
        // Update jam masuk jika belum ada
        if (!absensi.jam_masuk) {
          absensi.jam_masuk = new Date().toLocaleTimeString('id-ID');
        }
      }

      await absensi.save();

      res.json({
        success: true,
        message: 'Absen masuk berhasil',
        data: absensi
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Absen pulang
  async absenPulang(req, res) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const absensi = await Absensi.findOne({
        id_pengguna: req.userId,
        tanggal: today
      });

      if (!absensi) {
        return res.status(400).json({ error: 'Anda belum absen masuk' });
      }

      absensi.jam_pulang = new Date().toLocaleTimeString('id-ID');
      await absensi.save();

      res.json({
        success: true,
        message: 'Absen pulang berhasil',
        data: absensi
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get absensi user
  async getAbsensi(req, res) {
    try {
      const absensi = await Absensi.find({ id_pengguna: req.userId })
        .sort({ tanggal: -1 })
        .limit(30);

      res.json({ success: true, data: absensi });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = absensiController;
