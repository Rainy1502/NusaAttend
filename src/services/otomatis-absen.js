/**
 * ==================== LAYANAN ABSENSI OTOMATIS ====================
 * 
 * Service untuk menangani logika absensi otomatis.
 * 
 * Tujuan:
 * - Setiap tengah malam (00:01), sistem akan memeriksa pengguna yang belum absen hari kemarin
 * - Jika belum absen dan bukan karena izin/cuti, tandai sebagai "tidak_hadir"
 * - Catat dalam database dengan status "tidak_hadir"
 * 
 * Algoritma:
 * 1. Ambil semua karyawan yang aktif
 * 2. Loop setiap karyawan
 * 3. Cek apakah ada record absensi KEMARIN untuk karyawan tersebut
 * 4. Jika tidak ada:
 *    - Buat record baru dengan status "tidak_hadir"
 *    - Tandai tanggal kemarin sebagai tanggal absensi
 *    - Simpan ke database
 * 5. Log hasil untuk monitoring
 * 
 * Format Waktu Indonesia:
 * - Tanggal: DD/MM/YYYY
 * - Jam: HH.MM WIB (format 24 jam)
 * - Hari: Senin, Selasa, dst
 * 
 * Penamaan Variabel Bahasa Indonesia:
 * - tanggal (bukan date)
 * - jam (bukan time)
 * - pengguna (bukan user)
 * - karyawan (bukan employee)
 * - absensi (bukan attendance)
 * - tidak_hadir (bukan absent/not_present)
 */

const Pengguna = require('../models/Pengguna');
const Absensi = require('../models/Absensi');

/**
 * Fungsi: tandaiKaryawanTidakHadir
 * 
 * Menandai karyawan yang tidak melakukan absensi sebagai "tidak_hadir".
 * Dipanggil otomatis setiap hari pada pukul 00:01 WIB.
 * 
 * @returns {Promise<Object>} Status eksekusi dengan statistik
 */
async function tandaiKaryawanTidakHadir() {
  try {
    console.log('\n================= JALANKAN ABSENSI OTOMATIS =================');
    console.log(`⏰ Waktu Eksekusi: ${hitungWaktuIndonesia()}`);
    
    // ==================== STEP 1: HITUNG TANGGAL KEMARIN ====================
    
    // Tanggal hari ini
    const tanggalHariIni = new Date();
    tanggalHariIni.setHours(0, 0, 0, 0);
    
    // Tanggal kemarin (dikurangi 1 hari)
    const tanggalKemarin = new Date(tanggalHariIni);
    tanggalKemarin.setDate(tanggalKemarin.getDate() - 1);
    
    // Format tanggal untuk display (DD/MM/YYYY format Indonesia)
    const tanggalKemarinFormat = formatTanggalIndonesia(tanggalKemarin);
    
    console.log(`📅 Memeriksa absensi untuk tanggal: ${tanggalKemarinFormat}`);
    console.log(`📅 Range waktu: ${tanggalKemarin.toISOString().split('T')[0]} 00:00 - 23:59`);
    
    // ==================== STEP 2: AMBIL SEMUA KARYAWAN AKTIF ====================
    
    const semuaKaryawan = await Pengguna.find({
      role: 'karyawan',
      adalah_aktif: true
    }).select('_id nama_lengkap email').lean();
    
    console.log(`\n👥 Total karyawan aktif ditemukan: ${semuaKaryawan.length}`);
    
    if (semuaKaryawan.length === 0) {
      console.log('⚠️  Tidak ada karyawan aktif untuk diproses');
      return {
        sukses: true,
        pesan: 'Tidak ada karyawan aktif',
        jumlahDiperiksa: 0,
        jumlahTidakHadir: 0,
        waktuEksekusi: new Date()
      };
    }
    
    // ==================== STEP 3: LOOP SETIAP KARYAWAN ====================
    
    let jumlahTidakHadirBaru = 0;
    let jumlahSudahAda = 0;
    const detailHasil = [];
    
    for (const karyawan of semuaKaryawan) {
      try {
        // Cek apakah sudah ada record absensi untuk kemarin
        const absensiAda = await Absensi.findOne({
          id_pengguna: karyawan._id,
          tanggal: {
            $gte: new Date(tanggalKemarin.getFullYear(), tanggalKemarin.getMonth(), tanggalKemarin.getDate(), 0, 0, 0),
            $lte: new Date(tanggalKemarin.getFullYear(), tanggalKemarin.getMonth(), tanggalKemarin.getDate(), 23, 59, 59)
          }
        }).lean();
        
        if (absensiAda) {
          // Sudah ada record, skip
          jumlahSudahAda++;
          detailHasil.push({
            nama: karyawan.nama_lengkap,
            status: '✅ Sudah Ada',
            statusAbsensi: absensiAda.status,
            keterangan: `Record absensi sudah ada dengan status ${absensiAda.status}`
          });
        } else {
          // Belum ada record, buat baru dengan status "tidak_hadir"
          const absenBaru = new Absensi({
            id_pengguna: karyawan._id,
            tanggal: tanggalKemarin,
            jam_masuk: null,
            jam_pulang: null,
            status: 'tidak_hadir',
            keterangan: 'Otomatis: Tidak melakukan absensi pada hari tersebut'
          });
          
          await absenBaru.save();
          jumlahTidakHadirBaru++;
          
          detailHasil.push({
            nama: karyawan.nama_lengkap,
            status: '❌ Ditambahkan',
            statusAbsensi: 'tidak_hadir',
            keterangan: `Otomatis ditandai tidak hadir`
          });
          
          console.log(`   ❌ ${karyawan.nama_lengkap} - Ditambahkan sebagai TIDAK HADIR`);
        }
        
      } catch (errorKaryawan) {
        console.error(`   ⚠️  Error untuk ${karyawan.nama_lengkap}:`, errorKaryawan.message);
        detailHasil.push({
          nama: karyawan.nama_lengkap,
          status: '❌ Error',
          keterangan: errorKaryawan.message
        });
      }
    }
    
    // ==================== STEP 4: LAPORAN HASIL ====================
    
    console.log('\n================= RINGKASAN HASIL ABSENSI OTOMATIS =================');
    console.log(`📊 Total Karyawan Diperiksa: ${semuaKaryawan.length}`);
    console.log(`✅ Sudah Punya Record: ${jumlahSudahAda}`);
    console.log(`❌ Ditambahkan Tidak Hadir: ${jumlahTidakHadirBaru}`);
    console.log(`⏱️  Waktu Selesai: ${hitungWaktuIndonesia()}`);
    console.log('==================================================================\n');
    
    return {
      sukses: true,
      pesan: 'Absensi otomatis berhasil dijalankan',
      tanggalDiperiksa: tanggalKemarinFormat,
      jumlahDiperiksa: semuaKaryawan.length,
      jumlahSudahAda: jumlahSudahAda,
      jumlahTidakHadirBaru: jumlahTidakHadirBaru,
      detailHasil: detailHasil,
      waktuEksekusi: new Date()
    };
    
  } catch (error) {
    console.error('❌ ERROR ABSENSI OTOMATIS:', error.message);
    return {
      sukses: false,
      pesan: 'Terjadi error saat menjalankan absensi otomatis',
      error: error.message,
      waktuEksekusi: new Date()
    };
  }
}

/**
 * Helper: Hitung Waktu Indonesia (WIB)
 * Format: Hari, DD Bulan YYYY, HH.MM WIB
 * Contoh: Kamis, 26 Desember 2025, 14.30 WIB
 */
function hitungWaktuIndonesia() {
  const sekarang = new Date();
  
  // Tambah 7 jam untuk WIB (UTC+7)
  const waktuWIB = new Date(sekarang.getTime() + (7 * 60 * 60 * 1000));
  
  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const hari = namaHari[waktuWIB.getUTCDay()];
  const tanggal = String(waktuWIB.getUTCDate()).padStart(2, '0');
  const bulan = namaBulan[waktuWIB.getUTCMonth()];
  const tahun = waktuWIB.getUTCFullYear();
  const jam = String(waktuWIB.getUTCHours()).padStart(2, '0');
  const menit = String(waktuWIB.getUTCMinutes()).padStart(2, '0');
  
  return `${hari}, ${tanggal} ${bulan} ${tahun}, ${jam}.${menit} WIB`;
}

/**
 * Helper: Format Tanggal Indonesia
 * Format: Hari, DD Bulan YYYY
 * Contoh: Kamis, 26 Desember 2025
 */
function formatTanggalIndonesia(tanggal) {
  const namaHari = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const namaBulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  const hari = namaHari[tanggal.getDay()];
  const tgl = String(tanggal.getDate()).padStart(2, '0');
  const bulan = namaBulan[tanggal.getMonth()];
  const tahun = tanggal.getFullYear();
  
  return `${hari}, ${tgl} ${bulan} ${tahun}`;
}

/**
 * Helper: Format Tanggal Pendek
 * Format: DD/MM/YYYY
 * Contoh: 26/12/2025
 */
function formatTanggalPendek(tanggal) {
  const tgl = String(tanggal.getDate()).padStart(2, '0');
  const bulan = String(tanggal.getMonth() + 1).padStart(2, '0');
  const tahun = tanggal.getFullYear();
  
  return `${tgl}/${bulan}/${tahun}`;
}

// ==================== EXPORT ====================
module.exports = {
  tandaiKaryawanTidakHadir,
  hitungWaktuIndonesia,
  formatTanggalIndonesia,
  formatTanggalPendek
};
