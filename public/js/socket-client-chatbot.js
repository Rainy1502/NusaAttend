document.addEventListener('DOMContentLoaded', function () {

  /* ================= ROLE CHECK ================= */
  if (!window.USER_ROLE || window.USER_ROLE !== 'karyawan') {
    console.log(
      '⚠️ Chatbot hanya tersedia untuk karyawan. Role Anda: ' +
      (window.USER_ROLE || 'guest')
    );

    const pembungkus = document.querySelector('.pembungkus-chat');
    if (pembungkus) pembungkus.style.display = 'none';
    return; // STOP SCRIPT
  }

  /* ================= DOM ================= */
  const tombolPemicu = document.getElementById('tombol-pemicu');
  const kotakChat = document.getElementById('kotak-chat');
  const tombolTutup = document.getElementById('tombol-tutup-chat');
  const inputTeks = document.getElementById('input-chat-teks');
  const tombolKirim = document.getElementById('tombol-kirim-pesan');
  const kontenPesan = document.getElementById('konten-pesan');
  const daftarSaran = document.querySelectorAll('.tombol-saran');

  /* ================= POPUP UI (TIDAK TERGANTUNG SOCKET) ================= */
  tombolPemicu.addEventListener('click', function () {
    kotakChat.classList.toggle('tersembunyi');
  });

  tombolTutup.addEventListener('click', function () {
    kotakChat.classList.add('tersembunyi');
  });

  document.addEventListener('click', function (e) {
    if (
      !kotakChat.contains(e.target) &&
      !tombolPemicu.contains(e.target)
    ) {
      kotakChat.classList.add('tersembunyi');
    }
  });

  /* ================= SOCKET ================= */
  let socket = null;
  let socketAktif = false;

  if (window.io && window.SOCKET_TOKEN) {
    socket = io({
      auth: { token: window.SOCKET_TOKEN },
      reconnection: true,
      reconnectionAttempts: 5
    });

    socket.on('connect', function () {
      socketAktif = true;
      aktifkanChat();
      console.log('✅ Socket terhubung');
    });

    socket.on('disconnect', function () {
      socketAktif = false;
      nonaktifkanChat();
      console.log('❌ Socket terputus');
    });

    socket.on('chat:bot', function (balasan) {
      tampilkanPesan(balasan, 'asisten');
    });

    socket.on('connect_error', function (err) {
      console.error('❌ Socket error:', err.message);
      nonaktifkanChat();
    });

  } else {
    console.warn('⚠️ Socket tidak diaktifkan (SOCKET_TOKEN tidak ada)');
    nonaktifkanChat();
  }

  /* ================= UI CHAT ================= */
  function tampilkanPesan(teks, tipe) {
    const div = document.createElement('div');
    div.className = 'pesan ' + tipe;

    const balon = document.createElement('div');
    balon.className = 'balon-pesan';
    balon.textContent = teks;

    div.appendChild(balon);
    kontenPesan.appendChild(div);
    kontenPesan.scrollTop = kontenPesan.scrollHeight;
  }

  function kirimPesan() {
    const teks = inputTeks.value.trim();
    if (!teks) return;

    tampilkanPesan(teks, 'user');
    inputTeks.value = '';

    if (socketAktif) {
      socket.emit('chat:user', teks);
    } else {
      tampilkanPesan(
        'Chatbot belum aktif. Silakan refresh atau login ulang.',
        'asisten'
      );
    }
  }

  tombolKirim.addEventListener('click', kirimPesan);
  inputTeks.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') kirimPesan();
  });

  daftarSaran.forEach(function (btn) {
    btn.addEventListener('click', function () {
      inputTeks.value = btn.textContent;
      kirimPesan();
    });
  });

  function nonaktifkanChat() {
    inputTeks.disabled = true;
    tombolKirim.disabled = true;
  }

  function aktifkanChat() {
    inputTeks.disabled = false;
    tombolKirim.disabled = false;
  }

});