# 📋 Progress Checkpoint - Penanggung Jawab 2
**Tanggal:** 21 Desember 2025  
**Status:** ✅ Selesai  
**Pembuat:** Rainy  
**Periode:** Implementasi Halaman Review Pengajuan, Backend API, dan Modal Konfirmasi Logout  
**Referensi:** Lanjutan dari [Progress Checkpoint 1](./progress-penanggung-jawab1.md)

---

## 📌 Ringkasan Periode (21 Desember - Lanjutan)

Sesi ini fokus pada implementasi fitur Review Pengajuan, penambahan modal konfirmasi logout, dan refactoring struktur folder:

1. ✅ Implementasi Frontend Halaman Review Pengajuan (Handlebars + CSS)
2. ✅ Implementasi Backend API Review Pengajuan (Read-only)
3. ✅ Integrasi API ke app.js dengan middleware autentikasi
4. ✅ Penambahan Modal Konfirmasi Logout di Dashboard
5. ✅ CSS Styling dan JavaScript Handler untuk Modal
6. ✅ Refactoring Struktur Folder (supervisor → penanggung-jawab)

---

## 📅 Timeline Pembangunan

### Fase 5: Frontend Halaman Review Pengajuan
**Status:** ✅ Selesai  
**File Dibuat:** 
- `templates/views/penanggung-jawab/review-pengajuan.hbs` (113 lines)

**Implementasi:**
- ✅ Header dengan title "Review Pengajuan" dan deskripsi
- ✅ Container daftar pengajuan menunggu review
- ✅ Tabel dengan 6 kolom:
  1. **Karyawan** - Nama + Jabatan (2 baris)
  2. **Jenis Izin** - Icon + Tipe izin (Cuti Tahunan, Izin Sakit, WFH, dll)
  3. **Periode** - Rentang tanggal izin (DD MMM - DD MMM YYYY)
  4. **Durasi** - Jumlah hari izin
  5. **Diajukan** - Tanggal pengajuan dibuat
  6. **Aksi** - Tombol "Detail" untuk melihat detail pengajuan
- ✅ Conditional rendering: Pesan kosong jika tidak ada pengajuan
- ✅ Hover effect pada row tabel
- ✅ Responsive design (desktop, tablet, mobile)

**Fitur:**
- Tabel horizontal scrollable untuk mobile
- Semantic HTML5 (`<table>`, `<thead>`, `<tbody>`)
- Handlebars `{{#each}}` loop untuk data dinamis
- Inline styling TIDAK ada (semua di styles.css)
- Icon Font Awesome untuk visual enhancement

**Desain Konsistensi:**
- Padding & spacing sesuai dengan Manajemen Karyawan
- Border dan shadow sesuai design system
- Typography consistent dengan halaman admin

---

### Fase 6: Backend API Review Pengajuan (Read-Only)
**Status:** ✅ Selesai

**File Dibuat:**
1. `src/controllers/reviewPengajuanController.js`
   - Function: `ambilDaftarPengajuanMenunggu()`
   - Mengambil daftar pengajuan yang menunggu review
   - Data bersifat READ-ONLY (tidak ada create/update/delete)
   - Return struktur: `{ success, message, data: { daftar_pengajuan: [...] } }`

2. `src/routes/reviewPengajuan.js`
   - Endpoint: `GET /api/penanggung-jawab/review-pengajuan`
   - Protected dengan middleware autentikasi
   - Base path: `/api/penanggung-jawab` (registered di app.js)

**Implementasi di app.js:**
- Import: `const rutReviewPengajuan = require('./routes/reviewPengajuan');`
- Register: `app.use('/api/penanggung-jawab', middlewareAuntenfikasi, rutReviewPengajuan);`
- Middleware autentikasi diterapkan untuk akses kontrol

**Data Structure:**
```javascript
{
  "success": true,
  "message": "Daftar pengajuan menunggu review berhasil diambil",
  "data": {
    "daftar_pengajuan": [
      {
        "nama_karyawan": "Andi Pratama",
        "jabatan_karyawan": "Staff IT",
        "jenis_izin": "Cuti Tahunan",
        "periode": "15 Des - 20 Des 2025",
        "durasi": "6 hari",
        "tanggal_diajukan": "10 Des",
        "status_pengajuan": "Menunggu Review"
      },
      // ... items lainnya
    ]
  }
}
```

**Catatan Teknis:**
- Fase 1 menggunakan data mock (3 contoh pengajuan)
- Siap upgrade ke query MongoDB saat model Pengajuan diimplementasikan
- Error handling aman (tidak expose MongoDB error)
- Pesan error dalam Bahasa Indonesia

---

### Fase 7: Modal Sistem untuk Review Pengajuan (Detail + Tolak + Setujui)
**Status:** ✅ Selesai  
**File Dibuat:** `templates/views/penanggung-jawab/review-pengajuan.hbs` (expanded with modals)

#### Struktur Modal (3 Modal Terintegrasi)

**1️⃣ Modal Detail Pengajuan** (Primary Modal)
**Tujuan:** Display lengkap data pengajuan yang akan di-review

**Elemen HTML:**
```html
<div id="modalDetailPengajuan" class="overlayBackgroundModal">
  <div class="containerModalDetailPengajuan">
    <!-- Header dengan title -->
    <!-- Close button (X) -->
    
    <!-- Content sections: -->
    - Informasi Pemohon (Nama, Jabatan)
    - Data Pengajuan (Jenis Izin, Periode, Durasi)
    - Alasan Pengajuan (textarea readonly)
    - Sisa Cuti (info display)
    - Tanda Tangan Administratif (canvas element)
    
    <!-- Footer dengan buttons -->
    - "Tolak" button → Buka Modal Tolak
    - "Setujui" button → Buka Modal Setujui
    - "Tutup" button → Close modal
  </div>
</div>
```

**Features:**
- ✅ Data populated dari API `/api/pengguna/detail-pengajuan/:id`
- ✅ Read-only form fields (no direct editing)
- ✅ Canvas element untuk display tanda tangan (non-interactive)
- ✅ Animated slide-down entrance
- ✅ Overlay click to close
- ✅ ESC key to close

---

**2️⃣ Modal Tolak Pengajuan** (Secondary Modal)
**Tujuan:** Collect alasan penolakan dari penanggung jawab

**Elemen HTML:**
```html
<div id="modalTolakPengajuan" class="overlayBackgroundModal">
  <div class="containerModalTolakPengajuan">
    <!-- Header -->
    
    <!-- Content -->
    - Label: "Alasan Penolakan" (required field dengan *)
    - Textarea input field untuk alasan
    - Character counter (optional)
    
    <!-- Footer buttons -->
    - "Batal" button → Kembali ke Modal Detail
    - "Konfirmasi Penolakan" button → Submit ke backend
  </div>
</div>
```

**Features:**
- ✅ Triggered dari tombol "Tolak" di Modal Detail
- ✅ Textarea untuk input alasan (free text)
- ✅ Required field validation
- ✅ Can navigate back to Detail modal with "Batal"
- ✅ Submit ke endpoint `POST /api/pengguna/pengajuan-tolak/:id`
- ✅ Data dikirim: `{ alasan_penolakan: "..." }`

---

**3️⃣ Modal Setujui Pengajuan** (Secondary Modal)
**Tujuan:** Display canvas untuk tanda tangan digital approval, confirm approval

**Elemen HTML:**
```html
<div id="modalSetujuiPengajuan" class="overlayBackgroundModal">
  <div class="containerModalSetujuiPengajuan">
    <!-- Header -->
    
    <!-- Content -->
    - Info: "Tanda Tangan Digital Persetujuan"
    - Wrapper untuk canvas: 
      <div class="wrapperCanvasTandaTangan">
        <canvas id="canvasTandaTanganSetujui"></canvas>
      </div>
    - Canvas properties:
      - Width: 100% responsive
      - Height: 200px
      - Background: white
      - Border: 2px solid #d1d5dc
      - Cursor: crosshair (drawing mode)
    
    <!-- Footer buttons -->
    - "Hapus Tanda Tangan" button → Clear canvas
    - "Batal" button → Kembali ke Modal Detail
    - "Konfirmasi Setujui" button → Submit dengan signature
  </div>
</div>
```

**Features:**
- ✅ Canvas initialized saat modal dibuka
- ✅ Support mouse drawing (desktop)
- ✅ Support touch drawing (mobile/tablet)
- ✅ Canvas clear button untuk hapus signature
- ✅ Data URL signature dikirim ke backend
- ✅ Submit ke endpoint `POST /api/pengguna/pengajuan-setujui/:id`
- ✅ Data dikirim: `{ tanda_tangan_persetujuan: "data:image/png;..." }`

---

#### JavaScript Modal Handler Functions

**1️⃣ `bukaModalDetailPengajuan(button)`**
```javascript
/**
 * Membuka modal detail dengan data dari button.dataset
 * @param {HTMLElement} button - Tombol "Detail" yang diklik
 */
function bukaModalDetailPengajuan(button) {
    // 1. Extract data from button.dataset-*
    // 2. Fetch detail lengkap dari API
    // 3. Populate form fields
    // 4. Show modal dengan animasi
    // 5. Set global idPengajuanAktif
}
```

**Alur:**
1. User click "Detail" button di tabel Review Pengajuan
2. Extract ID dari `button.dataset.id`
3. Fetch full data dari `/api/pengguna/detail-pengajuan/:id`
4. Populate all form fields dengan data API
5. Modal slide down dengan overlay
6. User dapat klik "Tolak" atau "Setujui"

---

**2️⃣ `tolakPengajuan()`**
```javascript
/**
 * Transition dari Modal Detail ke Modal Tolak
 */
function tolakPengajuan() {
    // 1. Hide Detail modal
    // 2. Show Tolak modal
    // 3. Focus textarea untuk input alasan
}
```

**Flow:**
- User click "Tolak" di Modal Detail
- Modal Detail fade out
- Modal Tolak slide in
- Textarea ready for input

---

**3️⃣ `setujuiPengajuan()`**
```javascript
/**
 * Transition dari Modal Detail ke Modal Setujui
 * Juga initialize canvas untuk signature
 */
function setujuiPengajuan() {
    // 1. Hide Detail modal
    // 2. Show Setujui modal
    // 3. Initialize canvas:
    //    - Set size dengan DPR support (high-DPI display)
    //    - Attach event listeners (mouse + touch)
    //    - Clear background ke white
    // 4. Canvas ready untuk drawing
}
```

**Flow:**
- User click "Setujui" di Modal Detail
- Modal Detail fade out
- Modal Setujui slide in
- Canvas initialize dengan event listeners
- User dapat draw signature

---

#### Modal Styling & CSS Classes

**CSS Classes di styles.css:**
```css
/* Overlay & Container */
.overlayBackgroundModal           /* Semi-transparent dark background */
.containerModalDetailPengajuan    /* Detail modal main container */
.containerModalTolakPengajuan     /* Tolak modal main container */
.containerModalSetujuiPengajuan   /* Setujui modal main container */

/* Animations */
@keyframes modalAnimasiMasuk      /* Slide down + fade in */
@keyframes modalAnimasiKeluar     /* Slide up + fade out */
@keyframes overlayFadeOut         /* Overlay fade effect */

/* Canvas wrapper */
.wrapperCanvasTandaTangan         /* Border + padding untuk canvas */
.canvasTandaTangan                /* Canvas element styling */

/* Buttons & Forms */
.tombolDetailPengajuan            /* "Detail" button di tabel */
.tombolTolakPengajuan             /* "Tolak" button di modal detail */
.tombolSetujuiPengajuan           /* "Setujui" button di modal detail */
.tombolKonfirmasiPenolakan        /* Confirm tolak button */
.tombolKonfirmasiSetujui          /* Confirm setujui button */
```

---

#### Close/Navigation Functions

**Close Functions:**
- `tutupModalDetailPengajuan()` → Close Detail, clear data
- `tutupModalTolakPengajuan()` → Close Tolak, return to Detail
- `tutupModalSetujuiPengajuan()` → Close Setujui, clear canvas, return to Detail

**Helper Functions:**
- `matikanSemuaOverlay()` → Ensure only 1 modal visible at a time
- `aktifkanOverlayModal(modalId)` → Activate specific modal overlay

---

#### Keyboard & Accessibility Support

**Keyboard Shortcuts:**
- `ESC` → Close current modal (priority: Tolak/Setujui → Detail)
- Tab navigation untuk form fields
- Enter di textarea tidak submit (prevent accident)

**Multi-Modal Pattern:**
- Only 1 overlay visible at time (prevent ghost overlay)
- Before open new modal, disable all previous overlays
- Clear focus saat close modal

---

#### Data Flow Diagram

```
Halaman Review Pengajuan
        ↓
User click "Detail" button (row tabel)
        ↓
bukaModalDetailPengajuan() triggered
        ↓
Fetch API: /api/pengguna/detail-pengajuan/:id
        ↓
Modal Detail tampil ← Data dari API
        ↓
   ┌─────┴─────┐
   ↓           ↓
Klik "Tolak"  Klik "Setujui"
   ↓           ↓
Modal Tolak   Modal Setujui
   ↓           ↓
Input alasan  Draw signature
   ↓           ↓
Click "Konfirmasi" pada masing-masing
   ↓           ↓
POST tolak    POST setujui
   ↓           ↓
Backend process (update DB, send email)
   ↓           ↓
Show toast (success/error)
   ↓           ↓
   └─────┬─────┘
      Reload halaman
```

---

### Fase 8: Modal Konfirmasi Logout
**Status:** ✅ Selesai  
**Referensi:** Dashboard layout sidebar

**Update HTML (dashboard-layout.hbs):**
- ✅ Changed tombol logout dari form submit langsung → button trigger modal
- ✅ Added modal markup dengan struktur:
  - Overlay (semi-transparent background)
  - Modal container dengan border-radius & shadow
  - Header dengan warning icon (merah)
  - Content area (judul + deskripsi)
  - Footer dengan 2 tombol (Batal & Keluar)
  - Hidden form untuk submit logout

**CSS Styling (styles.css):**
- ✅ `.lapisanOverlayLogout` - Overlay backdrop
- ✅ `.modalKonfirmasiLogout` - Modal container dengan animasi slide-up
- ✅ `.headerModalLogout` - Header dengan background merah muda
- ✅ `.iconWarningLogout` - Circle icon dengan warna merah
- ✅ `.judulModalLogout` - Judul "Konfirmasi Logout" (20px, bold)
- ✅ `.deskripsiModalLogout` - Deskripsi pertanyaan
- ✅ `.tombolBatalLogout` - Button abu-abu dengan hover effect
- ✅ `.tombolKonfirmasiLogout` - Button merah (#e7000b) dengan hover effect
- ✅ Animasi `@keyframes slideInUp` untuk modal entrance
- ✅ Responsive design untuk mobile (stack buttons vertically)

**JavaScript Handler (public/js/app.js):**
- ✅ `initializeModalLogout()` function dengan event listeners:
  - Klik tombol "Keluar" → Tampilkan modal
  - Klik tombol "Batal" → Tutup modal
  - Klik overlay → Tutup modal (click outside)
  - Tekan ESC → Tutup modal
  - Klik tombol "Keluar" di modal → Submit form logout
- ✅ Graceful initialization (check element existence sebelum attach listener)
- ✅ Comment akademik yang jelas untuk setiap event handler

**UX Features:**
- Smooth transition dengan animasi slide-up
- Clear visual hierarchy (warning icon merah)
- Keyboard support (ESC untuk close)
- Click outside to close (standard UX pattern)
- Disabled submit default (prevent accidental logout)

---

## 📁 File Status Summary

| File | Status | Keterangan |
|------|--------|-----------|
| `templates/views/penanggung-jawab/review-pengajuan.hbs` | ✅ CREATED | Review pengajuan page (113 lines) |
| `src/controllers/reviewPengajuanController.js` | ✅ CREATED | Backend controller read-only |
| `src/routes/reviewPengajuan.js` | ✅ CREATED | API routes definition |
| `src/app.js` | ✅ UPDATED | Route paths diubah dari supervisor/* → penanggung-jawab/* |
| `templates/partials/dashboard-layout.hbs` | ✅ UPDATED | Changed logout button + added modal HTML |
| `public/css/styles.css` | ✅ UPDATED | +~330 lines (tabel + modal styling) |
| `public/js/app.js` | ✅ UPDATED | Added `initializeModalLogout()` function |
| `templates/views/supervisor/` | ❌ DELETED | Folder dihapus, semua file pindah ke penanggung-jawab |

---

## 🎨 CSS Styling Details

### Review Pengajuan Styles (~330 lines)
- `.reviewPengajuanHeader` - Page header dengan flexbox layout
- `.reviewPengajuanTitle` - Title 28px, bold, dark color
- `.reviewPengajuanSubtitle` - Subtitle 16px, secondary color
- `.containerDaftarPengajuan` - White card dengan border & shadow
- `.tabelPengajuan` - Table dengan sticky header
- `.cellHeaderTabel` - Column headers dengan background light
- `.rowTabelPengajuan` - Rows dengan hover effect (light background)
- `.tombolDetailPengajuan` - Primary button dengan transparent bg
- `.pesanTabelKosong` - Empty state dengan icon + text

### Modal Logout Styles (~150 lines)
- `.lapisanOverlayLogout` - Fixed overlay dengan z-index 1000
- `.lapisanOverlayLogout.aktif` - Show/hide dengan display flex
- `.modalKonfirmasiLogout` - Modal container max-width 420px
- Animasi `slideInUp` untuk entrance transition
- `.headerModalLogout` - Header dengan background #fff5f5 (light red)
- `.iconWarningLogout` - 60x60 circle dengan icon #e7000b
- `.tombolBatalLogout` - Secondary button (gray)
- `.tombolKonfirmasiLogout` - Primary danger button (red)
- Responsive: buttons stack on mobile, full-width

---

## 🔗 API Endpoint Summary

| Method | Endpoint | Handler | Status |
|--------|----------|---------|--------|
| GET | `/api/penanggung-jawab/review-pengajuan` | `reviewPengajuanController.ambilDaftarPengajuanMenunggu()` | ✅ READ-ONLY |

**Middleware:** `middlewareAuntenfikasi` (di level app.use)

---

## ✨ Fitur yang Sudah Aktif

**Dashboard Penanggung Jawab:**
- ✅ Dashboard dengan statistik real-time
- ✅ Pengajuan Mendesak (5 user terbaru)
- ✅ Sidebar navigation sesuai Figma design
- ✅ Modal konfirmasi logout dengan UX yang baik

**Review Pengajuan:**
- ✅ Tabel daftar pengajuan dengan 6 kolom
- ✅ Responsive design untuk semua ukuran layar
- ✅ Empty state messaging
- ✅ Hover effect dan visual feedback
- ✅ API endpoint read-only dengan data mock

---

## 📝 Fitur yang Belum Diimplementasikan

- ⏳ Detail modal untuk melihat pengajuan lengkap (tombol "Detail" placeholder)
- ⏳ Approval/rejection functionality (hanya read-only)
- ⏳ Filter dan search di tabel pengajuan
- ⏳ Pagination untuk tabel
- ⏳ Real-time update dengan Socket.IO
- ⏳ Database model Pengajuan terpisah (saat ini data mock)
- ⏳ Tinjauan Keberatan page
- ⏳ Rekap Kehadiran page

---

## ✅ Checklist Completion

### Frontend (Review Pengajuan)
- [x] Handlebars template lengkap
- [x] 6 kolom tabel dengan data layout
- [x] Icon integration (Font Awesome)
- [x] Conditional rendering (empty state)
- [x] Responsive grid layout
- [x] CSS classes semantik (tanpa inline style)
- [x] Hover effects dan interactivity

### Backend (Review Pengajuan)
- [x] Controller dengan function `ambilDaftarPengajuanMenunggu`
- [x] Routes definition dengan endpoint GET
- [x] Integrasi ke app.js dengan middleware
- [x] Data mock dengan struktur lengkap
- [x] Error handling & response formatting
- [x] Penamaan Bahasa Indonesia
- [x] Komentar akademik jelas

### Modal Logout
- [x] HTML markup dengan semantic structure
- [x] CSS styling dengan animation
- [x] JavaScript event handler (click, keyboard, overlay)
- [x] Form submission integration
- [x] Responsive design
- [x] UX best practices (ESC, click-outside)
- [x] Komentar code lengkap

### Styling & Design
- [x] CSS classes untuk semua komponen
- [x] Color scheme alignment (#4f39f6 primary, #e7000b danger)
- [x] Hover effects & transitions
- [x] Shadow dan borders konsisten
- [x] Typography consistent
- [x] Responsive breakpoints (desktop, tablet, mobile)
- [x] Animation smooth & professional

---

## 🎯 Catatan Teknis

### JavaScript Features
- Menggunakan vanilla JavaScript (no jQuery, no framework)
- Event delegation untuk flexibility
- Graceful degradation (checks element existence)
- Keyboard accessibility (ESC support)
- Semantic event naming

### Database Considerations
- Model User tidak diubah (sesuai batasan prompt)
- Data mock siap untuk upgrade ke MongoDB saat model Pengajuan ada
- Read-only pattern untuk data protection
- No direct data modification di frontend

### Performance
- CSS Grid untuk layout (efficient rendering)
- Sticky header untuk tabel (better UX)
- Lazy initialization untuk modal
- Minimal JavaScript footprint

### Refactoring Folder Structure
**Perubahan Struktur:**
- ❌ Dihapus: `templates/views/supervisor/` folder
- ✅ Dipindah: Semua file supervisor → `templates/views/penanggung-jawab/`
- ✅ Updated: Route paths di app.js (3 routes)
  - `supervisor/pengajuan` → `penanggung-jawab/review-pengajuan`
  - `supervisor/laporan` → `penanggung-jawab/laporan` (TBD)
  - `supervisor/detail-pengajuan` → `penanggung-jawab/detail-pengajuan` (TBD)

**Alasan:**
- Supervisor adalah role/peran, bukan folder struktur yang benar
- Penanggung-jawab adalah role yang ada di sistem NusaAttend
- Folder structure harus consistent dengan role naming di User model
- Menghindari confusion antara role supervisor vs penanggung-jawab

---

## 🚀 Next Phase (Fase 3)

**Prioritas Tinggi:**
1. Implementasi Detail Modal untuk review pengajuan
2. Implementasi Tinjauan Keberatan page
3. Implementasi Rekap Kehadiran page
4. Setup model Pengajuan di MongoDB
5. Query real dari database untuk review pengajuan

**Prioritas Medium:**
1. Search & filter functionality di tabel
2. Pagination untuk review pengajuan
3. Real-time notification dengan Socket.IO
4. Approval/rejection endpoints (POST/PUT)
5. Status indicator badges

**Prioritas Rendah:**
1. Export data functionality
2. Advanced analytics
3. Custom date range filters
4. User preference settings

---

## 📊 Progress Comparison

| Aspek | Checkpoint 1 | Checkpoint 2 |
|-------|-------------|-------------|
| Frontend Pages | 1 (Dashboard) | 2 (Dashboard + Review Pengajuan) |
| Backend Routes | 1 (Dashboard API) | 2 (Dashboard + Review Pengajuan API) |
| Controllers | 1 | 2 |
| HTML Files | 1 | 1 (template shared + modal) |
| CSS Lines Added | ~110 | ~330 (tabel + modal) |
| JavaScript | 0 | ~70 lines |
| Modal Features | 0 | 1 (Logout confirmation) |
| Data Endpoints | 1 | 2 |

---

**Dibuat pada:** 21 Desember 2025  
**Checkpoint Status:** ✅ STABLE & REFACTORED  
**Struktur Folder Final:**
```
templates/views/
├── admin/
├── employee/
├── penanggung-jawab/
│   ├── dashboard.hbs
│   └── review-pengajuan.hbs
└── partials/
```
**Siap untuk:** Git commit dan advance ke checkpoint 3 (Employee Role)
