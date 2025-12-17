/**
 * Fungsi untuk inisialisasi Socket.io dan mendengarkan event real-time
 * Menangani koneksi client dan berbagai event bisnis (pengajuan, absensi, chatbot)
 */
const inisialisasiSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✓ Klien baru terhubung: ${socket.id}`);

    // Event saat klien disconnect
    socket.on('disconnect', () => {
      console.log(`✗ Klien terputus: ${socket.id}`);
    });

    // ==================== EVENT PENGAJUAN ====================
    // Event ketika ada pengajuan surat izin baru
    socket.on('pengajuan_baru', (data) => {
      console.log('📝 Pengajuan baru:', data);
      io.emit('notifikasi_pengajuan_baru', data);
    });

    // Event ketika status pengajuan diubah
    socket.on('status_pengajuan_diubah', (data) => {
      console.log('✏️ Status pengajuan diubah:', data);
      io.emit('notifikasi_status_pengajuan_diubah', data);
    });

    // ==================== EVENT ABSENSI ====================
    // Event ketika absensi tercatat (masuk/pulang)
    socket.on('absensi_tercatat', (data) => {
      console.log('📍 Absensi tercatat:', data);
      io.emit('notifikasi_absensi_tercatat', data);
    });

    // ==================== EVENT CHATBOT ====================
    // Event ketika ada pertanyaan ke chatbot
    socket.on('pertanyaan_chatbot', (data) => {
      console.log('💬 Pertanyaan chatbot:', data);
    });
  });
};

module.exports = inisialisasiSocket;
