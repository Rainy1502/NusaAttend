/**
 * ==================== CONTROLLER: PEMROSESAN PESAN CHATBOT ====================
 * 
 * File: chatbotController.js
 * Tujuan: Validasi pesan pengguna dan orkestrasi proses chatbot
 * 
 * Alur Pemrosesan:
 * 1. Terima event 'chat:user' dari Socket.IO handler (chatbotSocket.js)
 * 2. Validasi format dan panjang pesan (tipe string, tidak kosong, max 500 char)
 * 3. Validasi keberadaan informasi pengguna di socket (id, nama, role)
 * 4. Ambil konteks data pengguna dari database (riwayat absensi, pengajuan, dll)
 * 5. Kirim pesan + konteks ke Groq API melalui utility chatbot.js
 * 6. Emit respons AI kembali ke client via event 'chat:bot'
 * 7. Handle error dengan pesan yang user-friendly
 * 
 * Catatan Akademik:
 * - Validasi input adalah langkah penting untuk keamanan dan user experience
 * - Context data dari database membantu AI memberikan respons yang relevan
 * - Error handling defensif: log detail untuk debug, pesan ramah untuk user
 * - Tidak ada decision-making logic - hanya orkestrasi antar module
 */

const { kirimKeGroq } = require("../utils/chatbot");
const { ambilContextUser } = require("../utils/contextChatService");

/**
 * Proses pesan chatbot dari pengguna
 * 
 * Tahapan:
 * 1. Validasi pesan (format, panjang)
 * 2. Validasi pengguna (user info exist di socket)
 * 3. Ambil context dari database
 * 4. Kirim ke Groq API
 * 5. Emit response kembali ke client
 * 
 * @param {object} socket - Socket.IO socket object (sudah terauth di middleware)
 * @param {string} pesan - Pesan dari pengguna
 * 
 * Emits:
 * - 'chat:bot' dengan string: respons AI atau pesan error
 */
exports.prosesPesanChatbot = async (socket, pesan) => {
  try {
    /* ================= TAHAP 1: VALIDASI PESAN ================= */
    // Pesan harus string dan tidak null/undefined
    if (!pesan || typeof pesan !== "string") {
      socket.emit("chat:bot", "⚠️ Pesan tidak valid. Harap kirim teks yang benar.");
      return;
    }

    const pesanTerbersih = pesan.trim();

    // Pesan tidak boleh kosong atau hanya whitespace
    if (pesanTerbersih.length === 0) {
      socket.emit("chat:bot", "⚠️ Pesan tidak boleh kosong.");
      return;
    }

    // Batasi panjang pesan untuk menghindari spam dan kontrol biaya API
    if (pesanTerbersih.length > 500) {
      socket.emit(
        "chat:bot",
        "⚠️ Pesan terlalu panjang (maksimal 500 karakter). Harap singkatkan."
      );
      return;
    }

    /* ================= TAHAP 2: VALIDASI PENGGUNA ================= */
    // socket.user sudah di-set oleh middleware socketAuth.js
    const pengguna = socket.user;

    if (!pengguna || !pengguna.id) {
      console.error("❌ Error Controller Chatbot: socket.user tidak valid");
      socket.emit(
        "chat:bot",
        "❌ Autentikasi gagal. Silakan refresh halaman dan login ulang."
      );
      return;
    }

    console.log(
      `💬 Pesan dari ${pengguna.nama} (${pengguna.role}): "${pesanTerbersih}"`
    );

    /* ================= TAHAP 3: AMBIL KONTEKS DARI DATABASE ================= */
    // Context termasuk: riwayat absensi, pengajuan terbaru, jumlah pending/approved
    // Ini membantu AI memberikan respons yang lebih relevan dan kontekstual
    const konteksDatabase = await ambilContextUser(pengguna.id);

    /* ================= TAHAP 4: KIRIM KE GROQ API ================= */
    // Delegate ke utility module chatbot.js untuk komunikasi dengan AI
    const responsAI = await kirimKeGroq(
      pesanTerbersih,
      {
        nama: pengguna.nama,
        role: pengguna.role,
      },
      konteksDatabase
    );

    /* ================= TAHAP 5: KIRIM RESPONS KE CLIENT ================= */
    socket.emit("chat:bot", responsAI);
    console.log(`✅ Respons AI dikirim ke ${pengguna.nama}`);

  } catch (error) {
    console.error("❌ Error Controller Chatbot:", error);

    /* ================= ERROR HANDLING: PESAN USER-FRIENDLY ================= */
    let pesanError =
      "❌ Maaf, sistem sedang mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.";

    // Specific error handling untuk berbagai scenario
    if (error.response?.status === 401) {
      console.error("⚠️ API Key Groq tidak valid atau sudah expired");
      pesanError = "❌ Konfigurasi AI belum lengkap. Hubungi administrator.";
    } 
    else if (error.response?.status === 429) {
      console.error("⚠️ Rate limit dari Groq API - terlalu banyak request");
      pesanError = "⚠️ Terlalu banyak permintaan ke AI. Tunggu beberapa saat, lalu coba lagi.";
    } 
    else if (error.message?.includes("timeout")) {
      console.error("⚠️ Request timeout - AI response terlalu lama");
      pesanError = "⚠️ Respons AI terlalu lama. Coba lagi nanti.";
    } 
    else if (error.message?.includes("ECONNREFUSED")) {
      console.error("⚠️ Koneksi ke Groq API ditolak");
      pesanError = "❌ Tidak bisa terhubung ke layanan AI. Hubungi administrator.";
    }

    // Emit error message ke client
    socket.emit("chat:bot", pesanError);
  }
};
