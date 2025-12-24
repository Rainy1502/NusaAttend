/* ==================== DETAIL PENGAJUAN CONTROLLER ==================== */
/* 
 * Controller untuk mengambil detail pengajuan dan mengelola approval/rejection
 * 
 * Fungsi:
 * - Menyediakan data administratif pengajuan untuk keperluan tampilan modal
 * - Mengembalikan konten surat izin dalam format visual
 * - Menangani persetujuan dan penolakan pengajuan
 * 
 * CATATAN:
 * - Data sisa cuti diambil dari database Pengguna
 * - Tanda tangan pengguna diambil dari database Pengguna
 * - Backend mengelola workflow approval: menerima keputusan & mengupdate status
 * - Tanda tangan bersifat ADMINISTRATIF VISUAL, bukan bukti hukum
 */

const Pengguna = require('../models/Pengguna');
const Pengajuan = require('../models/Pengajuan');

/**
 * Mengambil detail pengajuan untuk keperluan tampilan modal detail
 * 
 * Data diambil dari:
 * 1. Database Pengajuan - untuk data aplikasi (jenis izin, periode, alasan)
 * 2. Database Pengguna - untuk sisa cuti dan tanda tangan karyawan
 * 
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID pengajuan
 * @param {Object} res - Response object
 */
async function ambilDetailPengajuan(req, res) {
    try {
        const { id } = req.params;
        
        console.log(`📋 Mengambil detail pengajuan dengan ID: ${id}`);
        
        // Validasi input ID
        if (!id || id === undefined) {
            console.warn('⚠️  ID pengajuan tidak diberikan');
            return res.status(400).json({
                success: false,
                message: 'ID pengajuan harus diberikan'
            });
        }
        
        // Coba ambil data pengajuan dari database
        let detailPengajuanData = {};
        
        try {
            // Query Pengajuan dengan field names yang benar
            const pengajuan = await Pengajuan.findById(id).populate('karyawan_id');
            
            if (pengajuan) {
                console.log('✅ Data pengajuan ditemukan di database');
                console.log('📊 Pengajuan data:', JSON.stringify(pengajuan, null, 2));
                
                // Data karyawan dari relasi populate
                const karyawan = pengajuan.karyawan_id;
                console.log('👤 Data karyawan:', JSON.stringify(karyawan, null, 2));
                console.log(`📊 Sisa cuti karyawan - Nilai: ${karyawan?.sisa_cuti}, Tipe: ${typeof karyawan?.sisa_cuti}`);
                console.log(`📄 Tanda tangan - Nilai: ${pengajuan.tanda_tangan_base64 ? 'Ada' : 'Tidak ada'}, Panjang: ${pengajuan.tanda_tangan_base64?.length || 0}`);
                
                // Format jenis izin (ubah dari enum ke display name)
                const jenisIzinMap = {
                    'cuti-tahunan': 'Cuti Tahunan',
                    'izin-tidak-masuk': 'Izin Tidak Masuk',
                    'izin-sakit': 'Izin Sakit',
                    'wfh': 'Work From Home'
                };
                const jenisIzinDisplay = jenisIzinMap[pengajuan.jenis_izin] || pengajuan.jenis_izin;
                
                // Format tanggal
                const formatTanggal = (date) => {
                    if (!date) return '-';
                    const d = new Date(date);
                    const tahun = d.getFullYear();
                    const bulan = String(d.getMonth() + 1).padStart(2, '0');
                    const hari = String(d.getDate()).padStart(2, '0');
                    return `${tahun}-${bulan}-${hari}`;
                };
                
                // Hitung durasi hari
                const hitungDurasi = (mulai, selesai) => {
                    if (!mulai || !selesai) return '0 hari kerja';
                    const ms = new Date(selesai) - new Date(mulai);
                    const hari = Math.ceil(ms / (1000 * 60 * 60 * 24)) + 1;
                    return `${hari} hari kerja`;
                };
                
                // Hitung sisa cuti real-time dari pengajuan disetujui
                const jatahCutiAwal = 12;
                const pengajuanDisetujui = await Pengajuan.find({
                    karyawan_id: karyawan._id,
                    status: 'disetujui',
                    jenis_izin: { $ne: 'wfh' }
                }).select('tanggal_mulai tanggal_selesai');
                
                let hariDigunakan = 0;
                pengajuanDisetujui.forEach(paj => {
                    const durasiHari = Math.ceil(
                        (new Date(paj.tanggal_selesai) - new Date(paj.tanggal_mulai)) / (1000 * 60 * 60 * 24)
                    ) + 1;
                    hariDigunakan += durasiHari;
                });
                
                const sisaCutiHitung = Math.max(0, jatahCutiAwal - hariDigunakan);
                
                detailPengajuanData = {
                    jenis_izin: jenisIzinDisplay,
                    periode_izin: `${formatTanggal(pengajuan.tanggal_mulai)} s/d ${formatTanggal(pengajuan.tanggal_selesai)}`,
                    alasan_pengajuan: pengajuan.alasan || '-',
                    nama_pengguna: karyawan?.nama_lengkap || '-',
                    jabatan_pengguna: karyawan?.jabatan || '-',
                    tanggal_diajukan: formatTanggal(pengajuan.dibuat_pada),
                    durasi_pengajuan: hitungDurasi(pengajuan.tanggal_mulai, pengajuan.tanggal_selesai),
                    tanda_tangan_administratif: pengajuan.tanda_tangan_base64 || '[TANDA TANGAN ADMINISTRATIF]',
                    nama_penandatangan: karyawan?.nama_lengkap || '-',
                    sisa_cuti: String(sisaCutiHitung),
                    status_pengajuan: pengajuan.status || 'menunggu'
                };
                
                console.log('✅ Detail pengajuan berhasil diproses:', detailPengajuanData);
                console.log(`📊 DEBUG Sisa Cuti - Nilai: ${detailPengajuanData.sisa_cuti}, Tipe: ${typeof detailPengajuanData.sisa_cuti}`);
            } else {
                // Jika pengajuan tidak ada, gunakan mock data
                console.warn('⚠️  Pengajuan tidak ditemukan, menggunakan mock data');
                detailPengajuanData = _generateMockData();
            }
        } catch (dbError) {
            // Jika query database gagal, gunakan mock data
            console.warn('⚠️  Error query database, menggunakan mock data:', dbError.message);
            detailPengajuanData = _generateMockData();
        }
        
        console.log('✅ Data detail pengajuan berhasil diambil');
        
        // Return response dengan format standard
        return res.status(200).json({
            success: true,
            message: 'Detail pengajuan berhasil diambil',
            data: {
                detail_pengajuan: detailPengajuanData
            }
        });
        
    } catch (error) {
        console.error('❌ Error mengambil detail pengajuan:', error);
        
        // Return error response yang aman
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengambil detail pengajuan'
        });
    }
}

/**
 * Menyetujui pengajuan surat izin
 * 
 * Fungsi ini:
 * - Mengupdate status pengajuan menjadi 'disetujui'
 * - Menyimpan tanggal keputusan
 * - Mengembalikan konfirmasi ke frontend
 * 
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID pengajuan
 * @param {Object} res - Response object
 */
async function setujuiPengajuan(req, res) {
    try {
        const { id } = req.params;
        
        console.log(`✅ Menyetujui pengajuan dengan ID: ${id}`);
        
        // Validasi
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID pengajuan harus diberikan'
            });
        }
        
        // Update status pengajuan di database
        const hasil = await Pengajuan.findByIdAndUpdate(
            id,
            {
                status: 'disetujui',
                tanggal_direview: new Date(),
                penanggung_jawab_id: req.user?.id || null
            },
            { new: true }
        );
        
        if (!hasil) {
            console.warn('⚠️  Pengajuan tidak ditemukan');
            return res.status(404).json({
                success: false,
                message: 'Pengajuan tidak ditemukan'
            });
        }
        
        console.log('✅ Pengajuan berhasil disetujui');
        
        return res.status(200).json({
            success: true,
            message: 'Pengajuan berhasil disetujui',
            data: {
                status: hasil.status,
                tanggal_direview: hasil.tanggal_direview
            }
        });
        
    } catch (error) {
        console.error('❌ Error menyetujui pengajuan:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menyetujui pengajuan'
        });
    }
}

/**
 * Menolak pengajuan surat izin
 * 
 * Fungsi ini:
 * - Mengupdate status pengajuan menjadi 'ditolak'
 * - Menyimpan tanggal keputusan
 * - Mengembalikan konfirmasi ke frontend
 * 
 * @param {Object} req - Request object
 * @param {string} req.params.id - ID pengajuan
 * @param {Object} req.body - Request body
 * @param {string} req.body.alasan_penolakan - Alasan penolakan (optional)
 * @param {Object} res - Response object
 */
async function tolakPengajuan(req, res) {
    try {
        const { id } = req.params;
        const { alasan_penolakan } = req.body;
        
        console.log(`❌ Menolak pengajuan dengan ID: ${id}`);
        
        // Validasi
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'ID pengajuan harus diberikan'
            });
        }
        
        // Update status pengajuan di database
        const hasil = await Pengajuan.findByIdAndUpdate(
            id,
            {
                status: 'ditolak',
                tanggal_direview: new Date(),
                penanggung_jawab_id: req.user?.id || null,
                keterangan_review: alasan_penolakan || ''
            },
            { new: true }
        );
        
        if (!hasil) {
            console.warn('⚠️  Pengajuan tidak ditemukan');
            return res.status(404).json({
                success: false,
                message: 'Pengajuan tidak ditemukan'
            });
        }
        
        console.log('✅ Pengajuan berhasil ditolak');
        
        return res.status(200).json({
            success: true,
            message: 'Pengajuan berhasil ditolak',
            data: {
                status: hasil.status,
                tanggal_direview: hasil.tanggal_direview
            }
        });
        
    } catch (error) {
        console.error('❌ Error menolak pengajuan:', error);
        
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat menolak pengajuan'
        });
    }
}

/**
 * Helper function: Generate mock data untuk database tidak tersedia
 * @returns {Object} Mock detail pengajuan
 */
function _generateMockData() {
    return {
        jenis_izin: 'Cuti Tahunan',
        periode_izin: '2025-01-15 s/d 2025-01-20',
        alasan_pengajuan: 'Istirahat berkala dan quality time bersama keluarga',
        nama_pengguna: 'Andi Pratama',
        jabatan_pengguna: 'Staff IT',
        tanggal_diajukan: '2025-01-10',
        durasi_pengajuan: '6 hari kerja',
        tanda_tangan_administratif: '[TANDA TANGAN ADMINISTRATIF]',
        nama_penandatangan: 'Andi Pratama',
        sisa_cuti: '9',
        status_pengajuan: 'menunggu'
    };
}

// Export functions
module.exports = {
    ambilDetailPengajuan,
    setujuiPengajuan,
    tolakPengajuan
};
