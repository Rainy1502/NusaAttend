/**
 * ==================== SETUJUI PENGAJUAN CONTROLLER ====================
 * 
 * Controller ini menyediakan endpoint READ-ONLY TERBATAS untuk Modal "Setujui Pengajuan".
 * 
 * TUJUAN UTAMA:
 * - Mengambil data administratif pengajuan untuk ditampilkan di modal setujui
 * - Menyediakan informasi identitas pengguna & pengajuan
 * - Menyediakan placeholder tanda tangan administratif
 * - Memberikan konteks visual SEBELUM aksi persetujuan dilakukan
 * 
 * SIFAT SISTEM:
 * - READ-ONLY: Tidak ada perubahan data di database
 * - ADMINISTRATIF: Bersifat visual dan informasional
 * - NON-HUKUM: Tanda tangan adalah placeholder administratif, bukan bukti hukum
 * - DEFENSIF: Validasi ketat, error handling yang baik
 * 
 * BATASAN EKSPLISIT:
 * - TIDAK ada persetujuan real
 * - TIDAK ada penyimpanan tanda tangan
 * - TIDAK ada perubahan status pengajuan
 * - TIDAK ada operasi workflow otomatis
 * - TIDAK ada notifikasi atau operasi lain
 * 
 * ALASAN TIDAK MENYIMPAN:
 * - Sistem persetujuan formal belum ada / sedang dalam tahap desain
 * - Data tanda tangan hanya untuk keperluan presentasi modal
 * - Keputusan approval akan dihandle oleh endpoint terpisah (/pengajuan-setujui/:id)
 * 
 * ALASAN TANDA TANGAN ADMINISTRATIF:
 * - Tanda tangan di sini adalah visual placeholder untuk konfirmasi administratif
 * - BUKAN tanda tangan elektronik resmi atau tersertifikasi
 * - BUKAN bukti persetujuan hukum
 * - Hanya untuk keperluan dokumentasi internal dan audit trail administratif
 */

const Pengajuan = require('../models/Pengajuan');
const Pengguna = require('../models/Pengguna');

/**
 * Mengambil data pengajuan untuk modal "Setujui Pengajuan"
 * 
 * OPERASI (READ-ONLY):
 * 1. Validasi ID pengajuan
 * 2. Query data pengajuan dari database
 * 3. Query data pengguna (pemohon) dari database
 * 4. Kompilasi data administratif
 * 5. Tambahkan placeholder tanda tangan administratif
 * 6. Kembalikan objek lengkap (tanpa perubahan database)
 * 
 * SCHEMA RESPONSE:
 * {
 *   "success": true/false,
 *   "message": "...",
 *   "data": {
 *     "detail_setujui_pengajuan": {
 *       "jenis_izin": "Cuti Tahunan",
 *       "periode_izin": "15 Des - 20 Des 2025",
 *       "alasan_pengajuan": "...",
 *       "nama_pengguna": "Andi Pratama",
 *       "jabatan_pengguna": "Staff IT",
 *       "tanggal_diajukan": "2025-12-10",
 *       "durasi_pengajuan": "6 hari",
 *       "tanda_tangan_administratif": "[Canvas Placeholder]",
 *       "nama_penandatangan": "Budi Santoso (Manager HRD)"
 *     }
 *   }
 * }
 * 
 * @route   GET /api/pengguna/setujui-pengajuan/:id
 * @access  Private (Penanggung Jawab)
 * @param   {String} id - ID pengajuan dari URL parameter
 * @returns {Object} Response dengan struktur {success, message, data}
 */
async function ambilDataSetujuiPengajuan(req, res) {
  try {
    // ==================== VALIDASI AWAL ====================
    console.log('📥 Permintaan ambil data setujui pengajuan diterima');
    
    const { id } = req.params;
    const idPengguna = req.user._id; // Dari middleware autentikasi
    
    // Validasi ID pengajuan
    if (!id || id.length !== 24) {
      console.warn('⚠️ ID pengajuan tidak valid: ' + id);
      return res.status(400).json({
        success: false,
        message: 'ID pengajuan tidak valid'
      });
    }
    
    // ==================== QUERY DATA PENGAJUAN ====================
    console.log('🔍 Mengambil data pengajuan dari database...');
    
    const dataPengajuan = await Pengajuan.findById(id).lean();
    
    if (!dataPengajuan) {
      console.warn('⚠️ Pengajuan tidak ditemukan: ' + id);
      return res.status(404).json({
        success: false,
        message: 'Pengajuan tidak ditemukan'
      });
    }
    
    // ==================== QUERY DATA PENGGUNA (PEMOHON) ====================
    console.log('🔍 Mengambil data pengguna pemohon dari database...');
    
    const dataPengguna = await Pengguna.findById(dataPengajuan.id_pengguna).lean();
    
    if (!dataPengguna) {
      console.warn('⚠️ Pengguna pemohon tidak ditemukan: ' + dataPengajuan.id_pengguna);
      return res.status(404).json({
        success: false,
        message: 'Data pengguna pemohon tidak ditemukan'
      });
    }
    
    // ==================== KOMPILASI DATA ADMINISTRATIF ====================
    console.log('📋 Mengompilasi data untuk modal setujui pengajuan...');
    
    // Mapping jenis izin dari kode ke display name
    const mappingJenisIzin = {
      'cuti_tahunan': 'Cuti Tahunan',
      'izin_sakit': 'Izin Sakit',
      'izin_khusus': 'Izin Khusus',
      'work_from_home': 'Work From Home'
    };
    
    const jenisIzinDisplay = mappingJenisIzin[dataPengajuan.jenis_izin] || dataPengajuan.jenis_izin;
    
    // Format tanggal (dari ISO string ke format lokal)
    const formatTanggal = (tanggalISO) => {
      if (!tanggalISO) return '-';
      const date = new Date(tanggalISO);
      return date.toLocaleDateString('id-ID', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    };
    
    // Hitung durasi (hari)
    const hitungDurasi = (tanggalMulai, tanggalSelesai) => {
      if (!tanggalMulai || !tanggalSelesai) return '0 hari';
      const mulai = new Date(tanggalMulai);
      const selesai = new Date(tanggalSelesai);
      const selisihMs = selesai - mulai;
      const selisihHari = Math.ceil(selisihMs / (1000 * 60 * 60 * 24)) + 1; // +1 include hari pertama
      return `${selisihHari} hari`;
    };
    
    // Format periode izin
    const formatPeriode = () => {
      const mulai = formatTanggal(dataPengajuan.tanggal_mulai);
      const selesai = formatTanggal(dataPengajuan.tanggal_selesai);
      return `${mulai} - ${selesai}`;
    };
    
    // ==================== PLACEHOLDER TANDA TANGAN ADMINISTRATIF ====================
    // Tanda tangan di sini adalah placeholder visual untuk modal
    // BUKAN penyimpanan real, hanya untuk keperluan presentasi
    const tandaTanganAdministratif = '[Placeholder Canvas - Bukan Penyimpanan Real]';
    const namaPenandatangan = `${req.user.nama_lengkap} (${req.user.jabatan})`;
    
    // ==================== KOMPILASI RESPONSE ====================
    const dataSetujuiPengajuan = {
      jenis_izin: jenisIzinDisplay,
      periode_izin: formatPeriode(),
      alasan_pengajuan: dataPengajuan.alasan_pengajuan || '-',
      nama_pengguna: dataPengguna.nama_lengkap,
      jabatan_pengguna: dataPengguna.jabatan,
      tanggal_diajukan: formatTanggal(dataPengajuan.tanggal_diajukan),
      durasi_pengajuan: hitungDurasi(dataPengajuan.tanggal_mulai, dataPengajuan.tanggal_selesai),
      tanda_tangan_administratif: tandaTanganAdministratif,
      nama_penandatangan: namaPenandatangan
    };
    
    console.log('✅ Data setujui pengajuan berhasil dikompilasi');
    
    // ==================== RESPONSE SUKSES ====================
    return res.status(200).json({
      success: true,
      message: 'Data setujui pengajuan berhasil diambil',
      data: {
        detail_setujui_pengajuan: dataSetujuiPengajuan
      }
    });
    
  } catch (error) {
    // ==================== ERROR HANDLING ====================
    console.error('❌ Error dalam ambilDataSetujuiPengajuan:', error);
    
    // Jangan expose error mentah MongoDB
    const pesanError = error.message.includes('MongoDB') 
      ? 'Terjadi kesalahan pada server' 
      : error.message;
    
    return res.status(500).json({
      success: false,
      message: 'Gagal mengambil data setujui pengajuan: ' + pesanError
    });
  }
}

/**
 * Export function
 */
module.exports = {
  ambilDataSetujuiPengajuan
};
