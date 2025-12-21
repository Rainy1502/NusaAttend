const Absensi = require('../models/Absensi');
const Pengajuan = require('../models/Pengajuan');
const Pengguna= require('../models/Pengguna');

exports.ambilContextUser = async (userId) => {
  // Ambil seluruh absensi user (misal 30 terakhir)
  const daftarAbsensi = await Absensi.find({
    id_pengguna: userId
  })
    .sort({ tanggal: -1 })
    .limit(30)
    .lean();

  // Ambil seluruh pengajuan user
  const daftarPengajuan = await Pengajuan.find({
    id_pengguna: userId
  })
    .sort({ created_at: -1 })
    .limit(20)
    .lean();

  const infoPengguna = await Pengguna.findOne({_id : userId});

//   console.log(daftarAbsensi);
//   console.log(infoPengguna);
  return {
    absensi: daftarAbsensi,
    pengajuan: daftarPengajuan,
    infoPengguna
  };
};
