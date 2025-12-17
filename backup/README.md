# 📦 Backup Folder - Kerangka Awal

## ⚠️ PENTING

Folder ini berisi **kerangka awal (boilerplate)** dari project NusaAttend yang **TIDAK DIGUNAKAN** dalam project aktual.

Semua file di folder backup ini adalah versi awal yang belum dimodifikasi dan berfungsi hanya sebagai **referensi** jika diperlukan.

---

## 📋 Isi Backup

```
backup/
├── src/
│   ├── controllers/
│   │   ├── chatbotController.js          ❌ Tidak dipakai
│   │   ├── pengajuanController.js        ❌ Tidak dipakai
│   │   ├── absensiController.js          ❌ Tidak dipakai
│   │   └── adminController.js            ❌ Tidak dipakai
│   └── routes/
│       ├── chatbot.js                    ❌ Tidak dipakai
│       ├── pengajuan.js                  ❌ Tidak dipakai
│       ├── absensi.js                    ❌ Tidak dipakai
│       └── admin.js                      ❌ Tidak dipakai
└── templates/views/
    ├── 404.hbs                           ❌ Tidak dipakai
    ├── chatbot.hbs                       ❌ Tidak dipakai
    ├── index.hbs                         ❌ Tidak dipakai
    ├── register.hbs                      ❌ Tidak dipakai
    ├── admin/
    │   └── manajemen-pengajuan.hbs       ❌ Tidak dipakai
    ├── employee/                         ❌ Folder referensi saja
    └── supervisor/                       ❌ Folder referensi saja
```

---

## ✅ File yang AKTIF di Project

File berikut **SUDAH DIMODIFIKASI** dan **DIGUNAKAN** dalam project aktual:

### Controllers
- `src/controllers/authController.js` - Login & Password Hashing

### Routes
- `src/routes/auth.js` - Authentication Routing

### Views
- `templates/views/login.hbs` - Login Page
- `templates/views/admin/dashboard.hbs` - Admin Dashboard

### Layouts & Partials
- `templates/dashboard-layout.hbs` - Dashboard Layout
- `templates/partials/footer.hbs` - Footer Component

### Styling
- `public/css/styles.css` - All CSS Styling

### Core App
- `src/app.js` - Main Application Setup

---

## 🎯 Tujuan Backup Folder

1. **Referensi Struktur** - Melihat kerangka awal project
2. **Avoid Conflicts** - Mengurangi risiko conflict karena file yang tidak perlu
3. **Clean Project** - Membuat project root tetap rapi dan fokus
4. **Safety** - Menyimpan kerangka awal sebagai backup jika diperlukan restore

---

## 📝 Catatan Penting

- **JANGAN** copy file dari folder ini ke project aktual kecuali ada kebutuhan khusus
- **JANGAN** edit file di folder ini untuk project aktual
- Folder ini hanya berfungsi sebagai **referensi dan safety backup**
- Jika ada file baru yang akan dibuat, gunakan file di project root sebagai template

---

## 🔄 Jika Perlu Restore

Jika ada kebutuhan untuk menggunakan file dari backup:

1. Copy file dari `backup/` ke folder yang sesuai di project root
2. Modifikasi sesuai kebutuhan project
3. **Jangan** replace file yang sudah dimodifikasi

---

**Last Updated:** December 17, 2025  
**Status:** ✅ Active Project Structure Maintained
