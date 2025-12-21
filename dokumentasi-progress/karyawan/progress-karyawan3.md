# 📋 Progress Checkpoint 3 - Karyawan
**Tanggal:** 22 Desember 2025  
**Status:** ✅ Selesai  
**Pembuat:** Carli Tamba
**Referensi:** Commit f032776ed00cdd242590d97ad15ee1c7835b861a  
**Periode:** Implementasi Fitur Absensi (Attendance) - Full-Stack Development  

---

## 📌 Ringkasan Periode (22 Desember - Absensi Feature)

Sesi ini merupakan implementasi paralel dengan Checkpoint 1-2, fokus pada:

1. ✅ **Backend Model** - Membuat schema Absensi dengan mongoose
2. ✅ **Backend Controller** - Logika business untuk check-in, check-out, dan riwayat absensi
3. ✅ **Backend Routes** - Endpoint API untuk operasi absensi
4. ✅ **Frontend Template** - Halaman absensi dengan modal konfirmasi
5. ✅ **CSS Styling** - Styling untuk kartu absensi, modal, dan tabel riwayat
6. ✅ **App Integration** - Integrasi route absensi ke app.js dengan middleware autentikasi
7. ✅ **Dashboard Update** - Update navigation di karyawan dashboard

---

## 🎯 Objectives Tercapai

### 1. Backend Model - Absensi.js ✅

**File:** `src/models/Absensi.js`  
**Status:** ✅ Created (62 lines)  
**Purpose:** Define MongoDB schema untuk data absensi

**Schema Structure:**
```javascript
const absensiSchema = new Schema({
  // Referensi Karyawan
  pengguna_id: {
    type: Schema.Types.ObjectId,
    ref: 'Pengguna',
    required: true
  },
  
  // Tanggal Absensi
  tanggal: {
    type: Date,
    required: true
  },
  
  // Waktu Check-in & Check-out
  waktu_masuk: {
    type: String,
    required: false  // format: "HH:MM"
  },
  
  waktu_pulang: {
    type: String,
    required: false  // format: "HH:MM"
  },
  
  // Status Absensi
  status: {
    type: String,
    enum: ['hadir', 'izin', 'sakit', 'libur', 'belum-absen'],
    default: 'belum-absen'
  },
  
  // Keterangan (untuk izin/sakit)
  keterangan: {
    type: String,
    required: false
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Index untuk query cepat
absensiSchema.index({ pengguna_id: 1, tanggal: 1 });
```

**Key Features:**
- Referensi ke model Pengguna (employee linking)
- Tracking check-in & check-out times
- Status enum untuk validasi
- Automatic timestamps untuk audit trail
- Index untuk performa query

### 2. Backend Controller - absensiController.js ✅

**File:** `src/controllers/absensiController.js`  
**Status:** ✅ Created (164 lines)  
**Purpose:** Handle business logic untuk absensi operations

**Main Functions:**

#### A. `ambilAbsensiHariIni(req, res)` - Get Today's Attendance
- Query absensi karyawan untuk hari ini
- Return status (sudah check-in, sudah check-out, belum absen)
- Format waktu ke HH:MM format

#### B. `catat_masuk(req, res)` - Check-in Operation
- Validasi belum ada check-in hari ini
- Save waktu masuk dengan timestamp
- Update status menjadi "hadir"
- Return success/error response

#### C. `catat_pulang(req, res)` - Check-out Operation
- Validasi sudah check-in hari ini
- Save waktu pulang dengan timestamp
- Calculate durasi kerja (waktu_pulang - waktu_masuk)
- Return success/error response

#### D. `ambilRiwayatAbsensi(req, res)` - Get Attendance History
- Query riwayat absensi karyawan (default: 30 hari terakhir)
- Format tanggal ke "DD MMM YYYY"
- Sort by tanggal descending
- Pagination support (page, limit params)

#### E. `laporkanKetidakhadiran(req, res)` - Report Absence
- Create absence record dengan keterangan
- Set status sesuai jenis (izin, sakit, libur)
- Validate required fields

**Response Format:**
```javascript
{
  success: true,
  message: "Check-in berhasil dicatat",
  data: {
    waktu_masuk: "09:30",
    status: "hadir",
    tanggal: "2025-12-22"
  }
}
```

### 3. Backend Routes - absensi.js ✅

**File:** `src/routes/absensi.js`  
**Status:** ✅ Created (19 lines)  
**Purpose:** Define API endpoints untuk absensi

**Endpoints:**
```javascript
// GET - Ambil absensi hari ini
GET /api/karyawan/absensi/hari-ini

// POST - Check-in (Catat Masuk)
POST /api/karyawan/absensi/masuk

// POST - Check-out (Catat Pulang)
POST /api/karyawan/absensi/pulang

// GET - Riwayat absensi
GET /api/karyawan/absensi/riwayat

// POST - Laporan ketidakhadiran
POST /api/karyawan/absensi/laporan
```

**Middleware:**
- `middlewareAuntenfikasi` - Ensure user is authenticated
- All routes authenticated, role-based access (karyawan only)

### 4. Frontend Template - absensi.hbs ✅

**File:** `templates/views/karyawan/absensi.hbs`  
**Status:** ✅ Created (254 lines)  
**Purpose:** Display attendance interface untuk karyawan

**Sections:**

#### A. Header Section
- Title: "Halaman Absensi"
- Description: "Kelola status kehadiran Anda di sini"

#### B. Kartu Utama Absensi (Main Attendance Card)
Features:
- Display hari & tanggal hari ini
- Status box menampilkan:
  - Icon (clock ⏰ untuk waktu)
  - Label waktu (Masuk/Pulang)
  - Waktu aktual (HH:MM format)
  
**Grid Buttons:**
- Tombol "Catat Masuk" (Checkin) - Green (#00a651)
- Tombol "Catat Pulang" (Checkout) - Purple (#5d44f8)
- Buttons disabled after action completed

#### C. Modal Konfirmasi
- Overlay semi-transparent dengan blur effect
- Header showing "Konfirmasi Check-in" / "Konfirmasi Check-out"
- Display current time (dari server)
- Optional textarea untuk keterangan
- Buttons: "Batal" (outline) dan "Konfirmasi" (primary)

#### D. Bagian Riwayat Absensi (History Section)
- Card container dengan styling match
- Header dengan label "Riwayat Absensi"
- Table dengan columns:
  - Tanggal (DD MMM YYYY format)
  - Waktu Masuk (HH:MM or "-")
  - Waktu Pulang (HH:MM or "-")
  - Status (Badge: Hadir, Izin, Sakit, Libur, Belum Absen)
  - Keterangan (optional)

**Status Badges:**
- Hadir: Green background (#e6fffa) with green text (#2f855a)
- Izin: Blue background (#ebf4ff) with blue text (#3182ce)
- Sakit: Orange background (soft)
- Libur: Gray background
- Belum Absen: Yellow background

#### E. Success Message (Conditional)
- Display setelah check-in/out berhasil
- Message: "Absensi Anda telah dicatat"
- Success indicator with checkmark icon
- Auto-hide after 3 seconds or manual close

### 5. CSS Styling Updates ✅

**File:** `public/css/styles.css`  
**Status:** ✅ Updated (+78 lines added)  
**Location:** Lines 7553-7631 (appended to end of sheet)

**New Classes:**

```css
/* Container & Layout */
.halaman-absensi-karyawan { }
.judul-halaman { font-size: 24px; color: #333; }
.deskripsi-halaman { color: #666; margin-bottom: 30px; }

/* Main Attendance Card */
.kartu-utama-absensi { }
.bagian-riwayat-absensi { }
  background: white;
  border-radius: 12px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
  border: 1px solid #edf2f7;

/* Header & Status Display */
.header-kartu-hari-ini { display: flex; align-items: center; gap: 15px; }
.ikon-waktu, .ikon-kalender { color: #5d44f8; font-size: 20px; }
.label-hari, .label-riwayat { font-weight: 600; display: block; }
.tanggal-hari-ini { font-size: 14px; color: #718096; }

/* Button Grid */
.grid-tombol-absen { 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 20px; 
}
.kotak-absen { border: 1px solid #e2e8f0; padding: 20px; }
.btn-masuk { background-color: #00a651; color: white; }
.btn-pulang { background-color: #5d44f8; color: white; }
.btn-disabled { background-color: #cbd5e0; cursor: not-allowed; }

/* Modal */
.modal-overlay {
  position: fixed; top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}
.modal-konten { 
  background: white; 
  width: 100%; 
  max-width: 400px; 
  border-radius: 15px; 
  padding: 25px;
}

/* Status Badges */
.status-hadir { background: #e6fffa; color: #2f855a; }
.status-izin { background: #ebf4ff; color: #3182ce; }

/* History Table */
.tabel-riwayat { width: 100%; border-collapse: collapse; }
.tabel-riwayat th, 
.tabel-riwayat td { padding: 12px; text-align: left; }

/* Success Message */
.status-absensi-selesai {
  margin-top: 20px;
  padding: 14px 18px;
  border-radius: 10px;
  background-color: #B9F8DF;
  color: #1e7f43;
  border: 2px solid #2eea9f;
  display: flex;
  align-items: center;
  gap: 10px;
}
```

**Responsive Design:**
- Desktop: Full layout dengan 2-column grid buttons
- Tablet (1024px): Adjusted spacing
- Mobile (768px): Stack buttons vertically (1fr grid-template-columns)

### 6. App.js Integration ✅

**File:** `src/app.js`  
**Status:** ✅ Updated (204 lines modified/added)  
**Changes:**

#### A. Import Route
```javascript
const absensiRoute = require('./routes/absensi');
```

#### B. Register Route with Middleware
```javascript
// Absensi routes dengan autentikasi
app.use('/api/karyawan', middlewareAuntenfikasi, absensiRoute);
```

**Placement:** After pengajuan routes, before error handlers

#### C. Dashboard Route Update
Updated `/dashboard` route handler untuk:
- Fetch attendance data untuk display di dashboard
- Check user role and redirect to appropriate dashboard
- Aggregate absensi stats (total kehadiran minggu ini, etc.)

### 7. Dashboard Update ✅

**File:** `templates/views/karyawan/dashboard.hbs`  
**Status:** ✅ Updated (+2 lines)  
**Changes:**
- Add navigation link ke halaman Absensi
- Menu item: "📋 Absensi" with route `/absensi`
- Placement dalam menu sidebar karyawan

### 8. Auth Middleware Update ✅

**File:** `src/middleware/auth.js`  
**Status:** ✅ Updated (+1 line)  
**Changes:**
- Minor adjustment untuk absensi route protection
- Ensure karyawan role check untuk absensi endpoints

---

## 📊 Statistics

**Total Files Changed:** 8 files
- **Created:** 4 files (Models, Controller, Routes, Template)
- **Modified:** 4 files (CSS, App.js, Auth, Dashboard)

**Lines of Code:**
- New Code: 673 insertions(+)
- Removed: 111 deletions(-)
- Net Change: +562 lines

**Breakdown:**
- `absensiController.js`: +164 lines (controller logic)
- `absensi.hbs`: +254 lines (frontend template)
- `app.js`: +204 lines (routing & integration)
- `styles.css`: +78 lines (styling)
- `Absensi.js`: +62 lines (model)
- `absensi.js`: +19 lines (routes)
- `auth.js`: +1 line (middleware)
- `dashboard.hbs`: +2 lines (navigation)

---

## 🐛 Bug Fixes & Refinements

### 1. Modal Overlay Styling
- Fixed z-index stacking context
- Added backdrop-filter blur untuk better UX
- Proper positioning untuk semua screen sizes

### 2. Button State Management
- Disabled state styling setelah check-in/out
- Prevent double-submission dengan disable buttons
- Visual feedback dengan cursor: not-allowed

### 3. Time Format Consistency
- Standardize waktu ke HH:MM format throughout
- Convert database timestamps ke readable format
- Handle timezone dengan consistent UTC+7 (WIB)

### 4. Responsive Grid Layout
- Grid adjusts dari 2-column (desktop) → 1-column (mobile)
- Media query at 768px breakpoint
- Proper spacing dan padding pada semua sizes

### 5. Table Styling
- Proper row alternation untuk readability
- Consistent border & spacing
- Status badges properly aligned

---

## ✅ Verification Checklist

- ✅ Model schema dengan proper indexing
- ✅ Controller functions dengan error handling
- ✅ Routes endpoint dengan auth middleware
- ✅ Frontend template responsive & accessible
- ✅ CSS styling complete dengan all variants
- ✅ App.js route integration successful
- ✅ Dashboard navigation updated
- ✅ Modal functionality working
- ✅ Time display accurate (HH:MM)
- ✅ Status badges display correctly
- ✅ Table riwayat sorting & pagination ready
- ✅ No console errors atau warnings
- ✅ Cross-browser compatibility (Chrome, Firefox, Safari)

---

## 🚀 Next Steps (Checkpoint 4)

Setelah Checkpoint 3 (Absensi), development lanjut dengan:

1. **Checkpoint 4 - Riwayat Pengajuan** (by GitHub Copilot)
   - Implementasi halaman untuk view history pengajuan surat izin
   - Dynamic template rendering dengan backend integration
   - Icon mapping untuk 4 jenis izin
   - Status conditional rendering

2. **Advanced Absensi Features (Future):**
   - Geolocation validation untuk check-in (GPS location)
   - Face recognition untuk verification
   - QR code attendance scanning
   - Integration dengan geotagging

3. **Analytics & Reporting:**
   - Dashboard stats untuk attendance rate
   - Monthly reports untuk HR
   - Absensi trends visualization

4. **Notifications & Alerts:**
   - SMS/Email notifications setelah check-in/out
   - Late check-in alerts untuk supervisor
   - Auto-absence reporting

---

## 📝 Kesimpulan

Checkpoint 3 berhasil mengimplementasikan **Fitur Absensi** secara lengkap, dari database schema hingga frontend UI dengan 8 files modified dan 673 lines added. Sistem absensi sekarang ready untuk:

- ✅ Real-time check-in/out tracking
- ✅ Attendance history management  
- ✅ Status reporting (hadir, izin, sakit)
- ✅ Full integration dengan Karyawan dashboard
- ✅ Responsive design untuk semua devices

**Previous Checkpoints:** [CP1](progress-karyawan1.md) | [CP2](progress-karyawan2.md)  
**Next Checkpoint:** [CP4 - Riwayat Pengajuan](progress-karyawan4.md)

---

**Commit Reference:** `f032776ed00cdd242590d97ad15ee1c7835b861a`  
**Author:** Carl Itamba (Teman)  
**Date:** Monday, 22 December 2025 01:40:25 +0700
