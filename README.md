# 📱 NusaAttend - Sistem Manajemen Absensi & Pengajuan Izin

<div align="center">

![Versi](https://img.shields.io/badge/versi-1.3-blue.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-Siap%20Produksi-brightgreen.svg?style=flat-square)
![Penjadwal](https://img.shields.io/badge/penjadwal-Aktif-success.svg?style=flat-square)
![Lisensi](https://img.shields.io/badge/lisensi-MIT-green.svg?style=flat-square)
![Terakhir Diperbarui](https://img.shields.io/badge/terakhir%20diperbarui-Desember%202025-informational.svg?style=flat-square)

**Sistem Manajemen Absensi & Pengajuan Izin Berbasis Web Modern**

[Fitur](#-fitur-utama) • [Teknologi](#-teknologi-yang-digunakan) • [Instalasi](#-instalasi-dan-setup) • [Dokumentasi](#-dokumentasi-lengkap) • [Kontribusi](#-kontribusi--maintenance)

</div>

---

## 🎯 Tentang Proyek

**NusaAttend** adalah sistem manajemen absensi dan pengajuan izin karyawan yang komprehensif berbasis web modern. Dirancang khusus untuk organisasi skala kecil hingga menengah dengan fitur-fitur canggih seperti notifikasi real-time, chatbot AI bertenaga Groq, tanda tangan digital, dan perhitungan cuti otomatis.

Sistem ini memungkinkan karyawan untuk mengajukan izin/cuti dengan mudah melalui wizard 4-langkah, penanggung jawab untuk melakukan review dan approval, serta admin untuk mengelola data sistem secara efisien. Fitur terbaru adalah sistem otomatis yang menandai karyawan sebagai "tidak_hadir" jika tidak melakukan absensi.

---

## ✨ Fitur Utama

### 🔐 **Sistem Autentikasi & Keamanan**
- ✅ Login dengan email & password (Session-based authentication)
- ✅ Hash password dengan Bcrypt untuk keamanan tinggi
- ✅ Kontrol akses berbasis peran (Admin, Penanggung Jawab, Karyawan)
- ✅ Manajemen sesi dengan MongoDB (persistent)
- ✅ ⭐ **Sistem Pemulihan Kata Sandi** (Checkpoint 7)
  - Verifikasi email dengan token 30-menit
  - Perlindungan brute force (maksimal 5 percobaan/jam)
  - Pencegahan serangan email enumeration

### 📊 **Dashboard & Analitik**
- ✅ Dashboard karyawan dengan ringkasan statistik
  - Sisa cuti tahunan
  - Kehadiran bulan ini
  - Pengajuan menunggu persetujuan
  - Status tidak hadir
  - Riwayat pengajuan terbaru
- ✅ Dashboard penanggung jawab dengan permintaan yang tertunda
- ✅ Dashboard admin dengan sistem monitoring lengkap
  - Statistik pengguna
  - Log keberatan/pengaduan
  - Monitoring aktivitas sistem
  - Data real-time dari database

### 📋 **Sistem Absensi (Kehadiran)**
- ✅ Checkin/checkout dengan timestamp otomatis
- ✅ Durasi kerja dihitung otomatis
- ✅ Status harian (hadir, terlambat, libur, izin, sakit, tidak hadir)
- ✅ Riwayat absensi dalam bentuk tabel
- ✅ Integrasi dengan pengajuan surat izin
- ✅ ⭐ Penandaan otomatis tidak hadir (v1.3)

### 📝 **Sistem Surat Izin (Permintaan Cuti)**
- ✅ **Wizard 4-Langkah** untuk pengajuan yang intuitif
  1. **Langkah 1**: Isi formulir (jenis izin, tanggal, alasan)
  2. **Langkah 2**: Pratinjau surat izin resmi
  3. **Langkah 3**: Tanda tangan digital (gambar canvas)
  4. **Langkah 4**: Konfirmasi & selesai
  
- ✅ Jenis izin yang didukung:
  - Cuti Tahunan
  - Izin Tidak Masuk
  - Izin Sakit
  - Kerja Dari Rumah (Work From Home)

- ✅ ⭐ **Perhitungan Durasi dengan Penghitungan Inklusif** (Checkpoint 8)
  - Formula: `Math.ceil(durasi) + 1`
  - Contoh: 24 Des - 24 Des = 1 hari (bukan 0)
  - Validasi real-time di formulir

- ✅ ⭐ **Tampilan Sisa Cuti Real-time**
  - Perhitungan otomatis dari pengajuan yang disetujui
  - Kotak peringatan saat durasi > sisa cuti
  - Nonaktifkan tombol jika melebihi jatah

- ✅ **Validasi Komprehensif**
  - Validasi frontend
  - Pemeriksaan double di backend
  - Perlindungan dari pengajuan ganda

- ✅ **Pembuatan Surat Otomatis**
  - Hasilkan surat izin format resmi
  - Data otomatis dari formulir
  - Siap untuk dicetak

### ✍️ **Tanda Tangan Digital**
- ✅ Canvas untuk menggambar tanda tangan
- ✅ Dukungan input mouse & touch
- ✅ Tombol hapus untuk menghapus tanda tangan
- ✅ Simpan sebagai Base64 di database
- ✅ Tampilkan di modal detail pengajuan

### 👁️ **Modal Detail Pengajuan**
- ✅ **3 Variasi Status**:
  1. **Status Menunggu**: Badge kuning, informasi pengajuan
  2. **Status Disetujui**: Kotak hijau, informasi persetujuan & tanda tangan
  3. **Status Ditolak**: Kotak merah, alasan penolakan

- ✅ ⭐ **Manajemen Status Overlay** (Checkpoint 8)
  - Dukungan buka ulang modal tanpa batas
  - Reset status yang tepat saat ditutup
  - Tidak ada klik hantu atau overlay yang terjebak

- ✅ Desain responsif untuk semua perangkat
- ✅ CSS Grid 2-kolom untuk tampilan informasi

### 🤖 **Chatbot AI Bertenaga Groq** (Checkpoint 5)
- ✅ **Integrasi Groq AI API** - LLM berbasis cloud dengan respons cepat
- ✅ **Pemrosesan Bahasa Alami** - Memahami pertanyaan dalam bahasa Indonesia
- ✅ **Pesan Real-time** via Socket.io - Percakapan instan tanpa jeda
- ✅ **Respons Cerdas** - Menjawab pertanyaan tentang:
  - Kebijakan cuti & izin
  - Prosedur pengajuan
  - Status pengajuan pengguna
  - Informasi sistem
- ✅ **Sadar Konteks** - Menggunakan data pengguna & kebijakan sistem
- ✅ **Dukungan Multi-bahasa** - Bahasa Indonesia dioptimalkan
- ✅ **Widget Chatbot** - Dapat diakses di semua halaman dashboard

### ⏰ **Sistem Penandaan Tidak Hadir Otomatis** ⭐ (v1.3 BARU)
- ✅ **Penjadwal Berbasis Cron** - Eksekusi otomatis harian dengan node-cron v3.0.2
- ✅ **Pelacakan Karyawan** - Tandai otomatis "tidak_hadir" jika tidak absen
- ✅ **Dukungan Zona Waktu WIB** - Sesuai dengan zona waktu Indonesia (UTC+7)
- ✅ **Jadwal yang Dapat Dikonfigurasi** - Default 01:41 WIB, dapat diubah sesuai kebutuhan
- ✅ **Deteksi Cerdas** - Periksa absensi hari sebelumnya, cegah duplikasi
- ✅ **Logging Terperinci** - Format Bahasa Indonesia untuk monitoring
- ✅ **Penanganan Kesalahan Graceful** - Eksekusi yang kuat dengan pelacakan kesalahan
- ✅ **Integrasi Database** - Buat record Absensi otomatis dengan status "tidak_hadir"
- ✅ **Pengujian Manual** - Mode uji untuk memverifikasi sistem tanpa menunggu tengah malam

**Cara Mengonfigurasi:**
1. Edit `src/config/penjadwal-otomatis-absen.js` baris 34
2. Ubah pola cron: `'01 41 * * *'` → waktu yang diinginkan
3. Contoh:
   - `'00 00 * * *'` = 00:00 (tengah malam)
   - `'30 12 * * *'` = 12:30 (siang)
   - `'01 00 * * 1-5'` = 00:01 hari kerja saja
4. Server restart otomatis, periksa log untuk konfirmasi

### 🔔 **Notifikasi Real-time** (Socket.io)
- ✅ Perbarui status pengajuan langsung
- ✅ Notifikasi persetujuan/penolakan
- ✅ Konfirmasi checkin/checkout
- ✅ Komunikasi zero-latency klien-server

### 👥 **Manajemen Pengguna** (Admin)
- ✅ **Manajemen Karyawan**
  - Operasi CRUD lengkap data karyawan
  - Tetapkan penanggung jawab
  - Tetapkan jatah cuti tahunan
  - Status aktif/nonaktif
  - ⭐ Notifikasi email akun baru

- ✅ **Manajemen Penanggung Jawab**
  - CRUD supervisor
  - Edit profil & data kontak
  - Tetapkan karyawan yang dipandu
  - Notifikasi email

### 🗃️ **Log Keberatan (Pengaduan)**
- ✅ Pelacakan pengajuan keberatan
- ✅ CRUD lengkap untuk admin
- ✅ Monitoring status keberatan
- ✅ Catatan perkembangan kasus

---

## 🛠️ Teknologi yang Digunakan

<table>
<tr>
  <td align="center">
    <strong>Backend</strong>
  </td>
  <td align="center">
    <strong>Frontend</strong>
  </td>
  <td align="center">
    <strong>Database</strong>
  </td>
  <td align="center">
    <strong>DevOps</strong>
  </td>
</tr>
<tr>
  <td>
    • Node.js<br/>
    • Express.js v4+<br/>
    • Socket.io<br/>
    • Nodemailer<br/>
    • Bcrypt<br/>
    • node-cron v3.0.2<br/>
    • Groq AI API
  </td>
  <td>
    • Handlebars (HBS)<br/>
    • CSS Vanilla<br/>
    • JavaScript Vanilla<br/>
    • Font Awesome 6.4.0<br/>
    • Fetch API<br/>
    • Canvas API
  </td>
  <td>
    • MongoDB Atlas<br/>
    • connect-mongo<br/>
    • Mongoose<br/>
    • (skema fleksibel)
  </td>
  <td>
    • npm<br/>
    • Nodemon<br/>
    • dotenv<br/>
    • Git & GitHub<br/>
    • VS Code
  </td>
</tr>
</table>

---

## 📁 Struktur Folder Proyek

```
NusaAttend/
│
├── 📂 src/                              # Kode sumber backend
│   ├── app.js                           # Aplikasi Express utama
│   ├── index.js                         # Titik masuk
│   ├── chatbotSocket.js                 # Handler chatbot Socket.io
│   │
│   ├── 📂 config/                       # File konfigurasi
│   │   ├── database.js                  # Koneksi MongoDB
│   │   ├── socket.js                    # Konfigurasi Socket.io
│   │   └── penjadwal-otomatis-absen.js  # ⭐ Konfigurasi penjadwal (v1.3)
│   │
│   ├── 📂 controllers/                  # Logika bisnis (16 FILE)
│   │   ├── authController.js            # Login & register
│   │   ├── absensiController.js         # Checkin/checkout
│   │   ├── chatbotController.js         # Logika chatbot
│   │   ├── dashboardAdminController.js  # Dashboard admin
│   │   ├── dashboardPenanggungJawabController.js
│   │   ├── dashboardPenggunaController.js # Dashboard karyawan
│   │   ├── detailPengajuanController.js
│   │   ├── karyawanController.js        # CRUD karyawan
│   │   ├── kontrolerPemulihan.js        # Pemulihan kata sandi
│   │   ├── penanggungJawabController.js # CRUD supervisor
│   │   ├── pengajuanController.js       # Pembuatan permintaan cuti
│   │   ├── reviewPengajuanController.js # Logika review
│   │   ├── riwayatPengajuanController.js
│   │   ├── setujuiPengajuanController.js # Logika persetujuan
│   │   ├── tandaTanganController.js     # Tanda tangan digital
│   │   └── tolakPengajuanController.js  # Logika penolakan
│   │
│   ├── 📂 middleware/                   # Middleware Express
│   │   ├── auth.js                      # Pemeriksaan autentikasi
│   │   ├── errorHandler.js              # Penanganan kesalahan
│   │   └── socketAuth.js                # Autentikasi Socket.io
│   │
│   ├── 📂 models/                       # Skema MongoDB (4 FILE)
│   │   ├── Pengguna.js                  # Skema pengguna
│   │   ├── Pengajuan.js                 # Skema permintaan cuti
│   │   ├── Absensi.js                   # Skema absensi
│   │   └── User.js                      # Model pengguna alternatif
│   │
│   ├── 📂 routes/                       # Rute API (15 FILE)
│   │   ├── auth.js                      # Endpoint otentikasi
│   │   ├── absensi.js
│   │   ├── adminKaryawan.js
│   │   ├── adminPenanggungJawab.js
│   │   ├── dashboardAdmin.js
│   │   ├── dashboardPenanggungJawab.js
│   │   ├── dashboardPengguna.js
│   │   ├── detailPengajuan.js
│   │   ├── pengajuan.js
│   │   ├── reviewPengajuan.js
│   │   ├── riwayatPengajuan.js
│   │   ├── rutPemulihan.js              # Rute pemulihan
│   │   ├── setujuiPengajuan.js
│   │   ├── tandaTangan.js
│   │   └── tolakPengajuan.js
│   │
│   ├── 📂 services/                     # Layanan bisnis
│   │   ├── emailService.js              # Logika pengiriman email
│   │   ├── socketService.js             # Penanganan event Socket.io
│   │   └── otomatis-absen.js            # ⭐ Layanan penjadwal (v1.3)
│   │
│   └── 📂 utils/                        # Fungsi utilitas
│       ├── chatbot.js                   # Integrasi Groq AI
│       ├── contextDataService.js        # Data konteks AI
│       ├── letterGenerator.js           # Generator surat izin
│       └── formatters.js                # Pemformat data
│
├── 📂 public/                           # File statis (klien-side)
│   ├── 📂 css/
│   │   └── styles.css                   # Stylesheet utama (10000+ baris)
│   ├── 📂 js/
│   │   ├── app.js                       # Aplikasi klien utama
│   │   ├── socket-client.js             # Klien Socket.io
│   │   ├── socket-client-chatbot.js     # Socket chatbot
│   │   ├── manajemen-karyawan.js        # Penanganan modal
│   │   └── test-modal.js                # Utilitas pengujian
│   └── 📂 img/
│       ├── Logo NusaAttend.png
│       └── [gambar lainnya]
│
├── 📂 templates/                        # Template Handlebars
│   ├── main.hbs                         # Layout utama (publik)
│   ├── dashboard-layout.hbs             # Layout dashboard
│   │
│   ├── 📂 partials/
│   │   ├── head.hbs
│   │   ├── footer.hbs
│   │   ├── dashboard-layout.hbs
│   │   └── chatbot.hbs                  # Widget chatbot
│   │
│   └── 📂 views/
│       ├── 📂 publik/
│       │   ├── home.hbs                 # Halaman beranda
│       │   ├── login.hbs                # Halaman login
│       │   ├── lupa-password.hbs        # Lupa kata sandi
│       │   └── 404.hbs                  # Halaman kesalahan
│       │
│       ├── 📂 admin/
│       │   ├── dashboard.hbs            # Dashboard admin
│       │   ├── manajemen-karyawan.hbs
│       │   └── manajemen-penanggung-jawab.hbs
│       │
│       ├── 📂 karyawan/
│       │   ├── dashboard.hbs            # Dashboard karyawan
│       │   ├── absensi.hbs              # Halaman absensi
│       │   ├── surat-izin.hbs           # Formulir permintaan cuti
│       │   └── riwayat-pengajuan.hbs    # Riwayat + modal
│       │
│       ├── 📂 penanggung-jawab/
│       │   ├── dashboard.hbs            # Dashboard supervisor
│       │   └── review-pengajuan.hbs     # Halaman review
│       │
│       └── reset-password-dengan-token.hbs
│
├── 📂 dokumentasi-progress/             # Pelacakan kemajuan
│   ├── karyawan/
│   │   ├── progress-karyawan1.md        # Fitur 1-6
│   │   └── progress-karyawan*.md
│   ├── penanggung-jawab/
│   │   └── progress-penanggung-jawab*.md
│   └── admin/
│       └── progress-admin.md
│
├── 📂 node_modules/                     # Dependensi (otomatis)
│
├── 📄 package.json                      # Dependensi & skrip
├── 📄 package-lock.json                 # Versi kunci
├── 📄 .env.example                      # Template variabel lingkungan
├── 📄 .gitignore                        # Aturan git ignore
└── 📄 README.md                         # File ini
```

---

## 📊 Statistik Proyek

| Kategori | Jumlah |
|----------|--------|
| Controllers Aktif | 16 |
| File Rute Aktif | 15 |
| Model Database | 4 |
| Template Frontend | 20+ |
| Endpoint API | 30+ |
| Baris CSS | 15,000+ |
| Baris JavaScript | 3,000+ |
| Total Baris Kode | 20,000+ |
| Commit Git | 20+ |
| File Dokumentasi | 15+ |
| Dependensi | 15+ |
| File Penjadwal (v1.3) | 2 (service + config) |
| Cron Penandaan Tidak Hadir | 01:41 WIB (dapat dikonfigurasi) |

---

## 🚀 Instalasi dan Setup

### 1️⃣ Prasyarat
Pastikan sudah terinstall:
- **Node.js** v14+ ([Unduh](https://nodejs.org/))
- **npm** v6+ (biasanya disertakan dengan Node.js)
- **MongoDB** v4.4+ ([Unduh](https://www.mongodb.com/try/download/community) atau gunakan [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Unduh](https://git-scm.com/))
- **VS Code** atau editor pilihan Anda

### 2️⃣ Klon Repository
```bash
# Klon dari GitHub
git clone https://github.com/username/NusaAttend.git

# Masuk ke folder proyek
cd NusaAttend
```

### 3️⃣ Instal Dependensi
```bash
npm install
```

### 4️⃣ Setup Variabel Lingkungan
```bash
# Salin template .env
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# Gunakan editor favorit (VS Code, Notepad++, dll)
```

**Contoh `.env` yang sudah dikonfigurasi:**
```env
# Konfigurasi Database MongoDB
MONGODB_URI=mongodb+srv://nama_pengguna_anda:sandi_anda@cluster_anda.mongodb.net/NusaAttend

# Konfigurasi Nodemailer untuk email OTP
EMAIL=email_anda@gmail.com
PASSWORD=sandi_aplikasi_email_anda

# JWT Secret untuk Pembangkitan Token
JWT_SECRET=kunci_rahasia_jwt_nusaattend_2025

# Konfigurasi Chatbot Groq AI
GROQ_API_KEY=gsk_kunci_api_groq_anda
GROQ_MODEL=llama-3.3-70b-versatile
```

### 5️⃣ Jalankan Aplikasi

**Mode Pengembangan (dengan reload otomatis):**
```bash
npm run dev
```

**Mode Produksi:**
```bash
npm start
```

**Output yang diharapkan:**
```
✓ Server berjalan di http://localhost:3000
✓ MongoDB terhubung ke nusaattend
✓ Socket.io diinisialisasi
```

### 6️⃣ Akses Aplikasi
Buka browser dan kunjungi: `http://localhost:3000`

---

## 👤 Akun Default untuk Pengujian

| Peran | Email | Kata Sandi | Fungsi |
|-------|-------|-----------|--------|
| Admin | admin@nusaattend.com | admin123 | Kelola sistem & pengguna |
| Supervisor | supervisor@nusaattend.com | super123 | Review pengajuan |
| Karyawan | karyawan@nusaattend.com | kary123 | Kirim pengajuan & absensi |

**Catatan**: Akun ini hanya untuk pengujian. Di produksi, admin harus membuat akun baru melalui panel manajemen.

---

## 🌐 Endpoint API

### 🔐 Otentikasi
```
POST   /api/auth/login                    # Login
POST   /api/auth/register                 # Daftar
POST   /api/auth/logout                   # Logout
GET    /lupa-password                     # Halaman lupa kata sandi
POST   /api/pemulihan/minta-reset-link    # Minta tautan reset
POST   /api/pemulihan/reset-password-dengan-token  # Reset kata sandi
```

### 📊 Dashboard
```
GET    /admin/dashboard                   # Dashboard admin
GET    /penanggung-jawab/dashboard        # Dashboard supervisor
GET    /karyawan/dashboard                # Dashboard karyawan
GET    /api/admin/dashboard               # Statistik admin (JSON)
```

### 📋 Absensi
```
POST   /api/karyawan/absensi/checkin      # Checkin
POST   /api/karyawan/absensi/checkout     # Checkout
GET    /karyawan/absensi                  # Halaman absensi
GET    /api/karyawan/absensi              # Riwayat absensi (JSON)
```

### 📝 Pengajuan Surat Izin
```
GET    /pengajuan/buat                    # Halaman formulir pembuatan
POST   /api/karyawan/surat-izin           # Kirim permintaan cuti
GET    /karyawan/riwayat-pengajuan        # Halaman riwayat
GET    /api/karyawan/riwayat-pengajuan    # Data riwayat (JSON)
```

### 👁️ Review Pengajuan (Supervisor)
```
GET    /penanggung-jawab/review-pengajuan # Halaman review
GET    /api/pengguna/review-pengajuan     # Daftar permintaan (JSON)
POST   /api/penanggung-jawab/pengajuan-setujui/:id   # Setujui
POST   /api/penanggung-jawab/pengajuan-tolak/:id     # Tolak
```

### 👥 Manajemen Karyawan (Admin)
```
GET    /admin/karyawan                    # Halaman manajemen
GET    /api/admin/karyawan                # Daftar karyawan (JSON)
POST   /api/admin/karyawan                # Buat karyawan
PUT    /api/admin/karyawan/:id            # Perbarui karyawan
DELETE /api/admin/karyawan/:id            # Hapus karyawan
```

### 👨‍💼 Manajemen Penanggung Jawab (Admin)
```
GET    /admin/penanggung-jawab            # Halaman manajemen
GET    /api/admin/penanggung-jawab        # Daftar supervisor (JSON)
POST   /api/admin/penanggung-jawab        # Buat supervisor
PUT    /api/admin/penanggung-jawab/:id    # Perbarui supervisor
DELETE /api/admin/penanggung-jawab/:id    # Hapus supervisor
```

### 💬 Chatbot
```
Event Socket:
  - connect                               # Pengguna terhubung
  - chat-message                          # Kirim pesan
  - bot-response                          # Terima respons
  - disconnect                            # Pengguna terputus
```

---

## 🔄 Alur Sistem

### Alur Pengajuan Surat Izin
```
1. Karyawan Login
   ↓
2. Klik "Buat Surat Izin"
   ↓
3. Isi Formulir (Langkah 1)
   - Pilih jenis izin
   - Pilih tanggal mulai & selesai
   - Input alasan
   - ✓ Durasi terhitung otomatis
   - ✓ Peringatan jika > sisa cuti
   ↓
4. Tinjau Surat (Langkah 2)
   - Lihat pratinjau surat resmi
   - Konfirmasi data
   ↓
5. Tanda Tangan Digital (Langkah 3)
   - Gambar tanda tangan
   - Hapus jika perlu
   ↓
6. Konfirmasi Selesai (Langkah 4)
   - Ringkasan pengajuan
   - Status: Menunggu Persetujuan
   ↓
7. Penanggung Jawab Menerima Notifikasi (Socket.io)
   ↓
8. Supervisor Review & Setujui/Tolak
   - Lihat detail pengajuan
   - Tanda tangan persetujuan
   - Input alasan (jika tolak)
   ↓
9. Karyawan Menerima Update Status
   - Real-time via Socket.io
   - Status: Disetujui / Ditolak
   - Notifikasi email (jika diaktifkan)
   ↓
10. Selesai
```

### Alur Absensi
```
1. Karyawan Login
   ↓
2. Klik "Checkin Masuk"
   - Sistem catat waktu masuk
   - Absensi tercatat di database
   ↓
3. Karyawan Bekerja...
   ↓
4. Klik "Checkout Pulang"
   - Sistem catat waktu pulang
   - Durasi kerja otomatis terhitung
   ↓
5. Update Status:
   - Jika ada izin yang disetujui → Status: Izin
   - Jika normal checkin-checkout → Status: Hadir
   - Jika terlambat → Status: Terlambat
   - Jika tidak absen & tidak izin → Status: Tidak Hadir
   ↓
6. Riwayat Absensi Update
```

---

## 🧪 Pengujian

### Daftar Periksa Pengujian Manual
- [x] Alur Login/Register
- [x] Rendering dashboard
- [x] Formulir pengajuan (4-langkah)
- [x] Tanda tangan digital
- [x] Absensi checkin/checkout
- [x] Modal detail pengajuan
- [x] Manajemen admin
- [x] Integrasi chatbot
- [x] Notifikasi real-time
- [x] Pemulihan kata sandi

### Kompatibilitas Browser
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Browser mobile (Chrome, Safari iOS)

---

## 🔧 Pemecahan Masalah

### ❌ "Tidak dapat menemukan modul 'express'"
```bash
# Solusi: Instal dependensi
npm install
```

### ❌ "Koneksi MongoDB gagal"
- Pastikan layanan MongoDB berjalan
- Periksa `MONGODB_URI` di `.env`
- Untuk MongoDB Atlas, periksa akses jaringan & whitelist IP

### ❌ "Port 3000 sudah digunakan"
```bash
# Matikan proses di port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### ❌ "Koneksi Socket.io gagal"
- Periksa `SOCKET_TRANSPORTS` di konfigurasi
- Browser console untuk pesan kesalahan
- Periksa tab jaringan di DevTools

### ❌ "Email tidak terkirim"
- Buat Sandi Aplikasi Gmail (jika menggunakan Gmail)
- Periksa kredensial SMTP di `.env`
- Verifikasi firewall/antivirus tidak memblokir port 587

### ❌ "Durasi menunjukkan 0 hari"
- Perbarui ke Checkpoint 8+ (sudah diperbaiki)
- Hapus cache browser
- Periksa formula termasuk `+1` untuk penghitungan inklusif

---

## 📞 Kontak & Dukungan

**Kontributor Proyek:**
- 👨‍💻 **Fattan Naufan Islami** - Backend & Database
- 👨‍💻 **Carli Tamba** - Frontend & UI/UX

**Untuk pertanyaan atau masalah:**
- 📧 Email: support@nusaattend.com (placeholder)
- 🐛 Laporkan bug di [GitHub Issues](https://github.com/username/NusaAttend/issues)
- 💬 Diskusi di [GitHub Discussions](https://github.com/username/NusaAttend/discussions)

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lebih detail, lihat:
- 📋 **[Progress Final 2](./dokumentasi-progress/progress-final-2.md)** - Dokumentasi lengkap v1.3
- 📋 **[Progress Karyawan](./dokumentasi-progress/karyawan/)** - Pelacakan pengembangan fitur
- 📋 **[Progress Penanggung Jawab](./dokumentasi-progress/penanggung-jawab/)** - Fitur supervisor
- 📋 **[Progress Admin](./dokumentasi-progress/admin/)** - Fitur admin

---

## 🎓 Informasi Akademis

**Detail Proyek:**
| Item | Detail |
|------|--------|
| **Mata Kuliah** | Pemrograman Jaringan (Praktikum) |
| **Semester** | 5 (Lima) |
| **Tahun Akademik** | 2025 |
| **Institusi** | Universitas Negeri Padang (UNP) |
| **Tipe** | Aplikasi Web Full-Stack |
| **Status** | ✅ Siap Produksi |

**Catatan:**
- Sistem ini adalah simulasi untuk keperluan akademis
- Tanda tangan bersifat visual (bukan tanda tangan hukum)
- Email dapat dikonfigurasi dengan berbagai penyedia
- ⭐ **Chatbot menggunakan Groq AI API** (bukan berbasis aturan) untuk respons cerdas
- Persetujuan tingkat tunggal (tidak ada alur multi-tingkat)

---

## 📜 Lisensi

MIT License - Lihat file [LICENSE](./LICENSE) untuk detail lengkap

---

## 🎉 Riwayat Perubahan

### Versi 1.3 (26 Desember 2025) - Produksi + Penjadwal
- ✨ **Sistem Penandaan Tidak Hadir Otomatis**: Penjadwal berbasis cron untuk menandai "tidak_hadir"
- ✨ **Integrasi node-cron**: Eksekusi harian dengan zona waktu WIB
- ✨ **Jadwal yang Dapat Dikonfigurasi**: Default 01:41 WIB, sepenuhnya dapat disesuaikan
- ✨ **Deteksi Cerdas**: Cegah catatan duplikat, logging terperinci
- ✅ **Pengujian Manual**: Mode uji untuk memverifikasi sebelum produksi
- ✅ **Diuji & Diverifikasi**: Berhasil menandai 9/10 karyawan sebagai tidak_hadir

### Versi 1.2 (24 Desember 2025) - Checkpoint 8
- ✨ **Perbaikan Perhitungan Durasi**: Formula penghitungan inklusif `Math.ceil(...) + 1`
- ✨ **Tampilan Durasi Real-time**: Tampilan & peringatan di halaman formulir
- ✨ **Manajemen Status Overlay Modal**: Dukungan buka ulang tanpa batas
- 🐛 Perbaiki: Kesalahan sintaks absensi (kurung kurawal ekstra `});`)

### Versi 1.1 (21 Desember 2025) - Checkpoint 7
- ✨ Sistem pemulihan kata sandi dengan verifikasi email
- ✨ Alur reset kata sandi berbasis token
- ✨ Perlindungan brute force (maksimal 5 percobaan/jam)

### Versi 1.0 (1 Desember 2025) - Siap Produksi
- ✨ Bagian admin lengkap
- ✨ Dashboard & analitik
- ✨ Kontrol akses berbasis peran
- ✨ Integrasi chatbot AI (Groq)

---

<div align="center">

**Dibuat oleh Fattan Naufan Islami & Carli Tamba**

NusaAttend © 2025 - Semua hak dilindungi

[⬆ Kembali ke atas](#-nusaattend---sistem-manajemen-absensi--pengajuan-izin)

</div>
