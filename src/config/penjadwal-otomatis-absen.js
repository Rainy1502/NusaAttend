/**
 * ==================== PENJADWAL OTOMATIS ABSEN ====================
 * 
 * Menggunakan node-cron untuk menjadwalkan task absensi otomatis.
 * 
 * Jadwal:
 * - Setiap hari pukul 00:01 WIB (saat hari berganti)
 * - Memeriksa karyawan yang tidak melakukan absensi hari kemarin
 * - Otomatis menandai sebagai "tidak_hadir"
 * 
 * Time Format Cron:
 * Menit | Jam | Hari Bulan | Bulan | Hari Minggu
 *   01   |  00  |     *     |   *   |     *      → Setiap hari jam 00:01
 * 
 * Timezone: Asia/Jakarta (WIB, UTC+7)
 */

const cron = require('node-cron');
const { tandaiKaryawanTidakHadir, buatAbsensiOtomatisIzinSemuaPengajuan } = require('../services/otomatis-absen');

/**
 * Fungsi: inisialisasiPenjadwalAbsen
 * 
 * Menginisialisasi cron job untuk:
 * 1. Absensi otomatis tidak hadir (setiap tengah malam)
 * 2. Absensi otomatis izin/cuti (setiap tengah malam, setelah tidak hadir)
 * 
 * Dipanggil dari app.js saat server startup.
 * 
 * @returns {Object} Task object dari node-cron
 */
function inisialisasiPenjadwalAbsen() {
  console.log('\n🕐 Menginisialisasi penjadwal absensi otomatis...');
  
  // ==================== TASK 1: TANDAI TIDAK HADIR ====================
  
  // Buat task cron untuk tandai tidak hadir
  // Pattern: '00 00 * * *' = Setiap hari pukul 00:00 (tengah malam)
  const taskTandaiTidakHadir = cron.schedule('00 00 * * *', async () => {
    console.log('\n🔔 [CRON] Jalankan: Tandai Karyawan Tidak Hadir');
    
    try {
      // Jalankan fungsi tandai tidak hadir
      const hasil = await tandaiKaryawanTidakHadir();
      
      // Log hasil untuk monitoring
      if (hasil.sukses) {
        console.log('✅ Absensi otomatis tidak hadir berhasil dijalankan');
        console.log(`   - Total diperiksa: ${hasil.jumlahDiperiksa}`);
        console.log(`   - Ditambahkan tidak hadir: ${hasil.jumlahTidakHadirBaru}`);
      } else {
        console.error('❌ Absensi otomatis tidak hadir gagal:', hasil.pesan);
      }
      
    } catch (error) {
      console.error('❌ ERROR cron job tidak hadir:', error.message);
    }
    
  }, {
    scheduled: false,
    timezone: 'Asia/Jakarta'
  });
  
  // Start task tidak hadir
  taskTandaiTidakHadir.start();
  console.log('✅ Penjadwal TIDAK HADIR AKTIF (setiap hari pukul 00:00 WIB)');
  
  // ==================== TASK 2: BUAT ABSENSI IZIN OTOMATIS ====================
  
  // Buat task cron untuk buat absensi izin
  // Pattern: '02 00 * * *' = Setiap hari pukul 00:00 
  const taskBuatAbsensiIzin = cron.schedule('00 00 * * *', async () => {
    console.log('\n🔔 [CRON] Jalankan: Buat Absensi Otomatis untuk Izin/Cuti');
    
    try {
      // Jalankan fungsi buat absensi izin otomatis untuk semua pengajuan disetujui
      const hasil = await buatAbsensiOtomatisIzinSemuaPengajuan();
      
      // Log hasil untuk monitoring
      if (hasil.sukses) {
        console.log('✅ Absensi otomatis izin berhasil dijalankan');
        console.log(`   - Total pengajuan disetujui: ${hasil.totalPengajuan}`);
        console.log(`   - Total absensi baru dibuat: ${hasil.totalAbsensiBaruDibuat} hari`);
      } else {
        console.error('❌ Absensi otomatis izin gagal:', hasil.pesan);
      }
      
    } catch (error) {
      console.error('❌ ERROR cron job izin:', error.message);
    }
    
  }, {
    scheduled: false,
    timezone: 'Asia/Jakarta'
  });
  
  // Start task izin
  taskBuatAbsensiIzin.start();
  console.log('✅ Penjadwal IZIN/CUTI OTOMATIS AKTIF (setiap hari pukul 00:00 WIB)');
  
  console.log('\n📅 Ringkasan Penjadwal Absensi Otomatis:');
  console.log('   - 00:00 WIB: Tandai karyawan tidak hadir');
  console.log('   - 00:00 WIB: Buat absensi otomatis untuk izin/cuti\n');
  
  return { taskTandaiTidakHadir, taskBuatAbsensiIzin };
}

/**
 * Fungsi: hentikanPenjadwalAbsen
 * 
 * Menghentikan semua cron job absensi otomatis.
 * Dipanggil saat server shutdown.
 * 
 * @param {Object} tasks - Object berisi task object dari node-cron
 */
function hentikanPenjadwalAbsen(tasks) {
  if (tasks && tasks.taskTandaiTidakHadir) {
    tasks.taskTandaiTidakHadir.stop();
    tasks.taskTandaiTidakHadir.destroy();
    console.log('🛑 Penjadwal tidak hadir dihentikan');
  }
  
  if (tasks && tasks.taskBuatAbsensiIzin) {
    tasks.taskBuatAbsensiIzin.stop();
    tasks.taskBuatAbsensiIzin.destroy();
    console.log('🛑 Penjadwal izin otomatis dihentikan');
  }
}

// ==================== EXPORT ====================
module.exports = {
  inisialisasiPenjadwalAbsen,
  hentikanPenjadwalAbsen
};
