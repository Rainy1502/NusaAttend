# 📱 NusaAttend - Sistem Manajemen Absensi & Pengajuan Izin

<div align="center">

![Version](https://img.shields.io/badge/version-1.2-blue.svg?style=flat-square)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen.svg?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green.svg?style=flat-square)
![Last Updated](https://img.shields.io/badge/last%20updated-December%202025-informational.svg?style=flat-square)

**Sistem Manajemen Absensi & Pengajuan Izin Berbasis Web Modern**

[Fitur](#-fitur-utama) • [Tech Stack](#-teknologi-yang-digunakan) • [Instalasi](#-instalasi) • [Dokumentasi](#-dokumentasi) • [Progress](#-status-pengembangan)

</div>

---

## 🎯 Tentang Proyek

**NusaAttend** adalah sistem manajemen absensi dan pengajuan izin karyawan yang komprehensif berbasis web modern. Dirancang khusus untuk organisasi skala kecil hingga menengah dengan fitur-fitur canggih seperti notifikasi real-time, chatbot AI, digital signature, dan perhitungan cuti otomatis.

Sistem ini memungkinkan karyawan untuk mengajukan izin/cuti dengan mudah, penanggung jawab untuk melakukan review dan approval, serta admin untuk mengelola data sistem secara efisien.

---

## ✨ Fitur Utama

### 🔐 **Sistem Autentikasi & Keamanan**
- ✅ Login dengan email & password (Session-based authentication)
- ✅ Password hashing dengan Bcrypt untuk keamanan tinggi
- ✅ Role-based access control (Admin, Penanggung Jawab, Karyawan)
- ✅ Session management dengan MongoDB (persistent)
- ✅ ⭐ **Sistem Recovery Password** (Checkpoint 7)
  - Email verification dengan token 30-menit
  - Proteksi brute force (max 5 attempt/jam)
  - Pencegahan email enumeration attack

### 📊 **Dashboard & Analytics**
- ✅ Dashboard karyawan dengan ringkasan statistik
  - Sisa cuti tahunan
  - Kehadiran bulan ini
  - Pengajuan menunggu persetujuan
  - Status tidak hadir
  - Riwayat pengajuan terbaru
- ✅ Dashboard penanggung jawab dengan pending requests
- ✅ Dashboard admin dengan sistem monitoring lengkap
  - Statistik pengguna
  - Log keberatan/grievance
  - Monitoring aktivitas sistem
  - Real-time data dari database

### 📋 **Sistem Absensi (Kehadiran)**
- ✅ Checkin/checkout dengan timestamp otomatis
- ✅ Durasi kerja otomatis terhitung
- ✅ Status harian (hadir, terlambat, libur, izin, sakit, alpha)
- ✅ Riwayat absensi dalam bentuk tabel
- ✅ Integrasi dengan pengajuan surat izin

### 📝 **Sistem Surat Izin (Leave Request)**
- ✅ **4-Step Wizard** untuk pengajuan yang intuitif
  1. **Step 1**: Isi form (jenis izin, tanggal, alasan)
  2. **Step 2**: Preview surat izin resmi
  3. **Step 3**: Tanda tangan digital (canvas draw)
  4. **Step 4**: Konfirmasi & selesai
  
- ✅ Jenis izin yang didukung:
  - Cuti Tahunan
  - Izin Tidak Masuk
  - Izin Sakit
  - Work From Home (WFH)

- ✅ ⭐ **Durasi Calculation dengan Inclusive Counting** (Checkpoint 8)
  - Formula: `Math.ceil(durasi) + 1`
  - Contoh: 24 Des - 24 Des = 1 hari (bukan 0)
  - Validasi real-time di form

- ✅ ⭐ **Real-time Sisa Cuti Display**
  - Kalkulasi otomatis dari pengajuan yang disetujui
  - Warning box saat durasi > sisa cuti
  - Disable tombol jika melebihi jatah

- ✅ **Validasi Komprehensif**
  - Frontend validation
  - Backend double-check
  - Proteksi dari pengajuan ganda

- ✅ **Pembuatan Surat Otomatis**
  - Generate surat izin format resmi
  - Data otomatis dari form
  - Ready untuk print

### ✍️ **Tanda Tangan Digital**
- ✅ Canvas untuk menggambar tanda tangan
- ✅ Support input mouse & touch
- ✅ Tombol clear untuk hapus tanda tangan
- ✅ Simpan sebagai Base64 di database
- ✅ Display di modal detail pengajuan

### 👁️ **Modal Detail Pengajuan**
- ✅ **3 Status Variations**:
  1. **Status Menunggu**: Badge kuning, info pengajuan
  2. **Status Disetujui**: Box hijau, info persetujuan & signature
  3. **Status Ditolak**: Box merah, alasan penolakan

- ✅ ⭐ **Overlay State Management** (Checkpoint 8)
  - Support reopen modal unlimited times
  - Proper state reset saat close
  - No ghost clicks atau stuck overlay

- ✅ Responsive design untuk semua device
- ✅ CSS Grid 2-kolom untuk tampilan info

### 🤖 **Chatbot AI Powered by Groq** (Checkpoint 5)
- ✅ **Groq AI API Integration** - LLM berbasis cloud dengan response cepat
- ✅ **Natural Language Processing** - Memahami pertanyaan dalam bahasa Indonesia
- ✅ **Real-time Messaging** via Socket.io - Percakapan instant tanpa delay
- ✅ **Intelligent Responses** - Menjawab pertanyaan tentang:
  - Kebijakan cuti & izin
  - Prosedur pengajuan
  - Status pengajuan pengguna
  - Informasi sistem
- ✅ **Context-Aware** - Menggunakan data pengguna & kebijakan sistem
- ✅ **Multi-language Support** - Indonesian language optimized
- ✅ **Widget Chatbot** - Accessible di semua halaman dashboard

### 🔔 **Notifikasi Real-time** (Socket.io)
- ✅ Update status pengajuan langsung
- ✅ Notifikasi persetujuan/penolakan
- ✅ Konfirmasi checkin/checkout
- ✅ Zero-latency komunikasi client-server

### 👥 **Manajemen Pengguna** (Admin)
- ✅ **Manajemen Karyawan**
  - CRUD lengkap data karyawan
  - Assign penanggung jawab
  - Set jatah cuti tahunan
  - Active/inactive status
  - ⭐ Email notifikasi akun baru (Checkpoint 8 prep)

- ✅ **Manajemen Penanggung Jawab**
  - CRUD supervisor
  - Edit profil & data kontak
  - Assign karyawan yang dipandu
  - Email notifikasi (ready)

### 🗃️ **Log Keberatan (Grievance)**
- ✅ Tracking pengajuan keberatan
- ✅ CRUD lengkap untuk admin
- ✅ Status monitoring keberatan
- ✅ Catatan perkembangan case

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
    • Groq AI API
  </td>
  <td>
    • Handlebars (HBS)<br/>
    • Vanilla CSS<br/>
    • Vanilla JavaScript<br/>
    • Font Awesome 6.4.0<br/>
    • Fetch API<br/>
    • Canvas API
  </td>
  <td>
    • MongoDB Atlas<br/>
    • connect-mongo<br/>
    • Mongoose<br/>
    • (flexible schema)
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

## 📁 Struktur Folder Project

```
NusaAttend/
│
├── 📂 src/                              # Backend source code
│   ├── app.js                           # Main Express application
│   ├── index.js                         # Entry point
│   ├── chatbotSocket.js                 # Socket.io chatbot handler
│   │
│   ├── 📂 config/                       # Configuration files
│   │   ├── database.js                  # MongoDB connection
│   │   └── socket.js                    # Socket.io config
│   │
│   ├── 📂 controllers/                  # Business logic (16 FILES)
│   │   ├── authController.js            # Login & register
│   │   ├── absensiController.js         # Checkin/checkout
│   │   ├── chatbotController.js         # Chatbot logic
│   │   ├── dashboardAdminController.js  # Admin dashboard
│   │   ├── dashboardPenanggungJawabController.js
│   │   ├── dashboardPenggunaController.js # Employee dashboard
│   │   ├── detailPengajuanController.js
│   │   ├── karyawanController.js        # Employee CRUD
│   │   ├── kontrolerPemulihan.js        # Password recovery
│   │   ├── penanggungJawabController.js # Supervisor CRUD
│   │   ├── pengajuanController.js       # Leave request creation
│   │   ├── reviewPengajuanController.js # Review logic
│   │   ├── riwayatPengajuanController.js
│   │   ├── setujuiPengajuanController.js # Approval logic
│   │   ├── tandaTanganController.js     # Digital signature
│   │   └── tolakPengajuanController.js  # Rejection logic
│   │
│   ├── 📂 middleware/                   # Express middleware
│   │   ├── auth.js                      # Authentication check
│   │   ├── errorHandler.js              # Error handling
│   │   └── socketAuth.js                # Socket.io auth
│   │
│   ├── 📂 models/                       # MongoDB schemas (4 FILES)
│   │   ├── Pengguna.js                  # User schema
│   │   ├── Pengajuan.js                 # Leave request schema
│   │   ├── Absensi.js                   # Attendance schema
│   │   └── User.js                      # Alternative user model
│   │
│   ├── 📂 routes/                       # API routes (15 FILES)
│   │   ├── auth.js                      # Auth endpoints
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
│   │   ├── rutPemulihan.js              # Recovery routes
│   │   ├── setujuiPengajuan.js
│   │   ├── tandaTangan.js
│   │   └── tolakPengajuan.js
│   │
│   ├── 📂 services/                     # Business services
│   │   └── (Helper functions)
│   │
│   └── 📂 utils/                        # Utility functions
│       ├── chatbot.js                   # Groq AI integration
│       ├── contextDataService.js        # AI context data
│       ├── letterGenerator.js           # Surat izin generator
│       └── formatters.js                # Data formatters
│
├── 📂 public/                           # Static files (client-side)
│   ├── 📂 css/
│   │   └── styles.css                   # Master stylesheet (10000+ lines)
│   ├── 📂 js/
│   │   ├── app.js                       # Main client app
│   │   ├── socket-client.js             # Socket.io client
│   │   ├── socket-client-chatbot.js     # Chatbot socket
│   │   ├── manajemen-karyawan.js        # Modal handling
│   │   └── test-modal.js                # Testing utilities
│   └── 📂 img/
│       ├── Logo NusaAttend.png
│       └── [images lainnya]
│
├── 📂 templates/                        # Handlebars templates
│   ├── main.hbs                         # Main layout (publik)
│   ├── dashboard-layout.hbs             # Dashboard layout
│   │
│   ├── 📂 partials/
│   │   ├── head.hbs
│   │   ├── footer.hbs
│   │   ├── dashboard-layout.hbs
│   │   └── chatbot.hbs                  # Chatbot widget
│   │
│   └── 📂 views/
│       ├── 📂 publik/
│       │   ├── home.hbs                 # Landing page
│       │   ├── login.hbs                # Login page
│       │   ├── lupa-password.hbs        # Forgot password
│       │   └── 404.hbs                  # Error page
│       │
│       ├── 📂 admin/
│       │   ├── dashboard.hbs            # Admin dashboard
│       │   ├── manajemen-karyawan.hbs
│       │   └── manajemen-penanggung-jawab.hbs
│       │
│       ├── 📂 karyawan/
│       │   ├── dashboard.hbs            # Employee dashboard
│       │   ├── absensi.hbs              # Attendance page
│       │   ├── surat-izin.hbs           # Leave request form
│       │   └── riwayat-pengajuan.hbs    # History + modal
│       │
│       ├── 📂 penanggung-jawab/
│       │   ├── dashboard.hbs            # Supervisor dashboard
│       │   └── review-pengajuan.hbs     # Review page
│       │
│       └── reset-password-dengan-token.hbs
│
│
├── 📂 dokumentasi-progress/             # Progress tracking
│   ├── karyawan/
│   │   ├── progress-karyawan1.md        # Feature 1-6
│   │   └── progress-karyawan*.md
│   ├── penanggung-jawab/
│   │   └── progress-penanggung-jawab*.md
│   └── admin/
│       └── progress-admin.md
│
├── 📂 backup/                           # Archived files (tidak aktif)
│   └── (Referensi untuk development)
│
├── 📂 node_modules/                     # Dependencies (auto)
│
├── 📄 package.json                      # Dependencies & scripts
├── 📄 package-lock.json                 # Lock versions
├── 📄 .env.example                      # Environment template
├── 📄 .gitignore                        # Git ignore rules
└── 📄 README.md                         # File ini
```

---

## 🎯 File yang AKTIF di Project

✅ **Sudah dimodifikasi & digunakan untuk login, dashboard, dan admin features:**

**Controllers (16 Active):**
- `authController.js`, `absensiController.js`, `chatbotController.js`
- `dashboardAdminController.js`, `dashboardPenanggungJawabController.js`, `dashboardPenggunaController.js`
- `detailPengajuanController.js`, `karyawanController.js`, `kontrolerPemulihan.js`
- `penanggungJawabController.js`, `pengajuanController.js`, `reviewPengajuanController.js`
- `riwayatPengajuanController.js`, `setujuiPengajuanController.js`, `tandaTanganController.js`, `tolakPengajuanController.js`

**Routes (15 Active):**
- `auth.js`, `absensi.js`, `adminKaryawan.js`, `adminPenanggungJawab.js`
- `dashboardAdmin.js`, `dashboardPenanggungJawab.js`, `dashboardPengguna.js`
- `detailPengajuan.js`, `pengajuan.js`, `reviewPengajuan.js`, `riwayatPengajuan.js`
- `rutPemulihan.js`, `setujuiPengajuan.js`, `tandaTangan.js`, `tolakPengajuan.js`

**Models (4 Active):**
- `Pengguna.js`, `Pengajuan.js`, `Absensi.js`, `User.js`

**Views (All Active):**
- Admin: dashboard, manajemen-karyawan, manajemen-penanggung-jawab
- Karyawan: dashboard, absensi, surat-izin, riwayat-pengajuan
- Penanggung Jawab: dashboard, review-pengajuan
- Publik: home, login, lupa-password, 404

---

## 🚀 Instalasi & Setup

### 1️⃣ Prerequisites
Pastikan sudah terinstall:
- **Node.js** v14+ ([Download](https://nodejs.org/))
- **npm** v6+ (biasanya include dengan Node.js)
- **MongoDB** v4.4+ ([Download](https://www.mongodb.com/try/download/community) atau pakai [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **Git** ([Download](https://git-scm.com/))
- **VS Code** atau editor pilihan Anda

### 2️⃣ Clone Repository
```bash
# Clone dari GitHub
git clone https://github.com/username/NusaAttend.git

# Masuk ke folder project
cd NusaAttend
```

### 3️⃣ Install Dependencies
```bash
npm install
```

### 4️⃣ Setup Environment Variables
```bash
# Copy template .env
cp .env.example .env

# Edit .env dengan konfigurasi Anda
# Gunakan editor favorit (VS Code, Notepad++, dll)
```

**Contoh `.env` yang sudah dikonfigurasi:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/nusaattend
# Atau gunakan MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster0.mongodb.net/nusaattend

# Session
SESSION_SECRET=your_super_secret_session_key_12345

# Email (untuk password recovery)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=NusaAttend <noreply@nusaattend.com>

# AI Chatbot (Groq API)
GROQ_API_KEY=gsk_your_groq_api_key_here
```

### 5️⃣ Jalankan Aplikasi

**Development Mode (dengan auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

**Output yang diharapkan:**
```
✓ Server running on http://localhost:3000
✓ MongoDB connected to nusaattend
✓ Socket.io initialized
```

### 6️⃣ Akses Aplikasi
Buka browser dan kunjungi: `http://localhost:3000`

---

## 👤 Akun Default untuk Testing

| Role | Email | Password | Fungsi |
|------|-------|----------|--------|
| Admin | admin@nusaattend.com | admin123 | Manage sistem & pengguna |
| Supervisor | supervisor@nusaattend.com | super123 | Review pengajuan |
| Karyawan | karyawan@nusaattend.com | kary123 | Submit pengajuan & absensi |

**Catatan**: Akun ini adalah untuk testing. Di production, admin harus membuat akun baru melalui management panel.

---

## 🌐 API Endpoints

### 🔐 Authentication
```
POST   /api/auth/login                    # Login
POST   /api/auth/register                 # Register
POST   /api/auth/logout                   # Logout
GET    /lupa-password                     # Forgot password page
POST   /api/pemulihan/minta-reset-link    # Request reset link
POST   /api/pemulihan/reset-password-dengan-token  # Reset password
```

### 📊 Dashboard
```
GET    /admin/dashboard                   # Admin dashboard
GET    /penanggung-jawab/dashboard        # Supervisor dashboard
GET    /karyawan/dashboard                # Employee dashboard
GET    /api/admin/dashboard               # Admin stats (JSON)
```

### 📋 Absensi
```
POST   /api/karyawan/absensi/checkin      # Checkin
POST   /api/karyawan/absensi/checkout     # Checkout
GET    /karyawan/absensi                  # Attendance page
GET    /api/karyawan/absensi              # Attendance history (JSON)
```

### 📝 Pengajuan Surat Izin
```
GET    /pengajuan/buat                    # Create form page
POST   /api/karyawan/surat-izin           # Submit leave request
GET    /karyawan/riwayat-pengajuan        # History page
GET    /api/karyawan/riwayat-pengajuan    # History data (JSON)
```

### 👁️ Review Pengajuan (Supervisor)
```
GET    /penanggung-jawab/review-pengajuan # Review page
GET    /api/pengguna/review-pengajuan     # List requests (JSON)
POST   /api/penanggung-jawab/pengajuan-setujui/:id   # Approve
POST   /api/penanggung-jawab/pengajuan-tolak/:id     # Reject
```

### 👥 Manajemen Karyawan (Admin)
```
GET    /admin/karyawan                    # Management page
GET    /api/admin/karyawan                # List employees (JSON)
POST   /api/admin/karyawan                # Create employee
PUT    /api/admin/karyawan/:id            # Update employee
DELETE /api/admin/karyawan/:id            # Delete employee
```

### 👨‍💼 Manajemen Penanggung Jawab (Admin)
```
GET    /admin/penanggung-jawab            # Management page
GET    /api/admin/penanggung-jawab        # List supervisors (JSON)
POST   /api/admin/penanggung-jawab        # Create supervisor
PUT    /api/admin/penanggung-jawab/:id    # Update supervisor
DELETE /api/admin/penanggung-jawab/:id    # Delete supervisor
```

### 💬 Chatbot
```
Socket Events:
  - connect                               # User connects
  - chat-message                          # Send message
  - bot-response                          # Receive response
  - disconnect                            # User disconnects
```

---

## 🔄 Alur Sistem

### Alur Pengajuan Surat Izin
```
1. Karyawan Login
   ↓
2. Klik "Buat Surat Izin"
   ↓
3. Isi Form (Step 1)
   - Pilih jenis izin
   - Pilih tanggal mulai & selesai
   - Input alasan
   - ✓ Durasi otomatis terhitung
   - ✓ Warning jika > sisa cuti
   ↓
4. Review Surat (Step 2)
   - Lihat preview surat resmi
   - Konfirmasi data
   ↓
5. Tanda Tangan Digital (Step 3)
   - Gambar tanda tangan
   - Clear jika perlu
   ↓
6. Konfirmasi Selesai (Step 4)
   - Ringkasan pengajuan
   - Status: Menunggu Persetujuan
   ↓
7. Penanggung Jawab Menerima Notifikasi (Socket.io)
   ↓
8. Supervisor Review & Approve/Reject
   - Lihat detail pengajuan
   - Tanda tangan approval
   - Input alasan (jika reject)
   ↓
9. Karyawan Menerima Update Status
   - Real-time via Socket.io
   - Status: Disetujui / Ditolak
   - Email notifikasi (jika enabled)
   ↓
10. Selesai
```

### Alur Absensi
```
1. Karyawan Login
   ↓
2. Klik "Checkin Masuk"
   - Sistem catat waktu masuk
   - Absen tercatat di database
   ↓
3. Karyawan Bekerja...
   ↓
4. Klik "Checkout Pulang"
   - Sistem catat waktu pulang
   - Durasi kerja otomatis terhitung
   ↓
5. Status Update:
   - Jika ada izin yang disetujui → Status: Izin
   - Jika normal checkin-checkout → Status: Hadir
   - Jika terlambat → Status: Terlambat
   - Jika tidak absen & tidak izin → Status: Tidak Hadir
   ↓
6. Riwayat Absensi Update
```

---

## 📊 Database Schema

### 👤 Users Collection
```javascript
{
  _id: ObjectId,
  nama_lengkap: String,
  email: String (unique),
  password: String (hashed - bcrypt),
  nomor_identitas: String,
  role: "admin" | "penanggung-jawab" | "karyawan",
  departemen: String,
  jabatan: String,
  supervisor_id: ObjectId,
  tanggal_bergabung: Date,
  jatah_cuti: Number (default: 12),
  sisa_cuti: Number,
  status: "aktif" | "cuti" | "nonaktif",
  
  // Password recovery fields
  reset_token: String,
  reset_token_expiry: Date,
  recovery_attempts: Number,
  last_recovery_attempt: Date,
  
  created_at: Date,
  updated_at: Date
}
```

### 📝 Pengajuan Collection
```javascript
{
  _id: ObjectId,
  karyawan_id: ObjectId,
  jenis_izin: "cuti-tahunan" | "izin-tidak-masuk" | "izin-sakit" | "wfh",
  tanggal_mulai: Date,
  tanggal_selesai: Date,
  durasi: Number,
  alasan: String,
  status: "menunggu" | "disetujui" | "ditolak",
  penanggung_jawab_id: ObjectId,
  tanggal_direview: Date,
  keterangan_review: String,
  tanda_tangan: String (Base64),
  dibuat_pada: Date,
  diperbarui_pada: Date
}
```

### ✅ Absensi Collection
```javascript
{
  _id: ObjectId,
  karyawan_id: ObjectId,
  tanggal: Date,
  jam_checkin: Date,
  jam_checkout: Date,
  durasi_kerja: Number,
  status: "hadir" | "terlambat" | "izin" | "cuti" | "sakit" | "tidak_hadir" | "alpha",
  keterangan: String,
  ip_address: String,
  created_at: Date,
  updated_at: Date
}
```

---

## 🎨 Desain & UI/UX

### Palet Warna
```css
Primary Color    : #4f39f6 (Ungu Muda - Brand)
Secondary Color  : #9810fa (Ungu Tua - Accent)
Success Color    : #4cd964 (Hijau - Success)
Warning Color    : #ff9500 (Oranye - Warning)
Danger Color     : #ef4444 (Merah - Error)
Background       : #f9fafb (Abu-abu Muda)
Text Dark        : #101828 (Hitam Pekat)
Text Light       : #6a7282 (Abu-abu Medium)
```

### Responsive Design
- ✅ Mobile-first approach
- ✅ Breakpoints: 480px, 768px, 1024px, 1440px
- ✅ Touch-friendly UI
- ✅ Desktop optimization

### Komponen UI
- Modal dengan overlay state management
- Form wizard 4-step
- Data tables dengan sorting & filtering
- Toast notifications (coming soon)
- Loading states & spinners
- Status badges & indicators

---

## 🧪 Testing

### Manual Testing Checklist
- [x] Login/Register flow
- [x] Dashboard rendering
- [x] Pengajuan form (4-step)
- [x] Tanda tangan digital
- [x] Absensi checkin/checkout
- [x] Modal detail pengajuan
- [x] Admin manajemen
- [x] Chatbot integration
- [x] Real-time notifications
- [x] Password recovery

### Browser Compatibility
- ✅ Chrome/Chromium 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Mobile browsers (Chrome, Safari iOS)

---

## 🔧 Troubleshooting

### ❌ "Cannot find module 'express'"
```bash
# Solution: Install dependencies
npm install
```

### ❌ "MongoDB connection failed"
- Pastikan MongoDB service running
- Check `MONGODB_URI` di `.env`
- Untuk MongoDB Atlas, check network access & IP whitelist

### ❌ "Port 3000 already in use"
```bash
# Kill process di port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>
```

### ❌ "Socket.io connection failed"
- Check `SOCKET_TRANSPORTS` di config
- Browser console for error messages
- Check network tab in DevTools

### ❌ "Email not sending"
- Generate Gmail App Password (jika pakai Gmail)
- Check SMTP credentials di `.env`
- Verify firewall/antivirus tidak block port 587

### ❌ "Durasi showing 0 hari"
- Update ke Checkpoint 8+ (sudah fixed)
- Clear browser cache
- Check formula include `+1` untuk inclusive counting

---

## 📞 Kontak & Support

**Project Contributors:**
- 👨‍💻 **Rainy** - Backend & Database
- 👨‍💻 **Carli Tamba** - Frontend & UI/UX

**Untuk pertanyaan atau issues:**
- 📧 Email: support@nusaattend.com (placeholder)
- 🐛 Report bugs di [GitHub Issues](https://github.com/username/NusaAttend/issues)
- 💬 Diskusi di [GitHub Discussions](https://github.com/username/NusaAttend/discussions)

---

## 📚 Dokumentasi Lengkap

Untuk dokumentasi lebih detail, lihat:
- 📋 **[Progress Karyawan](./dokumentasi-progress/karyawan/)** - Feature development tracking
- 📋 **[Progress Penanggung Jawab](./dokumentasi-progress/penanggung-jawab/)** - Supervisor features
- 📋 **[Progress Admin](./dokumentasi-progress/admin/)** - Admin features

---

## 🎓 Informasi Akademis

**Project Details:**
| Item | Detail |
|------|--------|
| **Mata Kuliah** | Pemrograman Jaringan (Praktikum) |
| **Semester** | 5 (Lima) |
| **Tahun Akademik** | 2024/2025 |
| **Institusi** | Universitas Negeri Padang (UNP) |
| **Type** | Full-Stack Web Application |
| **Status** | ✅ Production Ready |

**Catatan:**
- Sistem ini adalah simulasi untuk keperluan akademis
- Tanda tangan bersifat visual (bukan legal signature)
- Email dapat dikonfigurasi dengan berbagai provider
- ⭐ **Chatbot menggunakan Groq AI API** (bukan rule-based) untuk intelligent responses
- Single-level approval (tidak ada multi-level flow)

---

## 📜 Lisensi

MIT License - Lihat file [LICENSE](./LICENSE) untuk detail lengkap

---

## 🎉 Changelog

### Version 1.2 (December 24, 2025) - Checkpoint 8
- ✨ **Durasi Calculation Fix**: Inclusive counting formula `Math.ceil(...) + 1`
- ✨ **Real-time Durasi Display**: Display & warning di form page
- ✨ **Modal Overlay State Management**: Support reopen unlimited
- 🐛 Fix: Absensi syntax error (extra `});`)

### Version 1.1 (December 21, 2025) - Checkpoint 7
- ✨ Password recovery system dengan email verification
- ✨ Token-based reset password flow
- ✨ Brute force protection (max 5 attempt/jam)

### Version 1.0 (December 1, 2025) - Production Ready
- ✨ Admin section complete
- ✨ Dashboard & analytics
- ✨ Role-based access control
- ✨ Chatbot AI integration (Groq)

---

<div align="center">

**Made with ❤️ by Rainy & Carli Tamba**

NusaAttend © 2025 - All rights reserved

[⬆ Back to top](#-nusaattend---sistem-manajemen-absensi--pengajuan-izin)

</div>
