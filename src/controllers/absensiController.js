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

      console.log(`\n🔍 ===== ABSEN MASUK DEBUG =====`);
      console.log(`   ID Pengguna: ${idPengguna}`);
      console.log(`   Tanggal Hari Ini: ${tanggalHariIni.toString()}`);

      let absensiHariIni = await Absensi.findOne({
        id_pengguna: idPengguna,
        tanggal: {
          $gte: new Date(tanggalHariIni.getFullYear(), tanggalHariIni.getMonth(), tanggalHariIni.getDate(), 0, 0, 0),
          $lt: new Date(tanggalHariIni.getFullYear(), tanggalHariIni.getMonth(), tanggalHariIni.getDate() + 1, 0, 0, 0)
        }
      });

      if (absensiHariIni) {
        console.log(`   📊 Record ditemukan:`);
        console.log(`      - ID: ${absensiHariIni._id}`);
        console.log(`      - Status: "${absensiHariIni.status}" (type: ${typeof absensiHariIni.status})`);
        console.log(`      - Jam Masuk: ${absensiHariIni.jam_masuk}`);
        console.log(`      - Keterangan: ${absensiHariIni.keterangan}`);
        console.log(`      - Check izin: ${absensiHariIni.status === 'izin'}`);
        console.log(`      - Check cuti: ${absensiHariIni.status === 'cuti'}`);
      } else {
        console.log(`   ❌ Tidak ada record untuk hari ini`);
      }

      // Cek jika sudah dibuat izin/cuti otomatis dari pengajuan
      if (absensiHariIni && (absensiHariIni.status === 'izin' || absensiHariIni.status === 'cuti')) {
        console.log(`   ❌ REJECTED: User sudah diizinkan untuk hari ini`);
        return res.status(400).json({
          success: false,
          message: `Anda tidak bisa absen hari ini karena sudah diizinkan (${absensiHariIni.keterangan})`
        });
      }

      if (!absensiHariIni) {
        console.log(`   ✅ Membuat record absensi baru`);
        absensiHariIni = await Absensi.create({
          id_pengguna: idPengguna,
          tanggal: tanggalHariIni,
          jam_masuk: jamMasuk,
          keterangan,
          status: 'hadir'
        });
      } else if (absensiHariIni.jam_masuk) {
        console.log(`   ❌ REJECTED: User sudah absen masuk sebelumnya`);
        return res.status(400).json({
          success: false,
          message: 'Anda sudah melakukan absen masuk hari ini'
        });
      } else {
        console.log(`   ✅ Updating record absensi yang ada`);
        absensiHariIni.jam_masuk = jamMasuk;
        absensiHariIni.keterangan = keterangan;
        if (!absensiHariIni.status || absensiHariIni.status === 'izin' || absensiHariIni.status === 'cuti') {
          // Jangan ubah status jika sudah izin/cuti
        } else {
          absensiHariIni.status = 'hadir';
        }
        await absensiHariIni.save();
      }

      console.log(`   ✅ SUCCESS: Absen masuk berhasil\n`);
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

      // Cek jika sudah dibuat izin/cuti otomatis dari pengajuan
      if (absensiHariIni && (absensiHariIni.status === 'izin' || absensiHariIni.status === 'cuti')) {
        return res.status(400).json({
          success: false,
          message: `Anda tidak bisa absen hari ini karena sudah diizinkan (${absensiHariIni.keterangan})`
        });
      }

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
            keterangan: absensiHariIni.keterangan,
            status: absensiHariIni.status
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

      // Helper function untuk format jenis izin
      const formatJenisIzin = (jenisIzinDb) => {
        if (!jenisIzinDb) return jenisIzinDb;
        // Format: izin-tidak-masuk → Izin tidak masuk
        return jenisIzinDb
          .split('-')
          .map((word, idx) => idx === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word)
          .join(' ');
      };

      const riwayatAbsensiFormat = riwayatAbsensi.map(item => ({
        ...item,
        keterangan: item.keterangan ? formatJenisIzin(item.keterangan) : null,
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
