# IMPLEMENTASI HALAMAN MANAJEMEN KARYAWAN
**Halaman**: Manajemen Karyawan (Admin)
**Figma Node-ID**: 3-215
**Role Pengguna**: Admin Sistem
**File HBS**: `templates/views/admin/manajemen-karyawan.hbs`
**Layout**: Dashboard Layout (Sidebar + Main Content)
**Tanggal Implementasi**: 18 Desember 2025

---

## A. IDENTIFIKASI HALAMAN

### A.1 Nama & Konteks
- **Nama Halaman**: Manajemen Karyawan
- **Tujuan**: Memungkinkan admin mengelola data karyawan di sistem NusaAttend
- **Role Pengguna**: Admin Sistem
- **Role Lain pada Halaman**: -

### A.2 Figma Design Info
- **Node-ID**: 3-215
- **Project URL**: https://www.figma.com/design/QIrDdgaGrNohfnZLSjV5vF/NusaAttend?node-id=3-215&m=dev
- **Status**: Satu halaman lengkap (tidak ada variant atau flow lain)

### A.3 File Implementation
- **View**: `templates/views/admin/manajemen-karyawan.hbs`
- **Layout**: `dashboard-layout.hbs` (menggunakan sidebar + main content)
- **Styling**: `public/css/styles.css` (ditambah section baru untuk manajemen karyawan)
- **JavaScript**: Inline di HBS file (untuk interaksi modal dan aksi)

---

## B. IMPLEMENTASI FRONTEND

### B.1 Struktur Halaman

Halaman dibagi menjadi beberapa bagian utama:

```
1. Header dengan Judul & Tombol Tambah
   ├── Judul Halaman: "Manajemen Karyawan"
   ├── Subtitle: "Kelola data akun karyawan dalam sistem"
   └── Tombol: "+ Tambah Karyawan Baru"

2. Kartu Catatan/Info
   ├── Ikon Info
   └── Teks: "Data karyawan berasal dari data internal organisasi..."

3. Tabel Daftar Karyawan
   ├── Header Tabel dengan Jumlah Karyawan
   └── Data Baris dengan Kolom:
       ├── Nama
       ├── Email
       ├── Jabatan
       ├── Penanggung Jawab
       ├── Sisa Cuti
       ├── Status (Badge: aktif/nonaktif)
       └── Aksi (Tombol Edit & Hapus)

4. Modal Form Tambah/Edit Karyawan
   ├── Field Input: Nama Lengkap, Email, Jabatan
   ├── Select: Penanggung Jawab
   ├── Field Input: Sisa Cuti
   ├── Checkbox: Status Akun Aktif
   └── Tombol: Batal & Simpan

5. Modal Konfirmasi Hapus
   ├── Pesan Konfirmasi
   └── Tombol: Batal & Ya, Hapus
```

### B.2 Fitur Utama

#### 1. **Menampilkan Daftar Karyawan**
- Menggunakan Handlebars loop `{{#each daftarKaryawan}}...{{/each}}`
- Data dari backend: `daftarKaryawan` array dengan field:
  - `idKaryawan`, `namaLengkap`, `email`, `jabatan`
  - `penanggungJawab`, `sisaCuti`, `statusAktif`

#### 2. **Tombol Tambah Karyawan Baru**
- Membuka modal form kosong
- JavaScript: fungsi `bukaTambahKaryawan()`
- Event: `onclick` pada elemen `#tombolTambahKaryawan`

#### 3. **Modal Form (Tambah/Edit)**
- Validasi input sebelum submit
- Mengisi ulang untuk edit (pre-fill data)
- Submit: POST ke `/api/karyawan` (tambah) atau PUT ke `/api/karyawan/{id}` (edit)
- Reload halaman setelah berhasil

#### 4. **Tombol Edit**
- Mengambil data dari baris tabel (DOM)
- Mengisi form dengan data karyawan
- Mengubah judul modal menjadi "Edit Data Karyawan"
- Submit method berubah menjadi PUT

#### 5. **Tombol Hapus**
- Menampilkan modal konfirmasi
- Mengirim DELETE request ke `/api/karyawan/{id}`
- Reload halaman setelah berhasil

#### 6. **Status Badge**
- `statusAktif` → badge hijau "aktif"
- Selain itu → badge merah "nonaktif"

---

## C. KODE HANDLEBARS

### C.1 Loop Data Karyawan
```handlebars
{{#each daftarKaryawan}}
  <tr class="baris-data">
    <td>{{namaLengkap}}</td>
    <td>{{email}}</td>
    <td>{{jabatan}}</td>
    <td>{{penanggungJawab}}</td>
    <td>{{sisaCuti}}/12 hari</td>
    <td>
      {{#if statusAktif}}
        <span class="status-badge status-aktif">aktif</span>
      {{else}}
        <span class="status-badge status-nonaktif">nonaktif</span>
      {{/if}}
    </td>
    <td>
      <button class="tombol-edit" data-id="{{idKaryawan}}">Edit</button>
      <button class="tombol-hapus" data-id="{{idKaryawan}}">Hapus</button>
    </td>
  </tr>
{{/each}}
```

### C.2 Loop Select Penanggung Jawab
```handlebars
<select id="selectPenanggungJawab" name="penanggungJawab">
  <option value="">-- Pilih Penanggung Jawab --</option>
  {{#each daftarPenanggungJawab}}
    <option value="{{idPenanggungJawab}}">{{namaPenanggungJawab}}</option>
  {{/each}}
</select>
```

### C.3 Conditional untuk Data Kosong
```handlebars
{{#if tidakAdaKaryawan}}
  <div class="pesan-kosong">
    <div class="ikon-kosong"><i class="fas fa-inbox"></i></div>
    <p class="teks-kosong">Tidak ada data karyawan...</p>
  </div>
{{/if}}
```

---

## D. JAVASCRIPT CLIENT-SIDE

### D.1 Fungsi Utama
1. **`bukaTambahKaryawan()`** - Membuka modal untuk tambah
2. **`tutupModal()`** - Menutup modal form
3. **`validasiForm()`** - Validasi input form
4. **`formKaryawan.addEventListener('submit', ...)`** - Submit form
5. **Edit handler** - Trigger ketika tombol edit diklik
6. **Hapus handler** - Trigger untuk modal konfirmasi hapus

### D.2 Event Listeners
- **Tombol Tambah**: `#tombolTambahKaryawan`
- **Tombol Tutup Modal**: `#tombolTutupModal`, `#tombolBatalForm`
- **Tombol Edit**: `.tombol-edit` (event delegation)
- **Tombol Hapus**: `.tombol-hapus` (event delegation)
- **Click Outside Modal**: Menutup modal jika user klik di luar

### D.3 API Endpoints
- **POST** `/api/karyawan` - Tambah karyawan baru
- **PUT** `/api/karyawan/{id}` - Edit data karyawan
- **DELETE** `/api/karyawan/{id}` - Hapus karyawan

---

## E. STYLING & DESAIN

### E.1 Color Palette (dari Figma)
- **Primary**: #4f39f6 (Ungu)
- **Text Dark**: #101828
- **Text Secondary**: #4a5565
- **Border**: #f3f4f6
- **Background**: #f9fafb
- **Success Badge**: #dcfce7 (bg), #016630 (text)
- **Danger Badge**: #fee2e2 (bg), #991b1b (text)
- **Info Card**: #eff6ff (bg), #bedbff (border), #1c398e (text)

### E.2 Layout Styling
- **Header**: Flex row dengan space-between
- **Tabel**: Sticky header, horizontal scroll pada mobile
- **Modal**: Fixed overlay dengan centered dialog
- **Responsive**: 3 breakpoint (1024px, 768px)

### E.3 CSS Classes (Penamaan Bahasa Indonesia)
- `.manajemen-header` - Header halaman
- `.manajemen-title` - Judul halaman
- `.btn-tambah-karyawan` - Tombol tambah
- `.tabel-karyawan-container` - Container tabel
- `.tabel-daftar-karyawan` - Table element
- `.sel-data`, `.sel-header` - Table cells
- `.status-badge` - Badge status
- `.tombol-aksi` - Tombol aksi
- `.modal-overlay` - Modal background
- `.modal-dialog` - Modal dialog
- `.form-karyawan` - Form element
- `.grup-form` - Form group
- `.input-form` - Input element
- `.pesan-error` - Error message

---

## F. KETENTUAN DOSEN (YANG DIPATUHI)

### F.1 Penamaan Bahasa Indonesia
✅ **Variabel & Fungsi:**
- `daftarKaryawan` (not requestList)
- `namaLengkap` (not fullName)
- `penanggungJawab` (not supervisor)
- `sisaCuti` (not remainingLeave)
- `statusAktif` (not isActive)
- `tombolTambahKaryawan` (not addBtn)
- `modalKaryawan` (not employeeModal)
- `bukaTambahKaryawan()` (not openAdd())
- `validasiForm()` (not validateForm())
- `tutupModal()` (not closeModal())

✅ **CSS Classes & ID:**
- `.manajemen-header` (not .management-header)
- `.tabel-karyawan-container` (not .employee-table-container)
- `.tombol-aksi` (not .action-btn)
- `#formKaryawan` (not #employeeForm)

✅ **HTML Labels & Text:**
- "Manajemen Karyawan" (not Employee Management)
- "Kelola data akun karyawan" (not Manage employee accounts)
- "Tambah Karyawan Baru" (not Add New Employee)

### F.2 Komentar Kode (Lengkap & Jelas)
✅ **Setiap bagian penting diberi komentar:**
- Struktur HTML dengan penjelasan
- Fungsi JavaScript dengan tujuan
- Event listeners dengan deskripsi
- Loop Handlebars dengan konteks

### F.3 Tidak Ada Framework Frontend
✅ **Teknologi yang digunakan:**
- Handlebars (template rendering)
- Vanilla HTML5 (semantic)
- Custom CSS (no Bootstrap/Tailwind)
- Vanilla JavaScript (no jQuery/React/Vue)
- Font Awesome 6.4.0 (icons only)
- Fetch API (untuk HTTP requests)

### F.4 Tidak Mengubah Backend
✅ **Hanya membuat file view baru:**
- File: `templates/views/admin/manajemen-karyawan.hbs`
- Hanya menambah CSS di `styles.css`
- JavaScript inline untuk UI interaksi

### F.5 Tidak Menyentuh Folder Backup
✅ **Hanya bekerja di folder aktif:**
- `src/`, `public/`, `templates/` (aktif)
- Tidak mengubah, mereferensi, atau mengambil dari `backup/`

---

## G. ASUMSI & KETERGANTUNGAN BACKEND

### G.1 Data yang Diharapkan (dari Backend)
Backend harus menyediakan view context:

```javascript
res.render('admin/manajemen-karyawan', {
  jumlahKaryawan: 3,
  tidakAdaKaryawan: false,
  daftarKaryawan: [
    {
      idKaryawan: '507f1f77bcf86cd799439011',
      namaLengkap: 'Andi Pratama',
      email: 'andi.pratama@perusahaan.com',
      jabatan: 'Staff IT',
      penanggungJawab: 'Budi Santoso',
      sisaCuti: 9,
      statusAktif: true
    },
    // ... data lainnya
  ],
  daftarPenanggungJawab: [
    {
      idPenanggungJawab: '507f1f77bcf86cd799439012',
      namaPenanggungJawab: 'Budi Santoso'
    },
    // ... penanggung jawab lainnya
  ]
});
```

### G.2 API Endpoints yang Diperlukan
Frontend mengharapkan endpoint API:

1. **GET** `/api/karyawan` (opsional, jika perlu fetch data)
2. **POST** `/api/karyawan` - Create karyawan baru
3. **PUT** `/api/karyawan/:id` - Update data karyawan
4. **DELETE** `/api/karyawan/:id` - Delete karyawan

### G.3 Request/Response Format

**POST `/api/karyawan` (Create)**
```javascript
// Request body
{
  namaLengkap: 'Andi Pratama',
  email: 'andi.pratama@perusahaan.com',
  jabatan: 'Staff IT',
  penanggungJawab: '507f1f77bcf86cd799439012',
  sisaCuti: 12,
  statusAktif: true
}

// Response
{ ok: true } // atau error response
```

**PUT `/api/karyawan/:id` (Update)**
```javascript
// Request body (sama seperti POST)
// Response
{ ok: true }
```

**DELETE `/api/karyawan/:id` (Delete)**
```javascript
// Response
{ ok: true }
```

---

## H. BATASAN & KETERBATASAN

### H.1 Halaman Saja
✅ **Implementasi SATU halaman saja:**
- Tidak membuat routing baru
- Tidak membuat halaman lain
- Fokus hanya pada UI manajemen karyawan

### H.2 Client-side Validation
✅ **Validasi di frontend (untuk UX):**
- Validasi email format
- Validasi field wajib diisi
- Pesan error ditampilkan di bawah input

### H.3 Tanpa Kompleksitas Berlebihan
✅ **Fitur yang disederhanakan:**
- Pagination tidak diimplementasikan
- Filter/Search tidak diimplementasikan (bisa ditambah kemudian)
- Export data tidak diimplementasikan
- Bulk action tidak diimplementasikan

### H.4 Modal vs Page
✅ **Menggunakan modal untuk form (bukan halaman terpisah):**
- Alasan: Tetap di halaman yang sama
- UX lebih lancar
- Konsisten dengan design Figma

---

## I. TESTING & VALIDASI

### I.1 Checklist Implementasi
- ✅ Struktur HTML semantik
- ✅ Semua penamaan Bahasa Indonesia
- ✅ Komentar kode lengkap
- ✅ No Bootstrap/Tailwind
- ✅ Vanilla JavaScript
- ✅ Modal form bekerja (buka/tutup)
- ✅ Validasi form
- ✅ Submit to API
- ✅ Edit data
- ✅ Delete dengan konfirmasi
- ✅ Responsive design
- ✅ Tidak ada logika bisnis di frontend

### I.2 Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

### I.3 Fitur Client-side
- ✅ Modal overlay dengan click-outside
- ✅ Form validation real-time
- ✅ Error message display
- ✅ Button states (hover, active)
- ✅ Responsive table (horizontal scroll)
- ✅ Icon dari Font Awesome

---

## J. FILE YANG DIBUAT/DIMODIFIKASI

### J.1 File Baru
```
templates/views/admin/manajemen-karyawan.hbs
```

### J.2 File Dimodifikasi
```
public/css/styles.css
  - Ditambah section: /* ==================== HALAMAN MANAJEMEN KARYAWAN ==================== */
  - ~600+ lines CSS rules baru
```

### J.3 File Tidak Diubah (Reference Only)
```
templates/partials/main.hbs
templates/views/admin/dashboard.hbs
src/app.js
src/controllers/authController.js
(semua file di folder backup/)
```

---

## K. CATATAN PENGEMBANGAN

### K.1 Alur Penggunaan (Admin)
1. Admin login ke sistem
2. Navigasi ke menu "Manajemen Karyawan" (di sidebar)
3. Halaman dimuat dengan daftar karyawan
4. Admin dapat:
   - Klik "+ Tambah Karyawan Baru" → form modal
   - Klik ikon edit → form dengan pre-filled data
   - Klik ikon hapus → modal konfirmasi
5. Submit form → API call → reload halaman

### K.2 Backend Integration Points
1. Route handler harus render halaman dengan context data
2. API endpoint CRUD harus sudah siap
3. Database model Karyawan harus sudah ada
4. Authentication middleware harus check role = Admin

### K.3 Future Enhancement (Opsional)
- Pagination untuk 50+ karyawan
- Search/filter karyawan
- Export ke CSV
- Bulk operations
- Sort kolom tabel
- Infinite scroll
- Real-time socket update saat ada perubahan data

---

## L. REFERENSI DESIGN

### L.1 Figma Color Variables
```
Primary: #4f39f6
Surface: #ffffff
Background: #f9fafb, #f8f9fa, #eff6ff
Text Primary: #101828
Text Secondary: #4a5565
Border: #f3f4f6, #d1d5dc
Success: #dcfce7 bg, #016630 text
Danger: #fee2e2 bg, #991b1b text
Info: #eff6ff bg, #bedbff border
```

### L.2 Spacing System (dari Figma)
```
8px, 12px, 16px, 20px, 24px, 32px
```

### L.3 Border Radius
```
6px: input, tombol kecil
8px: form group
10px: tombol, card border
14px: modal, card besar
999px: badge (pill shape)
```

---

**Implementasi Selesai**: 18 Desember 2025
**Status**: ✅ Ready untuk diintegrasikan dengan backend
**Versi**: 1.0
