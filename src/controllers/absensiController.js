const Absensi = require('../models/Absensi');

/* ================= HELPER (PURE FUNCTION) ================= */

function ambilTanggalHariIni() {
  const hariIni = new Date();
  hariIni.setHours(0, 0, 0, 0);
  return hariIni;
}


function ambilJamSekarang() {
  const sekarang = new Date();
  return (
    sekarang.getHours().toString().padStart(2, '0') +
    ':' +
    sekarang.getMinutes().toString().padStart(2, '0')
  );
}

/* ================= CONTROLLER ================= */

const absensiController = {

  async absenMasuk(req, res) {
    try {
      const idPengguna = req.session.user.id;
      const tanggalHariIni = ambilTanggalHariIni();
      const jamMasuk = ambilJamSekarang();
      const { keterangan } = req.body;

      let absensiHariIni = await Absensi.findOne({
        id_pengguna: idPengguna,
        tanggal: tanggalHariIni
      });

      if (!absensiHariIni) {
        absensiHariIni = await Absensi.create({
          id_pengguna: idPengguna,
          tanggal: tanggalHariIni,
          jam_masuk: jamMasuk,
          keterangan
        });
      } else if (absensiHariIni.jam_masuk) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah melakukan absen masuk hari ini'
        });
      } else {
        absensiHariIni.jam_masuk = jamMasuk;
        absensiHariIni.keterangan = keterangan;
        await absensiHariIni.save();
      }

      return res.json({
        success: true,
        message: 'Absen masuk berhasil',
        data: absensiHariIni
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  },

  async absenPulang(req, res) {
    try {
      const idPengguna = req.session.user.id;
      const tanggalHariIni = ambilTanggalHariIni();
      const jamPulang = ambilJamSekarang();

      const absensiHariIni = await Absensi.findOne({
        id_pengguna: idPengguna,
        tanggal: tanggalHariIni
      });

      if (!absensiHariIni || !absensiHariIni.jam_masuk) {
        return res.status(400).json({
          success: false,
          message: 'Anda belum melakukan absen masuk'
        });
      }

      if (absensiHariIni.jam_pulang) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah melakukan absen pulang hari ini'
        });
      }

      absensiHariIni.jam_pulang = jamPulang;
      await absensiHariIni.save();

      return res.json({
        success: true,
        message: 'Absen pulang berhasil',
        data: absensiHariIni
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  },

  async getAbsensiHariIni(req, res) {
    try {
      const idPengguna = req.session.user.id;
      const tanggalHariIni = ambilTanggalHariIni();

      console.log('📅 Mengambil data absensi...');
      console.log(`   - User ID: ${idPengguna}`);
      console.log(`   - Tanggal: ${tanggalHariIni}`);

      const absensiHariIni = await Absensi.findOne({
        id_pengguna: idPengguna,
        tanggal: tanggalHariIni
      });

      const absen = absensiHariIni
        ? {
            jamMasuk: absensiHariIni.jam_masuk,
            jamPulang: absensiHariIni.jam_pulang,
            keterangan: absensiHariIni.keterangan
          }
        : null;

      const riwayatAbsensi = await Absensi.find({ id_pengguna: idPengguna })
        .sort({ tanggal: -1 })
        .limit(30)
        .lean();
      
      console.log(`   - Total riwayat absensi: ${riwayatAbsensi.length} records`);
      if (riwayatAbsensi.length > 0) {
        console.log(`   - Data terbaru: ${riwayatAbsensi[0].status} pada ${riwayatAbsensi[0].tanggal}`);
      }

      const riwayatAbsensiFormat = riwayatAbsensi.map(item => ({
        ...item,
        tanggalFormat: new Date(item.tanggal).toLocaleDateString('id-ID', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          timeZone: 'Asia/Jakarta'
        })
      }));
      res.render('karyawan/absensi', {
        title: 'Absensi - NusaAttend',
        layout: 'dashboard-layout',
        halaman: 'absensi',
        user: req.session.user,
        absen,
        socketToken: req.session.socketToken || "",
        riwayatAbsensi : riwayatAbsensiFormat
      });

    } catch (err) {
      console.error(err);
      res.status(500).render('publik/500');
    }
  },


};

module.exports = absensiController;
