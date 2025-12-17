/**
 * Constants Configuration
 * Semua konstanta yang digunakan di aplikasi
 */

module.exports = {
  // Jenis Pengajuan
  JENIS_PENGAJUAN: {
    CUTI: 'cuti',
    IZIN_TIDAK_MASUK: 'izin_tidak_masuk',
    IZIN_SAKIT: 'izin_sakit',
    WFH: 'wfh'
  },

  // Status Pengajuan
  STATUS_PENGAJUAN: {
    MENUNGGU: 'menunggu_persetujuan',
    DISETUJUI: 'disetujui',
    DITOLAK: 'ditolak'
  },

  // Role Pengguna
  ROLE_PENGGUNA: {
    EMPLOYEE: 'employee',
    SUPERVISOR: 'supervisor',
    ADMIN: 'admin'
  },

  // Status Absensi
  STATUS_ABSENSI: {
    HADIR: 'hadir',
    IZIN: 'izin',
    CUTI: 'cuti',
    TIDAK_HADIR: 'tidak_hadir',
    SAKIT: 'sakit'
  },

  // Konfigurasi Cuti
  CUTI_CONFIG: {
    JATAH_TAHUNAN: 12,
    PERIODE_TAHUN: new Date().getFullYear()
  },

  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_ERROR: 500
  },

  // Error Messages
  ERROR_MESSAGES: {
    INVALID_CREDENTIALS: 'Email atau password salah',
    EMAIL_EXISTS: 'Email sudah terdaftar',
    USER_NOT_FOUND: 'Pengguna tidak ditemukan',
    UNAUTHORIZED: 'Anda tidak memiliki akses',
    SERVER_ERROR: 'Terjadi kesalahan pada server',
    VALIDATION_ERROR: 'Data tidak valid',
    CUTI_TIDAK_CUKUP: 'Sisa cuti tidak mencukupi'
  },

  // Success Messages
  SUCCESS_MESSAGES: {
    REGISTER_SUCCESS: 'Registrasi berhasil',
    LOGIN_SUCCESS: 'Login berhasil',
    LOGOUT_SUCCESS: 'Logout berhasil',
    PENGAJUAN_CREATED: 'Pengajuan berhasil dibuat',
    PENGAJUAN_APPROVED: 'Pengajuan telah disetujui',
    PENGAJUAN_REJECTED: 'Pengajuan telah ditolak',
    ABSENSI_RECORDED: 'Absensi berhasil tercatat'
  }
};
