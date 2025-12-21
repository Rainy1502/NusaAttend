const User = require('../models/User');

/**
 * Utility untuk Dashboard Penanggung Jawab
 * Fungsi-fungsi helper untuk menghitung ringkasan dan mengambil aktivitas terbaru
 * 
 * Digunakan oleh:
 * - dashboardPenanggungJawabController.js (API endpoint)
 * - app.js (route rendering)
 */

/**
 * Helper function untuk menghitung waktu relatif dari timestamp
 * 
 * @param {Date} timestamp - Timestamp yang akan dihitung
 * @param {Object} options - Opsi untuk formatting
 * @param {string} options.justNowText - Text untuk "baru saja" (default: "Baru saja")
 * @param {string} options.minutePrefix - Prefix untuk menit (default: "")
 * @param {string} options.hourPrefix - Prefix untuk jam (default: "")
 * @param {string} options.dayPrefix - Prefix untuk hari (default: "")
 * @returns {string} Waktu relatif dalam format readable
 */
function hitungWaktuRelatif(timestamp, options = {}) {
  const {
    justNowText = 'Baru saja',
    minutePrefix = '',
    hourPrefix = '',
    dayPrefix = ''
  } = options;
  
  const waktuSekarang = new Date();
  const selisihMs = waktuSekarang - timestamp;
  const selisihDetik = Math.floor(selisihMs / 1000);
  const selisihMenit = Math.floor(selisihDetik / 60);
  const selisihJam = Math.floor(selisihMenit / 60);
  const selisihHari = Math.floor(selisihJam / 24);
  
  if (selisihDetik < 60) {
    return justNowText;
  } else if (selisihMenit < 60) {
    return `${minutePrefix}${selisihMenit} menit lalu`;
  } else if (selisihJam < 24) {
    return `${hourPrefix}${selisihJam} jam lalu`;
  } else {
    return `${dayPrefix}${selisihHari} hari lalu`;
  }
}

/**
 * Hitung ringkasan statistik dashboard
 * 
 * @returns {Object} Objek berisi ringkasan statistik
 */
async function hitungRingkasanDashboard() {
  const totalKaryawan = await User.countDocuments({ role: 'karyawan' });
  const totalPenanggungJawab = await User.countDocuments({ role: 'penanggung-jawab' });
  const totalAkunAktif = await User.countDocuments({ adalah_aktif: true });
  
  // Hitung aktivitas hari ini
  const hariIniMulai = new Date();
  hariIniMulai.setHours(0, 0, 0, 0);
  const hariIniAkhir = new Date();
  hariIniAkhir.setHours(23, 59, 59, 999);
  
  const totalAktivitasHariIni = await User.countDocuments({
    $or: [
      { createdAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
      { updatedAt: { $gte: hariIniMulai, $lte: hariIniAkhir } }
    ]
  });
  
  return {
    totalKaryawan,
    totalPenanggungJawab,
    totalAkunAktif,
    totalAktivitasHariIni,
    hariIniMulai,
    hariIniAkhir
  };
}

/**
 * Ambil dan transform data user terbaru menjadi format aktivitas
 * 
 * @param {Date} hariIniMulai - Waktu mulai hari ini (00:00:00)
 * @param {Date} hariIniAkhir - Waktu akhir hari ini (23:59:59)
 * @returns {Object} Objek berisi daftarUserTerbaru dan aktivitasTerbaru
 */
async function ambilAktivitasTerbaru(hariIniMulai, hariIniAkhir) {
  // Query 5 user terakhir berdasarkan updatedAt
  const daftarUserTerbaru = await User.find()
    .select('nama_lengkap jabatan email role adalah_aktif createdAt updatedAt')
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();
  
  // Map data user menjadi format aktivitas
  const aktivitasTerbaru = daftarUserTerbaru.map(user => {
    const isNew = hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;
    
    let deskripsi = '';
    if (user.role === 'karyawan') {
      deskripsi = isNew ? 'Akun karyawan baru dibuat' : 'Data karyawan diperbarui';
    } else if (user.role === 'penanggung-jawab') {
      deskripsi = isNew ? 'Penanggung jawab ditambahkan' : 'Data penanggung jawab diperbarui';
    } else if (user.role === 'admin') {
      deskripsi = isNew ? 'Admin sistem ditambahkan' : 'Data admin diperbarui';
    }
    
    // Hitung waktu relatif menggunakan helper function
    const waktuRelatif = hitungWaktuRelatif(user.updatedAt);
    
    return {
      deskripsi,
      nama_pengguna: user.nama_lengkap,
      jabatan: user.jabatan,
      waktu_relatif: waktuRelatif
    };
  });
  
  return {
    daftarUserTerbaru,
    aktivitasTerbaru
  };
}

/**
 * Transform data user terbaru menjadi format pengajuan mendesak
 * (Format khusus untuk view rendering di app.js)
 * 
 * @param {Array} daftarUserTerbaru - Array user dari database
 * @param {Date} hariIniMulai - Waktu mulai hari ini
 * @param {Date} hariIniAkhir - Waktu akhir hari ini
 * @returns {Array} Array pengajuan mendesak
 */
function transformKePengajuanMendesak(daftarUserTerbaru, hariIniMulai, hariIniAkhir) {
  return daftarUserTerbaru.map(user => {
    const isNew = hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;
    
    // Tentukan jenis pengajuan berdasarkan role user
    let jenisPengajuan = '';
    if (user.role === 'karyawan') {
      jenisPengajuan = isNew ? 'Pendaftaran Karyawan Baru' : 'Update Data Karyawan';
    } else if (user.role === 'penanggung-jawab') {
      jenisPengajuan = isNew ? 'Penambahan Penanggung Jawab' : 'Update Penanggung Jawab';
    } else if (user.role === 'admin') {
      jenisPengajuan = 'Update Admin Sistem';
    }
    
    // Format tanggal pengajuan
    const tanggalPengajuan = user.updatedAt.toLocaleDateString('id-ID', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
    
    // Hitung waktu relatif menggunakan helper function dengan prefix "Diajukan"
    const waktuPengajuan = hitungWaktuRelatif(user.updatedAt, {
      justNowText: 'Diajukan baru saja',
      minutePrefix: 'Diajukan ',
      hourPrefix: 'Diajukan ',
      dayPrefix: 'Diajukan '
    });
    
    return {
      namaKaryawan: user.nama_lengkap,
      jenisPengajuan: jenisPengajuan,
      tanggalPengajuan: tanggalPengajuan,
      waktuPengajuan: waktuPengajuan
    };
  });
}

module.exports = {
  hitungRingkasanDashboard,
  ambilAktivitasTerbaru,
  transformKePengajuanMendesak
};
