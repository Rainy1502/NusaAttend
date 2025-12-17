// Main client-side app.js

// Ready state
document.addEventListener('DOMContentLoaded', function() {
  console.log('NusaAttend app loaded');
  
  // Initialize tooltips dan popovers jika menggunakan Bootstrap
  initializeBootstrapComponents();
});

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
