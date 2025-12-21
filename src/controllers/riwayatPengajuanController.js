/**
 * ==================== CONTROLLER RIWAYAT PENGAJUAN ====================
 * Controller untuk mengambil data riwayat pengajuan surat izin milik pengguna (karyawan)
 * 
 * Catatan Penting:
 * - Endpoint ini HANYA MEMBACA DATA, tidak mengubah apa pun
 * - Data riwayat pengajuan bersifat informatif dan administratif
 * - Tidak ada logika approval, persetujuan, atau penolakan
 * - Sistem ini HANYA menampilkan arsip pengajuan yang telah dikirim
 */

const Pengguna = require('../models/Pengguna');
const Pengajuan = require('../models/Pengajuan');

/**
 * Helper function: Map jenis_izin dari database ke display name dan icon
 * Database: 'wfh', 'cuti', 'izin-sakit', 'izin-tidak-masuk-kerja'
 * Display dengan icon:
 * - 'wfh' → 'Work From Home' + fas fa-laptop-house
 * - 'cuti' → 'Cuti Tahunan' + fas fa-calendar-check
 * - 'izin-sakit' → 'Izin Sakit' + fas fa-heartbeat
 * - 'izin-tidak-masuk-kerja' → 'Izin Tidak Masuk Kerja' + fas fa-ban
 */
function mapJenisIzin(jenisIzinDb) {
  const mapping = {
    'wfh': { display: 'Work From Home', icon: 'fa-laptop-house' },
    'cuti': { display: 'Cuti Tahunan', icon: 'fa-calendar-check' },
    'izin-sakit': { display: 'Izin Sakit', icon: 'fa-heartbeat' },
    'izin_sakit': { display: 'Izin Sakit', icon: 'fa-heartbeat' }, // fallback untuk underscore
    'izin-tidak-masuk-kerja': { display: 'Izin Tidak Masuk Kerja', icon: 'fa-ban' },
    'izin_tidak_masuk_kerja': { display: 'Izin Tidak Masuk Kerja', icon: 'fa-ban' } // fallback untuk underscore
  };
  return mapping[jenisIzinDb] || { display: jenisIzinDb, icon: 'fa-calendar' };
}

/**
 * Helper function: Map status dari database ke display name
 * Database: 'menunggu', 'disetujui', 'ditolak'
 * Display: 'Menunggu Persetujuan', 'Disetujui', 'Ditolak'
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
 * Helper function: Format tanggal ke format lokal Indonesia
 * Input: Date object atau ISO string
 * Output: 'DD MMM YYYY' (e.g., '22 Des 2025')
 */
function formatTanggalIndonesia(date) {
  if (!date) return '';
  const d = new Date(date);
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${d.getDate()} ${bulan[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Helper function: Hitung durasi (jumlah hari) antara dua tanggal
 * Inclusive pada kedua tanggal
 */
function hitungDurasi(tanggalMulai, tanggalSelesai) {
  const mulai = new Date(tanggalMulai);
  const selesai = new Date(tanggalSelesai);
  const selisih = selesai - mulai;
  const hari = Math.floor(selisih / (1000 * 60 * 60 * 24)) + 1; // +1 untuk inclusive
  return hari > 0 ? `${hari} hari` : '0 hari';
}

/**
 * Helper function: Format periode (tanggal mulai - tanggal selesai)
 */
function formatPeriode(tanggalMulai, tanggalSelesai) {
  const mulai = formatTanggalIndonesia(tanggalMulai);
  const selesai = formatTanggalIndonesia(tanggalSelesai);
  return `${mulai} - ${selesai}`;
}

/**
 * Fungsi: ambilRiwayatPengajuanPengguna
 * 
 * Deskripsi:
 * Mengambil riwayat pengajuan surat izin milik satu pengguna (karyawan).
 * Data ini bersifat READ-ONLY dan hanya digunakan untuk tampilan administratif.
 * 
 * Parameter:
 * - req: request object dari Express
 * - res: response object dari Express
 * 
 * Validasi:
 * - Pengguna HARUS sudah ter-autentikasi (session ada)
 * - Pengguna HARUS memiliki role 'karyawan'
 * 
 * Response:
 * - Mengembalikan JSON dengan format terstandar
 * - Field data.riwayat_pengajuan berisi array riwayat pengajuan
 * - Jika tidak ada data, mengembalikan array kosong (valid secara akademik)
 * 
 * Catatan Desain:
 * - Karena sistem pengajuan utama masih dalam tahap pengembangan,
 *   controller ini mengembalikan array kosong yang valid
 * - Struktur data sudah siap untuk integrasi di masa depan
 */
exports.ambilRiwayatPengajuanPengguna = async (req, res) => {
  try {
    // Validasi: Pastikan pengguna sudah login
    if (!req.session.user) {
      return res.status(401).json({
        success: false,
        message: 'Pengguna belum ter-autentikasi. Silakan login terlebih dahulu.',
        data: null
      });
    }

    // Validasi: Pastikan pengguna adalah karyawan
    if (req.session.user.role !== 'karyawan') {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak. Hanya karyawan yang dapat mengakses riwayat pengajuan.',
        data: null
      });
    }

    // Ambil ID pengguna dari session
    const idPengguna = req.session.user.id;

    // ==================== LOGIKA DATA READ-ONLY ====================
    /**
     * Query pengajuan dari database berdasarkan karyawan_id
     * - Seleksi fields: jenis_izin, tanggal_mulai, tanggal_selesai, status, dibuat_pada
     * - Sort: descending berdasarkan tanggal dibuat (terbaru dulu)
     * - Lean: return plain objects bukan Mongoose documents
     */
    const daftarPengajuanDb = await Pengajuan.find({ karyawan_id: idPengguna })
      .select('jenis_izin tanggal_mulai tanggal_selesai status dibuat_pada')
      .sort({ dibuat_pada: -1 })
      .lean();

    // Map data dari database ke format yang diharapkan template
    const daftarRiwayatPengajuan = daftarPengajuanDb.map(pengajuan => ({
      jenisIzin: mapJenisIzin(pengajuan.jenis_izin).display,
      iconJenisIzin: mapJenisIzin(pengajuan.jenis_izin).icon,
      periode: formatPeriode(pengajuan.tanggal_mulai, pengajuan.tanggal_selesai),
      durasi: hitungDurasi(pengajuan.tanggal_mulai, pengajuan.tanggal_selesai),
      tanggalPengajuan: formatTanggalIndonesia(pengajuan.dibuat_pada),
      statusPengajuan: mapStatus(pengajuan.status)
    }));

    return res.json({
      success: true,
      message: 'Riwayat pengajuan pengguna berhasil diambil',
      data: {
        riwayat_pengajuan: daftarRiwayatPengajuan
      }
    });

  } catch (error) {
    // Error handling: Tangkap error tanpa expose sistem
    console.error('Error di ambilRiwayatPengajuanPengguna:', error);

    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil riwayat pengajuan. Silakan coba beberapa saat lagi.',
      data: null
    });
  }
};
