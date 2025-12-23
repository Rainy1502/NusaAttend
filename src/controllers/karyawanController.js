const Pengguna = require('../models/Pengguna');
const { kirimEmailAkunBaru } = require('../utils/emailService');

/**
 * Controller untuk menangani operasi manajemen karyawan
 * Semua karyawan adalah User dengan role = 'employee'
 * 
 * Fungsi utama:
 * - ambilSemuaKaryawan: Mengambil data semua karyawan (User dengan role = 'employee')
 * - tambahKaryawanBaru: Menambah karyawan baru dengan validasi dasar
 * - hapusKaryawanById: Menghapus karyawan berdasarkan ID
 */

const kontrolerKaryawan = {
  /**
   * Fungsi: ambilSemuaKaryawan
   * Deskripsi: Mengambil semua pengguna dengan role = 'employee' dari database
   * Response: Array dari karyawan tanpa field password
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilSemuaKaryawan(req, res) {
    try {
      // Query semua user dengan role = 'karyawan'
      // select('-password') untuk tidak mengembalikan password
      // populate('penanggung_jawab_id') untuk menampilkan data supervisor lengkap
      const dataKaryawan = await Pengguna.find({ role: 'karyawan' })
        .select('-password')
        .populate('penanggung_jawab_id', 'nama_lengkap email');

      // Jika tidak ada karyawan
      if (dataKaryawan.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Belum ada karyawan terdaftar',
          data: []
        });
      }

      // Response sukses dengan data karyawan
      res.status(200).json({
        success: true,
        message: 'Data karyawan berhasil diambil',
        data: dataKaryawan,
        total: dataKaryawan.length
      });
    } catch (error) {
      console.error('Error saat mengambil data karyawan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data karyawan',
        data: null
      });
    }
  },

  /**
   * Fungsi: tambahKaryawanBaru
   * Deskripsi: Menambah karyawan baru dengan validasi input dan handling error email duplikat
   * 
   * Expected input dari req.body:
   * - nama_lengkap: string (wajib)
   * - email: string (wajib, unique)
   * - jabatan: string (wajib)
   * - jatah_cuti_tahunan: number (opsional, default 12)
   * - password: string (opsional, jika tidak ada, generate random)
   * - generatePassword: boolean (jika true, generate password random)
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async tambahKaryawanBaru(req, res) {
    try {
      const {
        nama_lengkap,
        email,
        jabatan,
        jatah_cuti_tahunan = 12,
        password = 'password123', // Password default untuk demo akademik
        generatePassword = false,
        penanggung_jawab_id
      } = req.body;

      // Validasi data wajib
      if (!nama_lengkap || !email || !jabatan || !penanggung_jawab_id) {
        return res.status(400).json({
          success: false,
          message: 'Data tidak lengkap. Field nama_lengkap, email, jabatan, dan penanggung_jawab wajib diisi.',
          data: null
        });
      }

      // Validasi format email
      const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexEmail.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Format email tidak valid',
          data: null
        });
      }

      // Cek apakah email sudah terdaftar
      const karyawanExisting = await Pengguna.findOne({ email });
      if (karyawanExisting) {
        return res.status(409).json({
          success: false,
          message: `Email ${email} sudah terdaftar di sistem`,
          data: null
        });
      }

      // Generate password jika generatePassword === true
      let passwordFinal = password;
      if (generatePassword) {
        // Generate random password 8 karakter (kombinasi huruf dan angka)
        passwordFinal = Math.random().toString(36).slice(2, 10);
      }

      // Buat object karyawan baru
      const karyawanBaru = new Pengguna({
        nama_lengkap: nama_lengkap.trim(),
        email: email.toLowerCase().trim(),
        jabatan: jabatan.trim(),
        role: 'karyawan', // Set role ke 'karyawan' untuk karyawan
        password: passwordFinal,
        jatah_cuti_tahunan,
        sisa_cuti: jatah_cuti_tahunan,
        penanggung_jawab_id,
        adalah_aktif: true
      });

      // Simpan ke database (password akan di-hash otomatis via pre-save hook di User model)
      await karyawanBaru.save();

      // Return data karyawan tanpa password
      const responseKaryawan = karyawanBaru.keJSON();

      // Response sukses
      res.status(201).json({
        success: true,
        message: `Karyawan ${nama_lengkap} berhasil ditambahkan`,
        data: responseKaryawan
      });

      // ==================== PENGIRIMAN EMAIL NOTIFIKASI ====================
      /**
       * Email dikirim SETELAH data berhasil disimpan ke database
       * Jika ada error pada pengiriman email, TIDAK MEMBLOK proses pembuatan akun
       * Email bersifat informatif, bukan verifikasi atau OTP
       * 
       * Kondisi: Email hanya dikirim jika generatePassword === true (explicit opt-in)
       */
      if (generatePassword) {
        // Kirim email notifikasi akun baru secara asinkron (fire-and-forget)
        // Tidak perlu await karena email bukan blocking operation
        kirimEmailAkunBaru(
          email,
          nama_lengkap,
          'Karyawan',
          process.env.APP_URL || 'https://nusaattend.local',
          passwordFinal  // Kirim password yang sudah di-generate
        ).catch(error => {
          // Error handling: jika email gagal, hanya log ke console
          // Tidak perlu merespons karena akun sudah berhasil dibuat
          console.error(`[KARYAWAN CONTROLLER] Error mengirim email ke ${email}:`, error);
        });
      }
    } catch (error) {
      // Handle error duplicate key email
      if (error.code === 11000 && error.keyPattern.email) {
        return res.status(409).json({
          success: false,
          message: `Email ${req.body.email} sudah terdaftar di sistem`,
          data: null
        });
      }

      // Handle error validasi dari Mongoose
      if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal: ' + messages.join(', '),
          data: null
        });
      }

      console.error('Error saat menambah karyawan:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambah karyawan',
        data: null
      });
    }
  },

  /**
   * Fungsi: hapusKaryawanById
   * Deskripsi: Menghapus karyawan berdasarkan ID, dengan validasi bahwa yang dihapus adalah employee
   * 
   * Expected parameter:
   * - id: MongoDB ObjectId (dari req.params.id)
   * 
   * @param {Object} req - Request object dari Express (berisi params.id)
   * @param {Object} res - Response object dari Express
   */
  async hapusKaryawanById(req, res) {
    try {
      const { id } = req.params;

      // Validasi bahwa id tidak kosong
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'ID karyawan tidak ditemukan di parameter',
          data: null
        });
      }

      // Cari karyawan berdasarkan ID
      const karyawan = await Pengguna.findById(id);
      if (!karyawan) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan',
          data: null
        });
      }

      // Validasi bahwa yang dihapus adalah karyawan (bukan admin/supervisor)
      if (karyawan.role !== 'karyawan') {
        return res.status(403).json({
          success: false,
          message: `Tidak bisa menghapus user dengan role ${karyawan.role}. Hanya karyawan yang bisa dihapus.`,
          data: null
        });
      }

      // Hapus karyawan dari database
      await Pengguna.findByIdAndDelete(id);

      // Response sukses
      res.status(200).json({
        success: true,
        message: `Karyawan ${karyawan.nama_lengkap} berhasil dihapus`,
        data: {
          id: karyawan._id,
          nama_lengkap: karyawan.nama_lengkap,
          email: karyawan.email
        }
      });
    } catch (error) {
      console.error('Error saat menghapus karyawan:', error);
      
      // Handle invalid MongoDB ObjectId
      if (error.name === 'CastError') {
        return res.status(400).json({
          success: false,
          message: 'Format ID karyawan tidak valid',
          data: null
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus karyawan',
        data: null
      });
    }
  },

  /**
   * Fungsi: ambilSemuaSupervisor
   * Deskripsi: Mengambil semua supervisor dari database untuk dropdown penanggung jawab
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilSemuaSupervisor(req, res) {
    try {
      const semuaSupervisor = await Pengguna.find({ role: 'penanggung-jawab' }).select(
        'nama_lengkap email'
      );

      res.status(200).json({
        success: true,
        message: 'Berhasil mengambil data supervisor',
        data: semuaSupervisor
      });
    } catch (error) {
      console.error('Error ambilSemuaSupervisor:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data supervisor',
        data: null
      });
    }
  },

  /**
   * Fungsi: ambilKaryawanById
   * Deskripsi: Mengambil data karyawan berdasarkan ID untuk keperluan edit
   * 
   * @param {Object} req - Request object dengan parameter :id
   * @param {Object} res - Response object dari Express
   */
  async ambilKaryawanById(req, res) {
    try {
      const { id } = req.params;

      // Validasi format ID MongoDB
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Format ID tidak valid',
          data: null
        });
      }

      // Cari karyawan berdasarkan ID dan populate penanggung_jawab_id
      const karyawan = await Pengguna.findById(id)
        .select('-password')
        .populate('penanggung_jawab_id', 'nama_lengkap email');

      // Jika karyawan tidak ditemukan
      if (!karyawan) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan',
          data: null
        });
      }

      // Jika yang ditemukan bukan karyawan (role bukan 'karyawan')
      if (karyawan.role !== 'karyawan') {
        return res.status(403).json({
          success: false,
          message: 'User ini bukan karyawan',
          data: null
        });
      }

      // Response sukses
      res.status(200).json({
        success: true,
        message: 'Data karyawan berhasil diambil',
        data: karyawan
      });
    } catch (error) {
      console.error('Error ambilKaryawanById:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data karyawan',
        data: null
      });
    }
  },

  /**
   * Fungsi: perbaruiDataKaryawan
   * Deskripsi: Memperbarui data karyawan berdasarkan ID
   * 
   * Field yang dapat diubah:
   * - nama_lengkap: string (opsional)
   * - email: string (opsional)
   * - jabatan: string (opsional)
   * - jatah_cuti_tahunan: number (opsional)
   * - penanggung_jawab_id: MongoDB ObjectId (opsional)
   * - adalah_aktif: boolean (opsional)
   * 
   * @param {Object} req - Request object dengan parameter :id
   * @param {Object} res - Response object dari Express
   */
  async perbaruiDataKaryawan(req, res) {
    try {
      const { id } = req.params;
      const {
        nama_lengkap,
        email,
        jabatan,
        jatah_cuti_tahunan,
        penanggung_jawab_id
      } = req.body;

      // Validasi format ID MongoDB
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Format ID tidak valid',
          data: null
        });
      }

      // Validasi data minimal (minimal salah satu field harus diisi)
      if (!nama_lengkap && !email && !jabatan && !jatah_cuti_tahunan && !penanggung_jawab_id) {
        return res.status(400).json({
          success: false,
          message: 'Minimal ada satu field yang harus diupdate',
          data: null
        });
      }

      // Jika email diupdate, validasi format
      if (email) {
        const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!regexEmail.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'Format email tidak valid',
            data: null
          });
        }

        // Cek apakah email sudah digunakan oleh user lain
        const cekEmail = await Pengguna.findOne({ email, _id: { $ne: id } });
        if (cekEmail) {
          return res.status(400).json({
            success: false,
            message: 'Email sudah terdaftar',
            data: null
          });
        }
      }

      // Cari dan validasi karyawan
      const karyawan = await Pengguna.findById(id);
      if (!karyawan) {
        return res.status(404).json({
          success: false,
          message: 'Karyawan tidak ditemukan',
          data: null
        });
      }

      if (karyawan.role !== 'karyawan') {
        return res.status(403).json({
          success: false,
          message: 'User ini bukan karyawan',
          data: null
        });
      }

      // Update field yang disediakan
      if (nama_lengkap) karyawan.nama_lengkap = nama_lengkap;
      if (email) karyawan.email = email;
      if (jabatan) karyawan.jabatan = jabatan;
      if (jatah_cuti_tahunan) karyawan.jatah_cuti_tahunan = jatah_cuti_tahunan;
      if (penanggung_jawab_id) karyawan.penanggung_jawab_id = penanggung_jawab_id;

      // Simpan perubahan
      await karyawan.save();

      // Populate penanggung_jawab_id untuk response
      await karyawan.populate('penanggung_jawab_id', 'nama_lengkap email');

      // Response sukses
      res.status(200).json({
        success: true,
        message: 'Data karyawan berhasil diperbarui',
        data: karyawan
      });
    } catch (error) {
      console.error('Error updateKaryawanById:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat memperbarui data karyawan',
        data: null
      });
    }
  }
};

module.exports = kontrolerKaryawan;
