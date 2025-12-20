// ==================== HALAMAN MANAJEMEN PENANGGUNG JAWAB ==================== //
/**
 * [REFACTOR AKADEMIK]
 * File JavaScript untuk mengelola operasi CRUD penanggung jawab (supervisor)
 * Mengubah istilah "supervisor" menjadi "penanggung-jawab" untuk konsistensi
 * terminologi lintas sistem sesuai ketentuan dosen
 */
// Fungsi: Load data, buka/tutup modal, submit form, edit, hapus, notifikasi

// ==================== FUNGSI LOAD DATA PENANGGUNG JAWAB ==================== //

/**
 * Memuat semua data penanggung jawab dari API
 * Data ditampilkan di tabel dengan kolom: nama, email, jabatan, dll
 * @function muatSemuaPenanggungJawab
 */
function muatSemuaPenanggungJawab() {
  console.log('📥 Memulai load data penanggung jawab dari API...');

  const container = document.getElementById('daftarPenanggungJawabContainer');

  fetch('/api/admin/supervisor')
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data) {
        console.log('✁EData penanggung jawab berhasil dimuat:', data.data);
        
        // Render tabel dinamis
        renderTabelPenanggungJawab(data.data);
      } else {
        console.error('❁EGagal memuat data penanggung jawab:', data.message);
        tampilkanNotifikasi('Gagal memuat data penanggung jawab: ' + data.message, 'error');
      }
    })
    .catch(error => {
      console.error('❁EError saat fetch data penanggung jawab:', error);
      tampilkanNotifikasi('Terjadi kesalahan saat memuat data', 'error');
    });
}

/**
 * Render tabel penanggung jawab dinamis dari data API
 * @function renderTabelPenanggungJawab
 * @param {Array} daftarPenanggungJawab - Array penanggung jawab dari API
 */
function renderTabelPenanggungJawab(daftarPenanggungJawab) {
  const container = document.getElementById('daftarPenanggungJawabContainer');
  
  if (!daftarPenanggungJawab || daftarPenanggungJawab.length === 0) {
    container.innerHTML = `
      <div class="pesan-kosong-penanggung-jawab">
        <div class="ikon-kosong">
          <i class="fas fa-user-tie"></i>
        </div>
        <p class="teks-kosong">Belum ada data penanggung jawab. Klik tombol "Tambah Penanggung Jawab Baru" untuk menambahkan.</p>
      </div>
    `;
    return;
  }

  // Build tabel HTML dinamis
  let tabelHTML = `
    <div class="tabel-penanggung-jawab-container">
      <div class="tabel-header">
        <h2 class="tabel-judul">Daftar Penanggung Jawab (${daftarPenanggungJawab.length})</h2>
      </div>
      <div class="tabel-wrapper">
        <table class="tabel-daftar-penanggung-jawab">
          <thead class="tabel-kepala">
            <tr class="baris-header">
              <th class="sel-header nama-header">Nama</th>
              <th class="sel-header email-header">Email</th>
              <th class="sel-header jabatan-header">Jabatan</th>
              <th class="sel-header jumlah-karyawan-header">Jumlah Karyawan</th>
              <th class="sel-header bergabung-header">Bergabung</th>
              <th class="sel-header status-header">Status</th>
              <th class="sel-header aksi-header">Aksi</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Loop setiap supervisor
  daftarPenanggungJawab.forEach((supervisor) => {
    const tanggalBergabung = formatTanggal(supervisor.createdAt);
    const statusClass = supervisor.isAktif ? 'status-aktif' : 'status-nonaktif';
    const statusText = supervisor.isAktif ? 'aktif' : 'nonaktif';
    const jumlahKaryawan = supervisor.jumlahKaryawan || 0;

    tabelHTML += `
      <tr class="baris-data">
        <td class="sel-data nama-penanggung-jawab">
          <div class="kontainer-nama">
            <div class="avatar-penanggung-jawab">
              <i class="fas fa-user"></i>
            </div>
            <span>${supervisor.nama_lengkap}</span>
          </div>
        </td>
        <td class="sel-data email-cell">${supervisor.email}</td>
        <td class="sel-data jabatan-cell">${supervisor.jabatan}</td>
        <td class="sel-data jumlah-karyawan-cell">${jumlahKaryawan} orang</td>
        <td class="sel-data bergabung-cell">${tanggalBergabung}</td>
        <td class="sel-data">
          <span class="status-badge ${statusClass}">${statusText}</span>
        </td>
        <td class="sel-data">
          <div class="kontainer-aksi">
            <button class="tombol-aksi tombol-edit" title="Edit Penanggung Jawab" onclick="bukaModalEditPenanggungJawab('${supervisor._id}')">
              <i class="fas fa-edit"></i>
            </button>
            <button class="tombol-aksi tombol-hapus" title="Hapus Penanggung Jawab" onclick="hapusPenanggungJawab('${supervisor._id}')">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });

  tabelHTML += `
          </tbody>
        </table>
      </div>
    </div>
  `;

  container.innerHTML = tabelHTML;
}

// ==================== FUNGSI MODAL TAMBAH SUPERVISOR ==================== //

/**
 * Membuka modal tambah penanggung jawab baru
 * Menampilkan form kosong untuk input data baru
 * @function bukaModalTambahPenanggungJawab
 */
function bukaModalTambahPenanggungJawab() {
  console.log('🔓 Membuka modal tambah penanggung jawab');
  const overlay = document.getElementById('lapisanOverlayTambahPenanggungJawab');
  const form = document.getElementById('formTambahPenanggungJawab');
  
  // Reset form ke kondisi kosong
  form.reset();
  
  // Tampilkan modal dengan animasi
  setTimeout(() => {
    overlay.classList.add('tampil');
  }, 10);
}

/**
 * Menutup modal tambah penanggung jawab
 * Menghapus class 'tampil' untuk trigger animasi close
 * @function tutupModalTambahPenanggungJawab
 */
function tutupModalTambahPenanggungJawab() {
  console.log('🔒 Menutup modal tambah penanggung jawab');
  const overlay = document.getElementById('lapisanOverlayTambahPenanggungJawab');
  overlay.classList.remove('tampil');
}

/**
 * Mengirim data supervisor baru ke API
 * Validasi dilakukan di backend
 * @function submitFormTambahPenanggungJawab
 * @param {Event} event - Event dari form submission
 */
function submitFormTambahPenanggungJawab(event) {
  event.preventDefault();
  console.log('📝 Mensubmit form tambah supervisor');

  const nama = document.getElementById('inputNamaLengkap').value.trim();
  const email = document.getElementById('inputEmail').value.trim();
  const jabatan = document.getElementById('inputJabatan').value.trim();

  // Validasi basic frontend
  if (!nama || !email || !jabatan) {
    tampilkanNotifikasi('Semua field wajib diisi', 'error');
    return;
  }

  // Tampilkan loading notification
  tampilkanNotifikasi('Menambahkan penanggung jawab...', 'loading');

  fetch('/api/admin/supervisor', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nama_lengkap: nama,
      email: email,
      jabatan: jabatan
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✁EPenanggung jawab berhasil ditambahkan:', data.data);
        tampilkanNotifikasi('Penanggung jawab berhasil ditambahkan', 'sukses');
        tutupModalTambahPenanggungJawab();
        
        // Refresh tabel setelah 1.5 detik
        setTimeout(() => {
          muatSemuaPenanggungJawab();
        }, 1500);
      } else {
        console.error('❁EGagal menambahkan penanggung jawab:', data.message);
        tampilkanNotifikasi('Gagal menambahkan: ' + data.message, 'error');
      }
    })
    .catch(error => {
      console.error('❁EError saat submit form:', error);
      tampilkanNotifikasi('Terjadi kesalahan saat menambahkan data', 'error');
    });
}

// ==================== FUNGSI MODAL EDIT SUPERVISOR ==================== //

/**
 * Membuka modal edit penanggung jawab
 * Memuat data supervisor ke form untuk diedit
 * @function bukaModalEditPenanggungJawab
 * @param {string} idSupervisor - ID supervisor yang akan diedit
 */
function bukaModalEditPenanggungJawab(idSupervisor) {
  console.log('🔓 Membuka modal edit supervisor, ID:', idSupervisor);

  // Fetch data supervisor yang akan diedit
  fetch(`/api/admin/supervisor/${idSupervisor}`)
    .then(response => response.json())
    .then(data => {
      if (data.success && data.data) {
        console.log('📥 Data supervisor dimuat:', data.data);
        
        // Isi form dengan data supervisor
        document.getElementById('editInputNamaLengkap').value = data.data.nama_lengkap;
        document.getElementById('editInputEmail').value = data.data.email;
        document.getElementById('editInputJabatan').value = data.data.jabatan;
        
        // Simpan ID untuk digunakan saat submit
        document.getElementById('formEditPenanggungJawab').dataset.idPenanggungJawab = idSupervisor;
        
        // Tampilkan modal
        const overlay = document.getElementById('lapisanOverlayEditPenanggungJawab');
        setTimeout(() => {
          overlay.classList.add('tampil');
        }, 10);
      } else {
        console.error('❁EGagal memuat data supervisor:', data.message);
        tampilkanNotifikasi('Gagal memuat data supervisor', 'error');
      }
    })
    .catch(error => {
      console.error('❁EError saat fetch supervisor detail:', error);
      tampilkanNotifikasi('Terjadi kesalahan saat memuat data', 'error');
    });
}

/**
 * Menutup modal edit penanggung jawab
 * @function tutupModalEditPenanggungJawab
 */
function tutupModalEditPenanggungJawab() {
  console.log('🔒 Menutup modal edit penanggung jawab');
  const overlay = document.getElementById('lapisanOverlayEditPenanggungJawab');
  overlay.classList.remove('tampil');
}

/**
 * Mengirim data edit supervisor ke API
 * @function submitFormEditPenanggungJawab
 * @param {Event} event - Event dari form submission
 */
function submitFormEditPenanggungJawab(event) {
  event.preventDefault();
  console.log('📝 Mensubmit form edit penanggung jawab');

  const idSupervisor = document.getElementById('formEditPenanggungJawab').dataset.idPenanggungJawab;
  const nama = document.getElementById('editInputNamaLengkap').value.trim();
  const email = document.getElementById('editInputEmail').value.trim();
  const jabatan = document.getElementById('editInputJabatan').value.trim();

  // Validasi basic frontend
  if (!nama || !email || !jabatan) {
    tampilkanNotifikasi('Semua field wajib diisi', 'error');
    return;
  }

  // Tampilkan loading notification
  tampilkanNotifikasi('Menyimpan perubahan...', 'loading');

  fetch(`/api/admin/supervisor/${idSupervisor}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      nama_lengkap: nama,
      email: email,
      jabatan: jabatan
    })
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✁EData penanggung jawab berhasil diperbarui:', data.data);
        tampilkanNotifikasi('Data penanggung jawab berhasil diperbarui', 'sukses');
        tutupModalEditPenanggungJawab();
        
        // Refresh tabel setelah 1.5 detik
        setTimeout(() => {
          muatSemuaPenanggungJawab();
        }, 1500);
      } else {
        console.error('❁EGagal memperbarui penanggung jawab:', data.message);
        tampilkanNotifikasi('Gagal memperbarui: ' + data.message, 'error');
      }
    })
    .catch(error => {
      console.error('❁EError saat submit edit form:', error);
      tampilkanNotifikasi('Terjadi kesalahan saat menyimpan', 'error');
    });
}

// ==================== FUNGSI HAPUS SUPERVISOR ==================== //

/**
 * Menampilkan modal konfirmasi sebelum menghapus supervisor
 * @function hapusPenanggungJawab
 * @param {string} idSupervisor - ID supervisor yang akan dihapus
 */
function hapusPenanggungJawab(idSupervisor) {
  console.log('🗑�E�EMenampilkan konfirmasi hapus supervisor, ID:', idSupervisor);
  
  // Buat modal konfirmasi dinamis
  const modalHTML = `
    <div class="modal-konfirmasi-hapus" id="modalKonfirmasiHapus">
      <div class="overlay-konfirmasi"></div>
      <div class="konten-konfirmasi">
        <div class="header-konfirmasi">
          <h2>Hapus Penanggung Jawab?</h2>
          <button type="button" class="tombol-tutup-konfirmasi" onclick="tutupKonfirmasiHapus()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="body-konfirmasi">
          <div class="icon-warning">
            <i class="fas fa-exclamation-triangle"></i>
          </div>
          <p class="pesan-konfirmasi">Anda yakin ingin menghapus penanggung jawab ini? Tindakan ini tidak dapat dibatalkan.</p>
        </div>
        <div class="footer-konfirmasi">
          <button type="button" class="tombol-batal-konfirmasi" onclick="tutupKonfirmasiHapus()">
            Batal
          </button>
          <button type="button" class="tombol-hapus-konfirmasi" onclick="proseshapusPenanggungJawab('${idSupervisor}')">
            Hapus
          </button>
        </div>
      </div>
    </div>
  `;

  // Insert modal ke DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Trigger animasi tampil
  setTimeout(() => {
    const modal = document.getElementById('modalKonfirmasiHapus');
    modal.classList.add('tampil');
  }, 10);
}

/**
 * Menutup modal konfirmasi hapus
 * @function tutupKonfirmasiHapus
 */
function tutupKonfirmasiHapus() {
  console.log('🔒 Menutup modal konfirmasi hapus');
  const modal = document.getElementById('modalKonfirmasiHapus');
  if (modal) {
    modal.classList.remove('tampil');
    // Hapus elemen setelah animasi selesai
    setTimeout(() => {
      modal.remove();
    }, 300);
  }
}

/**
 * Mengirim request hapus ke API
 * @function proseshapusPenanggungJawab
 * @param {string} idSupervisor - ID supervisor yang akan dihapus
 */
function proseshapusPenanggungJawab(idSupervisor) {
  console.log('📤 Mengirim request hapus supervisor ke API');
  
  // Tutup modal konfirmasi
  tutupKonfirmasiHapus();

  // Tampilkan loading notification
  tampilkanNotifikasi('Menghapus penanggung jawab...', 'loading');

  fetch(`/api/admin/supervisor/${idSupervisor}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        console.log('✁EPenanggung jawab berhasil dihapus');
        tampilkanNotifikasi('Penanggung jawab berhasil dihapus', 'sukses');
        
        // Refresh tabel setelah 1.5 detik
        setTimeout(() => {
          muatSemuaPenanggungJawab();
        }, 1500);
      } else {
        console.error('❁EGagal menghapus penanggung jawab:', data.message);
        tampilkanNotifikasi('Gagal menghapus: ' + data.message, 'error');
      }
    })
    .catch(error => {
      console.error('❁EError saat delete supervisor:', error);
      tampilkanNotifikasi('Terjadi kesalahan saat menghapus', 'error');
    });
}

// ==================== FUNGSI NOTIFIKASI TOAST ==================== //

/**
 * Menampilkan notifikasi toast dengan berbagai tipe
 * @function tampilkanNotifikasi
 * @param {string} pesan - Pesan notifikasi
 * @param {string} tipe - Tipe notifikasi: 'sukses', 'error', 'info', 'loading'
 */
function tampilkanNotifikasi(pesan, tipe = 'info') {
  // Hapus notifikasi lama jika ada
  const notifikasiLama = document.querySelector('.notifikasi-toast');
  if (notifikasiLama) {
    notifikasiLama.remove();
  }

  // Buat elemen notifikasi
  const notifikasi = document.createElement('div');
  notifikasi.className = `notifikasi-toast notifikasi-${tipe}`;
  notifikasi.innerHTML = `
    <div class="konten-notifikasi">
      <span class="pesan-notifikasi">${pesan}</span>
    </div>
  `;

  // Tambahkan ke body
  document.body.appendChild(notifikasi);

  // Trigger animasi
  setTimeout(() => {
    notifikasi.classList.add('tampil');
  }, 10);

  // Hapus otomatis setelah 4 detik (kecuali loading)
  if (tipe !== 'loading') {
    setTimeout(() => {
      notifikasi.classList.remove('tampil');
      setTimeout(() => notifikasi.remove(), 300);
    }, 4000);
  }
}

// ==================== FUNGSI HELPER ==================== //

/**
 * Memformat tanggal ke format Indonesia
 * @function formatTanggal
 * @param {string} tanggal - ISO string atau date string
 * @returns {string} - Tanggal dalam format "d MMM yyyy"
 */
function formatTanggal(tanggal) {
  const date = new Date(tanggal);
  const bulan = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  
  const hari = String(date.getDate()).padStart(2, '0');
  const bulanTeks = bulan[date.getMonth()];
  const tahun = date.getFullYear();

  return `${hari} ${bulanTeks} ${tahun}`;
}

// ==================== EVENT LISTENERS - MODAL TAMBAH ==================== //

// Tombol buka modal tambah
document.getElementById('tombolBukaModalPenanggungJawab')?.addEventListener('click', bukaModalTambahPenanggungJawab);

// Tombol tutup modal tambah
document.getElementById('tombolTutupModalTambah')?.addEventListener('click', tutupModalTambahPenanggungJawab);
document.getElementById('tombolBatalTambah')?.addEventListener('click', tutupModalTambahPenanggungJawab);

// Tutup modal saat klik overlay
document.getElementById('lapisanOverlayTambahPenanggungJawab')?.addEventListener('click', function(e) {
  if (e.target === this) {
    tutupModalTambahPenanggungJawab();
  }
});

// Submit form tambah
document.getElementById('formTambahPenanggungJawab')?.addEventListener('submit', submitFormTambahPenanggungJawab);

// ==================== EVENT LISTENERS - MODAL EDIT ==================== //

// Tombol tutup modal edit
document.getElementById('tombolTutupModalEdit')?.addEventListener('click', tutupModalEditPenanggungJawab);
document.getElementById('tombolBatalEdit')?.addEventListener('click', tutupModalEditPenanggungJawab);

// Tutup modal saat klik overlay
document.getElementById('lapisanOverlayEditPenanggungJawab')?.addEventListener('click', function(e) {
  if (e.target === this) {
    tutupModalEditPenanggungJawab();
  }
});

// Submit form edit
document.getElementById('formEditPenanggungJawab')?.addEventListener('submit', submitFormEditPenanggungJawab);

// ==================== INITIALIZATION ==================== //

// Load data penanggung jawab saat halaman dimuat
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Halaman manajemen penanggung jawab siap');
  muatSemuaPenanggungJawab();
});

