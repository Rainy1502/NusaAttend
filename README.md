# NusaAttend - Portal Administrasi Kehadiran Tim

NusaAttend adalah portal administrasi internal berbasis website yang dirancang untuk membantu tim atau organisasi skala kecil hingga menengah dalam mengelola pengajuan administrasi kehadiran secara terpusat, terstruktur, dan real-time.

## Fitur Utama

- **Autentikasi Pengguna**: Login dan logout untuk anggota tim dan admin
- **Sistem Surat Izin**: Pengajuan cuti tahunan, izin tidak masuk, izin sakit, dan WFH
- **Tanda Tangan Digital**: Tanda tangan visual pada surat izin
- **Alur Persetujuan Real-time**: Approval oleh penanggung jawab dengan notifikasi socket
- **Absensi Harian**: Absen masuk dan pulang dengan integrasi surat izin
- **Perhitungan Sisa Cuti**: Tracking otomatis sisa cuti tahunan
- **Email Notifikasi**: Notifikasi email untuk pengajuan dan perubahan status
- **Chatbot Bantuan**: Rule-based chatbot untuk menjawab pertanyaan umum
- **Dashboard Real-time**: Lihat status pengajuan secara real-time

## Teknologi yang Digunakan

- **Backend**: Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Frontend Template**: Handlebars
- **Email**: Nodemailer
- **Autentikasi**: JWT & Session
- **Enkripsi Password**: Bcrypt

## Struktur Folder

```
NusaAttend/
├── src/
│   ├── app.js                 # Entry point aplikasi
│   ├── config/                # Konfigurasi (database, email, etc)
│   │   ├── database.js
│   │   ├── email.js
│   │   └── socket.js
│   ├── models/                # MongoDB models/schemas
│   │   ├── User.js
│   │   ├── Pengajuan.js
│   │   ├── Absensi.js
│   │   └── Chatbot.js
│   ├── controllers/           # Business logic
│   │   ├── authController.js
│   │   ├── pengajuanController.js
│   │   ├── absensiController.js
│   │   ├── adminController.js
│   │   └── chatbotController.js
│   ├── routes/                # API routes
│   │   ├── auth.js
│   │   ├── pengajuan.js
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
- `password`: String (hashed)
- `jabatan`: String
- `role`: String (employee, supervisor, admin)
- `jatah_cuti_tahunan`: Number (default: 12)
- `sisa_cuti`: Number
- `created_at`: Date
- `updated_at`: Date

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

### Pengajuan
- `GET /api/pengajuan` - List pengajuan user
- `POST /api/pengajuan` - Buat pengajuan baru
- `GET /api/pengajuan/:id` - Detail pengajuan

### Absensi
- `POST /api/absensi/masuk` - Absen masuk
- `POST /api/absensi/pulang` - Absen pulang
- `GET /api/absensi/laporan` - Laporan absensi

### Admin
- `GET /api/admin/pengajuan` - List semua pengajuan
- `PUT /api/admin/pengajuan/:id/approve` - Approve pengajuan
- `PUT /api/admin/pengajuan/:id/reject` - Reject pengajuan

### Chatbot
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

- Aplikasi ini adalah sistem simulasi untuk keperluan akademis
- Tanda tangan bersifat visual (bukan tanda tangan hukum)
- Email menggunakan simulasi (dapat dikonfigurasi dengan Gmail/service lain)
- Chatbot berbasis rule, bukan AI generatif
- Sistem single-approval (tidak ada multi-level approval)

## Author
**NusaAttend** dikembangkan sebagai Final Project mata kuliah **Pemrograman Jaringan (Semester 5)** di Universitas Negeri padang.
