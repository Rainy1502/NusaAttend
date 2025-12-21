const { prosesPesanChatbot } = require("./controllers/chatbotController");

module.exports = (io) => {
  io.on("connection", (socket) => {
    // Verify user info dari socket
    if (!socket.user) {
      console.error("❌ Socket connection rejected: user info missing");
      socket.disconnect();
      return;
    }

    console.log(
      `🤖 Chatbot terhubung: ${socket.user.nama} (${socket.user.role})`
    );
    console.log(`   Socket ID: ${socket.id}`);

    // Handle chat:user event
    socket.on("chat:user", async (pesanUser) => {
      console.log(`📨 Pesan dari ${socket.user.nama}: ${pesanUser}`);
      await prosesPesanChatbot(socket, pesanUser);
    });

    // Handle errors
    socket.on("error", (error) => {
      console.error(`❌ Socket error [${socket.user.nama}]:`, error);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      console.log(`🔌 Chatbot disconnect: ${socket.user.nama}`);
    });
  });
};
