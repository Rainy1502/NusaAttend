require("dotenv").config();

const mongoose = require("mongoose")
const express = require("express");
const path = require("path");
const session = require("express-session");
const http = require("http");
const socketIO = require("socket.io");
const MongoStore = require("connect-mongo");
const jwt = require("jsonwebtoken");

const socketAuth = require("./middleware/socketAuth");
const chatbotSocket = require("./chatbotSocket");
// ==================== IMPORT KONFIGURASI ====================
const hubungkanDB = require("./config/database");
const inisialisasiSocket = require("./config/socket");

// ==================== IMPORT RUTE ====================
const rutAuntenfikasi = require("./routes/auth");
const rutAdminKaryawan = require("./routes/adminKaryawan");
/**
 * [REFACTOR AKADEMIK]
 * Mengubah import dari 'adminSupervisor' ke 'adminPenanggungJawab'
 * untuk konsistensi terminologi lintas sistem sesuai ketentuan dosen
 */
const rutAdminPenanggungJawab = require("./routes/adminPenanggungJawab");
/**
 * [FITUR BARU - Dashboard Admin]
 * Router untuk API Dashboard Admin Sistem
 * Menangani pengambilan data ringkasan dan aktivitas terbaru (read-only)
 */
const rutDashboardAdmin = require("./routes/dashboardAdmin");
/**
 * [FITUR BARU - Dashboard Penanggung Jawab]
 * Router untuk API Dashboard Penanggung Jawab (Supervisor)
 * Menangani pengambilan data ringkasan dan aktivitas terbaru tim (read-only)
 */
const rutDashboardPenanggungJawab = require("./routes/dashboardPenanggungJawab");

/**
 * [FITUR BARU - Review Pengajuan]
 * Router untuk API Review Pengajuan (Penanggung Jawab)
 * Menangani pengambilan daftar pengajuan yang menunggu review (read-only)
 */
const rutReviewPengajuan = require("./routes/reviewPengajuan");

/**
 * [FITUR BARU - Tanda Tangan Administratif]
 * Router untuk API Tanda Tangan Digital Karyawan
 * Menangani penyimpanan dan pengambilan tanda tangan administratif (Base64)
 */
const rutTandaTangan = require("./routes/tandaTangan");

/**
 * [FITUR BARU - Pengajuan Surat Izin]
 * Router untuk API Pengajuan (Surat Izin) Karyawan
 * Menangani CRUD pengajuan dengan validasi tanggal backend
 */
const rutPengajuan = require("./routes/pengajuan");

/**
 * [FITUR BARU - Riwayat Pengajuan]
 * Router untuk API Riwayat Pengajuan Karyawan
 * Menangani pengambilan data riwayat pengajuan surat izin (READ-ONLY)
 */
const rutRiwayatPengajuan = require("./routes/riwayatPengajuan");

/**
 * [FITUR BARU - Dashboard Pengguna]
 * Router untuk API Dashboard Pengguna (Karyawan)
 * Menangani pengambilan data ringkasan administratif dashboard
 */
const rutDashboardPengguna = require("./routes/dashboardPengguna");

/**
 * [FITUR BARU - Detail Pengajuan Modal]
 * Router untuk API Detail Pengajuan (READ-ONLY)
 * Menangani pengambilan data detail pengajuan untuk keperluan tampilan modal
 * Tidak melakukan persetujuan, penolakan, atau perubahan data
 */
const rutDetailPengajuan = require("./routes/detailPengajuan");

/**
 * [FITUR BARU - Tolak & Setujui Pengajuan]
 * Router untuk API Tolak dan Setujui Pengajuan (WRITE TERBATAS)
 * Menangani proses review dengan alasan administratif
 * - Tolak Pengajuan: Mengubah status → "ditolak" + simpan alasan
 * - Setujui Pengajuan: Mengubah status → "disetujui"
 * Sifat: Administratif internal, non-hukum, defensif
 */
const rutTolakPengajuan = require("./routes/tolakPengajuan");

/**
 * Routes: Setujui Pengajuan (READ-ONLY)
 *
 * Menyediakan endpoint untuk modal "Setujui Pengajuan"
 * - Mengambil data administratif pengajuan
 * - Menyediakan informasi identitas pengguna & pengajuan
 * - Memberikan placeholder tanda tangan administratif
 * Sifat: READ-ONLY, administratif, non-hukum, defensif
 */
const rutSetujuiPengajuan = require("./routes/setujuiPengajuan");

/**
 * [FITUR BARU - Pemulihan Password]
 * Router untuk pemulihan password via email link
 * - GET /lupa-password - Halaman lupa password
 * - POST /api/pemulihan/minta-reset-link - Minta link reset
 * - GET /reset-password-dengan-token/:token - Halaman reset dengan token
 * - POST /api/pemulihan/reset-password-dengan-token - Reset password
 * Features: Token 30 menit, brute force protection, email sending
 */
const rutPemulihan = require("./routes/rutPemulihan");

// const rutAdmin = require('./routes/admin');         // Di-backup
// const rutChatbot = require('./routes/chatbot');     // Di-backup

const absensiRoute = require("./routes/absensi");
// ==================== IMPORT MIDDLEWARE ====================
const {
  penggantiKesalahan,
  penggantiTidakDitemukan,
} = require("./middleware/errorHandler");
const middlewareAuntenfikasi = require("./middleware/auth");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
  },
});

// ==================== KONEKSI DATABASE ====================
hubungkanDB();

// SOCKET AUTH
io.use(socketAuth);

// REGISTER CHATBOT SOCKET
chatbotSocket(io);

// ==================== HELPER FUNCTIONS ====================

// ==================== MIDDLEWARE ====================

// Parser untuk JSON dan form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File statis (CSS, JS, gambar)
app.use(express.static(path.join(__dirname, "../public")));

// Konfigurasi session dengan MongoDB store
const konfigurasiSession = {
  secret: process.env.SESSION_SECRET || "your_session_secret",
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI || "mongodb://localhost:27017/nusaattend",
    collection: "sesi",
    touchAfter: 24 * 3600, // Update session setiap 24 jam
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24, // Masa berlaku 24 jam
  },
};

app.use(session(konfigurasiSession));

// ==================== VIEW ENGINE (HANDLEBARS) ====================
app.engine(
  "hbs",
  require("express-handlebars").engine({
    extname: "hbs",
    layoutsDir: path.join(__dirname, "../templates/partials"), // Layouts berada di partials folder
    partialsDir: path.join(__dirname, "../templates/partials"),
    helpers: {
      // Bantu untuk format tanggal dengan lokal Indonesia
      format_date: function (date) {
        if (!date) return "";
        const d = new Date(date);
        return d.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      // Bantu untuk huruf besar pada kata
      capitalize: function (str) {
        if (!str) return "";
        return str
          .split("_")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      },
      // Bantu untuk cek kesamaan nilai (support inline dan block)
      eq: function (a, b, options) {
        // Jika digunakan sebagai block helper: {{#eq a b}}...{{/eq}}
        if (options && options.fn) {
          if (a === b) {
            return options.fn(this);
          } else if (options.inverse) {
            return options.inverse(this);
          }
          return "";
        }
        // Jika digunakan sebagai inline helper: {{#if (eq a b)}}...{{/if}}
        return a === b;
      },
      // Bantu untuk kondisi OR (multiple conditions)
      or: function (...args) {
        return args.slice(0, -1).some((arg) => arg);
      },
      // Bantu untuk cek halaman aktif di menu
      isActive: function (page, currentPage) {
        return page === currentPage ? "active" : "";
      },
      // Bantu untuk format tanggal (alias untuk format_date)
      formatTanggal: function (date, locale = "id") {
        if (!date) return "";
        const d = new Date(date);
        if (locale === "id") {
          return d.toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          });
        }
        return d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      },
      // Bantu untuk switch-case logic dalam templates
      switch: function (value, options) {
        this._switch_value_ = value;
        const html = options.fn(this);
        delete this._switch_value_;
        return html;
      },
      // Bantu untuk case dalam switch statement
      case: function (value, options) {
        if (value == this._switch_value_) {
          return options.fn(this);
        }
      },
       gte(a, b) {
        return a >= b;
      },
      // Bantu untuk default case dalam switch statement
      default: function (options) {
        if (this._switch_value_ === undefined) {
          return options.fn(this);
        }
      },
    },
  })
);
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "../templates/views"));

// ==================== RUTE PUBLIK ====================

// Rute autentikasi
app.use("/api/auth", rutAuntenfikasi);

// Rute pemulihan password via email link
app.use("/", rutPemulihan);

// Halaman home/landing - menampilkan informasi produk
// Halaman publik: tidak memerlukan autentikasi, ditampilkan dari folder publik
app.get("/home", (req, res) => {
  res.render("publik/home", {
    title: "Home - NusaAttend",
    layout: "main",
  });
});

// Halaman utama - redirect ke dashboard atau login
// Halaman publik: jika sudah login redirect ke dashboard, jika belum tampilkan halaman home dari folder publik
app.get("/", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  // Jika belum login, tampilkan halaman home/landing page dari folder publik
  res.render("publik/home", {
    title: "Home - NusaAttend",
    layout: "main",
  });
});

// Halaman login
// Halaman publik: menampilkan form login dari folder publik
app.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("publik/login", {
    title: "Login - NusaAttend",
    layout: false,
  });
});

// Halaman register
app.get("/register", (req, res) => {
  if (req.session.user) {
    return res.redirect("/dashboard");
  }
  res.render("register", { title: "Register - NusaAttend" });
});

// Rute logout (menangani form POST)
app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render("error", {
        message: "Logout gagal",
        error: err,
      });
    }
    res.redirect("/login");
  });
});

// ==================== RUTE TERLINDUNGI ====================
// Daftarkan router admin karyawan dengan middleware autentikasi
app.use("/api/admin", middlewareAuntenfikasi, rutAdminKaryawan);

/**
 * [REFACTOR AKADEMIK]
 * Mengubah variabel dari rutAdminSupervisor ke rutAdminPenanggungJawab
 * untuk konsistensi terminologi lintas sistem sesuai ketentuan dosen
 */
// Daftarkan router admin penanggung jawab dengan middleware autentikasi
app.use("/api/admin", middlewareAuntenfikasi, rutAdminPenanggungJawab);

/**
 * [FITUR BARU - Dashboard Admin]
 * Daftarkan router dashboard admin dengan middleware autentikasi
 * Endpoint: /api/admin/dashboard
 * Handler: dashboardAdminController.js
 * Sifat: Read-only (pengambilan data ringkasan dan aktivitas)
 */
app.use("/api/admin", middlewareAuntenfikasi, rutDashboardAdmin);

/**
 * ==================== ROUTER: DASHBOARD PENANGGUNG JAWAB ====================
 *
 * READ-ONLY API untuk halaman Dashboard Penanggung Jawab
 *
 * - Sifat: Administratif & Informasional (view-only)
 * - Operasi: Pengambilan ringkasan data & indikator kondisi sistem
 * - TIDAK ada approval, rejection, atau perubahan status
 * - Controller: dashboardPenanggungJawabController.js
 *
 * ENDPOINT:
 * GET /api/pengguna/dashboard-penanggung-jawab
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutDashboardPenanggungJawab);

/**
 * ==================== ROUTER: REVIEW PENGAJUAN ====================
 *
 * READ-ONLY API untuk halaman Review Pengajuan
 * - Sifat: Administratif & Informasional (view-only)
 * - Operasi: Pengambilan daftar pengajuan TANPA approval/rejection
 * - Controller: reviewPengajuanController.js
 *
 * ENDPOINT:
 * GET /api/pengguna/review-pengajuan
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutReviewPengajuan);

/**
 * [FITUR BARU - Tanda Tangan Administratif]
 * Daftarkan router tanda tangan dengan middleware autentikasi
 * Endpoint: /api/karyawan/tanda-tangan
 * Handler: tandaTanganController.js
 * Sifat: Write-read (simpan tanda tangan administratif, ambil untuk review)
 */
app.use("/api/karyawan", middlewareAuntenfikasi, rutTandaTangan);

/**
 * [FITUR BARU - Pengajuan Surat Izin]
 * Daftarkan router pengajuan dengan middleware autentikasi
 * Endpoint: /api/karyawan/pengajuan
 * Handler: pengajuanController.js
 * Sifat: CRUD (buat, ambil, update status pengajuan)
 * Validasi Backend:
 * - Tanggal mulai >= hari ini
 * - Tanggal selesai >= tanggal mulai
 * - Durasi <= 365 hari (1 tahun)
 */
app.use("/api/karyawan", middlewareAuntenfikasi, rutPengajuan);

/**
 * [FITUR BARU - Riwayat Pengajuan]
 * Daftarkan router riwayat pengajuan dengan middleware autentikasi
 * Endpoint: /api/pengguna/riwayat-pengajuan
 * Handler: riwayatPengajuanController.js
 * Sifat: READ-ONLY (hanya mengambil data riwayat, tidak mengubah apapun)
 * Akses: Karyawan yang sudah ter-autentikasi
 * Catatan: Endpoint ini bersifat informatif & administratif saja
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutRiwayatPengajuan);

/**
 * [FITUR BARU - Dashboard Pengguna]
 * Daftarkan router dashboard pengguna dengan middleware autentikasi
 * Endpoint: /api/pengguna/dashboard
 * Handler: dashboardPenggunaController.js
 * Sifat: READ-ONLY (pengambilan data ringkasan kehadiran & pengajuan terbaru)
 * Akses: Karyawan yang sudah ter-autentikasi
 * Catatan: Backend ini menyediakan ringkasan administratif untuk dashboard
 *          Semua nilai bersifat informatif, bukan perhitungan real sistem
 *          Jika sistem detail belum lengkap, dikembalikan nilai default (0 atau array kosong)
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutDashboardPengguna);

/**
 * [FITUR BARU - Detail Pengajuan Modal]
 * Daftarkan router detail pengajuan dengan middleware autentikasi
 * Endpoint: /api/pengguna/detail-pengajuan/:id
 * Handler: detailPengajuanController.js
 * Sifat: READ-ONLY (pengambilan data detail pengajuan untuk tampilan modal)
 * Akses: Penanggung jawab yang sudah ter-autentikasi
 * Catatan: Backend HANYA menyuplai data administratif pengajuan
 *          Tidak melakukan persetujuan, penolakan, atau perubahan status
 *          Tanda tangan bersifat administratif visual, bukan bukti hukum
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutDetailPengajuan);

/**
 * [FITUR BARU - Tolak & Setujui Pengajuan]
 * Daftarkan router tolak & setujui pengajuan dengan middleware autentikasi
 * Endpoint:
 *   POST /api/pengguna/pengajuan-tolak/:id
 *   POST /api/pengguna/pengajuan-setujui/:id
 * Handler: tolakPengajuanController.js
 * Sifat: WRITE TERBATAS (hanya mengubah status & alasan)
 * Akses: Penanggung jawab yang sudah ter-autentikasi
 * Catatan: Backend mengubah status & menyimpan alasan penolakan administratif
 *          Bersifat non-hukum, hanya pertimbangan internal penanggung jawab
 *          Tidak ada workflow otomatis, notifikasi, atau operasi lain
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutTolakPengajuan);

/**
 * [FITUR BARU - Modal Setujui Pengajuan]
 * Daftarkan router setujui pengajuan dengan middleware autentikasi
 * Endpoint:
 *   GET /api/pengguna/setujui-pengajuan/:id
 * Handler: setujuiPengajuanController.js
 * Sifat: READ-ONLY (hanya mengambil data administratif)
 * Akses: Penanggung jawab yang sudah ter-autentikasi
 * Catatan: Backend HANYA menyediakan data untuk presentasi modal
 *          TIDAK ada persetujuan real, TIDAK ada penyimpanan tanda tangan
 *          Tanda tangan adalah placeholder visual untuk administratif
 *          Tidak ada perubahan status pengajuan di endpoint ini
 */
app.use("/api/pengguna", middlewareAuntenfikasi, rutSetujuiPengajuan);

// app.use('/api/absensi', middlewareAuntenfikasi, rutAbsensi);     // Di-backup
// app.use('/api/chatbot', rutChatbot);                             // Di-backup
// app.use('/api/admin', middlewareAuntenfikasi, rutAdmin);         // Di-backup

// ==================== MIDDLEWARE: ENSURE SOCKET TOKEN ====================
// Middleware untuk memastikan socketToken ada di session
app.use((req, res, next) => {
  if (req.session.user && !req.session.socketToken) {
    // Generate socketToken jika belum ada
    const socketToken = jwt.sign(
      {
        id: req.session.user.id,
        email: req.session.user.email,
        role: req.session.user.role,
        socketAuth: true,
      },
      process.env.JWT_SECRET || "your_jwt_secret",
      { expiresIn: "24h" }
    );
    req.session.socketToken = socketToken;

    // Save session
    req.session.save((err) => {
      if (err) console.error("⚠️ Session save error:", err);
    });
  }
  next();
});

// ==================== DASHBOARD (BERBASIS ROLE) ====================
// Rute dashboard dengan redirect berdasarkan role pengguna
app.get("/dashboard", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }

  // DEBUG: Log session socketToken
  console.log(
    "📍 Dashboard Route - Session socketToken:",
    req.session.socketToken ? "SET ✓" : "NOT SET ✗"
  );

  const role = req.session.user.role;
  if (role === "admin") {
    /**
     * [FITUR BARU - Data Dinamis]
     * Route dashboard admin sekarang fetch data dari API controller
     * Mengambil ringkasan & aktivitas terbaru dari database
     */
    try {
      // Query data dashboard dari controller langsung (bypass API call)
      const Pengguna = require("./models/Pengguna");

      // Hitung ringkasan
      const totalKaryawan = await Pengguna.countDocuments({ role: "karyawan" });
      const totalPenanggungJawab = await Pengguna.countDocuments({
        role: "penanggung-jawab",
      });
      const totalAkunAktif = await Pengguna.countDocuments({
        adalah_aktif: true,
      });

      // Hitung aktivitas hari ini
      const hariIniMulai = new Date();
      hariIniMulai.setHours(0, 0, 0, 0);
      const hariIniAkhir = new Date();
      hariIniAkhir.setHours(23, 59, 59, 999);

      const totalAktivitasHariIni = await Pengguna.countDocuments({
        $or: [
          { createdAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
          { updatedAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
        ],
      });

      // Ambil 5 aktivitas terbaru
      const daftarUserTerbaru = await Pengguna.find()
        .select(
          "nama_lengkap jabatan email role adalah_aktif createdAt updatedAt"
        )
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();

      // Transform ke format aktivitas
      const aktivitasTerbaru = daftarUserTerbaru.map((user) => {
        const isNew =
          hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;

        let deskripsi = "";
        if (user.role === "karyawan") {
          deskripsi = isNew
            ? "Akun karyawan baru dibuat"
            : "Data karyawan diperbarui";
        } else if (user.role === "penanggung-jawab") {
          deskripsi = isNew
            ? "Penanggung jawab ditambahkan"
            : "Data penanggung jawab diperbarui";
        } else if (user.role === "admin") {
          deskripsi = isNew
            ? "Admin sistem ditambahkan"
            : "Data admin diperbarui";
        }

        const waktuSekarang = new Date();
        const selisihMs = waktuSekarang - user.updatedAt;
        const selisihDetik = Math.floor(selisihMs / 1000);
        const selisihMenit = Math.floor(selisihDetik / 60);
        const selisihJam = Math.floor(selisihMenit / 60);
        const selisihHari = Math.floor(selisihJam / 24);

        let waktuRelatif = "";
        if (selisihDetik < 60) {
          waktuRelatif = "Baru saja";
        } else if (selisihMenit < 60) {
          waktuRelatif = `${selisihMenit} menit lalu`;
        } else if (selisihJam < 24) {
          waktuRelatif = `${selisihJam} jam lalu`;
        } else {
          waktuRelatif = `${selisihHari} hari lalu`;
        }

        return {
          deskripsi: deskripsi,
          nama_pengguna: user.nama_lengkap,
          jabatan: user.jabatan,
          waktu_relatif: waktuRelatif,
        };
      });

      res.render("admin/dashboard", {
        title: "Dashboard Admin - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        // Data ringkasan
        totalKaryawan: totalKaryawan,
        totalPenanggungJawab: totalPenanggungJawab,
        totalAkunAktif: totalAkunAktif,
        totalAktivitasHariIni: totalAktivitasHariIni,
        // Data aktivitas
        aktivitasTerbaru: aktivitasTerbaru,
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      res.render("admin/dashboard", {
        title: "Dashboard Admin - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        totalKaryawan: 0,
        totalPenanggungJawab: 0,
        totalAkunAktif: 0,
        totalAktivitasHariIni: 0,
        aktivitasTerbaru: [],
      });
    }
  } else if (role === "penanggung-jawab") {
    /**
     * [DASHBOARD PENANGGUNG JAWAB - Data Dinamis]
     * Route dashboard penanggung jawab sekarang fetch data dari model User
     * Mengambil ringkasan & aktivitas terbaru dari database
     */
    try {
      // Query data dashboard dari User model (sama seperti admin, tapi untuk semua user)
      const Pengguna = require("./models/Pengguna");
      const Pengajuan = require("./models/Pengajuan");

      // Hitung ringkasan
      const totalKaryawan = await Pengguna.countDocuments({ role: "karyawan" });
      const totalPenanggungJawab = await Pengguna.countDocuments({
        role: "penanggung-jawab",
      });
      const totalAkunAktif = await Pengguna.countDocuments({
        adalah_aktif: true,
      });

      // Hitung aktivitas hari ini
      const hariIniMulai = new Date();
      hariIniMulai.setHours(0, 0, 0, 0);
      const hariIniAkhir = new Date();
      hariIniAkhir.setHours(23, 59, 59, 999);

      const totalAktivitasHariIni = await Pengguna.countDocuments({
        $or: [
          { createdAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
          { updatedAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
        ],
      });

      // Ambil pengajuan mendesak (status menunggu, sorted by tanggal_mulai terdekat)
      const daftarPengajuanMendesak = await Pengajuan.find({
        status: "menunggu",
      })
        .populate("karyawan_id", "nama_lengkap")
        .sort({ tanggal_mulai: 1 }) // Paling dekat dulu
        .limit(5)
        .lean()
        .exec();

      // Transform ke format display untuk dashboard
      const pengajuanMendesak = daftarPengajuanMendesak.map((pengajuan) => {
        // Format tanggal pengajuan (kapan diajukan)
        const tanggalPengajuan = new Date(
          pengajuan.dibuat_pada
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // Hitung waktu relatif (berapa lama lalu diajukan)
        const waktuSekarang = new Date();
        const selisihMs = waktuSekarang - new Date(pengajuan.dibuat_pada);
        const selisihDetik = Math.floor(selisihMs / 1000);
        const selisihMenit = Math.floor(selisihDetik / 60);
        const selisihJam = Math.floor(selisihMenit / 60);
        const selisihHari = Math.floor(selisihJam / 24);

        let waktuPengajuan = "";
        if (selisihDetik < 60) {
          waktuPengajuan = "Diajukan baru saja";
        } else if (selisihMenit < 60) {
          waktuPengajuan = `Diajukan ${selisihMenit} menit lalu`;
        } else if (selisihJam < 24) {
          waktuPengajuan = `Diajukan ${selisihJam} jam lalu`;
        } else {
          waktuPengajuan = `Diajukan ${selisihHari} hari lalu`;
        }

        // Format jenis izin
        const jenisIzinMap = {
          "cuti-tahunan": "Cuti Tahunan",
          "izin-tidak-masuk": "Izin Tidak Masuk",
          "izin-sakit": "Izin Sakit",
          wfh: "Work From Home",
        };

        const tanggalMulai = new Date(
          pengajuan.tanggal_mulai
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return {
          namaKaryawan: pengajuan.karyawan_id?.nama_lengkap || "Unknown",
          jenisPengajuan: `${
            jenisIzinMap[pengajuan.jenis_izin] || pengajuan.jenis_izin
          } - ${tanggalMulai}`,
          tanggalPengajuan: tanggalPengajuan,
          waktuPengajuan: waktuPengajuan,
        };
      });

      // Hitung pengajuan menunggu review
      const menungguReview = await Pengajuan.countDocuments({
        status: "menunggu",
      });

      res.render("penanggung-jawab/dashboard", {
        title: "Dashboard Penanggung Jawab - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        // Data ringkasan - mapping ke frontend variables
        jumlahMenungguReview: menungguReview,
        jumlahDisetujuiBulanIni: totalKaryawan,
        jumlahDitolakBulanIni: totalPenanggungJawab,
        totalKaryawanTim: totalAkunAktif,
        // Data kehadiran (dummy untuk sekarang)
        jumlahHadir: 18,
        jumlahIzinCuti: 4,
        jumlahBelumAbsen: 2,
        // Data statistik bulan (dummy untuk sekarang)
        totalPengajuanBulanIni: 19,
        rataRataWaktuReview: "4.2 jam",
        tingkatPersetujuan: "85.7%",
        // Data aktivitas pengajuan mendesak
        pengajuanMendesak: pengajuanMendesak,
      });
    } catch (error) {
      console.error("Error loading dashboard penanggung jawab data:", error);
      res.render("penanggung-jawab/dashboard", {
        title: "Dashboard Penanggung Jawab - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        jumlahMenungguReview: 0,
        jumlahDisetujuiBulanIni: 0,
        jumlahDitolakBulanIni: 0,
        totalKaryawanTim: 0,
        jumlahHadir: 0,
        jumlahIzinCuti: 0,
        jumlahBelumAbsen: 0,
        totalPengajuanBulanIni: 0,
        rataRataWaktuReview: "0 jam",
        tingkatPersetujuan: "0%",
        pengajuanMendesak: [],
      });
    }
  } else {
    /**
     * [DASHBOARD KARYAWAN - Data Dinamis]
     * Route dashboard karyawan sekarang fetch data dari API controller
     * Mengambil ringkasan kehadiran & pengajuan terbaru dari database
     */
    try {
      const dashboardPenggunaController = require("./controllers/dashboardPenggunaController");

      // Buat mock response untuk memanggil controller
      const mockRes = {
        json: function (data) {
          this.data = data;
        },
        status: function (code) {
          this.statusCode = code;
          return this;
        },
      };

      // Panggil controller function untuk ambil data dashboard
      await dashboardPenggunaController.ambilDataDashboardPengguna(
        req,
        mockRes
      );

      // Jika sukses, pass data ke view
      let dataDashboard = {
        ringkasan: {
          sisa_cuti: 0,
          kehadiran_bulan_ini: 0,
          menunggu_persetujuan: 0,
          tidak_hadir: 0,
        },
        pengajuan_terbaru: [],
      };

      if (mockRes.data && mockRes.data.success && mockRes.data.data) {
        dataDashboard = mockRes.data.data;
      }

      // Transform data untuk template
      const userDataWithStats = {
        ...req.session.user,
        sisaCuti: dataDashboard.ringkasan.sisa_cuti,
        kehadiranBulanIni: dataDashboard.ringkasan.kehadiran_bulan_ini,
        menungguPersetujuan: dataDashboard.ringkasan.menunggu_persetujuan,
        tidakHadir: dataDashboard.ringkasan.tidak_hadir,
        totalCuti: 12, // Default untuk display
        hariKerja: 20, // Default untuk display
      };

      // Render dashboard dengan data dinamis
      res.render("karyawan/dashboard", {
        title: "Dashboard Karyawan - NusaAttend",
        user: userDataWithStats,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        pengajuanTerbaru: dataDashboard.pengajuan_terbaru,
      });
    } catch (error) {
      console.error("Error loading dashboard karyawan data:", error);
      // Render dengan default values jika error
      res.render("karyawan/dashboard", {
        title: "Dashboard Karyawan - NusaAttend",
        user: {
          ...req.session.user,
          sisaCuti: 0,
          kehadiranBulanIni: 0,
          menungguPersetujuan: 0,
          tidakHadir: 0,
          totalCuti: 12,
          hariKerja: 20,
        },
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        pengajuanTerbaru: [],
      });
    }
  }
});

// ==================== RUTE PENGAJUAN (BERBASIS ROLE) ====================

// Halaman pengajuan - berbeda tampilan untuk admin, supervisor, dan karyawan
app.get("/pengajuan", middlewareAuntenfikasi, async (req, res) => {
  const role = req.session.user.role;

  if (role === "admin") {
    // Admin melihat manajemen karyawan
    res.render("admin/manajemen-karyawan", {
      title: "Manajemen Karyawan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "manajemen-karyawan",
    });
  } else if (role === "penanggung-jawab") {
    // Penanggung jawab melihat pengajuan untuk direview
    try {
      const Pengajuan = require("./models/Pengajuan");

      // Ambil semua pengajuan dengan status "menunggu" review
      const daftarPengajuan = await Pengajuan.find({ status: "menunggu" })
        .populate("karyawan_id", "nama_lengkap jabatan email")
        .sort({ dibuat_pada: -1 })
        .lean()
        .exec();

      // Transform data untuk frontend display
      const pengajuanFormatted = daftarPengajuan.map((pengajuan) => {
        const durasi = Math.ceil(
          (new Date(pengajuan.tanggal_selesai) -
            new Date(pengajuan.tanggal_mulai)) /
            (1000 * 60 * 60 * 24)
        );

        // Format tanggal untuk display
        const tanggalMulai = new Date(
          pengajuan.tanggal_mulai
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const tanggalSelesai = new Date(
          pengajuan.tanggal_selesai
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        const tanggalDiajukan = new Date(
          pengajuan.dibuat_pada
        ).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        return {
          _id: pengajuan._id,
          namaKaryawan: pengajuan.karyawan_id?.nama_lengkap || "Unknown",
          emailKaryawan: pengajuan.karyawan_id?.email || "Unknown",
          jabatanKaryawan: pengajuan.karyawan_id?.jabatan || "Unknown",
          jenisIzin: pengajuan.jenis_izin,
          periode: `${tanggalMulai} - ${tanggalSelesai}`,
          durasi: `${durasi} hari`,
          tanggalDiajukan: tanggalDiajukan,
          status: pengajuan.status,
          alasan: pengajuan.alasan,
        };
      });

      res.render("penanggung-jawab/review-pengajuan", {
        title: "Review Pengajuan - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "pengajuan",
        daftarPengajuan: pengajuanFormatted,
      });
    } catch (error) {
      console.error("Error loading review pengajuan:", error);
      res.render("penanggung-jawab/review-pengajuan", {
        title: "Review Pengajuan - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "pengajuan",
        daftarPengajuan: [],
      });
    }
  } else {
    // Karyawan melihat riwayat pengajuan mereka
    // Fetch data riwayat pengajuan dari controller
    try {
      const riwayatPengajuanController = require("./controllers/riwayatPengajuanController");

      // Buat mock request untuk memanggil controller
      const mockRes = {
        json: function (data) {
          // Simpan data untuk dipass ke template
          this.data = data;
        },
        status: function (code) {
          this.statusCode = code;
          return this;
        },
      };

      // Panggil controller function
      await riwayatPengajuanController.ambilRiwayatPengajuanPengguna(
        req,
        mockRes
      );

      // Jika sukses, pass data ke view
      let riwayatPengajuan = [];
      if (mockRes.data && mockRes.data.success && mockRes.data.data) {
        riwayatPengajuan = mockRes.data.data.riwayat_pengajuan || [];
      }

      res.render("karyawan/riwayat-pengajuan", {
        title: "Riwayat Pengajuan - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "riwayat-pengajuan",
        riwayatPengajuan: riwayatPengajuan,
      });
    } catch (error) {
      console.error("Error dalam route riwayat pengajuan:", error);

      // Jika error, render dengan data kosong
      res.render("karyawan/riwayat-pengajuan", {
        title: "Riwayat Pengajuan - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "riwayat-pengajuan",
        riwayatPengajuan: [],
      });
    }
  }
});

// ==================== RUTE KARYAWAN ====================

// Halaman buat pengajuan surat izin
app.get("/pengajuan/buat", middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;

  // Hanya karyawan yang bisa membuat pengajuan
  if (role !== "karyawan") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses untuk membuat pengajuan.",
    });
  }

  res.render("karyawan/surat-izin", {
    title: "Buat Surat Izin - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    halaman: "buat-pengajuan",
    socketToken: req.session.socketToken || "",
  });
});

// Rute Absensi
app.use("/absensi", absensiRoute);

// ==================== RUTE ADMIN ====================

// Halaman manajemen karyawan
app.get("/admin/karyawan", middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  // Hanya admin yang bisa mengakses manajemen karyawan
  if (role !== "admin") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman manajemen karyawan.",
    });
  }

  res.render("admin/manajemen-karyawan", {
    title: "Manajemen Karyawan - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    halaman: "karyawan",
  });
});
// ==================== RUTE PENANGGUNG JAWAB ====================

// Halaman manajemen karyawan
app.get("/rekap-kehadiran", middlewareAuntenfikasi, async(req, res) => {

  const role = req.session.user.role;
  // Hanya penanggung jawab yang bisa mengakses rekap kehadiran
  if (role !== "penanggung-jawab") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman rekap kehadiran.",
    });
  }


  /**
     * [REKAP KEHADIRAN PENANGGUNG JAWAB - Data Dinamis]
     */
    try {
      // Query data pengguna
      const Pengguna = require("./models/Pengguna");
      // Hitung dataAbsensi
      const dataKaryawanAbsensi = await Pengguna.aggregate([
        {
          $match:{
          penanggung_jawab_id : new mongoose.Types.ObjectId(req.session.userId)
          }
        },
        { 
          $lookup: { 
            from: "absensis", 
            localField: "_id", 
            foreignField: "id_pengguna", 
            as: "absensi" 
          } }, 
          { 
            $project: { 
              nama_lengkap:1,
              jabatan:1,
              sisa_cuti : 1,
              "absensi.status":1,
              "absensi.tanggal" : 1
            } }
      ])


      // Hitung hadir hari ini
      const hariIni = new Date();
      hariIni.setHours(0, 0, 0, 0);


      let hariIniHadir = 0;
      let hariIniIzin = 0;

      const hariSama = (h1, h2) =>
          h1.getFullYear() === h2.getFullYear() &&
          h1.getMonth() === h2.getMonth() &&
          h1.getDate() === h2.getDate();


      const dataKaryawanAbsensiTotal = dataKaryawanAbsensi.map(k=>{
        
        
          let izin = 0;
          let hadir = 0;
          let tidakHadir = 0;
          (k.absensi ?? []).forEach(a => {
            if (a.status === 'hadir') {
              hadir++;
              if (hariSama(a.tanggal, hariIni)) {
                hariIniHadir++;
              }
            } else if (a.status === 'izin') {
              izin++;
              if (hariSama(a.tanggal, hariIni)) {
                hariIniIzin++;
              }
            } else {
              tidakHadir++;
            }
            });

            const totalHari = hadir + izin + tidakHadir;
            const persentase = totalHari === 0 ? 0 : (hadir / totalHari) * 100;

        return {
          nama_lengkap : k.nama_lengkap,
          jabatan : k.jabatan,
          sisa_cuti : k.sisa_cuti,
          izin,
          hadir,
          tidakHadir,
          persentase
        }
      })

      const rataRataKehadiran =
          dataKaryawanAbsensiTotal.reduce((sum, k) => sum + k.persentase, 0) / dataKaryawanAbsensiTotal.length;

      const totalKaryawan = dataKaryawanAbsensiTotal.length;
      

    res.render("penanggung-jawab/rekap-kehadiran", {
    title: "Rekap Kehadiran - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    karyawan:dataKaryawanAbsensiTotal,
    rataRataKehadiran,
    totalKaryawan,
    hariIniHadir,
    hariIniIzin,
    halaman: "rekap-kehadiran",
  });
    } catch (error) {
    console.error("Error loading dashboard penanggung jawab data:", error);
    res.render("penanggung-jawab/rekap-kehadiran", {
    title: "Rekap Kehadiran - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    halaman: "rekap-kehadiran",
  });
    }

  
});


// ==================== HALAMAN MANAJEMEN PENANGGUNG JAWAB (SUPERVISOR) ====================

/**
 * [REFACTOR AKADEMIK]
 * Route untuk halaman manajemen penanggung jawab (supervisor)
 * Path: '/admin/penanggung-jawab'
 * Template: 'admin/manajemen-penanggung-jawab.hbs'
 */
app.get("/admin/penanggung-jawab", middlewareAuntenfikasi, async (req, res) => {
  const role = req.session.user.role;

  // Hanya admin yang bisa mengakses manajemen supervisor
  if (role !== "admin") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman manajemen supervisor.",
    });
  }

  try {
    // Fetch data supervisor dari database
    const Pengguna = require("./models/Pengguna");
    const dataSupervisor = await Pengguna.find({
      role: "penanggung-jawab",
    }).select("-password");

    // Hitung jumlah karyawan per supervisor
    const daftarSupervisor = await Promise.all(
      dataSupervisor.map(async (supervisor) => {
        const jumlahKaryawan = await Pengguna.countDocuments({
          penanggung_jawab_id: supervisor._id,
          role: "karyawan",
        });

        return {
          ...supervisor.toObject(),
          jumlahKaryawan: jumlahKaryawan,
          isAktif: supervisor.adalah_aktif,
        };
      })
    );

    res.render("admin/manajemen-penanggung-jawab", {
      title: "Manajemen Penanggung Jawab - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "supervisor",
      daftarSupervisor: daftarSupervisor,
      jumlahSupervisor: daftarSupervisor.length,
    });
  } catch (error) {
    console.error("Error loading supervisor data:", error);
    res.status(500).render("publik/404", {
      title: "Error - NusaAttend",
      message: "Terjadi kesalahan saat memuat data supervisor.",
    });
  }
});

// ==================== HALAMAN LAPORAN ADMIN ====================

// Halaman laporan admin
app.get("/admin/laporan", middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;

  // Hanya admin yang bisa mengakses laporan admin
  if (role !== "admin") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman laporan admin.",
    });
  }

  res.render("admin/laporan", {
    title: "Laporan - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    halaman: "laporan",
  });
});

// ==================== RUTE PENANGGUNG JAWAB ====================

// Halaman laporan penanggung jawab
app.get("/supervisor/laporan", middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;

  // Hanya penanggung jawab yang bisa mengakses laporan penanggung jawab
  if (role !== "penanggung-jawab") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman laporan penanggung jawab.",
    });
  }

  res.render("penanggung-jawab/laporan", {
    title: "Laporan Tim - NusaAttend",
    user: req.session.user,
    layout: "dashboard-layout",
    halaman: "laporan",
  });
});

// Halaman detail review pengajuan (khusus penanggung jawab)
app.get("/pengajuan/:id", middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  const { id } = req.params;

  // Karyawan dan penanggung jawab bisa melihat detail pengajuan
  if (role === "karyawan" || role === "penanggung-jawab") {
    res.render("employee/detail-pengajuan", {
      title: "Detail Pengajuan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "pengajuan",
    });
  } else if (role === "penanggung-jawab") {
    res.render("penanggung-jawab/detail-pengajuan", {
      title: "Detail Review Pengajuan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "pengajuan",
    });
  } else if (role === "admin") {
    res.render("admin/detail-pengajuan", {
      title: "Detail Pengajuan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "pengajuan",
    });
  } else {
    return res.status(403).render("404", {
      title: "Akses Ditolak - NusaAttend",
    });
  }
});

// ==================== HANDLER ERROR ====================

// Handler halaman tidak ditemukan (404)
app.use(penggantiTidakDitemukan);

// ==================== SOCKET.IO ====================

inisialisasiSocket(io);

// ==================== MIDDLEWARE ERROR ====================

app.use(penggantiKesalahan);

// ==================== STARTUP SERVER ====================

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`🚀 Server NusaAttend berjalan di port ${PORT}`);
  console.log(`🔗 http://localhost:${PORT}`);
  console.log(`📡 Socket.io siap`);
  console.log(`📁 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Handle graceful shutdown - matikan server dengan baik saat ada signal SIGTERM
process.on("SIGTERM", () => {
  console.log("Signal SIGTERM diterima: menutup HTTP server");
  server.close(() => {
    console.log("HTTP server tertutup");
    process.exit(0);
  });
});

module.exports = app;
