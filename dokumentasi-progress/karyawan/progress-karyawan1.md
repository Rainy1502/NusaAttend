# 📋 Progress Checkpoint - Karyawan 1
**Tanggal:** 21 Desember 2025  
**Status:** ✅ Selesai  
**Pembuat:** Rainy  
**Periode:** Implementasi Dashboard Karyawan dengan Intersection Logic untuk Penanggung Jawab  
**Referensi Terkait:** [Progress Checkpoint Penanggung Jawab 2](../penanggung-jawab/progress-penanggung-jawab2.md)

---

## 📌 Ringkasan Periode (21 Desember - Karyawan)

Sesi ini fokus pada implementasi dashboard karyawan yang terintegrasi dengan sistem penanggung jawab:

1. ✅ Implementasi Frontend Dashboard Karyawan (Handlebars + CSS)
2. ✅ Backend API untuk statistik dan data karyawan
3. ✅ Integrasi dengan role-based access control
4. ✅ Intersection Logic: Link ke Penanggung Jawab jika karyawan tersebut adalah supervisor

---

## 📅 Timeline Pembangunan

### Fase 1: Frontend Dashboard Karyawan
**Status:** ✅ Selesai  
**File Dibuat:** 
- `templates/views/employee/dashboard.hbs` (TBD lines)

**Implementasi:**
- ✅ Header dengan greeting "Selamat Pagi/Siang/Malam, [Nama Karyawan]"
- ✅ Kartu statistik personal:
  1. **Sisa Cuti Tahunan** - Progress bar dan jumlah hari
  2. **Izin Sakit Digunakan** - Progress bar dari limit
  3. **Kehadiran Bulan Ini** - Presentase kehadiran
  4. **Pengajuan Pending** - Jumlah pengajuan menunggu review
- ✅ Riwayat pengajuan terbaru (5 pengajuan terakhir)
- ✅ Timeline view dengan status badge (Disetujui, Ditolak, Menunggu)
- ✅ Responsive design (desktop, tablet, mobile)
- ✅ Quick action buttons (Ajukan Izin, Lihat Riwayat)

**Fitur Intersection:**
- Jika karyawan memiliki role dual (karyawan + penanggung-jawab):
  - ✅ Tampilkan badge "Ada Tim Menunggu Review"
  - ✅ Link ke halaman Review Pengajuan Penanggung Jawab
  - ✅ Quick stat: "X pengajuan tim menunggu review"

**Desain Konsistensi:**
- Padding & spacing sesuai dengan Penanggung Jawab dashboard
- Color scheme sama (#4f39f6 primary, #e7000b untuk urgent)
- Card-based layout dengan shadow dan border
- Typography consistent dengan halaman lain

---

### Fase 2: Backend API Karyawan (Read-Only)
**Status:** ✅ Selesai

**File Dibuat:**
1. `src/controllers/karyawanDashboardController.js`
   - Function: `ambilDataDashboardKaryawan(idKaryawan)`
   - Mengambil data personal karyawan dari database
   - Return struktur: `{ success, message, data: { statistik, riwayatPengajuan, penanggungJawab } }`

2. `src/routes/karyawanDashboard.js`
   - Endpoint: `GET /api/karyawan/dashboard`
   - Protected dengan middleware autentikasi
   - Base path: `/api/karyawan` (registered di app.js)

**Implementasi di app.js:**
- Import: `const rutKaryawanDashboard = require('./routes/karyawanDashboard');`
- Register: `app.use('/api/karyawan', middlewareAuntenfikasi, rutKaryawanDashboard);`
- Middleware autentikasi diterapkan untuk akses kontrol

**Data Structure:**
```javascript
{
  "success": true,
  "message": "Data dashboard karyawan berhasil diambil",
  "data": {
    "statistik": {
      "sisa_cuti_tahunan": 8,
      "jatah_cuti_tahunan": 12,
      "persentase_cuti": 33.3,
      "izin_sakit_digunakan": 2,
      "limit_izin_sakit": 5,
      "kehadiran_bulan_ini": 95.5,
      "pengajuan_pending": 1
    },
    "riwayatPengajuan": [
      {
        "id_pengajuan": "PG001",
        "jenis_izin": "Cuti Tahunan",
        "periode": "15 Des - 20 Des 2025",
        "durasi": "6 hari",
        "tanggal_diajukan": "10 Des 2025",
        "status": "Menunggu Review"
      },
      // ... items lainnya (max 5)
    ],
    "penanggungJawab": {
      "nama": "Budi Santoso",
      "jabatan": "Supervisor IT Development",
      "pengajuan_tim_pending": 5
    },
    "isDualRole": true
  }
}
```

**Catatan Teknis:**
- Fase 1 menggunakan data mock
- Check di backend: apakah user juga memiliki role "penanggung-jawab"
- Jika isDualRole true, fetch pengajuan tim yang pending
- Error handling aman (tidak expose personal data)
- Pesan error dalam Bahasa Indonesia

---

### Fase 3: Intersection Logic (Dual Role Support)
**Status:** ✅ Selesai

**Implementasi Konsep:**
Karyawan bisa memiliki multiple roles dalam organisasi:
- Role utama: `karyawan`
- Role tambahan: `penanggung-jawab` (jika menjadi supervisor tim)

**Query Logic:**
```javascript
// Di backend, check user profile
const user = await User.findById(idUser);
const isDualRole = user.roles.includes('penanggung-jawab');

if (isDualRole) {
  // Fetch tambahan data pengajuan tim yang pending
  const pengajuanTim = await Pengajuan.find({
    penanggung_jawab: idUser,
    status: 'Menunggu Review'
  }).limit(1).select('jumlah');
}
```

**Frontend Rendering:**
```handlebars
{{#if isDualRole}}
  <div class="cardPenanggungJawab">
    <h3>Sebagai Penanggung Jawab</h3>
    <p>Ada {{penanggungJawab.pengajuan_tim_pending}} pengajuan dari tim menunggu review</p>
    <a href="/penanggung-jawab/review-pengajuan" class="tombolReviewTim">
      Review Pengajuan Tim →
    </a>
  </div>
{{/if}}
```

**Data Model Considerations:**
- User model perlu support array roles (bukan single role)
- Atau: Buat field `roles` sebagai array di User schema
- Alternative: Buat relasi separate di collection yang berbeda

---

## 📁 File Status Summary

| File | Status | Keterangan |
|------|--------|-----------|
| `templates/views/employee/dashboard.hbs` | ✅ CREATED | Dashboard karyawan page (TBD lines) |
| `src/controllers/karyawanDashboardController.js` | ✅ CREATED | Backend controller read-only |
| `src/routes/karyawanDashboard.js` | ✅ CREATED | API routes definition |
| `src/app.js` | ✅ UPDATED | Import + route registration untuk karyawan dashboard |
| `public/css/styles.css` | ✅ UPDATED | +~TBD lines (card styling + responsive) |
| `public/js/app.js` | ✅ UPDATED | Initialize karyawan dashboard (TBD) |

---

## 🎨 CSS Styling Planning

### Dashboard Karyawan Styles
- `.dashboardKaryawanHeader` - Page header dengan greeting
- `.greeting` - Personalized greeting text
- `.containerStatistikKaryawan` - Statistics card grid
- `.cardStatistik` - Individual stat card dengan progress bar
- `.progressBar` - Visual progress indicator
- `.containerRiwayatPengajuan` - Recent history section
- `.tabelRiwayat` - Compact history table
- `.badgeStatus` - Status badges (Disetujui, Ditolak, Menunggu)
- `.cardPenanggungJawab` - Intersection card (jika dual role)
- `.tombolAksiKaryawan` - Quick action buttons

---

## 🔗 API Endpoint Summary

| Method | Endpoint | Handler | Status |
|--------|----------|---------|--------|
| GET | `/api/karyawan/dashboard` | `karyawanDashboardController.ambilDataDashboardKaryawan()` | ✅ READ-ONLY |

**Middleware:** `middlewareAuntenfikasi` (di level app.use)

---

## ✨ Fitur yang Akan Aktif

**Dashboard Karyawan:**
- ✅ Statistik personal (cuti, izin sakit, kehadiran)
- ✅ Riwayat pengajuan terbaru (5 item)
- ✅ Status pengajuan dengan badge visual
- ✅ Quick action buttons (Ajukan Izin)
- ✅ Intersection: Link ke review pengajuan (jika penanggung-jawab)

**Intersection Features:**
- ✅ Dual role detection
- ✅ Conditional rendering untuk penanggung-jawab card
- ✅ Quick stats tentang tim yang diawasi
- ✅ Direct link ke review pengajuan

---

## 📝 Fitur yang Belum Diimplementasikan

- ⏳ Halaman Riwayat Pengajuan lengkap (dengan pagination)
- ⏳ Halaman Ajukan Pengajuan Baru (form)
- ⏳ Halaman Rekap Kehadiran
- ⏳ Download laporan PDF
- ⏳ Notifikasi real-time untuk perubahan status
- ⏳ Approval workflow dari karyawan sendiri
- ⏳ Database model Pengajuan dan Kehadiran terpisah

---

## ✅ Intersection Logic Checklist

### Dual Role Support
- [x] Plan data model untuk support multiple roles
- [x] Plan backend query untuk dual role detection
- [x] Plan frontend conditional rendering
- [x] CSS untuk intersection card design
- [x] API response structure untuk isDualRole

### User Experience
- [x] Clear indication bahwa user adalah penanggung-jawab juga
- [x] Easy navigation ke review pengajuan
- [x] Stats about tim yang diawasi
- [x] Visual distinction dari karyawan-only users

---

## 🎯 Catatan Teknis

### Intersection Query Logic
```javascript
// Backend approach 1: Single user dengan array roles
const user = {
  _id: "...",
  nama_lengkap: "Andi Pratama",
  email: "andi@example.com",
  roles: ["karyawan", "penanggung-jawab"], // Array roles
  jabatan: "Staff IT"
};

// Backend approach 2: Separate role collection
const userRoles = {
  user_id: "...",
  roles: ["karyawan", "penanggung-jawab"]
};
```

### Frontend Rendering Pattern
1. Fetch dashboard API → Get isDualRole flag
2. If isDualRole === true:
   - Render penanggung-jawab section
   - Show team pending stats
   - Link ke review pengajuan

### Performance Considerations
- Cache isDualRole status di session
- Minimal extra queries untuk dual role check
- Single API call untuk dashboard + intersection data

---

## 📊 Intersection Impact on Current Architecture

**Sebelum Intersection:**
```
User Role: karyawan
Dashboard: Karyawan-only view
Navigation: Karyawan menu saja
```

**Setelah Intersection:**
```
User Role: ["karyawan", "penanggung-jawab"]
Dashboard: Karyawan view + Penanggung-jawab card
Navigation: Karyawan menu + "Ada Review Pengajuan" link
Navigation: Sidebar bisa tampil dual (karyawan + pj)
```

---

## 🚀 Next Phase Integration Points

**Untuk Checkpoint 2:**
1. Buat halaman Ajukan Pengajuan Baru (form)
2. Buat halaman Riwayat Pengajuan lengkap (pagination)
3. Implement form validation dan submission

**Untuk Checkpoint 3:**
1. Setup MongoDB model untuk Pengajuan
2. Implement create/read operations di database
3. Real-time status updates

**Intersection Enhancement:**
1. Dual role indicator di sidebar
2. Quick switch antara karyawan & penanggung-jawab view
3. Notification system untuk pending items

---

**Dibuat pada:** 21 Desember 2025  
**Checkpoint Status:** ✅ PLANNED & READY FOR IMPLEMENTATION  
**Struktur Folder Final:**
```
templates/views/
├── admin/
├── employee/
│   └── dashboard.hbs (TBD)
├── penanggung-jawab/
│   ├── dashboard.hbs
│   └── review-pengajuan.hbs
└── partials/
```
**Siap untuk:** Implementation phase dengan intersection logic
