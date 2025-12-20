// ==================== SCRIPT UNTUK HALAMAN MANAJEMEN KARYAWAN ====================
// File ini menangani semua client-side logic untuk halaman manajemen karyawan
// Termasuk: modal control, form handling, API communication

// ==================== DIAGNOSTIC ====================
console.log('✅ manajemen-karyawan.js loaded successfully');

// Immediate logging untuk check apakah file ter-load
window.manajemenKaryawanLoaded = true;
console.log('🔍 Global variable manajemenKaryawanLoaded = true');

// ==================== FUNGSI-FUNGSI MODAL ====================

/**
 * Load daftar karyawan dari API dan tampilkan di halaman
 */
function muatSemuaKaryawan() {
    console.log('📥 Loading employee list from API...');
    console.log('🔍 Looking for container with id: daftarKaryawanContainer');
    
    const karyawanList = document.getElementById('daftarKaryawanContainer');
    console.log('Container found:', karyawanList ? '✅ YES' : '❌ NO');
    
    fetch('/api/admin/karyawan')
        .then(response => {
            console.log('📡 API Response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📦 API Response data:', data);
            
            if (data.success) {
                if (!karyawanList) {
                    console.error('❌ Container #daftarKaryawanContainer not found');
                    return;
                }
                
                // Bersihkan container
                karyawanList.innerHTML = '';
                
                if (data.data && data.data.length > 0) {
                    console.log(`✅ ${data.data.length} employees loaded`);
                    
                    // Buat container tabel dengan styling Figma
                    let containerHTML = `
                        <div class="tabel-karyawan-container">
                            <div class="tabel-header">
                                <h2 class="tabel-judul">Daftar Karyawan (${data.data.length})</h2>
                            </div>
                            <div class="tabel-wrapper">
                                <table class="tabel-daftar-karyawan">
                                    <thead class="tabel-kepala">
                                        <tr class="baris-header">
                                            <th class="sel-header nama-header">Nama</th>
                                            <th class="sel-header email-header">Email</th>
                                            <th class="sel-header jabatan-header">Jabatan</th>
                                            <th class="sel-header penanggung-jawab-header">Penanggung Jawab</th>
                                            <th class="sel-header sisa-cuti-header">Sisa Cuti</th>
                                            <th class="sel-header status-header">Status</th>
                                            <th class="sel-header aksi-header">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                    `;
                    
                    // Render setiap karyawan
                    data.data.forEach((karyawan, index) => {
                        console.log(`Processing employee ${index + 1}:`, karyawan.nama_lengkap);
                        
                        // Tentukan status badge
                        const statusClass = karyawan.adalah_aktif ? 'status-aktif' : 'status-nonaktif';
                        const statusText = karyawan.adalah_aktif ? 'aktif' : 'nonaktif';
                        
                        // Nama penanggung jawab (bisa undefined jika belum diassign)
                        const penanggungJawab = karyawan.penanggung_jawab_id?.nama_lengkap || '-';
                        
                        containerHTML += `
                            <tr class="baris-data">
                                <td class="sel-data nama-karyawan">${karyawan.nama_lengkap}</td>
                                <td class="sel-data email-cell">${karyawan.email}</td>
                                <td class="sel-data jabatan-cell">${karyawan.jabatan}</td>
                                <td class="sel-data penanggung-jawab-cell">${penanggungJawab}</td>
                                <td class="sel-data sisa-cuti-cell sisa-cuti-karyawan">${karyawan.sisa_cuti}/${karyawan.jatah_cuti_tahunan} hari</td>
                                <td class="sel-data">
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </td>
                                <td class="sel-data">
                                    <div class="kontainer-aksi">
                                        <button class="tombol-aksi tombol-edit" title="Edit Karyawan" onclick="bukaModalEditKaryawan('${karyawan._id}')">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="tombol-aksi tombol-hapus" title="Hapus Karyawan" onclick="hapusKaryawan('${karyawan._id}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `;
                    });
                    
                    containerHTML += `
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    `;
                    
                    karyawanList.innerHTML = containerHTML;
                    console.log('✅ Table rendered successfully');
                } else {
                    console.log('⚠️  No employees found');
                    
                    // Show empty state
                    karyawanList.innerHTML = `
                        <div class="pesan-kosong-karyawan">
                            <div class="ikon-kosong-karyawan">
                                <i class="fas fa-users"></i>
                            </div>
                            <p class="teks-kosong-karyawan">Belum ada karyawan. Silakan tambahkan karyawan baru untuk memulai.</p>
                            <button type="button" class="tombol-tambah-pertama" id="tombolTambahPertama" onclick="bukaModalTambahKaryawan()">
                                <i class="fas fa-plus"></i> Tambah Karyawan Pertama
                            </button>
                        </div>
                    `;
                }
            } else {
                console.error('❌ API returned success: false');
                console.error('Message:', data.message);
                
                if (karyawanList) {
                    karyawanList.innerHTML = `
                        <div style="text-align: center; padding: 40px; color: #d32f2f;">
                            <p><strong>Gagal memuat data karyawan</strong></p>
                            <p>${data.message}</p>
                        </div>
                    `;
                }
            }
        })
        .catch(error => {
            console.error('❌ Error loading employees:', error);
            
            if (karyawanList) {
                karyawanList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #d32f2f;">
                        <p><strong>Error:</strong> ${error.message}</p>
                    </div>
                `;
            }
        });
}

/**
 * Membuka modal tambah karyawan baru
 * Menambahkan class 'tampil-overlay' untuk menampilkan modal dengan animasi
 */
function bukaModalTambahKaryawan() {
    console.log('📂 Opening modal...');
    const lapisanOverlay = document.getElementById('lapisanOverlayTambahKaryawan');
    if (lapisanOverlay) {
        lapisanOverlay.classList.add('tampil-overlay');
        console.log('✅ Modal opened');
        
        // Load supervisors untuk dropdown
        loadSupervisors();
    } else {
        console.error('❌ Modal element not found');
    }
}

/**
 * Load daftar supervisor dari API untuk dropdown penanggung jawab
 */
function loadSupervisors() {
    fetch('/api/admin/supervisors')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data.length > 0) {
                const selectPenanggungJawab = document.getElementById('inputPenanggungJawab');
                // Clear existing options (keep placeholder)
                while (selectPenanggungJawab.options.length > 1) {
                    selectPenanggungJawab.remove(1);
                }
                
                // Add supervisor options
                data.data.forEach(supervisor => {
                    const option = document.createElement('option');
                    option.value = supervisor._id;
                    option.textContent = supervisor.nama_lengkap;
                    selectPenanggungJawab.appendChild(option);
                });
                
                console.log('✅ Supervisors loaded:', data.data.length);
            } else {
                console.warn('⚠️ No supervisors found');
            }
        })
        .catch(error => {
            console.error('❌ Error loading supervisors:', error);
        });
}

/**
 * Menutup modal tambah karyawan
 * Menghapus class 'tampil-overlay' dan me-reset form ke state awal
 */
function tutupModalTambahKaryawan() {
    const lapisanOverlay = document.getElementById('lapisanOverlayTambahKaryawan');
    const formTambahKaryawan = document.getElementById('formTambahKaryawan');
    
    if (lapisanOverlay) {
        lapisanOverlay.classList.remove('tampil-overlay');
    }
    
    if (formTambahKaryawan) {
        formTambahKaryawan.reset();
        // Set nilai default untuk field tertentu
        document.getElementById('inputJatahCuti').value = '12';
        document.getElementById('checkboxGeneratePassword').checked = true;
    }
}

/**
 * Menghapus karyawan dengan konfirmasi modal
 * @param {string} idKaryawan - ID unik karyawan yang akan dihapus
 */
function hapusKaryawan(idKaryawan) {
    // Tampilkan modal konfirmasi custom
    const namaKaryawan = document.querySelector(`[data-id="${idKaryawan}"]`)?.textContent || 'karyawan';
    
    // Buat modal konfirmasi
    const modal = document.createElement('div');
    modal.className = 'modal-konfirmasi-hapus';
    modal.innerHTML = `
        <div class="overlay-konfirmasi"></div>
        <div class="konten-konfirmasi">
            <div class="header-konfirmasi">
                <h3>Konfirmasi Penghapusan</h3>
                <button class="tombol-tutup-konfirmasi" onclick="tutupKonfirmasiHapus()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="body-konfirmasi">
                <div class="icon-warning">
                    <i class="fas fa-exclamation-circle"></i>
                </div>
                <p class="teks-konfirmasi">Apakah Anda yakin ingin menghapus karyawan ini?</p>
                <p class="teks-detail">Data karyawan akan dihapus secara permanen dan tidak dapat dikembalikan.</p>
            </div>
            <div class="footer-konfirmasi">
                <button class="tombol-batal-konfirmasi" onclick="tutupKonfirmasiHapus()">
                    Batal
                </button>
                <button class="tombol-hapus-konfirmasi" onclick="prosesHapusKaryawan('${idKaryawan}')">
                    Hapus Sekarang
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Tambahkan delay kecil sebelum show untuk animasi smooth
    setTimeout(() => {
        modal.classList.add('tampil');
    }, 10);
}

/**
 * Menutup modal konfirmasi hapus
 */
function tutupKonfirmasiHapus() {
    const modal = document.querySelector('.modal-konfirmasi-hapus');
    if (modal) {
        modal.classList.remove('tampil');
        setTimeout(() => modal.remove(), 300);
    }
}

/**
 * Proses penghapusan karyawan setelah konfirmasi
 * @param {string} idKaryawan - ID karyawan yang akan dihapus
 */
function prosesHapusKaryawan(idKaryawan) {
    // Tutup modal konfirmasi
    tutupKonfirmasiHapus();
    
    // Tampilkan loading notification
    tampilkanNotifikasi('Menghapus data karyawan...', 'loading');
    
    // Kirim request DELETE ke server
    fetch(`/api/admin/karyawan/${idKaryawan}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Tampilkan notifikasi sukses
            tampilkanNotifikasi('✅ Karyawan berhasil dihapus', 'sukses');
            
            // Reload list setelah 1.5 detik
            setTimeout(() => {
                muatSemuaKaryawan();
            }, 1500);
        } else {
            // Tampilkan notifikasi error
            tampilkanNotifikasi('❌ Gagal menghapus: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        tampilkanNotifikasi('❌ Terjadi kesalahan saat menghapus karyawan', 'error');
    });
}

/**
 * Tampilkan notifikasi toast di atas halaman
 * @param {string} pesan - Pesan yang ingin ditampilkan
 * @param {string} tipe - Tipe notifikasi: 'sukses', 'error', 'loading', 'info'
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

// ==================== MODAL EDIT KARYAWAN ====================

/**
 * Membuka modal edit karyawan dengan data karyawan yang dipilih
 * @param {string} idKaryawan - ID unik karyawan yang akan diedit
 */
function bukaModalEditKaryawan(idKaryawan) {
    console.log('🔓 Opening edit modal for employee:', idKaryawan);
    
    // Pertama, load daftar supervisor untuk dropdown
    loadSupervisorsEdit();
    
    // Fetch data karyawan berdasarkan ID
    fetch(`/api/admin/karyawan/${idKaryawan}`)
        .then(response => response.json())
        .then(data => {
            if (data.success && data.data) {
                const karyawan = data.data;
                console.log('✅ Employee data loaded:', karyawan);
                
                // Isi form dengan data karyawan
                document.getElementById('idKaryawanEdit').value = idKaryawan;
                document.getElementById('inputNamaLengkapEdit').value = karyawan.nama_lengkap || '';
                document.getElementById('inputEmailKerjaEdit').value = karyawan.email || '';
                document.getElementById('inputJabatanEdit').value = karyawan.jabatan || '';
                document.getElementById('inputJatahCutiEdit').value = karyawan.jatah_cuti_tahunan || 12;
                
                // Set penanggung jawab jika ada
                if (karyawan.penanggung_jawab_id) {
                    document.getElementById('inputPenanggungJawabEdit').value = karyawan.penanggung_jawab_id._id || '';
                }
                
                // Tampilkan modal
                const lapisanOverlay = document.getElementById('lapisanOverlayEditKaryawan');
                if (lapisanOverlay) {
                    lapisanOverlay.classList.add('tampil-overlay');
                }
            } else {
                alert('Gagal memuat data karyawan');
                console.error('Error loading employee:', data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan saat memuat data karyawan');
        });
}

/**
 * Load daftar supervisor ke dropdown pada modal edit
 */
function loadSupervisorsEdit() {
    fetch('/api/admin/supervisors')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const selectElement = document.getElementById('inputPenanggungJawabEdit');
                if (selectElement) {
                    // Simpan option pertama (placeholder)
                    const placeholder = selectElement.querySelector('option');
                    selectElement.innerHTML = '';
                    if (placeholder) {
                        selectElement.appendChild(placeholder);
                    }
                    
                    // Tambahkan supervisor ke dropdown
                    data.data.forEach(supervisor => {
                        const option = document.createElement('option');
                        option.value = supervisor._id;
                        option.textContent = supervisor.nama_lengkap;
                        selectElement.appendChild(option);
                    });
                    
                    console.log('✅ Supervisors loaded for edit modal:', data.data.length);
                }
            }
        })
        .catch(error => {
            console.error('Error loading supervisors:', error);
        });
}

/**
 * Menutup modal edit karyawan
 * Menghapus class 'tampil-overlay' dan me-reset form ke state awal
 */
function tutupModalEditKaryawan() {
    const lapisanOverlay = document.getElementById('lapisanOverlayEditKaryawan');
    const formEditKaryawan = document.getElementById('formEditKaryawan');
    
    if (lapisanOverlay) {
        lapisanOverlay.classList.remove('tampil-overlay');
    }
    
    if (formEditKaryawan) {
        formEditKaryawan.reset();
    }
    
    console.log('🔒 Edit modal closed');
}

// ==================== EVENT LISTENERS ====================

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔄 DOMContentLoaded fired for manajemen-karyawan');
    
    // Load employee list saat halaman pertama kali dibuka
    muatSemuaKaryawan();
    
    // Ambil elemen DOM yang diperlukan
    const tombolBukaModal = document.getElementById('tombolBukaModalKaryawan');
    const tombolTambahPertama = document.getElementById('tombolTambahPertama');
    const tombolTutupModal = document.getElementById('tombolTutupModal');
    const tombolBatalForm = document.getElementById('tombolBatalForm');
    const lapisanOverlay = document.getElementById('lapisanOverlayTambahKaryawan');
    const formTambahKaryawan = document.getElementById('formTambahKaryawan');
    
    console.log('✅ All DOM elements found and ready');
    
    // ==================== EVENT LISTENER - BUKA MODAL (BUTTON UTAMA) ====================
    if (tombolBukaModal) {
        tombolBukaModal.addEventListener('click', function(e) {
            console.log('🖱️ Button "Tambah Karyawan" clicked');
            e.preventDefault();
            bukaModalTambahKaryawan();
        });
    }
    
    // ==================== EVENT LISTENER - BUKA MODAL (BUTTON PERTAMA / EMPTY STATE) ====================
    if (tombolTambahPertama) {
        tombolTambahPertama.addEventListener('click', function(e) {
            console.log('🖱️ Button "Tambah Karyawan Pertama" clicked');
            e.preventDefault();
            bukaModalTambahKaryawan();
        });
    }
    
    // ==================== EVENT LISTENER - TUTUP MODAL (TOMBOL X) ====================
    if (tombolTutupModal) {
        tombolTutupModal.addEventListener('click', tutupModalTambahKaryawan);
    }
    
    // ==================== EVENT LISTENER - TOMBOL BATAL ====================
    if (tombolBatalForm) {
        tombolBatalForm.addEventListener('click', tutupModalTambahKaryawan);
    }
    
    // ==================== EVENT LISTENER - KLIK OVERLAY UNTUK TUTUP MODAL ====================
    if (lapisanOverlay) {
        lapisanOverlay.addEventListener('click', function(event) {
            // Hanya tutup modal jika mengklik overlay, bukan modal content
            if (event.target === lapisanOverlay) {
                tutupModalTambahKaryawan();
            }
        });
    }
    
    // ==================== EVENT LISTENER - FORM SUBMIT ====================
    if (formTambahKaryawan) {
        formTambahKaryawan.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Ambil data dari form
            const nama_lengkap = document.getElementById('inputNamaLengkap').value;
            const email = document.getElementById('inputEmailKerja').value;
            const jabatan = document.getElementById('inputJabatan').value;
            const penanggung_jawab_id = document.getElementById('inputPenanggungJawab').value;
            const jatah_cuti_tahunan = parseInt(document.getElementById('inputJatahCuti').value) || 12;
            const generatePassword = document.getElementById('checkboxGeneratePassword').checked;
            
            // Log data untuk debugging
            console.log('Data karyawan yang dikirim:', {
                nama_lengkap,
                email,
                jabatan,
                penanggung_jawab_id,
                jatah_cuti_tahunan,
                generatePassword
            });
            
            // Kirim data ke backend API
            fetch('/api/admin/karyawan', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nama_lengkap,
                    email,
                    jabatan,
                    penanggung_jawab_id,
                    jatah_cuti_tahunan,
                    generatePassword
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Karyawan ${nama_lengkap} berhasil ditambahkan!`);
                    tutupModalTambahKaryawan();
                    // Reload daftar karyawan tanpa refresh halaman
                    muatSemuaKaryawan();
                } else {
                    alert('Gagal menambah karyawan: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat menambah karyawan');
            });
        });
    }
    
    // ==================== EVENT LISTENER - MODAL EDIT KARYAWAN ====================
    // Ambil elemen DOM untuk modal edit
    const lapisanOverlayEditKaryawan = document.getElementById('lapisanOverlayEditKaryawan');
    const formEditKaryawan = document.getElementById('formEditKaryawan');
    const tombolTutupModalEdit = document.getElementById('tombolTutupModalEdit');
    const tombolBatalFormEdit = document.getElementById('tombolBatalFormEdit');
    
    // Event listener - Tombol tutup (X) modal edit
    if (tombolTutupModalEdit) {
        tombolTutupModalEdit.addEventListener('click', tutupModalEditKaryawan);
    }
    
    // Event listener - Tombol batal form edit
    if (tombolBatalFormEdit) {
        tombolBatalFormEdit.addEventListener('click', tutupModalEditKaryawan);
    }
    
    // Event listener - Klik overlay untuk tutup modal edit
    if (lapisanOverlayEditKaryawan) {
        lapisanOverlayEditKaryawan.addEventListener('click', function(event) {
            // Hanya tutup modal jika mengklik overlay, bukan modal content
            if (event.target === lapisanOverlayEditKaryawan) {
                tutupModalEditKaryawan();
            }
        });
    }
    
    // Event listener - Form submit untuk edit karyawan
    if (formEditKaryawan) {
        formEditKaryawan.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log('📝 Submitting edit form');
            
            // Ambil nilai dari form
            const idKaryawan = document.getElementById('idKaryawanEdit').value;
            const nama_lengkap = document.getElementById('inputNamaLengkapEdit').value;
            const email = document.getElementById('inputEmailKerjaEdit').value;
            const jabatan = document.getElementById('inputJabatanEdit').value;
            const penanggung_jawab_id = document.getElementById('inputPenanggungJawabEdit').value;
            const jatah_cuti_tahunan = parseInt(document.getElementById('inputJatahCutiEdit').value);
            
            console.log('📦 Form data:', {
                idKaryawan,
                nama_lengkap,
                email,
                jabatan,
                penanggung_jawab_id,
                jatah_cuti_tahunan
            });
            
            // Validasi input dasar
            if (!nama_lengkap || !email || !jabatan || !penanggung_jawab_id) {
                alert('Mohon lengkapi semua field yang diperlukan');
                return;
            }
            
            // Kirim data ke backend via PUT request
            fetch(`/api/admin/karyawan/${idKaryawan}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nama_lengkap,
                    email,
                    jabatan,
                    penanggung_jawab_id,
                    jatah_cuti_tahunan
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(`Data karyawan ${nama_lengkap} berhasil diperbarui!`);
                    tutupModalEditKaryawan();
                    // Reload daftar karyawan tanpa refresh halaman
                    muatSemuaKaryawan();
                } else {
                    alert('Gagal memperbarui data karyawan: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Terjadi kesalahan saat memperbarui data karyawan');
            });
        });
    }
    
    // ==================== SET ACTIVE SIDEBAR MENU ====================
    const menuItem = document.querySelector('[data-menu="manajemen-karyawan"]');
    if (menuItem) {
        menuItem.classList.add('active');
    }
});
