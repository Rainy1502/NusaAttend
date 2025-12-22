const Absensi = require('../models/Absensi');
const Pengajuan = require('../models/Pengajuan');
const Pengguna = require('../models/Pengguna');

/**
 * Ambil konteks data pengguna untuk chatbot
 * 
 * Mengumpulkan informasi pengguna dari database untuk diberikan ke AI model:
 * - Riwayat absensi (kehadiran, izin, sakit, dll)
 * - Riwayat pengajuan (surat izin yang sudah diajukan)
 * - Informasi pengguna dasar (nama, jabatan)
 * 
 * Data ini digunakan AI untuk memberikan respons yang lebih kontekstual
 * dan akurat berdasarkan data AKTUAL pengguna, bukan asumsi.
 * 
 * @param {string} userId - User ID (ObjectId dari Pengguna model)
 * @returns {object} - Konteks dengan struktur {absensi[], pengajuan[], ringkasan}
 */
exports.ambilContextUser = async (userId) => {
  try {
    // ==================== AMBIL DATA ABSENSI ====================
    // Query: 30 catatan absensi terbaru untuk konteks kehadiran
    const daftarAbsensi = await Absensi.find({
      id_pengguna: userId
    })
      .select('tanggal jam_masuk jam_pulang status keterangan')
      .sort({ tanggal: -1 })
      .limit(30)
      .lean();

    // ==================== AMBIL DATA PENGAJUAN ====================
    // Query: 20 pengajuan terbaru untuk konteks status pengajuan
    // PENTING: Model Pengajuan menggunakan field 'karyawan_id' bukan 'id_pengguna'
    const daftarPengajuan = await Pengajuan.find({
      karyawan_id: userId
    })
      .select('jenis_izin tanggal_mulai tanggal_selesai status dibuat_pada')
      .sort({ dibuat_pada: -1 })
      .limit(20)
      .lean();

    // ==================== AMBIL INFORMASI PENGGUNA ====================
    const infoPengguna = await Pengguna.findById(userId)
      .select('nama_lengkap jabatan email role')
      .lean();

    // ==================== HITUNG RINGKASAN UNTUK KONTEKS ====================
    // Membantu AI memahami status pengguna dengan cepat
    const ringkasan = {
      totalAbsensi: daftarAbsensi.length,
      hadiranBulanIni: 0,
      totalPengajuan: daftarPengajuan.length,
      menungguPersetujuan: 0,
      disetujui: 0,
      ditolak: 0
    };

    // Hitung kehadiran bulan ini
    const bulanIniMulai = new Date();
    bulanIniMulai.setDate(1);
    bulanIniMulai.setHours(0, 0, 0, 0);

    const bulanIniAkhir = new Date();
    bulanIniAkhir.setMonth(bulanIniAkhir.getMonth() + 1);
    bulanIniAkhir.setDate(0);
    bulanIniAkhir.setHours(23, 59, 59, 999);

    ringkasan.hadiranBulanIni = daftarAbsensi.filter(a => {
      const tgl = new Date(a.tanggal);
      return tgl >= bulanIniMulai && tgl <= bulanIniAkhir && a.status === 'hadir';
    }).length;

    // Hitung status pengajuan
    daftarPengajuan.forEach(p => {
      if (p.status === 'menunggu') ringkasan.menungguPersetujuan++;
      else if (p.status === 'disetujui') ringkasan.disetujui++;
      else if (p.status === 'ditolak') ringkasan.ditolak++;
    });

    // ==================== RETURN KONTEKS ====================
    return {
      absensi: daftarAbsensi,
      pengajuan: daftarPengajuan,
      infoPengguna: infoPengguna,
      ringkasan: ringkasan
    };
  } catch (error) {
    console.error('❌ Error ambilContextUser:', error);
    // Return empty context jika error, jangan throw
    return {
      absensi: [],
      pengajuan: [],
      infoPengguna: null,
      ringkasan: {
        totalAbsensi: 0,
        hadiranBulanIni: 0,
        totalPengajuan: 0,
        menungguPersetujuan: 0,
        disetujui: 0,
        ditolak: 0
      }
    };
  }
};
