require("dotenv").config();



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
 * [FITUR BARU - Log Keberatan]
 * Router untuk API Keberatan Administratif
 * Menangani CRUD keberatan dan perubahan status
 */
const rutAdminKeberatan = require("./routes/adminKeberatan");
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
const rutPengajuan = require('./routes/pengajuan');

/**
 * [FITUR BARU - Riwayat Pengajuan]
 * Router untuk API Riwayat Pengajuan Karyawan
 * Menangani pengambilan data riwayat pengajuan surat izin (READ-ONLY)
*/
const rutRiwayatPengajuan = require('./routes/riwayatPengajuan');
// const rutAbsensi = require('./routes/absensi');     // Di-backup
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
      capitalize: function(str) {
        if (!str) return '';
        return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      },
      // Bantu untuk cek kesamaan nilai (support inline dan block)
      eq: function(a, b, options) {
        // Jika digunakan sebagai block helper: {{#eq a b}}...{{/eq}}
        if (options && options.fn) {
          if (a === b) {
            return options.fn(this);
          } else if (options.inverse) {
            return options.inverse(this);
          }
          return '';
        }
        // Jika digunakan sebagai inline helper: {{#if (eq a b)}}...{{/if}}
        return a === b;
      },
      // Bantu untuk kondisi OR (multiple conditions)
      or: function(...args) {
        return args.slice(0, -1).some(arg => arg);
      },
      // Bantu untuk cek halaman aktif di menu
      isActive: function(page, currentPage) {
        return page === currentPage ? 'active' : '';
      },
      // Bantu untuk format tanggal (alias untuk format_date)
      formatTanggal: function(date, locale = 'id') {
        if (!date) return '';
        const d = new Date(date);
        if (locale === 'id') {
          return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
        }
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      },
      // Bantu untuk switch-case logic dalam templates
      switch: function(value, options) {
        this._switch_value_ = value;
        const html = options.fn(this);
        delete this._switch_value_;
        return html;
      },
      // Bantu untuk case dalam switch statement
      case: function(value, options) {
        if (value == this._switch_value_) {
          return options.fn(this);
        }
      },
      // Bantu untuk default case dalam switch statement
      default: function(options) {
        if (this._switch_value_ === undefined) {
          return options.fn(this);
        }
      }
    }
  })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));

// ==================== RUTE PUBLIK ====================

// Rute autentikasi
app.use("/api/auth", rutAuntenfikasi);

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
 * [FITUR BARU - Log Keberatan]
 * Daftarkan router keberatan administratif dengan middleware autentikasi
 * Endpoint: /api/admin/keberatan
 * Handler: keberatanController.js
 */
app.use("/api/admin", middlewareAuntenfikasi, rutAdminKeberatan);

/**
 * [FITUR BARU - Dashboard Admin]
 * Daftarkan router dashboard admin dengan middleware autentikasi
 * Endpoint: /api/admin/dashboard
 * Handler: dashboardAdminController.js
 * Sifat: Read-only (pengambilan data ringkasan dan aktivitas)
 */
app.use("/api/admin", middlewareAuntenfikasi, rutDashboardAdmin);

/**
 * [FITUR BARU - Dashboard Penanggung Jawab]
 * Daftarkan router dashboard penanggung jawab dengan middleware autentikasi
 * Endpoint: /api/penanggung-jawab/dashboard
 * Handler: dashboardPenanggungJawabController.js
 * Sifat: Read-only (pengambilan data ringkasan dan aktivitas tim)
 */
app.use(
  "/api/penanggung-jawab",
  middlewareAuntenfikasi,
  rutDashboardPenanggungJawab
);

/**
 * [FITUR BARU - Review Pengajuan]
 * Daftarkan router review pengajuan dengan middleware autentikasi
 * Endpoint: /api/penanggung-jawab/review-pengajuan
 * Handler: reviewPengajuanController.js
 * Sifat: Read-only (pengambilan daftar pengajuan yang menunggu review)
 */
app.use("/api/penanggung-jawab", middlewareAuntenfikasi, rutReviewPengajuan);

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
app.use('/api/karyawan', middlewareAuntenfikasi, rutPengajuan);

/**
 * [FITUR BARU - Riwayat Pengajuan]
 * Daftarkan router riwayat pengajuan dengan middleware autentikasi
 * Endpoint: /api/pengguna/riwayat-pengajuan
 * Handler: riwayatPengajuanController.js
 * Sifat: READ-ONLY (hanya mengambil data riwayat, tidak mengubah apapun)
 * Akses: Karyawan yang sudah ter-autentikasi
 * Catatan: Endpoint ini bersifat informatif & administratif saja
*/
app.use('/api/pengguna', middlewareAuntenfikasi, rutRiwayatPengajuan);
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

      // Transform ke format pengajuan mendesak untuk dashboard penanggung jawab
      const pengajuanMendesak = daftarUserTerbaru.map((user) => {
        const isNew =
          hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;

        // Tentukan jenis pengajuan berdasarkan role user
        let jenisPengajuan = "";
        if (user.role === "karyawan") {
          jenisPengajuan = isNew
            ? "Pendaftaran Karyawan Baru"
            : "Update Data Karyawan";
        } else if (user.role === "penanggung-jawab") {
          jenisPengajuan = isNew
            ? "Penambahan Penanggung Jawab"
            : "Update Penanggung Jawab";
        } else if (user.role === "admin") {
          jenisPengajuan = "Update Admin Sistem";
        }

        // Format tanggal pengajuan
        const tanggalPengajuan = user.updatedAt.toLocaleDateString("id-ID", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });

        // Hitung waktu relatif
        const waktuSekarang = new Date();
        const selisihMs = waktuSekarang - user.updatedAt;
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

        return {
          namaKaryawan: user.nama_lengkap,
          jenisPengajuan: jenisPengajuan,
          tanggalPengajuan: tanggalPengajuan,
          waktuPengajuan: waktuPengajuan,
        };
      });

      res.render("penanggung-jawab/dashboard", {
        title: "Dashboard Penanggung Jawab - NusaAttend",
        user: req.session.user,
        layout: "dashboard-layout",
        halaman: "dashboard",
        socketToken: req.session.socketToken || "",
        // Data ringkasan - mapping ke frontend variables
        jumlahMenungguReview: totalAktivitasHariIni,
        jumlahDisetujuiBulanIni: totalKaryawan,
        jumlahDitolakBulanIni: totalPenanggungJawab,
        totalKaryawanTim: totalAkunAktif,
        // Badge notification untuk sidebar
        totalKeberatan: 2,
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
        totalKeberatan: 0,
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
    console.log(
      "📍 Karyawan Dashboard - Session socketToken:",
      req.session.socketToken ? "SET ✓" : "NOT SET ✗"
    );
    console.log(
      "📍 Karyawan Dashboard - Full Session:",
      JSON.stringify({
        socketToken: req.session.socketToken,
        userId: req.session.userId,
      })
    );
    res.render("karyawan/dashboard", {
      title: "Dashboard Karyawan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "dashboard",
      socketToken: req.session.socketToken || "",
    });
  }
});

// ==================== RUTE PENGAJUAN (BERBASIS ROLE) ====================

// Halaman pengajuan - berbeda tampilan untuk admin, supervisor, dan karyawan
app.get('/pengajuan', middlewareAuntenfikasi, async (req, res) => {
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
    res.render("penanggung-jawab/review-pengajuan", {
      title: "Review Pengajuan - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "pengajuan",
    });
  } else {
    // Karyawan melihat riwayat pengajuan mereka
    // Fetch data riwayat pengajuan dari controller
    try {
      const riwayatPengajuanController = require('./controllers/riwayatPengajuanController');
      
      // Buat mock request untuk memanggil controller
      const mockRes = {
        json: function(data) {
          // Simpan data untuk dipass ke template
          this.data = data;
        },
        status: function(code) {
          this.statusCode = code;
          return this;
        }
      };

      // Panggil controller function
      await riwayatPengajuanController.ambilRiwayatPengajuanPengguna(req, mockRes);

      // Jika sukses, pass data ke view
      let riwayatPengajuan = [];
      if (mockRes.data && mockRes.data.success && mockRes.data.data) {
        riwayatPengajuan = mockRes.data.data.riwayat_pengajuan || [];
      }

      res.render('karyawan/riwayat-pengajuan', { 
        title: 'Riwayat Pengajuan - NusaAttend',
        user: req.session.user,
        layout: 'dashboard-layout',
        halaman: 'riwayat-pengajuan',
        riwayatPengajuan: riwayatPengajuan
      });
    } catch (error) {
      console.error('Error dalam route riwayat pengajuan:', error);
      
      // Jika error, render dengan data kosong
      res.render('karyawan/riwayat-pengajuan', { 
        title: 'Riwayat Pengajuan - NusaAttend',
        user: req.session.user,
        layout: 'dashboard-layout',
        halaman: 'riwayat-pengajuan',
        riwayatPengajuan: []
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
    socketToken: req.session.socketToken || ""
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

// ==================== HALAMAN LOG KEBERATAN ADMINISTRATIF ====================

/**
 * [FITUR BARU]
 * Route untuk halaman Log Keberatan Administratif
 * Path: '/admin/log-keberatan'
 * Template: 'admin/log-keberatan.hbs'
 * Fitur: Admin dapat memonitor semua keberatan yang diajukan (view-only)
 */
app.get("/admin/log-keberatan", middlewareAuntenfikasi, async (req, res) => {
  const role = req.session.user.role;

  /**
   * Validasi akses: Hanya admin yang bisa melihat log keberatan
   */
  if (role !== "admin") {
    return res.status(403).render("publik/404", {
      title: "Akses Ditolak - NusaAttend",
      message: "Anda tidak memiliki akses ke halaman log keberatan.",
    });
  }

  try {
    /**
     * Query data keberatan dari database
     * Populate data pengaju dan penanggung jawab untuk menampilkan nama lengkap
     */
    const Keberatan = require("./models/Keberatan");
    const daftarKeberatan = await Keberatan.find()
      .populate("pengaju", "nama_lengkap jabatan")
      .populate("penanggung_jawab", "nama_lengkap")
      .sort({ tanggal_pengajuan: -1 })
      .lean();

    /**
     * Transform data untuk frontend
     * Normalize nama field dari database ke template variable
     */
    const keberatanFormatted = daftarKeberatan.map((keberatan) => ({
      _id: keberatan._id,
      namaKaryawan: keberatan.pengaju?.nama_lengkap || "Tidak diketahui",
      departemenKaryawan: keberatan.pengaju?.jabatan || "Tidak diketahui",
      jenisKeberatan: keberatan.jenis_keberatan,
      tanggalMulai: keberatan.tanggal_pengajuan?.toLocaleDateString("id-ID"),
      tanggalSelesai: keberatan.tanggal_pembaruan?.toLocaleDateString("id-ID"),
      namaPenanggungJawab:
        keberatan.penanggung_jawab?.nama_lengkap || "Menunggu",
      tanggalDiajukan: keberatan.tanggal_pengajuan?.toLocaleDateString("id-ID"),
      status: keberatan.status_keberatan,
      tanggalDisetujui:
        keberatan.tanggal_pembaruan?.toLocaleDateString("id-ID"),
      tanggalDitolak: keberatan.tanggal_pembaruan?.toLocaleDateString("id-ID"),
    }));

    /**
     * Hitung statistik keberatan per status
     */
    const statistik = {
      jumlahTotalKeberatan: daftarKeberatan.length,
      jumlahMenunggu: daftarKeberatan.filter(
        (k) => k.status_keberatan === "menunggu"
      ).length,
      jumlahDisetujui: daftarKeberatan.filter(
        (k) => k.status_keberatan === "selesai"
      ).length,
      jumlahDitolak: 0, // Dapat diupdate jika ada field status detail (disetujui/ditolak)
    };

    /**
     * Render halaman log keberatan dengan data
     */
    res.render("admin/log-keberatan", {
      title: "Log Keberatan Administratif - NusaAttend",
      user: req.session.user,
      layout: "dashboard-layout",
      halaman: "log-keberatan",
      daftarKeberatan: keberatanFormatted,
      jumlahTotalKeberatan: statistik.jumlahTotalKeberatan,
      jumlahMenunggu: statistik.jumlahMenunggu,
      jumlahDisetujui: statistik.jumlahDisetujui,
      jumlahDitolak: statistik.jumlahDitolak,
    });
  } catch (error) {
    console.error("Error loading log keberatan:", error);
    res.status(500).render("publik/404", {
      title: "Error - NusaAttend",
      message: "Terjadi kesalahan saat memuat log keberatan.",
    });
  }
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
