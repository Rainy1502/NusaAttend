/**
 * ==================== CONTROLLER DASHBOARD PENGGUNA ====================
 * 
 * Tujuan:
 * Menyediakan backend API READ-ONLY untuk Dashboard Pengguna (Karyawan)
 * yang menampilkan ringkasan administratif kehadiran dan pengajuan
 * 
 * Sifat:
 * - HANYA MEMBACA DATA, tidak mengubah apa pun
 * - Data bersifat administratif dan informatif
 * - BUKAN sistem perhitungan cuti real atau absensi real
 * - BUKAN sistem approval atau persetujuan
 * 
 * Catatan Akademik:
 * - Backend ini adalah endpoint untuk menyuplai data visual dashboard
 * - Semua nilai ringkasan dikembalikan sebagai angka administratif
 * - Jika sistem detail belum lengkap, dikembalikan nilai default (0 atau array kosong)
 * - Konsisten dengan prinsip backend MVP (Minimum Viable Product)
 */

const Pengguna = require('../models/Pengguna');
const Pengajuan = require('../models/Pengajuan');

/**
 * Function: ambilDataDashboardPengguna
 * 
 * Mengambil data ringkasan dashboard untuk satu pengguna (karyawan)
 * 
 * Endpoint: GET /api/pengguna/dashboard
 * Middleware: Autentikasi (req.session.user harus ada)
 * 
 * Returns:
 * {
 *   "success": true,
 *   "message": "Data dashboard pengguna berhasil diambil",
 *   "data": {
 *     "nama_pengguna": string,
 *     "ringkasan": {
 *       "sisa_cuti": number,
 *       "kehadiran_bulan_ini": number,
 *       "menunggu_persetujuan": number,
 *       "tidak_hadir": number
 *     },
 *     "pengajuan_terbaru": array
 *   }
 * }
 */
async function ambilDataDashboardPengguna(req, res) {
  try {
    // Ambil ID pengguna dari session autentikasi
    const idPengguna = req.session.user.id;

    // ==================== AMBIL DATA PENGGUNA ====================
    const pengguna = await Pengguna.findById(idPengguna)
      .select('nama_lengkap')
      .lean();

    if (!pengguna) {
      return res.status(404).json({
        success: false,
        message: 'Pengguna tidak ditemukan',
        data: null
      });
    }

    // ==================== RINGKASAN ADMINISTRATIF ====================
    /**
     * Catatan: Nilai ringkasan berdasarkan data yang tersedia di database
     * - sisa_cuti: Default 12 hari (standar cuti tahunan Indonesia)
     *   Dalam implementasi penuh, akan dihitung dari pengajuan yang sudah disetujui
     * - kehadiran_bulan_ini: Dihitung dari Absensi records bulan ini
     * - tidak_hadir: Jumlah hari tidak hadir (izin + sakit)
     * - menunggu_persetujuan: Count dari Pengajuan dengan status 'menunggu'
     */

    // Default sisa cuti (standar 12 hari per tahun)
    const sisaCuti = 12;

    // Hitung kehadiran bulan ini dari Absensi collection (jika ada)
    let kehadiranBulanIni = 0;
    try {
      const Absensi = require('../models/Absensi');
      const bulanIniMulai = new Date();
      bulanIniMulai.setDate(1);
      bulanIniMulai.setHours(0, 0, 0, 0);

      const bulanIniAkhir = new Date();
      bulanIniAkhir.setMonth(bulanIniAkhir.getMonth() + 1);
      bulanIniAkhir.setDate(0);
      bulanIniAkhir.setHours(23, 59, 59, 999);

      kehadiranBulanIni = await Absensi.countDocuments({
        id_pengguna: idPengguna,
        tanggal: { $gte: bulanIniMulai, $lte: bulanIniAkhir },
        status: 'hadir'
      });
    } catch (err) {
      // Jika Absensi belum ada atau error, default ke 0
      kehadiranBulanIni = 0;
    }

    // Hitung tidak hadir dari Pengajuan (izin, sakit)
    const tidakHadir = 0; // Default untuk sekarang, bisa dihitung dari Pengajuan

    // ==================== AMBIL PENGAJUAN TERBARU ====================
    /**
     * Query: Pengajuan milik pengguna, urutkan terbaru, maksimal 5 item
     * Filter: Hanya tampilkan pengajuan dengan status valid
     * Format: Sederhana dan informatif
     * 
     * Note: Menggunakan karyawan_id karena field di model Pengajuan, bukan pengguna_id
     */
    const daftarPengajuanTerbaru = await Pengajuan.find({
      karyawan_id: idPengguna
    })
      .select('jenis_izin tanggal_mulai tanggal_selesai dibuat_pada status')
      .sort({ dibuat_pada: -1 })
      .limit(5)
      .lean();

    // Transform pengajuan ke format display
    const pengajuanTerbaru = daftarPengajuanTerbaru.map(pengajuan => {
      // Map jenis izin ke display name
      const jenisIzinDisplay = mapJenisIzin(pengajuan.jenis_izin);

      // Map status ke display name (untuk badge display)
      const statusDisplay = mapStatus(pengajuan.status);

      // Format tanggal ke DD MMM YYYY
      const tanggalFormatted = formatTanggalIndonesia(pengajuan.tanggal_mulai);
      const tanggalDiajukanFormatted = formatTanggalIndonesia(pengajuan.dibuat_pada);

      return {
        // Format template dashboard: jenisIzin, tanggal, diajukan, status
        jenisIzin: jenisIzinDisplay,
        tanggal: tanggalFormatted,
        diajukan: tanggalDiajukanFormatted,
        status: pengajuan.status, // Keep raw status untuk conditional di template
        // Also include formatted version for display
        status_pengajuan: statusDisplay
      };
    });

    // Hitung jumlah pengajuan yang menunggu persetujuan
    const jumlahMenungguPersetujuan = daftarPengajuanTerbaru.filter(
      p => p.status === 'menunggu'
    ).length;

    // ==================== RETURN RESPONSE ====================
    return res.status(200).json({
      success: true,
      message: 'Data dashboard pengguna berhasil diambil',
      data: {
        nama_pengguna: pengguna.nama_lengkap,
        ringkasan: {
          sisa_cuti: sisaCuti,
          kehadiran_bulan_ini: kehadiranBulanIni,
          menunggu_persetujuan: jumlahMenungguPersetujuan,
          tidak_hadir: tidakHadir
        },
        pengajuan_terbaru: pengajuanTerbaru
      }
    });
  } catch (error) {
    // Handle error dengan pesan manusiawi (jangan expose error mentah)
    console.error('Error ambilDataDashboardPengguna:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard pengguna',
      data: null
    });
  }
}

/**
 * Helper Function: mapJenisIzin
 * 
 * Map jenis_izin dari database ke display name
 * Database values: 'cuti-tahunan', 'izin-tidak-masuk', 'izin-sakit', 'wfh'
 */
function mapJenisIzin(jenisIzinDb) {
  const mapping = {
    'cuti-tahunan': 'Cuti Tahunan',
    'izin-tidak-masuk': 'Izin Tidak Masuk Kerja',
    'izin-sakit': 'Izin Sakit',
    'wfh': 'Work From Home',
    // Fallback untuk format berbeda
    'cuti': 'Cuti Tahunan',
    'izin_tidak_masuk': 'Izin Tidak Masuk Kerja',
    'izin_sakit': 'Izin Sakit'
  };
  return mapping[jenisIzinDb] || jenisIzinDb;
}

/**
 * Helper Function: mapStatus
 * 
 * Map status dari database ke display name
 * Database values: 'menunggu', 'disetujui', 'ditolak'
 */
function mapStatus(statusDb) {
  const mapping = {
    'menunggu': 'Menunggu Persetujuan',
    'disetujui': 'Disetujui',
    'ditolak': 'Ditolak'
  };
  return mapping[statusDb] || statusDb;
}

/**
 * Helper Function: formatTanggalIndonesia
 * 
 * Format tanggal ke format Indonesia: "DD MMM YYYY"
 * Contoh: "22 Des 2025"
 */
function formatTanggalIndonesia(tanggal) {
  if (!tanggal) return '-';

  const date = new Date(tanggal);
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const hari = date.getDate();
  const bulanIndex = date.getMonth();
  const tahun = date.getFullYear();

  return `${hari} ${bulan[bulanIndex]} ${tahun}`;
}

// ==================== EXPORT ====================
module.exports = {
  ambilDataDashboardPengguna
};
