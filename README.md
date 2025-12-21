# NusaAttend - Portal Administrasi Kehadiran Tim

<<<<<<< HEAD
**Status Project**: � Admin Section Complete & Production Ready - Phase 1: Login & Admin Dashboard  
**Last Updated**: December 21, 2025
=======
**Status Project**: 🚧 Work In Progress - Phase 2: Frontend Integration & Dashboard  
**Last Updated**: December 20, 2025
>>>>>>> a20babb469bed5af3b62856f389b72027b84a1f6

NusaAttend adalah portal administrasi internal berbasis website yang dirancang untuk membantu tim atau organisasi skala kecil hingga menengah dalam mengelola pengajuan administrasi kehadiran secara terpusat, terstruktur, dan real-time.

## 📋 Fitur yang Sudah Diimplementasi

- ✅ **Login Page**: Login dengan email dan password
<<<<<<< HEAD
- ✅ **Session Management**: Session-based authentication dengan Express Session
- ✅ **Password Hashing**: Secure password dengan Bcrypt
- ✅ **Admin Dashboard**: Dashboard admin dengan real-time statistics dan activity log
- ✅ **Log Keberatan**: System tracking pengajuan keberatan dengan CRUD lengkap
- ✅ **Manajemen Karyawan**: Admin dapat mengelola akun karyawan
- ✅ **Manajemen Penanggung Jawab**: Admin dapat mengelola akun supervisor/penanggung jawab
- ✅ **Role-Based Access Control**: Akses terbatas berdasarkan role (admin, supervisor, karyawan)
- ✅ **Frontend Standardization**: Semua halaman admin memiliki styling yang konsisten
- ✅ **Real-time Data**: Database queries untuk statistik dan monitoring aktual
=======
- ✅ **Admin Dashboard**: Dashboard admin dengan role-based access
- ✅ **Employee Dashboard (Karyawan)**: Dashboard karyawan dengan statistik & pengajuan terbaru
- ✅ **Global Footer**: Footer terintegrasi di semua halaman
- ✅ **Session Management**: Session-based authentication dengan MongoDB store
- ✅ **Password Hashing**: Secure password dengan Bcrypt
- ✅ **Responsive Design**: Desktop, tablet, dan mobile layouts
>>>>>>> a20babb469bed5af3b62856f389b72027b84a1f6

## 🔜 Fitur yang Akan Datang (Next Phase)

- 📝 **Sistem Surat Izin**: Pengajuan cuti tahunan, izin tidak masuk, izin sakit, dan WFH
- 📋 **Absensi Harian**: Absen masuk dan pulang dengan integrasi surat izin
- ✍️ **Tanda Tangan Digital**: Tanda tangan visual pada surat izin
- 🔔 **Alur Persetujuan Real-time**: Approval oleh penanggung jawab dengan notifikasi socket
- 🗓️ **Perhitungan Sisa Cuti**: Tracking otomatis sisa cuti tahunan
- 📧 **Email Notifikasi**: Notifikasi email untuk pengajuan dan perubahan status
- 💬 **Chatbot Bantuan**: Rule-based chatbot untuk menjawab pertanyaan umum
- 📊 **Analytics Dashboard**: Dashboard analytics dengan visualisasi data

## 💻 Teknologi yang Digunakan

- **Backend**: Express.js (Node.js)
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Frontend Template**: Handlebars (express-handlebars)
- **Email**: Nodemailer
- **Autentikasi**: Session-based + JWT
- **Enkripsi Password**: Bcrypt
- **Styling**: Custom CSS (No Framework)
- **Icons**: Font Awesome 6.4.0

## 📁 Struktur Folder Project

```
NusaAttend/
├── src/
│   ├── app.js                      # Main Express application
│   ├── config/
│   │   ├── database.js             # MongoDB connection
│   │   └── socket.js               # Socket.io configuration
│   ├── controllers/
│   │   ├── authController.js       # ✅ Login/Register logic
│   │   ├── dashboardAdminController.js  # ✅ Dashboard stats & activity
│   │   ├── keberatanController.js  # ✅ Keberatan CRUD operations
│   │   ├── karyawanController.js   # ✅ Employee management
│   │   └── penanggungJawabController.js # ✅ Supervisor management
│   ├── middleware/
│   │   ├── auth.js                 # Authentication middleware
│   │   └── errorHandler.js         # Error handling
│   ├── models/
│   │   ├── User.js                 # User schema dengan role enum
│   │   └── Keberatan.js            # ✅ Keberatan schema
│   ├── routes/
│   │   ├── auth.js                 # ✅ Auth routes (login/logout)
│   │   ├── dashboardAdmin.js       # ✅ Dashboard routes
│   │   ├── adminKeberatan.js       # ✅ Keberatan routes
│   │   ├── adminKaryawan.js        # ✅ Employee management routes
│   │   └── adminPenanggungJawab.js # ✅ Supervisor management routes
│   ├── services/                   # Business services
│   └── utils/                      # Utility functions
│
├── public/
│   ├── css/
│   │   └── styles.css              # ✅ All styling (5000+ lines, unified)
│   ├── img/                        # Images
│   └── js/                         # Client-side scripts
│
├── templates/
│   ├── main.hbs                    # Layout template (untuk halaman umum)
│   ├── dashboard-layout.hbs        # ✅ Dashboard layout (sidebar + main content)
│   ├── views/
<<<<<<< HEAD
│   │   ├── login.hbs               # ✅ Login page
│   │   ├── register.hbs            # Register page (belum dimodifikasi)
│   │   └── admin/
│   │       ├── dashboard.hbs       # ✅ Admin dashboard dengan real-time data
│   │       ├── log-keberatan.hbs   # ✅ Keberatan monitoring
│   │       ├── manajemen-karyawan.hbs      # ✅ Employee management
│   │       └── manajemen-penanggung-jawab.hbs  # ✅ Supervisor management
=======
│   │   ├── publik/                 # ✅ Public pages (no auth required)
│   │   │   ├── home.hbs            # Landing page
│   │   │   ├── login.hbs           # ✅ Login page with global footer & back button
│   │   │   └── 404.hbs             # 404 error page
│   │   ├── admin/
│   │   │   └── dashboard.hbs       # ✅ Admin dashboard
│   │   └── karyawan/
│   │       └── dashboard.hbs       # ✅ Employee dashboard dengan statistik & pengajuan terbaru
>>>>>>> a20babb469bed5af3b62856f389b72027b84a1f6
│   └── partials/
│       ├── header.hbs              # Header component
│       ├── footer.hbs              # ✅ Global footer component
│       └── (partials lainnya)
│
├── dokumentasi-progress/           # 📚 Documentation files
│   ├── admin/
│   │   ├── progress-admin-final.md # Final checkpoint documentation
│   │   └── ...
│   └── REFACTORING_REPORT.md       # Code audit & refactoring report
│
├── backup/                         # 🔐 Backup folder (referensi & tidak dipakai)
<<<<<<< HEAD
│   └── (archived deprecated files)
=======
│   ├── src/                        # Reference files untuk fitur mendatang
│   └── templates/views/            # Reference templates
>>>>>>> a20babb469bed5af3b62856f389b72027b84a1f6
│
├── dokumentasi-progress/           # Documentation & progress tracking
├── package.json
├── README.md                       # File ini
└── .env                           # Environment variables
```

## 🎯 File yang AKTIF di Project

<<<<<<< HEAD
✅ **Sudah dimodifikasi & digunakan untuk login, dashboard, dan admin features:**

**Controllers (5 Active):**
- `src/controllers/authController.js` - Login & authentication
- `src/controllers/dashboardAdminController.js` - Admin dashboard dengan real-time stats
- `src/controllers/keberatanController.js` - Log keberatan CRUD operations
- `src/controllers/karyawanController.js` - Employee management
- `src/controllers/penanggungJawabController.js` - Supervisor management

**Routes (5 Active):**
- `src/routes/auth.js` - Auth routing (/api/auth/*)
- `src/routes/dashboardAdmin.js` - Dashboard admin (/api/admin/dashboard)
- `src/routes/adminKeberatan.js` - Keberatan management (/api/admin/keberatan/*)
- `src/routes/adminKaryawan.js` - Employee management (/api/admin/karyawan/*)
- `src/routes/adminPenanggungJawab.js` - Supervisor management (/api/admin/penanggung-jawab/*)

**Models (2 Active):**
- `src/models/User.js` - User schema dengan role validation
- `src/models/Keberatan.js` - Keberatan schema dengan complete fields

**Views (Admin - 4 Active):**
- `templates/views/login.hbs` - Login page
- `templates/views/admin/dashboard.hbs` - Main dashboard dengan dynamic data
- `templates/views/admin/log-keberatan.hbs` - Grievance monitoring
- `templates/views/admin/manajemen-karyawan.hbs` - Employee management
- `templates/views/admin/manajemen-penanggung-jawab.hbs` - Supervisor management

**Supporting Files:**
- `src/app.js` - Main application setup
- `src/middleware/auth.js` - Authentication middleware
- `src/middleware/errorHandler.js` - Error handling
- `src/config/database.js` - MongoDB connection
- `src/config/socket.js` - Socket.io setup
- `templates/dashboard-layout.hbs` - Dashboard layout dengan sidebar
- `templates/partials/footer.hbs` - Dashboard footer
- `public/css/styles.css` - All CSS (5000+ lines, unified styling)
=======
✅ **Sudah dimodifikasi & digunakan untuk login, dashboard admin, dan dashboard karyawan:**

- `src/app.js` - Main application setup dengan routing publik & protected
- `src/controllers/authController.js` - Login & authentication logic
- `src/routes/auth.js` - Auth routing
- `src/models/User.js` - User model dengan role & statistik
- `src/middleware/auth.js` - Auth middleware untuk protected routes
- `src/middleware/errorHandler.js` - Error handling dengan 404 publik
- `src/config/database.js` - MongoDB connection
- `src/config/socket.js` - Socket.io setup
- `templates/views/publik/login.hbs` - ✅ Login page dengan back button & global footer
- `templates/views/publik/home.hbs` - Landing page
- `templates/views/publik/404.hbs` - Error page
- `templates/views/admin/dashboard.hbs` - Admin dashboard
- `templates/views/karyawan/dashboard.hbs` - ✅ Employee dashboard (statistik, pengajuan terbaru)
- `templates/dashboard-layout.hbs` - Dashboard layout dengan sidebar
- `templates/partials/footer.hbs` - ✅ Global footer untuk semua halaman
- `public/css/styles.css` - ✅ All CSS (2774 lines) termasuk dashboard styling
- `public/js/` - Client-side scripts
>>>>>>> a20babb469bed5af3b62856f389b72027b84a1f6

## 🏗️ Tentang Views & Folder Organization

**publik/ folder**: Halaman publik yang tidak memerlukan autentikasi
- `publik/home.hbs` - Landing page / beranda
- `publik/login.hbs` - Login page dengan back button dan global footer
- `publik/404.hbs` - Error page untuk access denied & not found

**admin/ folder**: Halaman khusus admin (memerlukan role: admin)
- `admin/dashboard.hbs` - Dashboard admin dengan sidebar

**karyawan/ folder**: Halaman khusus karyawan/employee (memerlukan login)
- `karyawan/dashboard.hbs` - Dashboard karyawan dengan statistik:
  - Sisa cuti tahunan (9/12)
  - Kehadiran bulan ini (18/20)
  - Menunggu persetujuan (2 pengajuan)
  - Tidak hadir (1 hari)
  - Tabel pengajuan terbaru dengan status badges

**dashboard-layout.hbs**: Layout khusus untuk dashboard (dengan sidebar)
- Struktur: sidebar + main-content + global footer
- Digunakan untuk semua halaman protected (admin, karyawan, supervisor)

**main.hbs**: Layout template utama untuk halaman umum (non-dashboard)
- Include header dan footer partial
- Digunakan untuk halaman register, error, dll
- Belum banyak digunakan dalam phase ini

## 🔐 Backup Folder

Folder `backup/` berisi kerangka awal yang **TIDAK DIGUNAKAN** dalam project aktif:
- Referensi untuk fitur-fitur yang akan dikembangkan (pengajuan, absensi, chatbot, supervisor)
- Tidak boleh di-edit atau di-copy ke project root tanpa kebutuhan khusus
- Lihat `backup/README.md` untuk detail lengkap
```
│   │   ├── absensi.js
│   │   ├── admin.js
│   │   └── chatbot.js
│   ├── services/              # Business logic services
│   │   ├── emailService.js
│   │   ├── socketService.js
│   │   ├── pengajuanService.js
│   │   ├── absensiService.js
│   │   └── chatbotService.js
│   ├── middleware/            # Express middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── validation.js
│   └── utils/                 # Utility functions
│       ├── letterGenerator.js # Generate surat izin
│       ├── validators.js
│       └── constants.js
├── public/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── socket-client.js
│   │   ├── app.js
│   │   └── chatbot.js
│   └── img/
├── templates/
│   ├── partials/
│   │   ├── header.hbs
│   │   ├── footer.hbs
│   │   └── navbar.hbs
│   └── views/
│       ├── index.hbs
│       ├── login.hbs
│       ├── register.hbs
│       ├── dashboard.hbs
│       ├── buat-surat-izin.hbs
│       ├── preview-surat.hbs
│       ├── tanda-tangan.hbs
│       ├── riwayat-pengajuan.hbs
│       ├── absensi.hbs
│       ├── admin-dashboard.hbs
│       ├── manajemen-pengajuan.hbs
│       └── 404.hbs
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Instalasi

1. Clone atau copy folder project
```bash
cd NusaAttend
```

2. Install dependencies
```bash
npm install
```

3. Setup environment variables
```bash
cp .env.example .env
# Edit .env dengan konfigurasi Anda
```

4. Setup MongoDB
```bash
# Pastikan MongoDB running
# Default: mongodb://localhost:27017/nusaattend
```

5. Jalankan aplikasi
```bash
npm run dev     # Development mode dengan nodemon
# atau
npm start       # Production mode
```

6. Akses aplikasi
```
http://localhost:3000
```

## Struktur Database (MongoDB)

### Koleksi: users
- `_id`: ObjectId
- `nama_lengkap`: String
- `email`: String (unique)
- `password`: String (hashed dengan bcrypt)
- `jabatan`: String
- `role`: String (employee, supervisor, admin)
- `jatah_cuti_tahunan`: Number (default: 12)
- `sisa_cuti`: Number
- `created_at`: Date
- `updated_at`: Date

**Catatan**: Dalam dashboard karyawan, data statistik ditampilkan berdasarkan:
- `sisa_cuti` / `jatah_cuti_tahunan` (Sisa Cuti)
- Perhitungan kehadiran dari koleksi absensi (Kehadiran)
- Pengajuan dengan status 'menunggu' (Menunggu Persetujuan)
- Absensi dengan status 'tidak_hadir' (Tidak Hadir)

### Koleksi: pengajuan
- `_id`: ObjectId
- `id_pengguna`: ObjectId (ref: users)
- `jenis_pengajuan`: String (cuti, izin_tidak_masuk, izin_sakit, wfh)
- `tanggal_mulai`: Date
- `tanggal_selesai`: Date
- `alasan`: String
- `status`: String (menunggu_persetujuan, disetujui, ditolak)
- `surat_izin`: Object (HTML surat)
- `ttd_karyawan`: String (signature canvas/image)
- `ttd_penanggung_jawab`: String (signature canvas/image)
- `catatan_penolakan`: String
- `created_at`: Date
- `updated_at`: Date

### Koleksi: absensi
- `_id`: ObjectId
- `id_pengguna`: ObjectId (ref: users)
- `tanggal`: Date
- `jam_masuk`: String
- `jam_pulang`: String
- `status`: String (hadir, izin, cuti, tidak_hadir)
- `keterangan`: String
- `created_at`: Date

### Koleksi: chatbot_responses
- `_id`: ObjectId
- `keywords`: Array<String>
- `response`: String
- `created_at`: Date

## Alur Aplikasi

### Alur Surat Izin
1. Karyawan login
2. Buat surat izin (pilih jenis, tanggal, alasan)
3. Sistem generate surat otomatis
4. Karyawan memberikan tanda tangan digital
5. Kirim pengajuan
6. Penanggung jawab menerima notifikasi (socket)
7. Penanggung jawab review dan approve/reject
8. Sistem mengirim email hasil
9. Status berubah real-time di dashboard karyawan

### Alur Absensi
1. Karyawan klik "Absen Masuk"
2. Sistem catat jam masuk
3. Karyawan klik "Absen Pulang"
4. Sistem catat jam pulang
5. Jika ada surat izin disetujui → status = izin
6. Jika tidak absen & tidak izin → status = tidak hadir

## API Endpoints

### Auth
- `POST /api/auth/register` - Register pengguna baru
- `POST /api/auth/login` - Login pengguna
- `POST /api/auth/logout` - Logout pengguna

### Admin Dashboard
- `GET /api/admin/dashboard` - Get dashboard statistics & activity (Real-time data dari database)

### Keberatan Management
- `GET /api/admin/keberatan` - List semua keberatan
- `POST /api/admin/keberatan` - Buat keberatan baru
- `GET /api/admin/keberatan/:id` - Detail keberatan
- `PUT /api/admin/keberatan/:id` - Update keberatan
- `DELETE /api/admin/keberatan/:id` - Delete keberatan

### Employee Management (Karyawan)
- `GET /api/admin/karyawan` - List semua karyawan
- `POST /api/admin/karyawan` - Tambah karyawan baru
- `GET /api/admin/karyawan/:id` - Detail karyawan
- `PUT /api/admin/karyawan/:id` - Update data karyawan
- `DELETE /api/admin/karyawan/:id` - Delete karyawan

### Supervisor Management (Penanggung Jawab)
- `GET /api/admin/penanggung-jawab` - List semua supervisor
- `POST /api/admin/penanggung-jawab` - Tambah supervisor baru
- `GET /api/admin/penanggung-jawab/:id` - Detail supervisor
- `PUT /api/admin/penanggung-jawab/:id` - Update data supervisor
- `DELETE /api/admin/penanggung-jawab/:id` - Delete supervisor

### Fitur yang Akan Datang
- `GET /api/pengajuan` - List pengajuan user
- `POST /api/pengajuan` - Buat pengajuan baru
- `POST /api/absensi/masuk` - Absen masuk
- `POST /api/absensi/pulang` - Absen pulang
- `POST /api/chatbot/ask` - Tanya chatbot

## Socket.io Events

### Client to Server
- `pengajuan_baru` - Notifikasi pengajuan baru
- `status_pengajuan_diubah` - Notifikasi status berubah
- `absensi_tercatat` - Notifikasi absensi tercatat

## Environment Variables

```
MONGODB_URI=mongodb://localhost:27017/nusaattend
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM=noreply@nusaattend.com
SESSION_SECRET=your_session_secret_key_here
```

## Catatan Pengembangan

- ✅ Admin section sudah lengkap dan production-ready (December 21, 2025)
- ✅ Semua halaman admin memiliki styling yang konsisten dan unified
- ✅ Dashboard menampilkan real-time data dari database
- ✅ Code audit selesai, deprecated files sudah diarchive
- ⏳ Phase 2: Sistem surat izin dan absensi (akan dikerjakan selanjutnya)
- Aplikasi ini adalah sistem simulasi untuk keperluan akademis
- Tanda tangan bersifat visual (bukan tanda tangan hukum)
- Email menggunakan simulasi (dapat dikonfigurasi dengan Gmail/service lain)
- Chatbot berbasis rule, bukan AI generatif
- Sistem single-approval (tidak ada multi-level approval)

## Author
**NusaAttend** dikembangkan sebagai Final Project mata kuliah **Pemrograman Jaringan (Semester 5)** di Universitas Negeri padang.
