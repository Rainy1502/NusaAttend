# DOKUMENTASI DASHBOARD-LAYOUT.HBS

**File**: `templates/dashboard-layout.hbs`
**Tujuan**: Layout master untuk semua halaman dashboard dengan sidebar navigasi
**Digunakan untuk**: Admin, Supervisor, Karyawan (role-based)
**Tanggal Dibuat**: 18 Desember 2025

---

## A. OVERVIEW

`dashboard-layout.hbs` adalah layout Handlebars yang menyediakan struktur dashboard dengan:
- **Sidebar Navigation** di sebelah kiri
- **Main Content Area** di tengah/kanan
- **Footer** di bagian bawah
- **Role-based Menu** (menu berubah sesuai role user)

---

## B. STRUKTUR HTML

```
<!DOCTYPE html>
<html>
  <head>
    - Meta tags
    - CSS (styles.css)
    - Font Awesome
  </head>
  
  <body>
    
    <div class="dashboard-layout">
      
      <!-- SIDEBAR -->
      <aside class="sidebar">
        - Logo & Branding
        - User Info (role, name, status)
        - Navigation Menu (role-based)
        - Logout Button
      </aside>
      
      <!-- MAIN CONTENT -->
      <main class="main-content">
        {{{body}}}  <!-- View content di-render di sini -->
      </main>
      
    </div>
    
    <!-- FOOTER -->
    <footer class="dashboard-footer">
      - Copyright info
    </footer>
    
    <!-- Scripts -->
    - Socket.io
    - app.js
    
  </body>
</html>
```

---

## C. KOMPONEN UTAMA

### C.1 Sidebar Header
```handlebars
<div class="sidebar-header">
  <div class="sidebar-logo">
    <i class="fas fa-calendar-check"></i>
  </div>
  <h1 class="sidebar-title">NusaAttend</h1>
</div>
```
- **Logo**: Icon calendar-check dari Font Awesome
- **Title**: "NusaAttend"
- **Styling**: `.sidebar-header`, `.sidebar-logo`, `.sidebar-title`

### C.2 User Info
```handlebars
<div class="sidebar-user">
  <p class="user-role">{{role}}</p>
  <p class="user-name">{{nama}}</p>
  <div class="user-status">
    <span class="status-badge-sidebar">{{statusBadge}}</span>
  </div>
</div>
```
- Menampilkan role user
- Menampilkan nama user
- Badge status (aktif/nonaktif)

### C.3 Navigation Menu (Role-Based)
Menu berubah sesuai role user:

**Admin Sistem**:
- Dashboard
- Manajemen Karyawan
- Manajemen Penanggung Jawab
- Log Keberatan

**Supervisor**:
- Dashboard
- Log Keberatan

**Karyawan**:
- Dashboard
- Pengajuan Saya
- Absensi

### C.4 Menu Item Active State
```handlebars
{{#if (eq halaman 'dashboard')}}
  <a href="/admin/dashboard" class="menu-item active">
    ...
  </a>
{{else}}
  <a href="/admin/dashboard" class="menu-item">
    ...
  </a>
{{/if}}
```
- Menggunakan conditional `eq` (equals) helper
- Class `active` ditambahkan jika halaman sama
- Helper ini sudah didefinisikan di `src/app.js`

### C.5 Logout Button
```handlebars
<form action="/logout" method="POST">
  <button type="submit" class="logout-btn">
    <i class="fas fa-sign-out-alt"></i>
    <span>Keluar</span>
  </button>
</form>
```
- Form POST ke `/logout`
- Tombol dengan icon dan text

### C.6 Main Content Area
```handlebars
<main class="main-content">
  {{{body}}}
</main>
```
- Triple braces `{{{` untuk render HTML tanpa escape
- View content di-render di sini

---

## D. DATA CONTEXT (DARI CONTROLLER)

Controller harus pass data context ke dashboard-layout:

```javascript
res.render('admin/dashboard', {
  title: 'Dashboard Admin - NusaAttend',
  layout: 'dashboard-layout',
  
  // Data untuk sidebar
  role: 'Admin Sistem',           // Role user
  nama: 'Ahmad Wijaya',            // Nama user
  statusBadge: 'Admin Sistem',    // Badge text
  halaman: 'dashboard',            // Current page (untuk active state)
  
  // Data lainnya untuk view
  user: req.session.user,
  ...
});
```

### D.1 Data Wajib
- `role`: String (Admin Sistem, Supervisor, Karyawan)
- `nama`: String (nama lengkap user)
- `statusBadge`: String (teks badge status)
- `halaman`: String (nama halaman aktif: 'dashboard', 'manajemen-karyawan', dll)

### D.2 Data Opsional
- Semua data yang dibutuhkan view bisa ditambahkan

---

## E. ROUTES YANG MENGGUNAKAN LAYOUT INI

### E.1 Admin Routes
```javascript
app.get('/admin/dashboard', (req, res) => {
  res.render('admin/dashboard', {
    layout: 'dashboard-layout',
    halaman: 'dashboard',
    role: 'Admin Sistem',
    nama: req.session.user.namaLengkap,
    statusBadge: 'Admin Sistem'
  });
});

app.get('/admin/manajemen-karyawan', (req, res) => {
  res.render('admin/manajemen-karyawan', {
    layout: 'dashboard-layout',
    halaman: 'manajemen-karyawan',
    role: 'Admin Sistem',
    nama: req.session.user.namaLengkap,
    statusBadge: 'Admin Sistem',
    ...
  });
});
```

### E.2 Supervisor Routes
```javascript
app.get('/supervisor/dashboard', (req, res) => {
  res.render('supervisor/dashboard', {
    layout: 'dashboard-layout',
    halaman: 'dashboard',
    role: 'Supervisor',
    nama: req.session.user.namaLengkap,
    statusBadge: 'Supervisor'
  });
});
```

### E.3 Employee Routes
```javascript
app.get('/employee/dashboard', (req, res) => {
  res.render('employee/dashboard', {
    layout: 'dashboard-layout',
    halaman: 'dashboard',
    role: 'Karyawan',
    nama: req.session.user.namaLengkap,
    statusBadge: 'Karyawan'
  });
});
```

---

## F. CSS CLASSES

### F.1 Layout Structure
- `.dashboard-layout` - Container utama (flex row)
- `.sidebar` - Sidebar container (flex column)
- `.main-content` - Main content area (flex grow)
- `.dashboard-footer` - Footer element

### F.2 Sidebar Components
- `.sidebar-header` - Header sidebar
- `.sidebar-logo` - Logo container
- `.sidebar-title` - Title "NusaAttend"
- `.sidebar-user` - User info section
- `.user-role` - User role text
- `.user-name` - User name text
- `.user-status` - Status badge container
- `.status-badge-sidebar` - Status badge

### F.3 Navigation Menu
- `.sidebar-menu` - Menu container (flex column)
- `.menu-item` - Individual menu item
- `.menu-item.active` - Active menu item
- `.menu-item i` - Icon inside menu item
- `.menu-item span` - Text inside menu item

### F.4 Sidebar Footer
- `.sidebar-footer` - Footer section
- `.logout-btn` - Logout button

---

## G. HANDLEBARS HELPERS YANG DIGUNAKAN

### G.1 `eq` (Equals)
```handlebars
{{#if (eq halaman 'dashboard')}}
  <!-- Render jika halaman === 'dashboard' -->
{{/if}}
```
- Membandingkan dua nilai
- Helper sudah ada di `src/app.js`

### G.2 `or` (OR Logic)
```handlebars
{{#if (or (eq role 'Admin Sistem') (eq role 'Supervisor'))}}
  <!-- Render jika role adalah Admin atau Supervisor -->
{{/if}}
```
- Kondisi OR untuk multiple conditions
- Helper sudah ada di `src/app.js`

---

## H. RESPONSIVE DESIGN

### H.1 Breakpoints
- **Desktop** (1024px+): Sidebar 260px fixed
- **Tablet** (768px-1023px): Sidebar 220px
- **Mobile** (<768px): Sidebar transforms to horizontal nav

### H.2 Mobile Menu
- Sidebar bisa transform ke horizontal menu
- Bisa tambah toggle menu button untuk mobile

---

## I. MENU ROUTING LOGIC

### I.1 Admin Sistem
- **Dashboard**: `/admin/dashboard`
- **Manajemen Karyawan**: `/admin/manajemen-karyawan`
- **Manajemen Penanggung Jawab**: `/admin/manajemen-penanggung-jawab`
- **Log Keberatan**: `/admin/log-keberatan`

### I.2 Supervisor
- **Dashboard**: `/supervisor/dashboard`
- **Log Keberatan**: `/supervisor/log-keberatan`

### I.3 Karyawan
- **Dashboard**: `/employee/dashboard`
- **Pengajuan Saya**: `/employee/pengajuan`
- **Absensi**: `/employee/absensi`

---

## J. INTEGRASI DENGAN MANAJEMEN KARYAWAN

Halaman `templates/views/admin/manajemen-karyawan.hbs` menggunakan layout ini:

```javascript
// di controller
res.render('admin/manajemen-karyawan', {
  title: 'Manajemen Karyawan - NusaAttend',
  layout: 'dashboard-layout',
  halaman: 'manajemen-karyawan',  // Menu akan active di sini
  role: 'Admin Sistem',
  nama: req.session.user.namaLengkap,
  statusBadge: 'Admin Sistem',
  
  // Data untuk halaman manajemen karyawan
  daftarKaryawan: [...],
  daftarPenanggungJawab: [...]
});
```

---

## K. SOCKET.IO INTEGRATION

Layout ini include Socket.io script:
```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
<script src="/js/app.js"></script>
```

Frontend bisa listen socket events untuk:
- Real-time notification status pengajuan
- Real-time update data karyawan
- Real-time update absensi

---

## L. CATATAN PENTING

### L.1 Triple Braces `{{{body}}}`
```handlebars
{{{body}}}  <!-- Render HTML tanpa escape -->
```
- Jangan gunakan double braces `{{body}}`
- Triple braces diperlukan agar HTML dari view tidak di-escape

### L.2 Layout Parameter
```javascript
res.render('halaman', {
  layout: 'dashboard-layout'  // WAJIB untuk gunakan layout ini
});
```
- Jika tidak ada parameter `layout`, akan gunakan default layout

### L.3 Conditional Helpers
```handlebars
{{#if (eq halaman 'dashboard')}}
  <!-- Gunakan eq helper untuk string comparison -->
{{/if}}
```
- Handlebars native `==` tidak bisa digunakan di template
- Harus gunakan custom helper `eq`

---

## M. PENGEMBANGAN SELANJUTNYA

### M.1 Mobile Menu Toggle
```handlebars
<button class="sidebar-toggle">
  <i class="fas fa-bars"></i>
</button>
```

### M.2 User Dropdown Menu
```handlebars
<div class="user-menu-dropdown">
  <button class="user-menu-toggle">{{nama}}</button>
  <div class="user-menu-options">
    <a href="/profile">Profil</a>
    <a href="/settings">Pengaturan</a>
    <form action="/logout" method="POST">
      <button type="submit">Keluar</button>
    </form>
  </div>
</div>
```

### M.3 Search Functionality
```handlebars
<div class="sidebar-search">
  <input type="text" placeholder="Cari menu...">
</div>
```

---

**Dokumentasi Selesai** ✅
