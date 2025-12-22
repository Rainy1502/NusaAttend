/**
 * ==================== EVENT HANDLER SOCKET.IO CHATBOT ====================
 * 
 * File: chatbotSocket.js
 * Tujuan: Mengatur event handler Socket.IO untuk komunikasi real-time chatbot
 * 
 * Alur Event:
 * 1. Koneksi Socket: Client terhubung → Middleware socketAuth memvalidasi JWT
 * 2. Chat User: Client mengirim pesan melalui event 'chat:user'
 * 3. Proses Pesan: Controller memvalidasi dan mengirim ke Groq API
 * 4. Chat Bot: Response dari AI dikirim kembali via event 'chat:bot'
 * 5. Disconnect: Client terputus → Log dan cleanup
 * 
 * Catatan Akademik:
 * - Socket.IO adalah transport layer untuk real-time communication
 * - Autentikasi dilakukan di middleware socketAuth.js sebelum sampai ke sini
 * - Setiap socket.user sudah terverifikasi dan memiliki data pengguna yang valid
 */

const { prosesPesanChatbot } = require("./controllers/chatbotController");

/**
 * Mendaftarkan event handler untuk koneksi Socket.IO
 * 
 * @param {object} io - Instance Socket.IO server dari app.js
 * 
 * Flow:
 * - io.on("connection", ...) dipanggil setiap kali client baru terhubung
 * - socket object dibuat per koneksi dan berisi data user dari middleware
 * - Event handler didaftarkan untuk setiap socket connection
 */
module.exports = (io) => {
  io.on("connection", (socket) => {
    /* ================= VALIDASI INFORMASI PENGGUNA ================= */
    // socket.user sudah di-set oleh middleware socketAuth.js
    if (!socket.user) {
      console.error("❌ Socket connection ditolak: informasi user tidak ditemukan");
      socket.disconnect();
      return;
    }

    console.log(
      `🤖 Chatbot terhubung: ${socket.user.nama} (${socket.user.role})`
    );
    console.log(`   Socket ID: ${socket.id}`);

    /* ================= EVENT: TERIMA PESAN DARI USER ================= */
    /**
     * Event 'chat:user' dipanggil ketika client mengirim pesan
     * Data: pesanUser (string) - pesan dari pengguna
     */
    socket.on("chat:user", async (pesanUser) => {
      console.log(`📨 Pesan dari ${socket.user.nama}: ${pesanUser}`);
      // Delegate ke controller untuk validasi dan pemrosesan
      await prosesPesanChatbot(socket, pesanUser);
    });

    /* ================= EVENT: HANDLE ERROR ================= */
    /**
     * Event 'error' dipanggil ketika ada error di socket connection
     */
    socket.on("error", (error) => {
      console.error(`❌ Socket error [${socket.user.nama}]:`, error);
    });

    /* ================= EVENT: HANDLE DISCONNECT ================= */
    /**
     * Event 'disconnect' dipanggil ketika client terputus dari server
     * Baik karena client close connection atau network error
     */
    socket.on("disconnect", () => {
      console.log(`🔌 Chatbot disconnect: ${socket.user.nama}`);
    });
  });
};
