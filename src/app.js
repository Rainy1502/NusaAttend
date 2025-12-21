require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const socketIO = require('socket.io');
const MongoStore = require('connect-mongo');

// ==================== IMPORT KONFIGURASI ====================
const hubungkanDB = require('./config/database');
const inisialisasiSocket = require('./config/socket');

// ==================== IMPORT RUTE ====================
const rutAuntenfikasi = require('./routes/auth');
const rutAdminKaryawan = require('./routes/adminKaryawan');
/**
 * [REFACTOR AKADEMIK]
 * Mengubah import dari 'adminSupervisor' ke 'adminPenanggungJawab'
 * untuk konsistensi terminologi lintas sistem sesuai ketentuan dosen
 */
const rutAdminPenanggungJawab = require('./routes/adminPenanggungJawab');
/**
 * [FITUR BARU - Log Keberatan]
 * Router untuk API Keberatan Administratif
 * Menangani CRUD keberatan dan perubahan status
 */
const rutAdminKeberatan = require('./routes/adminKeberatan');
/**
 * [FITUR BARU - Dashboard Admin]
 * Router untuk API Dashboard Admin Sistem
 * Menangani pengambilan data ringkasan dan aktivitas terbaru (read-only)
 */
const rutDashboardAdmin = require('./routes/dashboardAdmin');
// const rutPengajuan = require('./routes/pengajuan'); // Di-backup
// const rutAbsensi = require('./routes/absensi');     // Di-backup
// const rutAdmin = require('./routes/admin');         // Di-backup
// const rutChatbot = require('./routes/chatbot');     // Di-backup

// ==================== IMPORT MIDDLEWARE ====================
const { penggantiKesalahan, penggantiTidakDitemukan } = require('./middleware/errorHandler');
const middlewareAuntenfikasi = require('./middleware/auth');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// ==================== KONEKSI DATABASE ====================
hubungkanDB();

// Simpan instance io untuk digunakan di controller
app.locals.io = io;

// ==================== MIDDLEWARE ====================

// Parser untuk JSON dan form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// File statis (CSS, JS, gambar)
app.use(express.static(path.join(__dirname, '../public')));

// Konfigurasi session dengan MongoDB store
const konfigurasiSession = {
  secret: process.env.SESSION_SECRET || 'your_session_secret',
  resave: false,
  saveUninitialized: true,
  store: new MongoStore({
    mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/nusaattend',
    touchAfter: 24 * 3600 // Update session setiap 24 jam
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // Masa berlaku 24 jam
  }
};

app.use(session(konfigurasiSession));

// ==================== VIEW ENGINE (HANDLEBARS) ====================
app.engine('hbs', require('express-handlebars').engine({
  extname: 'hbs',
  layoutsDir: path.join(__dirname, '../templates/partials'),  // Layouts berada di partials folder
  partialsDir: path.join(__dirname, '../templates/partials'),
  helpers: {
    // Bantu untuk format tanggal dengan lokal Indonesia
    format_date: function(date) {
      if (!date) return '';
      const d = new Date(date);
      return d.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    // Bantu untuk huruf besar pada kata
    capitalize: function(str) {
      if (!str) return '';
      return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    },
    // Bantu untuk cek kesamaan nilai
    eq: function(a, b) {
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
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));

// ==================== RUTE PUBLIK ====================

// Rute autentikasi
app.use('/api/auth', rutAuntenfikasi);

// Halaman home/landing - menampilkan informasi produk
// Halaman publik: tidak memerlukan autentikasi, ditampilkan dari folder publik
app.get('/home', (req, res) => {
  res.render('publik/home', { 
    title: 'Home - NusaAttend',
    layout: 'main'
  });
});

// Halaman utama - redirect ke dashboard atau login
// Halaman publik: jika sudah login redirect ke dashboard, jika belum tampilkan halaman home dari folder publik
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  // Jika belum login, tampilkan halaman home/landing page dari folder publik
  res.render('publik/home', { 
    title: 'Home - NusaAttend',
    layout: 'main'
  });
});

// Halaman login
// Halaman publik: menampilkan form login dari folder publik
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('publik/login', { 
    title: 'Login - NusaAttend',
    layout: false
  });
});

// Halaman register
app.get('/register', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', { title: 'Register - NusaAttend' });
});

// Rute logout (menangani form POST)
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).render('error', { 
        message: 'Logout gagal',
        error: err 
      });
    }
    res.redirect('/login');
  });
});

// ==================== RUTE TERLINDUNGI ====================
// Daftarkan router admin karyawan dengan middleware autentikasi
app.use('/api/admin', middlewareAuntenfikasi, rutAdminKaryawan);

/**
 * [REFACTOR AKADEMIK]
 * Mengubah variabel dari rutAdminSupervisor ke rutAdminPenanggungJawab
 * untuk konsistensi terminologi lintas sistem sesuai ketentuan dosen
 */
// Daftarkan router admin penanggung jawab dengan middleware autentikasi
app.use('/api/admin', middlewareAuntenfikasi, rutAdminPenanggungJawab);

/**
 * [FITUR BARU - Log Keberatan]
 * Daftarkan router keberatan administratif dengan middleware autentikasi
 * Endpoint: /api/admin/keberatan
 * Handler: keberatanController.js
 */
app.use('/api/admin', middlewareAuntenfikasi, rutAdminKeberatan);

/**
 * [FITUR BARU - Dashboard Admin]
 * Daftarkan router dashboard admin dengan middleware autentikasi
 * Endpoint: /api/admin/dashboard
 * Handler: dashboardAdminController.js
 * Sifat: Read-only (pengambilan data ringkasan dan aktivitas)
 */
app.use('/api/admin', middlewareAuntenfikasi, rutDashboardAdmin);

// app.use('/api/pengajuan', middlewareAuntenfikasi, rutPengajuan); // Di-backup
// app.use('/api/absensi', middlewareAuntenfikasi, rutAbsensi);     // Di-backup
// app.use('/api/chatbot', rutChatbot);                             // Di-backup
// app.use('/api/admin', middlewareAuntenfikasi, rutAdmin);         // Di-backup

// Halaman chatbot
app.get('/chatbot', (req, res) => {
  res.render('chatbot', { title: 'Chatbot Bantuan - NusaAttend' });
});

// ==================== DASHBOARD (BERBASIS ROLE) ====================
// Rute dashboard dengan redirect berdasarkan role pengguna
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const role = req.session.user.role;
  if (role === 'admin') {
    /**
     * [FITUR BARU - Data Dinamis]
     * Route dashboard admin sekarang fetch data dari API controller
     * Mengambil ringkasan & aktivitas terbaru dari database
     */
    try {
      // Query data dashboard dari controller langsung (bypass API call)
      const User = require('./models/User');
      
      // Hitung ringkasan
      const totalKaryawan = await User.countDocuments({ role: 'karyawan' });
      const totalPenanggungJawab = await User.countDocuments({ role: 'penanggung-jawab' });
      const totalAkunAktif = await User.countDocuments({ adalah_aktif: true });
      
      // Hitung aktivitas hari ini
      const hariIniMulai = new Date();
      hariIniMulai.setHours(0, 0, 0, 0);
      const hariIniAkhir = new Date();
      hariIniAkhir.setHours(23, 59, 59, 999);
      
      const totalAktivitasHariIni = await User.countDocuments({
        $or: [
          { createdAt: { $gte: hariIniMulai, $lte: hariIniAkhir } },
          { updatedAt: { $gte: hariIniMulai, $lte: hariIniAkhir } }
        ]
      });
      
      // Ambil 5 aktivitas terbaru
      const daftarUserTerbaru = await User.find()
        .select('nama_lengkap jabatan email role adalah_aktif createdAt updatedAt')
        .sort({ updatedAt: -1 })
        .limit(5)
        .lean();
      
      // Transform ke format aktivitas
      const aktivitasTerbaru = daftarUserTerbaru.map(user => {
        const isNew = hariIniMulai <= user.createdAt && user.createdAt <= hariIniAkhir;
        
        let deskripsi = '';
        if (user.role === 'karyawan') {
          deskripsi = isNew ? 'Akun karyawan baru dibuat' : 'Data karyawan diperbarui';
        } else if (user.role === 'penanggung-jawab') {
          deskripsi = isNew ? 'Penanggung jawab ditambahkan' : 'Data penanggung jawab diperbarui';
        } else if (user.role === 'admin') {
          deskripsi = isNew ? 'Admin sistem ditambahkan' : 'Data admin diperbarui';
        }
        
        const waktuSekarang = new Date();
        const selisihMs = waktuSekarang - user.updatedAt;
        const selisihDetik = Math.floor(selisihMs / 1000);
        const selisihMenit = Math.floor(selisihDetik / 60);
        const selisihJam = Math.floor(selisihMenit / 60);
        const selisihHari = Math.floor(selisihJam / 24);
        
        let waktuRelatif = '';
        if (selisihDetik < 60) {
          waktuRelatif = 'Baru saja';
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
          waktu_relatif: waktuRelatif
        };
      });
      
      res.render('admin/dashboard', { 
        title: 'Dashboard Admin - NusaAttend',
        user: req.session.user,
        layout: 'dashboard-layout',
        halaman: 'dashboard',
        // Data ringkasan
        totalKaryawan: totalKaryawan,
        totalPenanggungJawab: totalPenanggungJawab,
        totalAkunAktif: totalAkunAktif,
        totalAktivitasHariIni: totalAktivitasHariIni,
        // Data aktivitas
        aktivitasTerbaru: aktivitasTerbaru
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      res.render('admin/dashboard', { 
        title: 'Dashboard Admin - NusaAttend',
        user: req.session.user,
        layout: 'dashboard-layout',
        halaman: 'dashboard',
        totalKaryawan: 0,
        totalPenanggungJawab: 0,
        totalAkunAktif: 0,
        totalAktivitasHariIni: 0,
        aktivitasTerbaru: []
      });
    }
  } else if (role === 'penanggung-jawab') {
    res.render('supervisor/dashboard', { 
      title: 'Dashboard Penanggung Jawab - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'dashboard'
    });
  } else {
    res.render('karyawan/dashboard', { 
      title: 'Dashboard Karyawan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'dashboard'
    });
  }
});

// ==================== RUTE PENGAJUAN (BERBASIS ROLE) ====================

// Halaman pengajuan - berbeda tampilan untuk admin, supervisor, dan karyawan
app.get('/pengajuan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  if (role === 'admin') {
    // Admin melihat manajemen karyawan
    res.render('admin/manajemen-karyawan', { 
      title: 'Manajemen Karyawan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'manajemen-karyawan'
    });
  } else if (role === 'penanggung-jawab') {
    // Penanggung jawab melihat pengajuan untuk direview
    res.render('supervisor/pengajuan', { 
      title: 'Review Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else {
    // Karyawan melihat riwayat pengajuan mereka
    res.render('employee/pengajuan', { 
      title: 'Riwayat Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'riwayat-pengajuan'
    });
  }
});

// ==================== RUTE KARYAWAN ====================

// Halaman buat pengajuan surat izin
app.get('/pengajuan/buat', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya karyawan yang bisa membuat pengajuan
  if (role !== 'karyawan') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses untuk membuat pengajuan.'
    });
  }
  
  res.render('employee/buat-pengajuan', { 
    title: 'Buat Surat Izin - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'buat-pengajuan'
  });
});

// Halaman absensi
app.get('/absensi', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya karyawan yang bisa mengakses absensi
  if (role !== 'karyawan') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman absensi.'
    });
  }
  
  res.render('employee/absensi', { 
    title: 'Absensi - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'absensi'
  });
});


// ==================== RUTE ADMIN ====================

// Halaman manajemen karyawan
app.get('/admin/karyawan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya admin yang bisa mengakses manajemen karyawan
  if (role !== 'admin') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman manajemen karyawan.'
    });
  }
  
  res.render('admin/manajemen-karyawan', { 
    title: 'Manajemen Karyawan - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'karyawan'
  });
});

// ==================== HALAMAN MANAJEMEN PENANGGUNG JAWAB (SUPERVISOR) ====================

/**
 * [REFACTOR AKADEMIK]
 * Route untuk halaman manajemen penanggung jawab (supervisor)
 * Path: '/admin/penanggung-jawab'
 * Template: 'admin/manajemen-penanggung-jawab.hbs'
 */
app.get('/admin/penanggung-jawab', middlewareAuntenfikasi, async (req, res) => {
  const role = req.session.user.role;
  
  // Hanya admin yang bisa mengakses manajemen supervisor
  if (role !== 'admin') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman manajemen supervisor.'
    });
  }
  
  try {
    // Fetch data supervisor dari database
    const User = require('./models/User');
    const dataSupervisor = await User.find({ role: 'penanggung-jawab' }).select('-password');
    
    // Hitung jumlah karyawan per supervisor
    const daftarSupervisor = await Promise.all(
      dataSupervisor.map(async (supervisor) => {
        const jumlahKaryawan = await User.countDocuments({
          penanggung_jawab_id: supervisor._id,
          role: 'karyawan'
        });
        
        return {
          ...supervisor.toObject(),
          jumlahKaryawan: jumlahKaryawan,
          isAktif: supervisor.adalah_aktif
        };
      })
    );
    
    res.render('admin/manajemen-penanggung-jawab', { 
      title: 'Manajemen Penanggung Jawab - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'supervisor',
      daftarSupervisor: daftarSupervisor,
      jumlahSupervisor: daftarSupervisor.length
    });
  } catch (error) {
    console.error('Error loading supervisor data:', error);
    res.status(500).render('publik/404', {
      title: 'Error - NusaAttend',
      message: 'Terjadi kesalahan saat memuat data supervisor.'
    });
  }
});

// ==================== HALAMAN LAPORAN ADMIN ====================

// Halaman laporan admin
app.get('/admin/laporan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya admin yang bisa mengakses laporan admin
  if (role !== 'admin') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman laporan admin.'
    });
  }
  
  res.render('admin/laporan', { 
    title: 'Laporan - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'laporan'
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
app.get('/admin/log-keberatan', middlewareAuntenfikasi, async (req, res) => {
  const role = req.session.user.role;
  
  /**
   * Validasi akses: Hanya admin yang bisa melihat log keberatan
   */
  if (role !== 'admin') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman log keberatan.'
    });
  }
  
  try {
    /**
     * Query data keberatan dari database
     * Populate data pengaju dan penanggung jawab untuk menampilkan nama lengkap
     */
    const Keberatan = require('./models/Keberatan');
    const daftarKeberatan = await Keberatan.find()
      .populate('pengaju', 'nama_lengkap jabatan')
      .populate('penanggung_jawab', 'nama_lengkap')
      .sort({ tanggal_pengajuan: -1 })
      .lean();

    /**
     * Transform data untuk frontend
     * Normalize nama field dari database ke template variable
     */
    const keberatanFormatted = daftarKeberatan.map(keberatan => ({
      _id: keberatan._id,
      namaKaryawan: keberatan.pengaju?.nama_lengkap || 'Tidak diketahui',
      departemenKaryawan: keberatan.pengaju?.jabatan || 'Tidak diketahui',
      jenisKeberatan: keberatan.jenis_keberatan,
      tanggalMulai: keberatan.tanggal_pengajuan?.toLocaleDateString('id-ID'),
      tanggalSelesai: keberatan.tanggal_pembaruan?.toLocaleDateString('id-ID'),
      namaPenanggungJawab: keberatan.penanggung_jawab?.nama_lengkap || 'Menunggu',
      tanggalDiajukan: keberatan.tanggal_pengajuan?.toLocaleDateString('id-ID'),
      status: keberatan.status_keberatan,
      tanggalDisetujui: keberatan.tanggal_pembaruan?.toLocaleDateString('id-ID'),
      tanggalDitolak: keberatan.tanggal_pembaruan?.toLocaleDateString('id-ID')
    }));

    /**
     * Hitung statistik keberatan per status
     */
    const statistik = {
      jumlahTotalKeberatan: daftarKeberatan.length,
      jumlahMenunggu: daftarKeberatan.filter(k => k.status_keberatan === 'menunggu').length,
      jumlahDisetujui: daftarKeberatan.filter(k => k.status_keberatan === 'selesai').length,
      jumlahDitolak: 0 // Dapat diupdate jika ada field status detail (disetujui/ditolak)
    };

    /**
     * Render halaman log keberatan dengan data
     */
    res.render('admin/log-keberatan', { 
      title: 'Log Keberatan Administratif - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'log-keberatan',
      daftarKeberatan: keberatanFormatted,
      jumlahTotalKeberatan: statistik.jumlahTotalKeberatan,
      jumlahMenunggu: statistik.jumlahMenunggu,
      jumlahDisetujui: statistik.jumlahDisetujui,
      jumlahDitolak: statistik.jumlahDitolak
    });
  } catch (error) {
    console.error('Error loading log keberatan:', error);
    res.status(500).render('publik/404', {
      title: 'Error - NusaAttend',
      message: 'Terjadi kesalahan saat memuat log keberatan.'
    });
  }
});

// ==================== RUTE PENANGGUNG JAWAB ====================

// Halaman laporan penanggung jawab
app.get('/supervisor/laporan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya penanggung jawab yang bisa mengakses laporan penanggung jawab
  if (role !== 'penanggung-jawab') {
    return res.status(403).render('publik/404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman laporan penanggung jawab.'
    });
  }
  
  res.render('supervisor/laporan', { 
    title: 'Laporan Tim - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'laporan'
  });
});

// Halaman detail review pengajuan (khusus penanggung jawab)
app.get('/pengajuan/:id', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  const { id } = req.params;
  
  // Karyawan dan penanggung jawab bisa melihat detail pengajuan
  if (role === 'karyawan' || role === 'penanggung-jawab') {
    res.render('employee/detail-pengajuan', { 
      title: 'Detail Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else if (role === 'penanggung-jawab') {
    res.render('supervisor/detail-pengajuan', { 
      title: 'Detail Review Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else if (role === 'admin') {
    res.render('admin/detail-pengajuan', { 
      title: 'Detail Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else {
    return res.status(403).render('404', {
      title: 'Akses Ditolak - NusaAttend'
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
  console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown - matikan server dengan baik saat ada signal SIGTERM
process.on('SIGTERM', () => {
  console.log('Signal SIGTERM diterima: menutup HTTP server');
  server.close(() => {
    console.log('HTTP server tertutup');
    process.exit(0);
  });
});

module.exports = app;
