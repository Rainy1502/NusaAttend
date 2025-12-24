/**
 * ==================== DEPRECATED FILE ====================
 * 
 * File: constants.js (BACKUP - Dipindahkan dari src/utils/)
 * Status: DEPRECATED - Tidak digunakan di sistem aktif
 * Tanggal Deprecation: 24 Desember 2025
 * 
 * Alasan Deprecation:
 * - Audit menunjukkan 0 file yang mengimport/require constants.js
 * - Implementasi aktif menggunakan hardcoded string values
 * - Tidak ada refactoring ke arah penggunaan constants
 * - File ini kemungkinan adalah rencana yang tidak terealisasi
 * 
 * Penggunaan Historis:
 * - Dirancang untuk standardisasi nilai di seluruh sistem
 * - Tujuan: prevent typos dan maintain consistency
 * - Namun implementasi aktual tidak memanfaatkan file ini
 * 
 * Jika Ingin Menggunakan Kembali:
 * 1. Copy dari backup/src/utils/constants.js ke src/utils/constants.js
 * 2. Refactor semua controllers untuk menggunakan constants
 * 3. Import di setiap file yang membutuhkan
 * 4. Test untuk memastikan tidak ada breaking changes
 * 
 * ==================== ORIGINAL CODE ====================
 */

// Konstanta untuk aplikasi NusaAttend

const JENIS_PENGAJUAN = {
  CUTI: 'cuti',
  IZIN_TIDAK_MASUK: 'izin_tidak_masuk',
  IZIN_SAKIT: 'izin_sakit',
  WFH: 'wfh'
};

const STATUS_PENGAJUAN = {
  MENUNGGU_PERSETUJUAN: 'menunggu_persetujuan',
  DISETUJUI: 'disetujui',
  DITOLAK: 'ditolak'
};

const ROLE_PENGGUNA = {
  EMPLOYEE: 'employee',
  SUPERVISOR: 'supervisor',
  ADMIN: 'admin'
};

const STATUS_ABSENSI = {
  HADIR: 'hadir',
  IZIN: 'izin',
  CUTI: 'cuti',
  TIDAK_HADIR: 'tidak_hadir',
  SAKIT: 'sakit'
};

module.exports = {
  JENIS_PENGAJUAN,
  STATUS_PENGAJUAN,
  ROLE_PENGGUNA,
  STATUS_ABSENSI
};
