const Pengguna = require('../models/Pengguna');

/**
 * Controller untuk Dashboard Admin Sistem
 * Mengelola pengambilan data ringkasan dan aktivitas terbaru
 * 
 * Tujuan: Menyuplai data untuk halaman dashboard admin yang berfungsi sebagai
 * portal ringkasan kondisi sistem dan pintu masuk ke halaman manajemen lain
 * 
 * Data hanya bersifat READ-ONLY (tidak ada operasi create/update/delete)
 */

/**
 * Fungsi: ambilDataDashboardAdmin
 * 
 * Mengambil data ringkasan sistem dan aktivitas terbaru untuk dashboard admin
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
exports.ambilDataDashboardAdmin = async (req, res) => {
  try {
    /**
     * ==================== HITUNG RINGKASAN ANGKA ====================
     */

    /**
     * Hitung total karyawan
     * Query User dengan role 'karyawan'
     */
    const totalKaryawan = await Pengguna.countDocuments({ role: 'karyawan' });

    /**
     * Hitung total penanggung jawab
     * Query User dengan role 'penanggung-jawab'
     */
    const totalPenanggungJawab = await Pengguna.countDocuments({ role: 'penanggung-jawab' });

    /**
     * Hitung total akun aktif
     * Query User dengan adalah_aktif: true
     */
    const totalAkunAktif = await Pengguna.countDocuments({ adalah_aktif: true });

    /**
     * Hitung total aktivitas hari ini
     * Cek user yang dibuat atau diupdate pada hari yang sama (hari ini)
     * 
     * Logic:
     * 1. Set waktu mulai: hari ini jam 00:00:00
     * 2. Set waktu akhir: hari ini jam 23:59:59
     * 3. Filter: createdAt ATAU updatedAt dalam range tersebut
     */
    const hariIniMulai = new Date();
    hariIniMulai.setHours(0, 0, 0, 0); // Jam 00:00:00

    const hariIniAkhir = new Date();
    hariIniAkhir.setHours(23, 59, 59, 999); // Jam 23:59:59

    const totalAktivitasHariIni = await Pengguna.countDocuments({
      $or: [
        { createdAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
        { updatedAt: { $gte: hariIniMulai, $lte: hariIniAkhir } }
      ]
    });

    /**
     * ==================== AMBIL AKTIVITAS TERBARU ====================
     */

    /**
     * Query 5 user terakhir berdasarkan updatedAt
     * Diurutkan dari yang paling baru
     * Select field yang diperlukan saja (tidak select password)
     */
    const daftarUserTerbaru = await Pengguna.find()
      .select('nama_lengkap jabatan email role adalah_aktif createdAt updatedAt')
      .sort({ updatedAt: -1 }) // Terbaru dulu
      .limit(5)
      .lean(); // Gunakan lean() untuk query lebih cepat (read-only)

    /**
     * Map data user menjadi format aktivitas
     * Transform createdAt/updatedAt menjadi deskripsi aktivitas dan waktu relatif
     */
    const aktivitasTerbaru = daftarUserTerbaru.map(user => {
      /**
       * Tentukan jenis aktivitas berdasarkan apakah user baru dibuat atau diupdate
       */
      const isNew = hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;
      
      let deskripsi = '';
      if (user.role === 'karyawan') {
        deskripsi = isNew ? 'Akun karyawan baru dibuat' : 'Data karyawan diperbarui';
      } else if (user.role === 'penanggung-jawab') {
        deskripsi = isNew ? 'Penanggung jawab ditambahkan' : 'Data penanggung jawab diperbarui';
      } else if (user.role === 'admin') {
        deskripsi = isNew ? 'Admin sistem ditambahkan' : 'Data admin diperbarui';
      }

      /**
       * Hitung waktu relatif (berapa lama yang lalu)
       * Fungsi helper untuk format waktu readable
       */
      const waktuSekarang = new Date();
      const selisihMs = waktuSekarang - user.updatedAt;
      const selisihDetik = Math.floor(selisihMs / 1000);
      const selisihMenit = Math.floor(selisihDetik / 60);
      const selisihJam = Math.floor(selisihMenit / 60);
      const selisihHari = Math.floor(selisihJam / 24);

      let waktuRelatif = '';
      if (selisihDetik < 60) {
        waktuRelatif = 'Baru saja';
      } else if (selisihMenit < 60) {
        waktuRelatif = `${selisihMenit} menit lalu`;
      } else if (selisihJam < 24) {
        waktuRelatif = `${selisihJam} jam lalu`;
      } else {
        waktuRelatif = `${selisihHari} hari lalu`;
      }

      /**
       * Return object aktivitas dengan format yang dibutuhkan frontend
       */
      return {
        deskripsi: deskripsi,
        nama_pengguna: user.nama_lengkap,
        jabatan: user.jabatan,
        waktu_relatif: waktuRelatif
      };
    });

    /**
     * ==================== SUSUN RESPONSE ====================
     */

    // Response sukses dengan format yang telah ditentukan
    res.status(200).json({
      success: true,
      message: 'Data dashboard admin berhasil diambil',
      data: {
        ringkasan: {
          total_karyawan: totalKaryawan,
          total_penanggung_jawab: totalPenanggungJawab,
          total_akun_aktif: totalAkunAktif,
          total_aktivitas_hari_ini: totalAktivitasHariIni
        },
        aktivitas_terbaru: aktivitasTerbaru
      }
    });
  } catch (error) {
    /**
     * Error handling yang aman
     * Tidak expose error mentah MongoDB ke client
     */
    console.error('Error ambilDataDashboardAdmin:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data dashboard admin',
      error: error.message
    });
  }
};
