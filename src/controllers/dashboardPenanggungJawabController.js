/**
 * ==================== DASHBOARD PENANGGUNG JAWAB CONTROLLER ====================
 * 
 * Controller untuk endpoint dashboard administratif Penanggung Jawab.
 * 
 * 🔒 SIFAT: READ-ONLY DASHBOARD DISPLAY
 * - Hanya mengambil dan menampilkan ringkasan data
 * - TIDAK melakukan approval atau rejection pengajuan
 * - TIDAK mengubah status apa pun
 * - TIDAK menyimpan keputusan
 * - TIDAK menjalankan workflow persetujuan
 * 
 * 📊 TUJUAN:
 * - Menyediakan ringkasan administratif tingkat tinggi
 * - Menampilkan indikator kondisi pengajuan & kehadiran tim
 * - Memberikan tampilan dashboard visual untuk penanggung jawab
 * 
 * 🔍 ALASAN PENDEKATAN SAFE:
 * - Sistem pengajuan & kehadiran formal belum terimplementasi lengkap
 * - Mengembalikan angka aman (0) & array kosong yang valid secara akademik
 * - Tidak berspekulasi sistem yang belum ada
 * - Siap untuk integrasi real ketika sistem lengkap
 * 
 * ✅ ENDPOINT YANG DISEDIAKAN:
 * - GET /api/pengguna/dashboard-penanggung-jawab (READ-ONLY)
 */

const Pengguna = require('../models/Pengguna');
const Pengajuan = require('../models/Pengajuan');

/**
 * Mengambil data dashboard penanggung jawab
 * 
 * READ-ONLY: Hanya mengambil dan menampilkan data administratif
 * TIDAK ada logika approval, rejection, atau perubahan status
 * 
 * @route   GET /api/pengguna/dashboard-penanggung-jawab
 * @access  Private (Penanggung Jawab / Admin)
 * @returns {Object} Response dengan struktur ringkasan, pengajuan_mendesak, kehadiran, statistik
 */
async function ambilDataDashboardPenanggungJawab(req, res) {
  try {
    console.log('📊 Mengambil data dashboard penanggung jawab...');

    // ==================== RINGKASAN ANGKA ADMINISTRATIF ====================
    // 
    // Menghitung angka-angka real dari data yang ada di database
    // 
    // Data yang dihitung:
    // - menunggu_review: Count pengajuan dengan status "menunggu"
    // - disetujui_bulan_ini: Count pengajuan dengan status "disetujui" bulan ini
    // - ditolak_bulan_ini: Count pengajuan dengan status "ditolak" bulan ini
    // - total_karyawan: Count HANYA Pengguna dengan role "karyawan" yang ditanggungjawabi user ini
    
    // Hitung total karyawan yang ditanggungjawabi (filter by penanggung_jawab_id)
    // Referensi: Sama seperti di rekap-kehadiran, hanya ambil karyawan dengan penanggung_jawab_id = user yang login
    const totalKaryawan = await Pengguna.countDocuments({ 
      role: 'karyawan',
      penanggung_jawab_id: req.session.user.id  // Fix: gunakan .id bukan ._id
    });
    
    // Hitung pengajuan menunggu review (status = 'menunggu') - HANYA dari karyawan yang ditanggungjawabi
    // Filter: pengajuan dengan penanggung_jawab_id sama dengan user yang login
    // Catatan: Pengajuan lama mungkin punya penanggung_jawab_id = null, mereka tidak ditampilkan
    const menungguReview = await Pengajuan.countDocuments({ 
      status: 'menunggu',
      penanggung_jawab_id: req.session.user.id  // Fix: gunakan .id bukan ._id
    });
    
    // Hitung pengajuan disetujui bulan ini - HANYA dari karyawan yang ditanggungjawabi
    const bulanIniMulai = new Date();
    bulanIniMulai.setDate(1);
    bulanIniMulai.setHours(0, 0, 0, 0);
    
    const bulanIniAkhir = new Date();
    bulanIniAkhir.setMonth(bulanIniAkhir.getMonth() + 1);
    bulanIniAkhir.setDate(0);
    bulanIniAkhir.setHours(23, 59, 59, 999);
    
    const disetujuiBulanIni = await Pengajuan.countDocuments({
      status: 'disetujui',
      penanggung_jawab_id: req.session.user.id,  // Fix: gunakan .id bukan ._id
      tanggal_direview: { $gte: bulanIniMulai, $lte: bulanIniAkhir }
    });
    
    // Hitung pengajuan ditolak bulan ini - HANYA dari karyawan yang ditanggungjawabi
    const ditolakBulanIni = await Pengajuan.countDocuments({
      status: 'ditolak',
      penanggung_jawab_id: req.session.user.id,  // Fix: gunakan .id bukan ._id
      tanggal_direview: { $gte: bulanIniMulai, $lte: bulanIniAkhir }
    });

    // Data ringkasan dengan angka real dari database
    const ringkasan = {
      menunggu_review: menungguReview,
      disetujui_bulan_ini: disetujuiBulanIni,
      ditolak_bulan_ini: ditolakBulanIni,
      total_karyawan: totalKaryawan || 0
    };

    // ==================== DAFTAR PENGAJUAN MENDESAK (VISUAL ONLY) ====================
    // 
    // Pengajuan mendesak = pengajuan dengan status "menunggu" yang tanggal mulainya
    // paling dekat ke hari ini (upcoming soonest).
    // 
    // Logika:
    // 1. Query pengajuan dengan status "menunggu"
    // 2. Urutkan berdasarkan tanggal_mulai (terdekat dulu)
    // 3. Ambil maksimal 5 item teratas
    // 4. Map ke format display dengan label "Mendesak"
    
    const Pengajuan = require('../models/Pengajuan');
    
    const daftarPengajuanMendesak = await Pengajuan.find({ 
      status: 'menunggu',
      penanggung_jawab_id: req.session.user.id  // Fix: gunakan .id bukan ._id
    })
      .populate('karyawan_id', 'nama_lengkap')
      .sort({ tanggal_mulai: 1 })  // Paling dekat dulu
      .limit(5)
      .lean()
      .exec();

    // Transform data pengajuan mendesak untuk display
    const pengajuanMendesak = daftarPengajuanMendesak.map(pengajuan => {
      // Format tanggal pengajuan (kapan diajukan)
      const tanggalDiajukan = new Date(pengajuan.dibuat_pada).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      // Hitung waktu relatif (berapa lama yang lalu diajukan)
      const waktuSekarang = new Date();
      const selisihMs = waktuSekarang - new Date(pengajuan.dibuat_pada);
      const selisihDetik = Math.floor(selisihMs / 1000);
      const selisihMenit = Math.floor(selisihDetik / 60);
      const selisihJam = Math.floor(selisihMenit / 60);
      const selisihHari = Math.floor(selisihJam / 24);

      let waktuRelatif = '';
      if (selisihDetik < 60) {
        waktuRelatif = 'Diajukan baru saja';
      } else if (selisihMenit < 60) {
        waktuRelatif = `Diajukan ${selisihMenit} menit lalu`;
      } else if (selisihJam < 24) {
        waktuRelatif = `Diajukan ${selisihJam} jam lalu`;
      } else {
        waktuRelatif = `Diajukan ${selisihHari} hari lalu`;
      }

      // Format jenis izin untuk display
      const jenisIzinMap = {
        'cuti-tahunan': 'Cuti Tahunan',
        'izin-tidak-masuk': 'Izin Tidak Masuk',
        'izin-sakit': 'Izin Sakit',
        'wfh': 'Work From Home'
      };

      const tanggalMulai = new Date(pengajuan.tanggal_mulai).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return {
        nama_pengguna: pengajuan.karyawan_id?.nama_lengkap || 'Unknown',
        judul_pengajuan: `${jenisIzinMap[pengajuan.jenis_izin] || pengajuan.jenis_izin} - ${tanggalMulai}`,
        tanggal_pengajuan: tanggalDiajukan,
        waktu_relatif: waktuRelatif,
        label_prioritas: 'Mendesak'
      };
    });

    // ==================== RINGKASAN KEHADIRAN HARI INI (INDIKATIF) ====================
    // 
    // Angka bersifat indikatif & administratif.
    // Sistem kehadiran real belum terhubung ke dashboard.
    // 
    // Safe defaults:
    // - hadir: 0
    // - izin_cuti: 0  
    // - belum_absen: 0
    
    const kehadiranHariIni = {
      hadir: 0,           // Belum ada integrasi sistem kehadiran real
      izin_cuti: 0,       // Belum ada integrasi data cuti
      belum_absen: 0      // Belum ada sistem pencatatan kehadiran
    };

    // ==================== STATISTIK BULANAN (INFORMASI VISUAL) ====================
    // 
    // Angka bersifat informasi visual, bukan KPI real.
    // Hanya untuk tampilan dashboard, bukan untuk pengambilan keputusan.
    
    const statistikBulanan = {
      total_pengajuan: 0,           // Safe default: sistem pengajuan belum lengkap
      rata_rata_waktu_review: "-",  // Tidak ada data review untuk dihitung
      tingkat_persetujuan: 0        // Tidak ada approval history
    };

    console.log(`✅ Data dashboard siap:`);
    console.log(`   - Total karyawan: ${ringkasan.total_karyawan}`);
    console.log(`   - Pengajuan mendesak: ${pengajuanMendesak.length} item`);

    // ==================== RESPONSE JSON (FORMAT WAJIB) ====================
    // 
    // Format HARUS sesuai dengan frontend requirement.
    // Tidak boleh menambah atau mengubah struktur.
    
    res.status(200).json({
      success: true,
      message: 'Data dashboard penanggung jawab berhasil diambil',
      data: {
        ringkasan: ringkasan,
        pengajuan_mendesak: pengajuanMendesak,
        kehadiran_hari_ini: kehadiranHariIni,
        statistik_bulanan: statistikBulanan
      }
    });

  } catch (error) {
    // Error handling yang defensif dan manusiawi
    console.error('❌ Error saat mengambil data dashboard:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan saat mengambil data dashboard',
      data: null
    });
  }
}

// ==================== EXPORT ====================
module.exports = {
  ambilDataDashboardPenanggungJawab
};
