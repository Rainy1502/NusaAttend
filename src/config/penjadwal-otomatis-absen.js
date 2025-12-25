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
const { tandaiKaryawanTidakHadir } = require('../services/otomatis-absen');

/**
 * Fungsi: inisialisasiPenjadwalAbsen
 * 
 * Menginisialisasi cron job untuk absensi otomatis.
 * Dipanggil dari app.js saat server startup.
 * 
 * @returns {Object} Task object dari node-cron
 */
function inisialisasiPenjadwalAbsen() {
  console.log('\n🕐 Menginisialisasi penjadwal absensi otomatis...');
  
  // Buat task cron
  // Pattern: '41 01 * * *' = Setiap hari pukul 01:41
  const taskAbsenOtomatis = cron.schedule('00 00 * * *', async () => {
    console.log('\n🔔 [NOTIFIKASI CRON] Waktu menjalankan absensi otomatis!');
    
    try {
      // Jalankan fungsi absensi otomatis
      const hasil = await tandaiKaryawanTidakHadir();
      
      // Log hasil untuk monitoring
      if (hasil.sukses) {
        console.log('✅ Absensi otomatis berhasil dijalankan');
        console.log(`   - Ditambahkan tidak hadir: ${hasil.jumlahTidakHadirBaru}`);
      } else {
        console.error('❌ Absensi otomatis gagal:', hasil.pesan);
      }
      
    } catch (error) {
      console.error('❌ ERROR saat menjalankan cron job absensi otomatis:', error.message);
    }
    
  }, {
    scheduled: false, // Set ke false dulu, kita jalankan manual di bawah
    timezone: 'Asia/Jakarta'
  });
  
  // Start task
  taskAbsenOtomatis.start();
  console.log('✅ Penjadwal absensi otomatis AKTIF (setiap hari pukul 01:41 WIB)');
  
  // Optional: Jalankan manual untuk testing (comment jika tidak perlu)
  // console.log('\n🧪 [TEST] Menjalankan absensi otomatis secara manual...');
  // tandaiKaryawanTidakHadir();
  
  return taskAbsenOtomatis;
}

/**
 * Fungsi: hentikanPenjadwalAbsen
 * 
 * Menghentikan cron job absensi otomatis.
 * Dipanggil saat server shutdown.
 * 
 * @param {Object} task - Task object dari node-cron
 */
function hentikanPenjadwalAbsen(task) {
  if (task) {
    task.stop();
    task.destroy();
    console.log('🛑 Penjadwal absensi otomatis dihentikan');
  }
}

// ==================== EXPORT ====================
module.exports = {
  inisialisasiPenjadwalAbsen,
  hentikanPenjadwalAbsen
};
