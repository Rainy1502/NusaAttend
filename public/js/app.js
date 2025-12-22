// Main client-side app.js

// Ready state
document.addEventListener('DOMContentLoaded', function() {
  console.log('NusaAttend app loaded');
  
  // Initialize tooltips dan popovers jika menggunakan Bootstrap
  initializeBootstrapComponents();

  // Initialize modal logout konfirmasi
  initializeModalLogout();
});

// ==================== MODAL LOGOUT KONFIRMASI ====================

/**
 * Fungsi: initializeModalLogout
 * 
 * Menginisialisasi event listener untuk modal konfirmasi logout dengan animasi
 * - Tombol Keluar (sidebar) → Buka modal dengan animasi fade-in
 * - Tombol Batal → Tutup modal dengan animasi fade-out
 * - Tombol Konfirmasi Keluar → Submit form logout
 * 
 * ANIMASI:
 * - Modal masuk: fade-in + slide-up (400ms)
 * - Modal keluar: fade-out + slide-down (300ms)
 * - Overlay: tetap smooth tanpa hard switch
 */
function initializeModalLogout() {
  // Ambil element modal dan tombol
  const lapisanOverlayLogout = document.getElementById('lapisanOverlayLogout');
  const modalKonfirmasiLogout = document.querySelector('.modalKonfirmasiLogout');
  const tombolKeluarDashboard = document.getElementById('tombolKeluarDashboard');
  const tombolBatalLogout = document.getElementById('tombolBatalLogout');
  const tombolKonfirmasiLogout = document.getElementById('tombolKonfirmasiLogout');
  const formLogout = document.getElementById('formLogout');

  // Jika element tidak ditemukan, skip initialization
  if (!lapisanOverlayLogout || !tombolKeluarDashboard) {
    return;
  }

  /**
   * Event: Klik tombol Keluar (sidebar)
   * Aksi: Tampilkan modal konfirmasi logout dengan animasi
   */
  tombolKeluarDashboard.addEventListener('click', function(e) {
    e.preventDefault();
    console.log('🎬 Membuka modal logout dengan animasi...');
    
    // Step 1: Tampilkan overlay
    lapisanOverlayLogout.classList.add('aktif');
    
    // Step 2: Animasi modal masuk
    if (modalKonfirmasiLogout) {
      modalKonfirmasiLogout.classList.remove('modalAnimasiKeluar');
      modalKonfirmasiLogout.classList.add('modalAnimasiMasuk');
      console.log('✅ Modal logout dibuka dengan animasi fade-in + slide-up');
    }
  });

  /**
   * Event: Klik tombol Batal
   * Aksi: Tutup modal dengan animasi fade-out
   */
  tombolBatalLogout.addEventListener('click', function() {
    console.log('🔒 Menutup modal logout dengan animasi...');
    tutupModalLogoutDenganAnimasi();
  });

  /**
   * Event: Klik overlay (background modal)
   * Aksi: Tutup modal jika klik di luar modal
   */
  lapisanOverlayLogout.addEventListener('click', function(e) {
    if (e.target === lapisanOverlayLogout) {
      console.log('🔒 Menutup modal logout via overlay click...');
      tutupModalLogoutDenganAnimasi();
    }
  });

  /**
   * Event: Klik tombol Konfirmasi Logout
   * Aksi: Submit form logout untuk mengirim request ke server
   */
  tombolKonfirmasiLogout.addEventListener('click', function() {
    // Submit form logout
    if (formLogout) {
      formLogout.submit();
    }
  });

  /**
   * Event: Keyboard (ESC key)
   * Aksi: Tutup modal saat menekan tombol ESC dengan animasi
   */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lapisanOverlayLogout.classList.contains('aktif')) {
      console.log('🔒 Menutup modal logout via ESC key...');
      tutupModalLogoutDenganAnimasi();
    }
  });

  /**
   * Helper function: Tutup modal logout dengan animasi
   * Animasi: fade-out + slide-down (300ms)
   */
  function tutupModalLogoutDenganAnimasi() {
    // Step 1: Animasi modal keluar
    if (modalKonfirmasiLogout) {
      modalKonfirmasiLogout.classList.remove('modalAnimasiMasuk');
      modalKonfirmasiLogout.classList.add('modalAnimasiKeluar');
      console.log('🎬 Modal logout animate out (fade-out + slide-down)');
    }
    
    // Step 2: Tunggu animasi selesai, baru hide overlay
    setTimeout(() => {
      lapisanOverlayLogout.classList.remove('aktif');
      console.log('✅ Modal logout ditutup setelah animasi');
    }, 300); // Durasi animasi keluar
  }
}

// Initialize Bootstrap components
function initializeBootstrapComponents() {
  // Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

// Helper function untuk format date
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
}

// Helper function untuk format time
function formatTime(timeString) {
  return new Date(timeString).toLocaleTimeString('id-ID');
}
