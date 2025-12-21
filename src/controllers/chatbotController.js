const { kirimKeGroq } = require("../utils/chatbot");
const { ambilContextUser } = require("../utils/contextChatService");

exports.prosesPesanChatbot = async (socket, pesan) => {
  try {
    /* ================= VALIDASI PESAN ================= */
    if (!pesan || typeof pesan !== "string") {
      socket.emit("chat:bot", "⚠️ Pesan tidak valid.");
      return;
    }

    const pesanTrimmed = pesan.trim();

    if (pesanTrimmed.length === 0) {
      socket.emit("chat:bot", "⚠️ Pesan tidak boleh kosong.");
      return;
    }

    if (pesanTrimmed.length > 500) {
      socket.emit(
        "chat:bot",
        "⚠️ Pesan terlalu panjang (maksimal 500 karakter)."
      );
      return;
    }

    /* ================= VALIDASI USER ================= */
    const user = socket.user;

    if (!user || !user.id) {
      console.error("❌ Chatbot Error: socket.user tidak tersedia");
      socket.emit(
        "chat:bot",
        "❌ Autentikasi gagal. Silakan login ulang."
      );
      return;
    }

    console.log(
      `💬 Chat dari ${user.nama} (${user.role}): "${pesanTrimmed}"`
    );

    /* ================= AMBIL CONTEXT DATABASE ================= */
    const contextDB = await ambilContextUser(user.id);

    /* ================= KIRIM KE GROQ ================= */
    const balasanAI = await kirimKeGroq(
      pesanTrimmed,
      {
        nama: user.nama,
        role: user.role,
      },
      contextDB
    );

    /* ================= KIRIM BALASAN ================= */
    socket.emit("chat:bot", balasanAI);
    console.log(`✅ Balasan AI terkirim ke ${user.nama}`);
  } catch (error) {
    console.error("❌ Chatbot Controller Error:", error);

    let errorMessage =
      "❌ Maaf, sistem sedang mengalami gangguan. Silakan coba lagi.";

    if (error.response?.status === 401) {
      errorMessage = "❌ API Key AI tidak valid. Hubungi administrator.";
    } else if (error.response?.status === 429) {
      errorMessage =
        "⚠️ Terlalu banyak permintaan. Silakan tunggu sebentar.";
    } else if (error.message?.includes("timeout")) {
      errorMessage = "⚠️ Respons AI terlalu lama. Coba lagi.";
    }

    socket.emit("chat:bot", errorMessage);
  }
};
