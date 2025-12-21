/**
 * Controller untuk Review Pengajuan (Penanggung Jawab)
 * Mengelola pengambilan data daftar pengajuan yang menunggu review
 * 
 * Tujuan: Menyuplai data untuk halaman review pengajuan yang berfungsi
 * sebagai tampilan administratif daftar pengajuan surat izin dari karyawan
 * 
 * Catatan Teknis:
 * - Data bersifat READ-ONLY (tidak ada operasi create/update/delete)
 * - Sistem pengajuan detail belum diimplementasikan di database
 * - Untuk fase pertama, endpoint mengembalikan data mock yang aman secara akademik
 * - Data mock mencakup struktur lengkap sesuai frontend: nama, jabatan, jenis izin, periode, durasi, tanggal
 * - Saat sistem pengajuan real diimplementasikan, controller ini dapat langsung diupdate ke query MongoDB
 */

/**
 * Fungsi: ambilDaftarPengajuanMenunggu
 * 
 * Mengambil daftar pengajuan izin yang sedang menunggu review dari penanggung jawab
 * 
 * Data yang dikembalikan (per item pengajuan):
 * - nama_karyawan: Nama lengkap karyawan yang mengajukan
 * - jabatan_karyawan: Posisi/jabatan di perusahaan
 * - jenis_izin: Tipe izin (Cuti Tahunan, Izin Sakit, Work From Home, dll)
 * - periode: Rentang tanggal izin berlaku
 * - durasi: Jumlah hari izin yang diminta
 * - tanggal_diajukan: Kapan pengajuan dibuat
 * - status_pengajuan: Status saat ini (selalu "Menunggu Review" di endpoint ini)
 * 
 * Format Response:
 * {
 *   "success": true,
 *   "message": "...",
 *   "data": {
 *     "daftar_pengajuan": [
 *       {
 *         "nama_karyawan": "Andi Pratama",
 *         "jabatan_karyawan": "Staff IT",
 *         ...
 *       }
 *     ]
 *   }
 * }
 * 
 * @param {Object} req - Request object dari Express
 * @param {Object} res - Response object dari Express
 * @returns {JSON} Response dengan status success dan data daftar pengajuan
 */
exports.ambilDaftarPengajuanMenunggu = async (req, res) => {
  try {
    /**
     * ==================== AMBIL DATA PENGAJUAN ====================
     * 
     * Catatan Implementasi:
     * Fase 1 (Saat Ini): Data mock aman secara akademik
     * Fase 2 (Mendatang): Query ke model Pengajuan ketika diimplementasikan
     * 
     * Data mock mewakili 3 pengajuan contoh dengan struktur lengkap
     * untuk mendemonstrasikan fungsionalitas halaman review pengajuan
     */

    // Data mock pengajuan yang menunggu review
    // Struktur ini akan diganti dengan query MongoDB saat model Pengajuan diimplementasikan
    const daftarPengajuan = [
      {
        nama_karyawan: 'Andi Pratama',
        jabatan_karyawan: 'Staff IT',
        jenis_izin: 'Cuti Tahunan',
        periode: '15 Des - 20 Des 2025',
        durasi: '6 hari',
        tanggal_diajukan: '10 Des',
        status_pengajuan: 'Menunggu Review'
      },
      {
        nama_karyawan: 'Siti Nurhaliza',
        jabatan_karyawan: 'Marketing',
        jenis_izin: 'Izin Sakit',
        periode: '16 Des - 16 Des 2025',
        durasi: '1 hari',
        tanggal_diajukan: '16 Des',
        status_pengajuan: 'Menunggu Review'
      },
      {
        nama_karyawan: 'Budi Santoso',
        jabatan_karyawan: 'Designer',
        jenis_izin: 'Work From Home',
        periode: '17 Des - 17 Des 2025',
        durasi: '1 hari',
        tanggal_diajukan: '16 Des',
        status_pengajuan: 'Menunggu Review'
      }
    ];

    /**
     * ==================== RETURN RESPONSE ====================
     * 
     * Format response harus sesuai spesifikasi frontend:
     * - success: boolean status operasi
     * - message: pesan deskriptif untuk logging
     * - data: object berisi daftar_pengajuan array
     */
    res.status(200).json({
      success: true,
      message: 'Daftar pengajuan menunggu review berhasil diambil',
      data: {
        daftar_pengajuan: daftarPengajuan
      }
    });
  } catch (error) {
    /**
     * ==================== ERROR HANDLING ====================
     * 
     * Menangkap error dan mengembalikan response yang aman
     * - Jangan expose error mentah dari MongoDB
     * - Gunakan pesan error yang manusiawi dan aman
     * - Log error ke console untuk debugging (tidak dikirim ke frontend)
     */
    console.error('Error mengambil daftar pengajuan:', error.message);
    
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil daftar pengajuan. Silakan coba lagi.',
      data: {
        daftar_pengajuan: []
      }
    });
  }
};
