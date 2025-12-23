const Pengguna = require('../models/Pengguna');
const { kirimEmailAkunBaru } = require('../utils/emailService');

/**
 * Controller untuk menangani operasi manajemen penanggung jawab (supervisor)
 * 
 * [REFACTOR AKADEMIK]
 * Mengubah istilah "supervisor" menjadi "penanggung-jawab" untuk konsistensi
 * terminologi lintas sistem sesuai ketentuan dosen
 * 
 * Penanggung jawab adalah User dengan role = 'penanggung-jawab'
 * 
 * Fungsi utama:
 * - ambilSemuaPenanggungJawab: Mengambil data semua penanggung jawab
 * - ambilPenanggungJawabById: Mengambil data satu penanggung jawab berdasarkan ID
 * - tambahPenanggungJawabBaru: Menambah penanggung jawab baru dengan validasi
 * - ubahPenanggungJawabById: Mengubah data penanggung jawab berdasarkan ID
 * - hapusPenanggungJawabById: Menghapus penanggung jawab berdasarkan ID
 */

const kontrolerPenanggungJawab = {
  /**
   * Fungsi: ambilSemuaPenanggungJawab
   * Deskripsi: Mengambil semua pengguna dengan role = 'penanggung-jawab' dari database
   * Menghitung jumlah karyawan yang berada di bawah supervisi
   * 
   * [REFACTOR AKADEMIK] Mengubah nama fungsi dari ambilSemuaSupervisor
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilSemuaPenanggungJawab(req, res) {
    try {
      // Query semua user dengan role = 'penanggung-jawab'
      // select('-password') untuk tidak mengembalikan password
      const dataPenanggungJawab = await Pengguna.find({ role: 'penanggung-jawab' })
        .select('-password');

      // Hitung jumlah karyawan untuk setiap penanggung jawab
      const dataPenanggungJawabDenganJumlah = await Promise.all(
        dataPenanggungJawab.map(async (pj) => {
          const jumlahKaryawan = await Pengguna.countDocuments({
            penanggung_jawab_id: pj._id,
            role: 'karyawan'
          });
          
          return {
            ...pj.toObject(),
            jumlahKaryawan: jumlahKaryawan,
            isAktif: pj.adalah_aktif
          };
        })
      );

      // Jika tidak ada penanggung jawab
      if (dataPenanggungJawabDenganJumlah.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Belum ada penanggung jawab terdaftar',
          data: []
        });
      }

      // Response sukses dengan data penanggung jawab
      res.status(200).json({
        success: true,
        message: 'Data penanggung jawab berhasil diambil',
        data: dataPenanggungJawabDenganJumlah,
        total: dataPenanggungJawabDenganJumlah.length
      });
    } catch (error) {
      console.error('❁EError saat mengambil data penanggung jawab:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data penanggung jawab',
        data: null
      });
    }
  },

  /**
   * Fungsi: ambilPenanggungJawabById
   * Deskripsi: Mengambil data penanggung jawab tunggal berdasarkan ID
   * Validasi: ID harus valid MongoDB ObjectId dan user harus role penanggung-jawab
   * 
   * [REFACTOR AKADEMIK] Mengubah nama fungsi dari ambilSupervisorById
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilPenanggungJawabById(req, res) {
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

      // Cari penanggung jawab berdasarkan ID dan role
      const pj = await Pengguna.findOne({
        _id: id,
        role: 'penanggung-jawab'
      }).select('-password');

      // Jika penanggung jawab tidak ditemukan
      if (!pj) {
        return res.status(404).json({
          success: false,
          message: 'Penanggung jawab tidak ditemukan',
          data: null
        });
      }

      // Hitung jumlah karyawan yang disupervisi
      const jumlahKaryawan = await Pengguna.countDocuments({
        penanggung_jawab_id: pj._id,
        role: 'karyawan'
      });

      // Response sukses
      res.status(200).json({
        success: true,
        message: 'Data penanggung jawab berhasil diambil',
        data: {
          ...pj.toObject(),
          jumlahKaryawan: jumlahKaryawan,
          isAktif: pj.adalah_aktif
        }
      });
    } catch (error) {
      console.error('❁EError saat mengambil data penanggung jawab by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data penanggung jawab',
        data: null
      });
    }
  },

  /**
   * Fungsi: tambahSupervisorBaru
   * Deskripsi: Menambah supervisor baru dengan validasi input dan handling error email duplikat
   * 
   * Expected input dari req.body:
   * - nama_lengkap: string (wajib)
   * - email: string (wajib, unique)
   * - jabatan: string (wajib)
   * - password: string (opsional, default 'password123' untuk akademik)
   * 
   * [REFACTOR AKADEMIK] Mengubah nama fungsi dari tambahSupervisorBaru
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async tambahPenanggungJawabBaru(req, res) {
    try {
      const {
        nama_lengkap,
        email,
        jabatan,
        password = 'password123' // Password default untuk demo akademik
      } = req.body;

      // Validasi input wajib
      if (!nama_lengkap || !email || !jabatan) {
        return res.status(400).json({
          success: false,
          message: 'Nama lengkap, email, dan jabatan harus diisi',
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

      // Cek apakah email sudah digunakan
      const penanggungJawabExist = await Pengguna.findOne({ email: email.toLowerCase() });
      if (penanggungJawabExist) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar di sistem',
          data: null
        });
      }

      // Buat penanggung jawab baru
      const penanggungJawabBaru = new Pengguna({
        nama_lengkap: nama_lengkap.trim(),
        email: email.toLowerCase().trim(),
        jabatan: jabatan.trim(),
        password: password,
        role: 'penanggung-jawab',
        adalah_aktif: true
      });

      // Simpan ke database
      await penanggungJawabBaru.save();

      // Return data tanpa password
      const hasilSimpan = penanggungJawabBaru.toObject();
      delete hasilSimpan.password;

      res.status(201).json({
        success: true,
        message: 'Supervisor berhasil ditambahkan',
        data: hasilSimpan
      });

      // ==================== PENGIRIMAN EMAIL NOTIFIKASI ====================
      /**
       * Email dikirim SETELAH data berhasil disimpan ke database
       * Jika ada error pada pengiriman email, TIDAK MEMBLOK proses pembuatan akun
       * Email bersifat informatif, bukan verifikasi atau OTP
       * 
       * Penanggung Jawab selalu mendapat email notifikasi akun baru
       */
      kirimEmailAkunBaru(
        email,
        nama_lengkap,
        'Penanggung Jawab',
        process.env.APP_URL || 'https://nusaattend.local',
        password  // Kirim password yang diberikan
      ).catch(error => {
        // Error handling: jika email gagal, hanya log ke console
        // Tidak perlu merespons karena akun sudah berhasil dibuat
        console.error(`[PENANGGUNG JAWAB CONTROLLER] Error mengirim email ke ${email}:`, error);
      });
    } catch (error) {
      console.error('❁EError saat menambah supervisor:', error.message);
      
      // Handle duplikat email error dari Mongoose
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar di sistem',
          data: null
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menambah penanggung jawab',
        data: null
      });
    }
  },

  /**
   * Fungsi: ubahPenanggungJawabById
   * Deskripsi: Mengubah data penanggung jawab berdasarkan ID dengan validasi
   * 
   * [REFACTOR AKADEMIK] Mengubah nama fungsi dari ubahSupervisorById
   * 
   * Expected input dari req.body:
   * - nama_lengkap: string (opsional)
   * - email: string (opsional, unique)
   * - jabatan: string (opsional)
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ubahPenanggungJawabById(req, res) {
    try {
      const { id } = req.params;
      const {
        nama_lengkap,
        email,
        jabatan
      } = req.body;

      // Validasi format ID MongoDB
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
          success: false,
          message: 'Format ID tidak valid',
          data: null
        });
      }

      // Cari penanggung jawab berdasarkan ID
      const pj = await Pengguna.findOne({
        _id: id,
        role: 'penanggung-jawab'
      });

      // Jika penanggung jawab tidak ditemukan
      if (!pj) {
        return res.status(404).json({
          success: false,
          message: 'Penanggung jawab tidak ditemukan',
          data: null
        });
      }

      // Validasi email jika ada di input
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
        const emailExist = await Pengguna.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id } // Exclude penanggung jawab saat ini
        });

        if (emailExist) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar di sistem',
            data: null
          });
        }

        pj.email = email.toLowerCase().trim();
      }

      // Update field jika ada
      if (nama_lengkap) {
        pj.nama_lengkap = nama_lengkap.trim();
      }

      if (jabatan) {
        pj.jabatan = jabatan.trim();
      }

      // Simpan perubahan
      await pj.save();

      // Return data tanpa password
      const hasilUpdate = pj.toObject();
      delete hasilUpdate.password;

      res.status(200).json({
        success: true,
        message: 'Data penanggung jawab berhasil diubah',
        data: hasilUpdate
      });
    } catch (error) {
      console.error('❁EError saat mengubah data penanggung jawab:', error.message);

      // Handle duplikat email error dari Mongoose
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar di sistem',
          data: null
        });
      }

      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengubah data penanggung jawab',
        data: null
      });
    }
  },

  /**
   * Fungsi: hapusPenanggungJawabById
   * Deskripsi: Menghapus penanggung jawab berdasarkan ID
   * Catatan: Penanggung jawab hanya bisa dihapus jika tidak ada karyawan yang supervised
   * 
   * [REFACTOR AKADEMIK] Mengubah nama fungsi dari hapusSupervisorById
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async hapusPenanggungJawabById(req, res) {
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

      // Cari penanggung jawab
      const pj = await Pengguna.findOne({
        _id: id,
        role: 'penanggung-jawab'
      });

      // Jika penanggung jawab tidak ditemukan
      if (!pj) {
        return res.status(404).json({
          success: false,
          message: 'Penanggung jawab tidak ditemukan',
          data: null
        });
      }

      // Cek apakah ada karyawan yang di-supervisi
      const jumlahKaryawan = await Pengguna.countDocuments({
        penanggung_jawab_id: id,
        role: 'karyawan'
      });

      if (jumlahKaryawan > 0) {
        return res.status(400).json({
          success: false,
          message: `Penanggung jawab memiliki ${jumlahKaryawan} karyawan yang masih supervised. Pindahkan karyawan terlebih dahulu.`,
          data: null
        });
      }

      // Hapus penanggung jawab
      await Pengguna.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Penanggung jawab berhasil dihapus',
        data: null
      });
    } catch (error) {
      console.error('❁EError saat menghapus penanggung jawab:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus penanggung jawab',
        data: null
      });
    }
  }
};

module.exports = kontrolerPenanggungJawab;
