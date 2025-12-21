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
 * Menginisialisasi event listener untuk modal konfirmasi logout
 * - Tombol Keluar (sidebar) → Buka modal konfirmasi
 * - Tombol Batal → Tutup modal
 * - Tombol Konfirmasi Keluar → Submit form logout
 */
function initializeModalLogout() {
  // Ambil element modal dan tombol
  const lapisanOverlayLogout = document.getElementById('lapisanOverlayLogout');
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
   * Aksi: Tampilkan modal konfirmasi logout
   */
  tombolKeluarDashboard.addEventListener('click', function(e) {
    e.preventDefault();
    lapisanOverlayLogout.classList.add('aktif');
  });

  /**
   * Event: Klik tombol Batal
   * Aksi: Tutup modal konfirmasi logout
   */
  tombolBatalLogout.addEventListener('click', function() {
    lapisanOverlayLogout.classList.remove('aktif');
  });

  /**
   * Event: Klik overlay (background modal)
   * Aksi: Tutup modal jika klik di luar modal
   */
  lapisanOverlayLogout.addEventListener('click', function(e) {
    if (e.target === lapisanOverlayLogout) {
      lapisanOverlayLogout.classList.remove('aktif');
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
   * Aksi: Tutup modal saat menekan tombol ESC
   */
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lapisanOverlayLogout.classList.contains('aktif')) {
      lapisanOverlayLogout.classList.remove('aktif');
    }
  });
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
