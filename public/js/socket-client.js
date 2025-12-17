// Socket client untuk real-time communication
const socket = io('/socket');

// Dengarkan notifikasi pengajuan baru
socket.on('pengajuan_baru_notifikasi', function(data) {
  console.log('Pengajuan baru:', data);
  showNotification('Ada pengajuan baru', 'info');
});

// Dengarkan notifikasi status berubah
socket.on('status_pengajuan_diubah_notifikasi', function(data) {
  console.log('Status pengajuan berubah:', data);
  showNotification('Status pengajuan telah diubah: ' + data.status, 'warning');
});

// Dengarkan notifikasi absensi tercatat
socket.on('absensi_tercatat_notifikasi', function(data) {
  console.log('Absensi tercatat:', data);
  showNotification('Absensi berhasil tercatat', 'success');
});

// Helper function untuk menampilkan notifikasi
function showNotification(message, type) {
  // Bisa diganti dengan toast library seperti toastr, bootstrap toast, dll
  console.log(`[${type.toUpperCase()}] ${message}`);
  
  // Optional: Menggunakan browser notification API
  if (Notification.permission === 'granted') {
    new Notification('NusaAttend', {
      body: message,
      icon: '/img/nusaattend-logo.png'
    });
  }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}
