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
 * @param {string} pesan - Pesan atau pertanyaan dari pengguna
 * @param {object} infoUser - Informasi pengguna {nama, role}
 * @param {object} contextDB - Context dari database (absensi, pengajuan, dll)
 * @returns {string} - Respons dari model AI atau pesan error
 * 
 * @example
 * const respons = await kirimKeGroq(
 *   "Bagaimana cara membuat pengajuan cuti?",
 *   { nama: "Rendra Pratama", role: "karyawan" },
 *   { recentAbsensi: [...], recentPengajuan: [...] }
 * );
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
 * System prompt berisi:
 * - Deskripsi peran chatbot (asisten informatif)
 * - Informasi pengguna (nama, role)
 * - Batasan perilaku chatbot
 * - Fitur sistem yang tersedia di NusaAttend
 * - Context data dari database pengguna (opsional)
 * 
 * @param {object} infoUser - Informasi pengguna {nama, role}
 * @param {object} contextDB - Context dari database
 * @returns {string} - System prompt yang siap dikirim ke model
 */
function buatPromptSistem(infoUser, contextDB = {}) {
  const namaRole = infoUser.role === 'karyawan' ? 'Karyawan' : 
                   infoUser.role === 'penanggung-jawab' ? 'Penanggung Jawab' : 'Administrator';

  let prompt = `Anda adalah Asisten Virtual NusaAttend - sebuah sistem manajemen absensi dan pengajuan cuti untuk perusahaan.

=== IDENTITAS PENGGUNA ===
Nama: ${infoUser.nama}
Peran: ${namaRole}

=== BATASAN & PEDOMAN PERILAKU ===
1. Berikan respons yang ramah, ringkas, dan informatif (maksimal 150 kata per respons)
2. Gunakan Bahasa Indonesia yang baik dan benar
3. Fokus pada informasi teknis sistem NusaAttend (absensi, pengajuan, cuti, dll)
4. Jika pengguna bertanya di luar scope sistem, redirect dengan halus ke topik terkait
5. Berikan solusi praktis dan jelas berdasarkan konteks pengguna
6. JANGAN membuat keputusan bisnis atau memberikan rekomendasi resmi
7. Jika tidak tahu jawaban, sarankan pengguna menghubungi administrator

=== FITUR SISTEM NUSAATTEND YANG TERSEDIA ===
• Absensi: Pencatatan waktu masuk dan pulang harian
• Pengajuan: Permohonan cuti, izin tidak masuk kerja, izin sakit, atau WFH
• Dashboard: Ringkasan data kehadiran dan aktivitas terbaru
• Riwayat: Melihat histori pengajuan dan pencatatan absensi`;

  /* ================= TAMBAHKAN KONTEKS DATA PENGGUNA (OPSIONAL) ================= */
  if (contextDB) {
    if (contextDB.recentAbsensi && contextDB.recentAbsensi.length > 0) {
      prompt += `\n\n=== DATA ABSENSI TERBARU ANDA ===
Terakhir absen: ${contextDB.recentAbsensi[0]?.tanggal || 'Belum ada catatan'}`;
    }
    
    if (contextDB.recentPengajuan && contextDB.recentPengajuan.length > 0) {
      prompt += `\n\n=== DATA PENGAJUAN TERBARU ANDA ===
Pengajuan menunggu persetujuan: ${contextDB.pendingCount || 0}
Pengajuan sudah disetujui: ${contextDB.approvedCount || 0}`;
    }
  }

  return prompt;
}
