# NusaAttend - Project Structure Documentation

## 📁 Struktur Lengkap Project

```
NusaAttend/
│
├── 📄 package.json                 # Dependencies & scripts
├── 📄 .env.example                 # Environment variables template
├── 📄 .gitignore                   # Git ignore rules
├── 📄 README.md                    # Project documentation
├── 📄 GETTING_STARTED.md           # Setup guide
│
├── 📁 src/                         # Backend source code
│   │
│   ├── 📄 app.js                   # Main application entry point
│   │                                # - Express setup
│   │                                # - Middleware configuration
│   │                                # - Route mounting
│   │                                # - Error handling
│   │                                # - Server startup
│   │
│   ├── 📁 config/                  # Configuration files
│   │   ├── 📄 database.js          # MongoDB connection setup
│   │   ├── 📄 email.js             # Email transporter (Nodemailer)
│   │   └── 📄 socket.js            # Socket.io configuration
│   │
│   ├── 📁 models/                  # Mongoose Data Models
│   │   ├── 📄 User.js              # User schema dengan bcrypt password hashing
│   │   ├── 📄 Pengajuan.js         # Pengajuan/surat izin schema
│   │   ├── 📄 Absensi.js           # Absensi harian schema
│   │   └── 📄 Chatbot.js           # Chatbot responses schema
│   │
│   ├── 📁 controllers/             # Business Logic Controllers
│   │   ├── 📄 authController.js    # Register, login, logout
│   │   ├── 📄 pengajuanController.js # Create, read pengajuan
│   │   ├── 📄 absensiController.js # Absen masuk, pulang
│   │   ├── 📄 adminController.js   # Admin pengajuan management
│   │   └── 📄 chatbotController.js # Chatbot logic
│   │
│   ├── 📁 routes/                  # API Route Handlers
│   │   ├── 📄 auth.js              # /api/auth/* routes
│   │   ├── 📄 pengajuan.js         # /api/pengajuan/* routes
│   │   ├── 📄 absensi.js           # /api/absensi/* routes
│   │   ├── 📄 admin.js             # /api/admin/* routes
│   │   └── 📄 chatbot.js           # /api/chatbot/* routes
│   │
│   ├── 📁 services/                # Business Logic Services
│   │   ├── 📄 emailService.js      # Email sending logic
│   │   ├── 📄 socketService.js     # Socket.io events handling
│   │   ├── 📄 pengajuanService.js  # Pengajuan business logic
│   │   └── 📄 absensiService.js    # Absensi business logic
│   │
│   ├── 📁 middleware/              # Express Middleware
│   │   ├── 📄 auth.js              # JWT/Session authentication
│   │   ├── 📄 errorHandler.js      # Global error handling
│   │   └── 📄 validation.js        # Input validation
│   │
│   └── 📁 utils/                   # Utility Functions
│       ├── 📄 letterGenerator.js   # Generate HTML surat izin
│       ├── 📄 constants.js         # App constants
│       └── 📄 validators.js        # Validation utilities
│
├── 📁 public/                      # Frontend Static Files
│   │
│   ├── 📁 css/
│   │   └── 📄 styles.css           # Main stylesheet
│   │
│   ├── 📁 js/
│   │   ├── 📄 app.js               # Client-side JavaScript
│   │   ├── 📄 socket-client.js     # Socket.io client
│   │   └── 📄 chatbot.js           # Chatbot frontend logic
│   │
│   └── 📁 img/
│       └── [logo & images]         # Static images
│
└── 📁 templates/                   # Handlebars Views
    │
    ├── 📁 partials/                # Reusable template components
    │   ├── 📄 head.hbs             # <head> section
    │   ├── 📄 header.hbs           # Navigation bar
    │   └── 📄 footer.hbs           # Footer with scripts
    │
    └── 📁 views/                   # Page templates
        │
        ├── 📄 index.hbs            # Homepage
        ├── 📄 login.hbs            # Login page
        ├── 📄 register.hbs         # Registration page
        ├── 📄 chatbot.hbs          # Chatbot page
        ├── 📄 404.hbs              # 404 error page
        │
        ├── 📁 employee/            # Employee role views
        │   ├── 📄 dashboard.hbs    # Employee dashboard
        │   ├── 📄 pengajuan.hbs    # List pengajuan
        │   ├── 📄 buat-pengajuan.hbs # Create pengajuan form
        │   ├── 📄 detail-pengajuan.hbs # Pengajuan detail
        │   └── 📄 absensi.hbs      # Absensi page
        │
        ├── 📁 supervisor/          # Supervisor role views
        │   ├── 📄 dashboard.hbs    # Supervisor dashboard
        │   └── 📄 review-pengajuan.hbs # Review form
        │
        └── 📁 admin/               # Admin role views
            ├── 📄 dashboard.hbs    # Admin dashboard
            └── 📄 manajemen-pengajuan.hbs # Management page
```

## 🔄 Data Flow Architecture

### 1. Authentication Flow
```
User Input (Login Form)
        ↓
POST /api/auth/login (authController)
        ↓
Verify Email & Password (User Model)
        ↓
Create Session / Generate JWT
        ↓
Redirect to Dashboard (role-based)
```

### 2. Pengajuan Creation Flow
```
Employee Form Input
        ↓
POST /api/pengajuan (pengajuanController)
        ↓
Validate Input (middleware)
        ↓
Generate Surat HTML (letterGenerator.js)
        ↓
Save to MongoDB (Pengajuan Model)
        ↓
Send Email (emailService.js)
        ↓
Emit Socket Event (pengajuan_baru)
        ↓
Notify Supervisor (Real-time)
```

### 3. Pengajuan Review Flow
```
Supervisor Review Page
        ↓
View Pengajuan Detail
        ↓
Approve/Reject Decision
        ↓
PUT /api/admin/pengajuan/:id/approve (adminController)
        ↓
Update Pengajuan Status in MongoDB
        ↓
Save Supervisor Signature
        ↓
Send Status Email to Employee
        ↓
Emit Socket Event (status_pengajuan_diubah)
        ↓
Update Employee Dashboard (Real-time)
```

### 4. Absensi Flow
```
Employee Absen Button Click
        ↓
POST /api/absensi/masuk or /pulang (absensiController)
        ↓
Check/Create Absensi Record (Absensi Model)
        ↓
Record Time
        ↓
Check Pengajuan Status (Auto-sync with surat izin)
        ↓
Save to MongoDB
        ↓
Emit Socket Event (absensi_tercatat)
```

## 📊 Database Schema

### Users Collection
```javascript
{
  _id: ObjectId,
  nama_lengkap: String,
  email: String (unique),
  password: String (hashed),
  jabatan: String,
  role: String (employee, supervisor, admin),
  jatah_cuti_tahunan: Number,
  sisa_cuti: Number,
  adalah_aktif: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Pengajuan Collection
```javascript
{
  _id: ObjectId,
  id_pengguna: ObjectId (ref: User),
  jenis_pengajuan: String (cuti, izin_tidak_masuk, izin_sakit, wfh),
  tanggal_mulai: Date,
  tanggal_selesai: Date,
  alasan: String,
  status: String (menunggu_persetujuan, disetujui, ditolak),
  surat_izin: String (HTML),
  ttd_karyawan: String (Base64/image path),
  ttd_penanggung_jawab: String (Base64/image path),
  catatan_penolakan: String,
  jumlah_hari: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Absensi Collection
```javascript
{
  _id: ObjectId,
  id_pengguna: ObjectId (ref: User),
  tanggal: Date,
  jam_masuk: String,
  jam_pulang: String,
  status: String (hadir, izin, cuti, tidak_hadir, sakit),
  keterangan: String,
  createdAt: Date
}
```

### ChatbotResponse Collection
```javascript
{
  _id: ObjectId,
  keywords: [String],
  response: String,
  kategori: String,
  createdAt: Date
}
```

## 🌐 API Endpoints Summary

### Auth Routes
```
POST   /api/auth/register        Register new user
POST   /api/auth/login           Login user
POST   /api/auth/logout          Logout user
```

### Pengajuan Routes
```
GET    /api/pengajuan            Get all pengajuan (user)
GET    /api/pengajuan/:id        Get pengajuan detail
POST   /api/pengajuan            Create new pengajuan
```

### Absensi Routes
```
POST   /api/absensi/masuk        Absen masuk
POST   /api/absensi/pulang       Absen pulang
GET    /api/absensi              Get absensi list
```

### Admin Routes
```
GET    /api/admin/pengajuan      Get all pengajuan
PUT    /api/admin/pengajuan/:id/approve   Approve
PUT    /api/admin/pengajuan/:id/reject    Reject
```

### Chatbot Routes
```
POST   /api/chatbot/ask          Ask chatbot
```

## 🔌 Socket.io Events

### Client → Server
- `pengajuan_baru` - New pengajuan created
- `status_pengajuan_diubah` - Status changed
- `absensi_tercatat` - Absensi recorded

### Server → Client
- `pengajuan_baru_notifikasi` - Broadcast new pengajuan
- `status_pengajuan_diubah_notifikasi` - Broadcast status change
- `absensi_tercatat_notifikasi` - Broadcast absensi

## 🎯 Role-Based Access

### Employee
- View dashboard dengan statistik pengajuan
- Buat surat izin baru
- Lihat riwayat pengajuan
- Absensi masuk & pulang
- Chat dengan chatbot

### Supervisor
- View dashboard dengan list pengajuan
- Review & approve/reject pengajuan
- Lihat detail surat izin
- Tanda tangan digital pada surat

### Admin
- View all pengajuan from all employees
- Manage pengajuan approval
- Generate laporan
- Manage user accounts

## 🚀 Key Technologies Used

- **Backend**: Express.js
- **Database**: MongoDB + Mongoose
- **Real-time**: Socket.io
- **Templating**: Handlebars
- **Authentication**: JWT + Session
- **Password**: Bcrypt
- **Email**: Nodemailer
- **Frontend**: Bootstrap 5, Vanilla JS

## 📝 Development Notes

- Struktur modular untuk scalability
- Separation of concerns (MVC pattern)
- Middleware untuk authentication & validation
- Real-time updates menggunakan Socket.io
- Error handling global di middleware
- Environment-based configuration

Selamat mengembangkan! 🎉
