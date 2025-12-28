/**
 * ==================== TOLAK PENGAJUAN CONTROLLER ====================
 * 
 * Controller ini menyediakan endpoint WRITE TERBATAS untuk Tolak Pengajuan.
 * 
 * KONTEKS PENOLAKAN:
 * - Tindakan administratif internal untuk penolakan pengajuan
 * - Bersifat non-hukum (hanya pertimbangan administratif)
 * - Disertai alasan tekstual dari penanggung jawab
 * - Mengubah status pengajuan menjadi "Ditolak"
 * 
 * BATASAN EKSPLISIT:
 * - HANYA menerima: id_pengajuan, alasan_penolakan
 * - HANYA mengubah: status → "ditolak", menyimpan alasan & tanggal
 * - TIDAK ada workflow otomatis, notifikasi, atau operasi lain
 * - TIDAK ada perubahan data karyawan atau sisa cuti
 * - Backend bertanggung jawab hanya sebagai penyimpan keputusan administratif
 * 
 * SIFAT SISTEM:
 * - Bukan sistem keputusan hukum
 * - Bukan sistem approval formal
 * - Sederhana, defensif, dan terukur
 * - Layak untuk konteks akademik dan administratif internal
 */

const Pengajuan = require('../models/Pengajuan');

/**
 * Menolak pengajuan dengan menyimpan alasan penolakan
 * 
 * OPERASI:
 * 1. Validasi ID pengajuan
 * 2. Terima alasan penolakan dari frontend
 * 3. Ubah status → "ditolak"
 * 4. Simpan alasan penolakan (keterangan_review)
 * 5. Set tanggal review (tanggal_direview)
 * 6. Kembalikan respons sukses
 * 
 * @route   POST /api/pengguna/pengajuan-tolak/:id
 * @access  Private (Penanggung Jawab)
 * @param   {String} id - ID pengajuan dari URL parameter
 * @body    {String} alasan_penolakan - Alasan penolakan dari textarea modal
 * @returns {Object} Response dengan struktur {success, message, data}
 */
async function tolakPengajuan(req, res) {
  try {
    // ==================== VALIDASI AWAL ====================
    console.log('📥 Permintaan tolak pengajuan diterima');
    
    const { id } = req.params;
    const { alasan_penolakan } = req.body;
    
    // Validasi ID
    if (!id) {
      console.log('❌ Validasi gagal: ID pengajuan tidak diberikan');
      return res.status(400).json({
        success: false,
        message: 'ID pengajuan harus diberikan'
      });
    }
    
    // Validasi alasan
    if (!alasan_penolakan || typeof alasan_penolakan !== 'string') {
      console.log('❌ Validasi gagal: Alasan penolakan harus berupa string');
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan harus berupa teks'
      });
    }
    
    // Trim whitespace dan cek panjang minimal
    const alasanTrimmed = alasan_penolakan.trim();
    if (alasanTrimmed.length === 0) {
      console.log('❌ Validasi gagal: Alasan penolakan kosong');
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan tidak boleh kosong'
      });
    }
    
    if (alasanTrimmed.length < 5) {
      console.log('❌ Validasi gagal: Alasan penolakan terlalu pendek');
      return res.status(400).json({
        success: false,
        message: 'Alasan penolakan minimal 5 karakter'
      });
    }
    
    console.log(`📌 ID Pengajuan: ${id}`);
    console.log(`📌 Alasan Penolakan: ${alasanTrimmed.substring(0, 50)}...`);
    
    // ==================== CARI PENGAJUAN ====================
    console.log('🔍 Mencari pengajuan di database...');
    
    const pengajuan = await Pengajuan.findById(id).exec();
    
    if (!pengajuan) {
      console.log(`❌ Pengajuan dengan ID ${id} tidak ditemukan`);
      return res.status(404).json({
        success: false,
        message: 'Pengajuan tidak ditemukan'
      });
    }
    
    // Cek status sebelumnya
    const statusSebelumnya = pengajuan.status;
    console.log(`✅ Pengajuan ditemukan | Status saat ini: ${statusSebelumnya}`);
    
    // ==================== UPDATE STATUS & ALASAN ====================
    console.log('💾 Mengubah status & menyimpan alasan penolakan...');
    
    // Update field yang diperlukan
    pengajuan.status = 'ditolak';
    pengajuan.keterangan_review = alasanTrimmed;
    pengajuan.tanggal_direview = new Date();
    pengajuan.diperbarui_pada = new Date();
    
    // Simpan ke database
    const pengajuanUpdated = await pengajuan.save();
    
    console.log(`✅ Pengajuan berhasil diupdate`);
    console.log(`   - Status: ${statusSebelumnya} → ${pengajuanUpdated.status}`);
    console.log(`   - Tanggal Review: ${pengajuanUpdated.tanggal_direview}`);
    
    // ==================== RESPONSE SUKSES ====================
    console.log('📤 Mengirim respons sukses...');
    
    const response = {
      success: true,
      message: 'Pengajuan berhasil ditolak',
      data: {
        tanggal_ditolak: pengajuanUpdated.tanggal_direview
      }
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    // ==================== ERROR HANDLING ====================
    console.error('❌ Error saat tolak pengajuan:', error.message);
    
    // Jangan expose error mentah MongoDB
    const pesan = error.message || 'Terjadi kesalahan saat memproses penolakan pengajuan';
    
    return res.status(500).json({
      success: false,
      message: pesan
    });
  }
}

/**
 * Endpoint tambahan: Menyetujui pengajuan (approval)
 * 
 * OPERASI:
 * 1. Validasi ID pengajuan
 * 2. Ubah status → "disetujui"
 * 3. Set tanggal review (tanggal_direview)
 * 4. Kembalikan respons sukses
 * 
 * CATATAN:
 * - Approval TIDAK menerima alasan (tidak ada form reason)
 * - Approval bersifat persetujuan langsung
 * 
 * @route   POST /api/pengguna/pengajuan-setujui/:id
 * @access  Private (Penanggung Jawab)
 * @param   {String} id - ID pengajuan dari URL parameter
 * @returns {Object} Response dengan struktur {success, message, data}
 */
async function setujuiPengajuan(req, res) {
  try {
    // ==================== VALIDASI AWAL ====================
    console.log('📥 Permintaan setujui pengajuan diterima');
    
    const { id } = req.params;
    
    // Validasi ID
    if (!id) {
      console.log('❌ Validasi gagal: ID pengajuan tidak diberikan');
      return res.status(400).json({
        success: false,
        message: 'ID pengajuan harus diberikan'
      });
    }
    
    console.log(`📌 ID Pengajuan: ${id}`);
    
    // ==================== CARI PENGAJUAN ====================
    console.log('🔍 Mencari pengajuan di database...');
    
    const pengajuan = await Pengajuan.findById(id).exec();
    
    if (!pengajuan) {
      console.log(`❌ Pengajuan dengan ID ${id} tidak ditemukan`);
      return res.status(404).json({
        success: false,
        message: 'Pengajuan tidak ditemukan'
      });
    }
    
    // Cek status sebelumnya
    const statusSebelumnya = pengajuan.status;
    console.log(`✅ Pengajuan ditemukan | Status saat ini: ${statusSebelumnya}`);
    
    // ==================== UPDATE STATUS ====================
    console.log('💾 Mengubah status menjadi disetujui...');
    
    // Update field yang diperlukan
    pengajuan.status = 'disetujui';
    pengajuan.tanggal_direview = new Date();
    pengajuan.diperbarui_pada = new Date();
    
    // Simpan ke database
    const pengajuanUpdated = await pengajuan.save();
    
    console.log(`✅ Pengajuan berhasil diupdate`);
    console.log(`   - Status: ${statusSebelumnya} → ${pengajuanUpdated.status}`);
    console.log(`   - Tanggal Review: ${pengajuanUpdated.tanggal_direview}`);
    
    // ==================== AUTO-CREATE ABSENSI RECORDS ====================
    // Ketika pengajuan disetujui, buat record absensi otomatis untuk tanggal-tanggal izin
    console.log('📅 Membuat record absensi otomatis untuk tanggal-tanggal izin...');
    console.log(`   - Jenis izin: ${pengajuanUpdated.jenis_izin}`);
    console.log(`   - Karyawan ID: ${pengajuanUpdated.karyawan_id}`);
    console.log(`   - Tanggal mulai: ${pengajuanUpdated.tanggal_mulai}`);
    console.log(`   - Tanggal selesai: ${pengajuanUpdated.tanggal_selesai}`);
    
    try {
      const Absensi = require('../models/Absensi');
      
      // Helper function: normalize date ke local midnight (00:00:00)
      const normalizeDate = (dateStr) => {
        const date = new Date(dateStr);
        date.setHours(0, 0, 0, 0);
        return date;
      };
      
      // Loop dari tanggal_mulai hingga tanggal_selesai
      const tanggalMulai = normalizeDate(pengajuanUpdated.tanggal_mulai);
      const tanggalSelesai = normalizeDate(pengajuanUpdated.tanggal_selesai);
      
      console.log(`   - Tanggal mulai (normalized): ${tanggalMulai.toString()}`);
      console.log(`   - Tanggal selesai (normalized): ${tanggalSelesai.toString()}`);
      
      // Tentukan status absensi berdasarkan jenis_izin
      const statusAbsensi = (jenis) => {
        // Semua jenis izin menggunakan status 'izin' agar konsisten di UI
        if (jenis === 'cuti-tahunan') return 'izin';
        if (jenis === 'izin-sakit') return 'izin';
        if (jenis === 'izin-tidak-masuk') return 'izin';
        if (jenis === 'wfh') return 'izin'; // WFH dianggap izin
        return 'izin'; // default
      };
      
      const statusAbsensiValue = statusAbsensi(pengajuanUpdated.jenis_izin);
      console.log(`   - Status absensi: ${statusAbsensiValue}`);
      
      // Loop setiap hari dari mulai hingga selesai
      const currentDate = new Date(tanggalMulai);
      let counterAbsensi = 0;
      
      while (currentDate <= tanggalSelesai) {
        const hariIni = new Date(currentDate);
        const hariIniStart = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate(), 0, 0, 0, 0);
        const hariIniEnd = new Date(hariIni.getFullYear(), hariIni.getMonth(), hariIni.getDate(), 23, 59, 59, 999);
        
        console.log(`   ⏳ Memproses tanggal: ${hariIni.toDateString()}`);
        
        // Cek apakah sudah ada record absensi untuk hari ini
        const absensiExist = await Absensi.findOne({
          id_pengguna: pengajuanUpdated.karyawan_id,
          tanggal: {
            $gte: hariIniStart,
            $lte: hariIniEnd
          }
        });
        
        // Jika belum ada, buat record baru
        if (!absensiExist) {
          const absensi = new Absensi({
            id_pengguna: pengajuanUpdated.karyawan_id,
            tanggal: hariIniStart,
            status: statusAbsensiValue,
            keterangan: pengajuanUpdated.jenis_izin
          });
          
          await absensi.save();
          counterAbsensi++;
          console.log(`   ✅ Absensi dibuat: ${hariIni.toDateString()} - ${statusAbsensiValue}`);
        } else {
          console.log(`   ℹ️  Absensi sudah ada: ${hariIni.toDateString()} (status: ${absensiExist.status})`);
        }
        
        // Tambah 1 hari
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      console.log(`✅ Total absensi dibuat: ${counterAbsensi} hari`);
    } catch (errorAbsensi) {
      console.error('⚠️ Warning: Error saat membuat absensi otomatis:', errorAbsensi.message);
      console.error(errorAbsensi.stack);
      // Jangan stop approval hanya karena error absensi
      // Absensi boleh dibuat manual nanti
    }
    
    // ==================== UPDATE SISA CUTI (JIKA CUTI TAHUNAN) ====================
    // Note: Sisa cuti dihitung real-time dari pengajuan yang disetujui di dashboard
    // Jadi tidak perlu update field sisa_cuti di Pengguna model
    if (pengajuanUpdated.jenis_izin === 'cuti-tahunan') {
      console.log('💰 Catatan: Sisa cuti akan dihitung real-time di dashboard dari pengajuan disetujui');
    }
    
    // ==================== RESPONSE SUKSES ====================
    console.log('📤 Mengirim respons sukses...');
    
    const response = {
      success: true,
      message: 'Pengajuan berhasil disetujui',
      data: {
        tanggal_disetujui: pengajuanUpdated.tanggal_direview
      }
    };
    
    return res.status(200).json(response);
    
  } catch (error) {
    // ==================== ERROR HANDLING ====================
    console.error('❌ Error saat setujui pengajuan:', error.message);
    
    // Jangan expose error mentah MongoDB
    const pesan = error.message || 'Terjadi kesalahan saat memproses persetujuan pengajuan';
    
    return res.status(500).json({
      success: false,
      message: pesan
    });
  }
}

module.exports = {
  tolakPengajuan,
  setujuiPengajuan
};
