const dashboardHelper = require('../utils/dashboardHelper');

/**
 * Controller untuk Dashboard Penanggung Jawab
 * Mengelola pengambilan data ringkasan dan aktivitas terbaru tim
 * 
 * Tujuan: Menyuplai data untuk halaman dashboard penanggung jawab yang berfungsi
 * sebagai portal ringkasan kondisi tim dan aktivitas terbaru unit
 * 
 * Data hanya bersifat READ-ONLY (tidak ada operasi create/update/delete)
 */

/**
 * Fungsi: ambilDataDashboardPenanggungJawab
 * 
 * Mengambil data ringkasan sistem dan aktivitas terbaru untuk dashboard penanggung jawab
 * 
 * Data yang dikembalikan:
 * 1. Ringkasan Angka:
 *    - total_karyawan: Count User dengan role 'karyawan'
 *    - total_penanggung_jawab: Count User dengan role 'penanggung-jawab'
 *    - total_akun_aktif: Count User dengan adalah_aktif: true
 *    - total_aktivitas_hari_ini: User yang dibuat atau diupdate hari ini
 * 
 * 2. Aktivitas Terbaru:
 *    - Maksimal 5 data terakhir
 *    - Diambil dari User berdasarkan updatedAt (terbaru dulu)
 *    - Dimapped menjadi format aktivitas yang readable
 * 
 * @param {Object} req - Request object dari Express
 * @param {Object} res - Response object dari Express
 */
exports.ambilDataDashboardPenanggungJawab = async (req, res) => {
  try {
    /**
     * ==================== HITUNG RINGKASAN ANGKA ====================
     */

    /**
     * Menggunakan utility function untuk menghitung ringkasan dashboard
     * Menghindari duplikasi logic dengan route handler di app.js
     */
    const ringkasan = await dashboardHelper.hitungRingkasanDashboard();

    /**
     * ==================== AMBIL AKTIVITAS TERBARU ====================
     */

    /**
     * Menggunakan utility function untuk mengambil dan transform aktivitas terbaru
     * Menghindari duplikasi logic dengan route handler di app.js
     */
    const { aktivitasTerbaru } = await dashboardHelper.ambilAktivitasTerbaru(
      ringkasan.hariIniMulai,
      ringkasan.hariIniAkhir
    );

    /**
     * ==================== KIRIM RESPONSE ====================
     */

    /**
     * Format response sesuai standar API
     * - success: boolean status response
     * - message: pesan deskriptif untuk user/frontend
     * - data: payload berisi ringkasan dan aktivitas
     */
    return res.status(200).json({
      success: true,
      message: 'Data dashboard penanggung jawab berhasil diambil',
      data: {
        ringkasan: {
          total_karyawan: ringkasan.totalKaryawan,
          total_penanggung_jawab: ringkasan.totalPenanggungJawab,
          total_akun_aktif: ringkasan.totalAkunAktif,
          total_aktivitas_hari_ini: ringkasan.totalAktivitasHariIni
        },
        aktivitas_terbaru: aktivitasTerbaru
      }
    });
  } catch (error) {
    /**
     * ==================== ERROR HANDLING ====================
     */

    console.error('Error mengambil data dashboard penanggung jawab:', error);

    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data dashboard. Silakan coba beberapa saat lagi.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
