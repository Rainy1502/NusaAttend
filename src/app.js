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
    }
  }
}));
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, '../templates/views'));

// ==================== RUTE PUBLIK ====================

// Rute autentikasi
app.use('/api/auth', rutAuntenfikasi);

// Halaman utama - redirect ke dashboard atau login
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.redirect('/login');
});

// Halaman login
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('login', { 
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
app.get('/dashboard', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }

  const role = req.session.user.role;
  if (role === 'admin') {
    res.render('admin/dashboard', { 
      title: 'Dashboard Admin - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'dashboard'
    });
  } else if (role === 'supervisor') {
    res.render('supervisor/dashboard', { 
      title: 'Dashboard Supervisor - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'dashboard'
    });
  } else {
    res.render('employee/dashboard', { 
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
    // Admin melihat semua pengajuan yang diajukan oleh karyawan
    res.render('admin/pengajuan', { 
      title: 'Manajemen Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else if (role === 'supervisor') {
    // Supervisor melihat pengajuan untuk direview
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
  if (role !== 'employee' && role !== 'karyawan') {
    return res.status(403).render('404', {
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
  if (role !== 'employee' && role !== 'karyawan') {
    return res.status(403).render('404', {
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
    return res.status(403).render('404', {
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

// Halaman laporan admin
app.get('/admin/laporan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya admin yang bisa mengakses laporan admin
  if (role !== 'admin') {
    return res.status(403).render('404', {
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

// ==================== RUTE SUPERVISOR ====================

// Halaman laporan supervisor
app.get('/supervisor/laporan', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  
  // Hanya supervisor yang bisa mengakses laporan supervisor
  if (role !== 'supervisor') {
    return res.status(403).render('404', {
      title: 'Akses Ditolak - NusaAttend',
      message: 'Anda tidak memiliki akses ke halaman laporan supervisor.'
    });
  }
  
  res.render('supervisor/laporan', { 
    title: 'Laporan Tim - NusaAttend',
    user: req.session.user,
    layout: 'dashboard-layout',
    halaman: 'laporan'
  });
});

// Halaman detail review pengajuan (khusus supervisor)
app.get('/pengajuan/:id', middlewareAuntenfikasi, (req, res) => {
  const role = req.session.user.role;
  const { id } = req.params;
  
  // Karyawan dan supervisor bisa melihat detail pengajuan
  if (role === 'employee' || role === 'karyawan') {
    res.render('employee/detail-pengajuan', { 
      title: 'Detail Pengajuan - NusaAttend',
      user: req.session.user,
      layout: 'dashboard-layout',
      halaman: 'pengajuan'
    });
  } else if (role === 'supervisor') {
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
