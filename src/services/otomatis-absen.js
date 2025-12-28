/**
 * ==================== LAYANAN ABSENSI OTOMATIS ====================
 * 
 * Service untuk menangani logika absensi otomatis.
 * 
 * Tujuan:
 * - Setiap tengah malam (00:01), sistem akan memeriksa pengguna yang belum absen hari kemarin
 * - Jika belum absen dan bukan karena izin/cuti, tandai sebagai "tidak_hadir"
 * - Catat dalam database dengan status "tidak_hadir"
 * - Saat pengajuan disetujui, buat absensi otomatis untuk tanggal-tanggal izin
 * 
 * Algoritma Tidak Hadir:
 * 1. Ambil semua karyawan yang aktif
 * 2. Loop setiap karyawan
 * 3. Cek apakah ada record absensi KEMARIN untuk karyawan tersebut
 * 4. Jika tidak ada:
 *    - Buat record baru dengan status "tidak_hadir"
 *    - Tandai tanggal kemarin sebagai tanggal absensi
 *    - Simpan ke database
 * 5. Log hasil untuk monitoring
 * 
 * Algoritma Izin/Cuti Otomatis:
 * 1. Ambil pengajuan dengan status 'disetujui'
 * 2. Loop setiap hari dalam periode izin (mulai s/d selesai)
 * 3. Cek apakah sudah ada absensi untuk hari itu
 * 4. Jika belum ada, buat record Absensi baru dengan status 'izin'
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
const Pengajuan = require('../models/Pengajuan');

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
    console.log('\n================= JALANKAN ABSENSI OTOMATIS TIDAK HADIR =================');
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
    
    console.log('\n================= RINGKASAN HASIL ABSENSI OTOMATIS TIDAK HADIR =================');
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
 * Fungsi: buatAbsensiOtomatisIzin
 * 
 * Membuat record absensi otomatis untuk satu pengajuan izin/cuti yang sudah disetujui.
 * 
 * @param {string} idPengajuan - ID pengajuan yang akan dibuatkan absensi
 * @returns {Promise<Object>} Status eksekusi dengan statistik
 */
async function buatAbsensiOtomatisIzin(idPengajuan) {
  try {
    console.log(`\n📋 Membuat absensi otomatis untuk pengajuan: ${idPengajuan}`);
    
    // ==================== STEP 1: AMBIL DATA PENGAJUAN ====================
    
    const pengajuan = await Pengajuan.findById(idPengajuan).populate('karyawan_id', 'nama_lengkap');
    
    if (!pengajuan) {
      console.warn(`⚠️  Pengajuan dengan ID ${idPengajuan} tidak ditemukan`);
      return {
        sukses: false,
        pesan: 'Pengajuan tidak ditemukan',
        idPengajuan: idPengajuan
      };
    }
    
    console.log(`✅ Pengajuan ditemukan:`);
    console.log(`   - Jenis: ${pengajuan.jenis_izin}`);
    console.log(`   - Karyawan: ${pengajuan.karyawan_id.nama_lengkap}`);
    console.log(`   - Status: ${pengajuan.status}`);
    console.log(`   - Periode: ${pengajuan.tanggal_mulai} - ${pengajuan.tanggal_selesai}`);
    
    // Cek apakah status disetujui
    if (pengajuan.status !== 'disetujui') {
      console.warn(`⚠️  Pengajuan belum disetujui (status: ${pengajuan.status})`);
      return {
        sukses: false,
        pesan: `Pengajuan tidak bisa dibuatkan absensi karena belum disetujui (status: ${pengajuan.status})`,
        idPengajuan: idPengajuan
      };
    }
    
    // ==================== STEP 2: NORMALIZE TANGGAL ====================
    
    const normalisirTanggal = (tanggalStr) => {
      const tanggal = new Date(tanggalStr);
      tanggal.setHours(0, 0, 0, 0);
      return tanggal;
    };
    
    const tanggalMulai = normalisirTanggal(pengajuan.tanggal_mulai);
    const tanggalSelesai = normalisirTanggal(pengajuan.tanggal_selesai);
    
    console.log(`📅 Tanggal range (normalized):`);
    console.log(`   - Mulai: ${tanggalMulai.toDateString()}`);
    console.log(`   - Selesai: ${tanggalSelesai.toDateString()}`);
    
    // ==================== STEP 3: TENTUKAN STATUS ABSENSI ====================
    
    const tentukanStatusAbsensi = (jenisIzin) => {
      // Semua jenis izin menggunakan status 'izin' agar konsisten
      if (jenisIzin === 'cuti-tahunan') return 'izin';
      if (jenisIzin === 'izin-sakit') return 'izin';
      if (jenisIzin === 'izin-tidak-masuk') return 'izin';
      if (jenisIzin === 'wfh') return 'izin';
      return 'izin'; // default
    };
    
    const statusAbsensiNilai = tentukanStatusAbsensi(pengajuan.jenis_izin);
    console.log(`📊 Status absensi yang akan dibuat: ${statusAbsensiNilai}`);
    
    // ==================== STEP 4: LOOP SETIAP HARI & BUAT ABSENSI ====================
    
    const tanggalSekarang = new Date(tanggalMulai);
    let penghitungBuat = 0;
    let penghitungSudahAda = 0;
    const detailAbsensi = [];
    
    while (tanggalSekarang <= tanggalSelesai) {
      const hariIni = new Date(tanggalSekarang);
      const hariIniAwal = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate(), 0, 0, 0, 0);
      const hariIniAkhir = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate(), 23, 59, 59, 999);
      
      // Cek apakah sudah ada record absensi
      const absensiExist = await Absensi.findOne({
        id_pengguna: pengajuan.karyawan_id._id,
        tanggal: {
          $gte: hariIniAwal,
          $lte: hariIniAkhir
        }
      });
      
      const tanggalFormat = hariIni.toLocaleDateString('id-ID');
      
      if (!absensiExist) {
        // Belum ada, buat baru
        const absensi = new Absensi({
          id_pengguna: pengajuan.karyawan_id._id,
          tanggal: hariIniAwal,
          status: statusAbsensiNilai,
          keterangan: pengajuan.jenis_izin
        });
        
        await absensi.save();
        penghitungBuat++;
        
        detailAbsensi.push({
          tanggal: tanggalFormat,
          status: 'Dibuat',
          keterangan: pengajuan.jenis_izin
        });
        
        console.log(`   ✅ ${tanggalFormat} - Absensi dibuat (${statusAbsensiNilai})`);
      } else {
        // Sudah ada, skip
        penghitungSudahAda++;
        
        detailAbsensi.push({
          tanggal: tanggalFormat,
          status: 'Sudah Ada',
          statusExisting: absensiExist.status,
          keterangan: absensiExist.keterangan
        });
        
        console.log(`   ℹ️  ${tanggalFormat} - Sudah ada (${absensiExist.status})`);
      }
      
      // Tambah 1 hari
      tanggalSekarang.setDate(tanggalSekarang.getDate() + 1);
    }
    
    // ==================== STEP 5: LAPORAN HASIL ====================
    
    console.log(`\n✅ SELESAI - Absensi otomatis dibuat:`);
    console.log(`   - Absensi baru: ${penghitungBuat} hari`);
    console.log(`   - Sudah ada: ${penghitungSudahAda} hari`);
    
    return {
      sukses: true,
      pesan: 'Absensi otomatis berhasil dibuat',
      idPengajuan: idPengajuan,
      jenisIzin: pengajuan.jenis_izin,
      karyawan: pengajuan.karyawan_id.nama_lengkap,
      absensiBaruDibuat: penghitungBuat,
      absensiSudahAda: penghitungSudahAda,
      totalHari: penghitungBuat + penghitungSudahAda,
      detailAbsensi: detailAbsensi
    };
    
  } catch (error) {
    console.error(`❌ ERROR membuat absensi otomatis:`, error.message);
    return {
      sukses: false,
      pesan: 'Terjadi error saat membuat absensi otomatis',
      idPengajuan: idPengajuan,
      error: error.message
    };
  }
}

/**
 * Fungsi: buatAbsensiOtomatisIzinSemuaPengajuan
 * 
 * Membuat absensi otomatis untuk SEMUA pengajuan izin/cuti yang sudah disetujui.
 * Berguna untuk repair/sync data.
 * 
 * @returns {Promise<Object>} Status eksekusi dengan statistik lengkap
 */
async function buatAbsensiOtomatisIzinSemuaPengajuan() {
  try {
    console.log('\n🔧 REPAIR: Membuat absensi otomatis untuk SEMUA pengajuan disetujui');
    
    // ==================== STEP 1: AMBIL SEMUA PENGAJUAN DISETUJUI ====================
    
    const semuaPengajuanDisetujui = await Pengajuan.find({ status: 'disetujui' })
      .populate('karyawan_id', 'nama_lengkap')
      .lean();
    
    console.log(`📋 Total pengajuan disetujui ditemukan: ${semuaPengajuanDisetujui.length}`);
    
    if (semuaPengajuanDisetujui.length === 0) {
      console.log('⚠️  Tidak ada pengajuan disetujui');
      return {
        sukses: true,
        pesan: 'Tidak ada pengajuan disetujui untuk diproses',
        totalPengajuan: 0,
        hasilPerPengajuan: []
      };
    }
    
    // ==================== STEP 2: LOOP SETIAP PENGAJUAN ====================
    
    const hasilPerPengajuan = [];
    let totalAbsensiDibuat = 0;
    
    for (const pengajuan of semuaPengajuanDisetujui) {
      const hasil = await buatAbsensiOtomatisIzin(pengajuan._id.toString());
      hasilPerPengajuan.push(hasil);
      
      if (hasil.sukses) {
        totalAbsensiDibuat += hasil.absensiBaruDibuat || 0;
      }
    }
    
    // ==================== STEP 3: LAPORAN RINGKASAN ====================
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ REPAIR ABSENSI OTOMATIS IZIN SELESAI`);
    console.log(`${'='.repeat(60)}`);
    console.log(`📊 Total pengajuan diproses: ${semuaPengajuanDisetujui.length}`);
    console.log(`✅ Total absensi baru dibuat: ${totalAbsensiDibuat} hari`);
    
    return {
      sukses: true,
      pesan: 'Repair absensi otomatis izin selesai',
      totalPengajuan: semuaPengajuanDisetujui.length,
      totalAbsensiBaruDibuat: totalAbsensiDibuat,
      hasilPerPengajuan: hasilPerPengajuan
    };
    
  } catch (error) {
    console.error(`❌ ERROR repair absensi:`, error.message);
    return {
      sukses: false,
      pesan: 'Terjadi error saat repair absensi otomatis',
      error: error.message
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
  buatAbsensiOtomatisIzin,
  buatAbsensiOtomatisIzinSemuaPengajuan,
  hitungWaktuIndonesia,
  formatTanggalIndonesia,
  formatTanggalPendek
};
