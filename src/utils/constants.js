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
