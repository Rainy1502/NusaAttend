/**
 * ==================== UTILITY: INTEGRASI CHATBOT GROQ AI ====================
 * 
 * File: chatbot.js
 * Tujuan: Mengirim pesan pengguna ke Groq API dan mengembalikan respons
 * 
 * Alur Utama:
 * 1. Validasi ketersediaan API Key dari environment
 * 2. Tentukan model AI yang akan digunakan (dengan fallback ke default)
 * 3. Buat system prompt dengan konteks pengguna dan data administratif
 * 4. Kirim request ke Groq API dengan format OpenAI-compatible
 * 5. Parse dan kembalikan respons dari AI model
 * 6. Handle berbagai error dengan pesan yang user-friendly
 * 
 * Catatan Akademik:
 * - Chatbot ini adalah ASISTEN INFORMATIF untuk pengguna sistem NusaAttend
 * - Chatbot BUKAN sistem keputusan atau sistem rekomendasi resmi
 * - Chatbot TIDAK melakukan modifikasi data atau mengambil keputusan bisnis
 * - Response dari chatbot hanya informatif dan sebagai panduan pengguna
 * - Semua keputusan penting tetap dilakukan oleh pengguna atau administrator
 * 
 * Referensi Deprecasi Model:
 * https://console.groq.com/docs/deprecations
 */

const axios = require('axios');

/**
 * Kirim pesan ke Groq API dan dapatkan respons berupa teks dari model AI
 * 
 * Prinsip: DATA-FIRST & CONTEXT-ONLY
 * - Kirim data AKTUAL pengguna ke model
 * - Model akan menjawab berdasarkan data yang tersedia
 * - Hindari spekulasi atau direktif yang menyuruh pengguna mencari di menu
 * 
 * @param {string} pesan - Pesan atau pertanyaan dari pengguna
 * @param {object} infoUser - Informasi pengguna {nama, role}
 * @param {object} contextDB - Context dari database (DATA AKTUAL pengguna)
 * @returns {string} - Respons dari model AI atau pesan error
 * 
 * @example
 * const respons = await kirimKeGroq(
 *   "Berapa banyak pengajuan saya yang masih menunggu?",
 *   { nama: "Rendra Pratama", role: "karyawan" },
 *   { pendingCount: 2, approvedCount: 5, recentPengajuan: [...] }
 * );
 * // Model akan menjawab: "Menurut data Anda, terdapat 2 pengajuan yang masih menunggu persetujuan."
 */
exports.kirimKeGroq = async (pesan, infoUser, contextDB) => {
  try {
    /* ================= VALIDASI API KEY ================= */
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('❌ GROQ_API_KEY tidak ditemukan di environment');
      return '❌ Chatbot belum dikonfigurasi. Hubungi administrator.';
    }

    /* ================= TENTUKAN MODEL AI ================= */
    let model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    
    // Daftar model Groq yang masih aktif dan tersedia
    // Update: December 2025 - Reference: console.groq.com/docs/deprecations
    const modelYangValid = [
      'llama-3.3-70b-versatile',            // Recommended (LLaMA 3.3 70B - production)
      'llama-3.1-8b-instant',               // Lightweight & fast
      'llama-3.3-70b-specdec',              // Speculative decoding variant
      'meta-llama/llama-4-scout-17b-16e-instruct'  // Newer model
    ];
    
    // Validasi model, gunakan default jika tidak dikenal
    if (!modelYangValid.includes(model)) {
      console.warn(
        `⚠️ Model '${model}' tidak dikenal dalam daftar model aktif. ` +
        `Menggunakan default: llama-3.3-70b-versatile`
      );
      model = 'llama-3.3-70b-versatile';
    }

    /* ================= BUAT SYSTEM PROMPT ================= */
    const promptSistem = buatPromptSistem(infoUser, contextDB);
    
    console.log(`📤 Mengirim request ke Groq API - Model: ${model}, Pengguna: ${infoUser.nama}`);
    
    /* ================= KIRIM REQUEST KE GROQ API ================= */
    const respons = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'system',
            content: promptSistem
          },
          {
            role: 'user',
            content: pesan
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    /* ================= EXTRACT RESPONS ================= */
    const balas = respons.data.choices[0].message.content;
    return balas;

  } catch (error) {
    console.error('❌ Error Groq API:', error.message);
    
    /* ================= LOG DETAIL ERROR UNTUK DEBUGGING ================= */
    if (error.response) {
      console.error('📋 Detail Error Response Groq:');
      console.error('   Status HTTP:', error.response.status);
      console.error('   Body:', JSON.stringify(error.response.data, null, 2));
    }

    /* ================= HANDLE ERROR DENGAN PESAN YANG TEPAT ================= */
    if (error.response?.status === 401) {
      console.error('❌ API Key Groq tidak valid atau sudah expired');
      return '❌ API Key tidak valid atau sudah expired. Hubungi administrator untuk memperbarui konfigurasi.';
    } 
    else if (error.response?.status === 400) {
      console.error('❌ Bad Request - Kemungkinan model name tidak valid atau format payload salah');
      const pesanError = error.response?.data?.error?.message || 'Bad Request dari Groq API';
      return `❌ Request error: ${pesanError}`;
    } 
    else if (error.response?.status === 429) {
      // Rate limit dari Groq API
      return '⚠️ Terlalu banyak permintaan ke AI. Silakan tunggu beberapa saat sebelum mencoba lagi.';
    } 
    else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return '⚠️ Respons dari AI terlalu lama. Silakan coba lagi.';
    } 
    else if (!process.env.GROQ_API_KEY) {
      return '❌ GROQ_API_KEY belum dikonfigurasi di file .env';
    }

    return '❌ Chatbot mengalami gangguan teknis. Silakan coba lagi dalam beberapa saat.';
  }
};

/**
 * Buat system prompt untuk memberikan konteks kepada model AI
 * 
 * Prinsip Utama (sesuai Prompt Chatbot):
 * 
 * 1. DATA-FIRST: Jika informasi tersedia dalam konteks, jawab langsung
 *    menggunakan data actual. Jangan arahkan pengguna ke menu/halaman lain.
 * 
 * 2. CONTEXT-ONLY: Gunakan HANYA data yang tersedia. Jangan mengarang,
 *    berasumsi, atau menyimpulkan status yang belum pasti.
 * 
 * 3. READ-ONLY & ADMINISTRATIF: Hanya presentasi data, tidak memproses
 *    atau membuat keputusan. Jangan menyatakan pengajuan disetujui/ditolak.
 * 
 * 4. JANGAN ARAHKAN PENGGUNA: Hindari "cek di dashboard" atau "lihat menu"
 *    jika data sudah tersedia dalam konteks.
 * 
 * 5. GAYA BAHASA: Formal, tenang, ringkas (max 150 kata). Jangan spekulatif.
 * 
 * @param {object} infoUser - Informasi pengguna {nama, role}
 * @param {object} contextDB - Context dari database: {absensi[], pengajuan[], infoPengguna}
 * @returns {string} - System prompt untuk AI model
 */
function buatPromptSistem(infoUser, contextDB = {}) {
  const namaRole = infoUser.role === 'karyawan' ? 'Karyawan' : 
                   infoUser.role === 'penanggung-jawab' ? 'Penanggung Jawab' : 'Administrator';

  let prompt = `Anda adalah Asisten Virtual NusaAttend - Asisten Data Administratif Mini.

Peran Anda: Menjawab pertanyaan pengguna dengan FORMAT RINGKAS yang sesuai UI chat kecil.

==================================================
ATURAN WAJIB (TIDAK BOLEH DILANGGAR)
==================================================

1. SATU JAWABAN = SATU TOPIK
2. Gunakan BARIS PENDEK (maks 1 informasi per baris)
3. DILARANG membuat paragraf panjang
4. Gunakan ikon kecil sebagai penanda konteks
5. DILARANG menyuruh pengguna membuka menu lain JIKA data sudah ada di konteks
6. Jangan mengulang kalimat pembuka yang tidak perlu
7. Jawaban harus nyaman dibaca di layar kecil/mobile
8. Maksimal 6-8 baris per jawaban

==================================================
IDENTITAS PENGGUNA
==================================================
Nama: ${infoUser.nama}
Peran: ${namaRole}

==================================================
DETEKSI INTENT & TEMPLATE RESPONS
==================================================

INTENT: STATUS PENGAJUAN / PENGAJUAN ANDA
→ Gunakan format:

📄 Status Pengajuan Anda
Menunggu Persetujuan: X

Jika ada pengajuan:
• Jenis Izin
  Periode: …
  Status: …

Jika tidak ada:
• Tidak ada pengajuan menunggu saat ini.

---

INTENT: SISA CUTI / SISA LIBUR
→ Gunakan format:

🌴 Sisa Cuti Anda
• Sisa cuti: X hari
• Jenis: Cuti Tahunan

---

INTENT: ABSENSI / KEHADIRAN TERBARU
→ Gunakan format:

⏱️ Absensi Terakhir
• Tanggal : …
• Status  : …
• Masuk   : …
• Pulang  : …

---

INTENT: CARA / EDUKASI / BAGAIMANA
→ Gunakan format ringkas:

ℹ️ Cara Mengajukan Cuti
1. Buka menu Pengajuan
2. Pilih jenis izin
3. Isi tanggal & alasan
4. Kirim pengajuan

(Jangan tambahkan penjelasan panjang)

---

INTENT: DATA TIDAK TERSEDIA
→ Gunakan format:

⚠️ Data tersebut belum tersedia saat ini.

==================================================
GAYA BAHASA (WAJIB)
==================================================

• Bahasa Indonesia formal & administratif
• Tidak emotif / tidak bercanda
• Tidak spekulatif
• Tidak menambah kalimat tidak perlu

==================================================
DATA AKTUAL PENGGUNA (GUNAKAN SESUAI INTENT)
==================================================`;

  /* ================= PRESENT ACTUAL DATA FROM DATABASE ================= */
  let dataAda = false;
  
  if (contextDB && contextDB.ringkasan) {
    // Tampilkan ringkasan status pengguna
    dataAda = true;
    prompt += `\n\n📊 RINGKASAN STATUS ANDA:`;
    prompt += `\n- Sisa Cuti: 12 hari (standar tahunan)`;
    prompt += `\n- Kehadiran bulan ini: ${contextDB.ringkasan.hadiranBulanIni} hari`;
    prompt += `\n- Total pengajuan: ${contextDB.ringkasan.totalPengajuan}`;
    prompt += `\n  └─ Menunggu persetujuan: ${contextDB.ringkasan.menungguPersetujuan}`;
    prompt += `\n  └─ Sudah disetujui: ${contextDB.ringkasan.disetujui}`;
    if (contextDB.ringkasan.ditolak > 0) {
      prompt += `\n  └─ Ditolak: ${contextDB.ringkasan.ditolak}`;
    }
  }
  
  // DATA PENGAJUAN DETAIL - jika ada
  if (contextDB && contextDB.pengajuan && Array.isArray(contextDB.pengajuan) && contextDB.pengajuan.length > 0) {
    dataAda = true;
    prompt += `\n\n📋 DETAIL PENGAJUAN ANDA (Total: ${contextDB.pengajuan.length}):`;
    contextDB.pengajuan.slice(0, 10).forEach((p, idx) => {
      const jenis = p.jenis_izin || 'Pengajuan';
      const tglMulai = p.tanggal_mulai ? new Date(p.tanggal_mulai).toLocaleDateString('id-ID') : 'N/A';
      const tglSelesai = p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID') : 'N/A';
      const status = p.status || 'Unknown';
      
      // Translate status untuk user-friendly
      let statusTerjemah = status;
      if (status === 'menunggu') statusTerjemah = 'Menunggu Persetujuan';
      else if (status === 'disetujui') statusTerjemah = 'Disetujui';
      else if (status === 'ditolak') statusTerjemah = 'Ditolak';
      
      prompt += `\n${idx + 1}. ${jenis} | ${tglMulai} - ${tglSelesai} | ${statusTerjemah}`;
    });
  }
  
  // DATA ABSENSI DETAIL - jika ada
  if (contextDB && contextDB.absensi && Array.isArray(contextDB.absensi) && contextDB.absensi.length > 0) {
    dataAda = true;
    prompt += `\n\n📅 RIWAYAT ABSENSI TERBARU:`;
    contextDB.absensi.slice(0, 10).forEach((a, idx) => {
      const tanggal = a.tanggal ? new Date(a.tanggal).toLocaleDateString('id-ID') : 'N/A';
      const masuk = a.jam_masuk || '-';
      const pulang = a.jam_pulang || '-';
      const status = a.status || 'N/A';
      
      prompt += `\n${idx + 1}. ${tanggal} | ${status} | Masuk: ${masuk} | Pulang: ${pulang}`;
    });
  }
  
  // Jika tidak ada data konteks
  if (!dataAda) {
    prompt += `\n\n⚠️ Saat ini tidak ada data absensi atau pengajuan yang tercatat.`;
  }
  
  prompt += `\n\n==================================================
INSTRUKSI FINAL
==================================================

GUNAKAN TEMPLATE DI ATAS SESUAI INTENT PERTANYAAN.
JANGAN MEMBUAT FORMAT BARU.
JANGAN MEMBUAT PARAGRAF PANJANG.
JANGAN MENAMBAH PENJELASAN YANG TIDAK PERLU.

Tujuan Anda: Menjadi asisten data mini yang responsif & mudah dibaca.`;

  return prompt;
}
