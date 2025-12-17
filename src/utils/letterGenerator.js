// Utility untuk generate surat izin HTML
const letterGenerator = {
  generateLetterHTML(data) {
    const {
      nama,
      jabatan,
      jenis_pengajuan,
      tanggal_mulai,
      tanggal_selesai,
      alasan,
      jumlah_hari
    } = data;

    const jenisPengajuanLabel = {
      cuti: 'Cuti Tahunan',
      izin_tidak_masuk: 'Izin Tidak Masuk Kerja',
      izin_sakit: 'Izin Sakit',
      wfh: 'Work From Home (WFH)'
    };

    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; border: 1px solid #ccc;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0;">SURAT IZIN</h2>
          <p style="margin: 5px 0; color: #666;">${jenisPengajuanLabel[jenis_pengajuan]}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p><strong>Nama Lengkap:</strong> ${nama}</p>
          <p><strong>Jabatan:</strong> ${jabatan}</p>
          <p><strong>Jenis Izin:</strong> ${jenisPengajuanLabel[jenis_pengajuan]}</p>
        </div>

        <div style="margin-bottom: 20px;">
          <p>Dengan ini saya mengajukan ${jenisPengajuanLabel[jenis_pengajuan].toLowerCase()} pada:</p>
          <p style="margin-left: 20px;">
            <strong>Tanggal Mulai:</strong> ${new Date(tanggal_mulai).toLocaleDateString('id-ID')}<br>
            <strong>Tanggal Selesai:</strong> ${new Date(tanggal_selesai).toLocaleDateString('id-ID')}<br>
            <strong>Jumlah Hari:</strong> ${jumlah_hari} hari
          </p>
        </div>

        <div style="margin-bottom: 30px;">
          <p><strong>Alasan:</strong></p>
          <p style="margin-left: 20px;">${alasan}</p>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px;">
          <div style="text-align: center;">
            <p style="margin-bottom: 40px;">Pemohon,</p>
            <p style="border-top: 1px solid #000; min-width: 150px;">${nama}</p>
          </div>
          <div style="text-align: center;">
            <p style="margin-bottom: 40px;">Diketahui,</p>
            <p style="border-top: 1px solid #000; min-width: 150px;">Penanggung Jawab</p>
          </div>
        </div>
      </div>
    `;
  }
};

module.exports = letterGenerator;
