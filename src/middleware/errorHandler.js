/**
 * Middleware untuk menangani kesalahan (error) di aplikasi
 * Menampilkan pesan error dan status code yang sesuai
 */
const penggantiKesalahan = (err, req, res, next) => {
  console.error('Kesalahan:', err);

  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server';

  res.status(status).json({
    success: false,
    status: status,
    message: message,
    // Tampilkan stack trace hanya di development mode
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware untuk menangani halaman yang tidak ditemukan (404)
 * Render halaman 404 ketika rute tidak ada dari folder publik
 */
const penggantiTidakDitemukan = (req, res) => {
  res.status(404).render('publik/404', { title: 'Halaman Tidak Ditemukan' });
};

module.exports = { penggantiKesalahan, penggantiTidakDitemukan };
