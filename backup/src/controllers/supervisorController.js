const User = require('../models/User');

/**
 * Controller untuk menangani operasi manajemen supervisor (penanggung jawab)
 * Supervisor adalah User dengan role = 'penanggung-jawab'
 * 
 * Fungsi utama:
 * - ambilSemuaSupervisor: Mengambil data semua supervisor
 * - ambilSupervisorById: Mengambil data satu supervisor berdasarkan ID
 * - tambahSupervisorBaru: Menambah supervisor baru dengan validasi
 * - ubahSupervisorById: Mengubah data supervisor berdasarkan ID
 * - hapusSupervisorById: Menghapus supervisor berdasarkan ID
 */

const kontrolerSupervisor = {
  /**
   * Fungsi: ambilSemuaSupervisor
   * Deskripsi: Mengambil semua pengguna dengan role = 'penanggung-jawab' dari database
   * Menghitung jumlah karyawan yang berada di bawah supervisi
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilSemuaSupervisor(req, res) {
    try {
      // Query semua user dengan role = 'penanggung-jawab'
      // select('-password') untuk tidak mengembalikan password
      const dataSupervisor = await User.find({ role: 'penanggung-jawab' })
        .select('-password');

      // Hitung jumlah karyawan untuk setiap supervisor
      const dataSupervisorDenganJumlah = await Promise.all(
        dataSupervisor.map(async (supervisor) => {
          const jumlahKaryawan = await User.countDocuments({
            penanggung_jawab_id: supervisor._id,
            role: 'karyawan'
          });
          
          return {
            ...supervisor.toObject(),
            jumlahKaryawan: jumlahKaryawan,
            isAktif: supervisor.adalah_aktif
          };
        })
      );

      // Jika tidak ada supervisor
      if (dataSupervisorDenganJumlah.length === 0) {
        return res.status(200).json({
          success: true,
          message: 'Belum ada supervisor terdaftar',
          data: []
        });
      }

      // Response sukses dengan data supervisor
      res.status(200).json({
        success: true,
        message: 'Data supervisor berhasil diambil',
        data: dataSupervisorDenganJumlah,
        total: dataSupervisorDenganJumlah.length
      });
    } catch (error) {
      console.error('❌ Error saat mengambil data supervisor:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data supervisor',
        data: null
      });
    }
  },

  /**
   * Fungsi: ambilSupervisorById
   * Deskripsi: Mengambil data supervisor tunggal berdasarkan ID
   * Validasi: ID harus valid MongoDB ObjectId dan user harus role supervisor
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ambilSupervisorById(req, res) {
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

      // Cari supervisor berdasarkan ID dan role
      const supervisor = await User.findOne({
        _id: id,
        role: 'penanggung-jawab'
      }).select('-password');

      // Jika supervisor tidak ditemukan
      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor tidak ditemukan',
          data: null
        });
      }

      // Hitung jumlah karyawan yang disupervisi
      const jumlahKaryawan = await User.countDocuments({
        penanggung_jawab_id: supervisor._id,
        role: 'karyawan'
      });

      // Response sukses
      res.status(200).json({
        success: true,
        message: 'Data supervisor berhasil diambil',
        data: {
          ...supervisor.toObject(),
          jumlahKaryawan: jumlahKaryawan,
          isAktif: supervisor.adalah_aktif
        }
      });
    } catch (error) {
      console.error('❌ Error saat mengambil data supervisor by ID:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat mengambil data supervisor',
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
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async tambahSupervisorBaru(req, res) {
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
      const supervisorExist = await User.findOne({ email: email.toLowerCase() });
      if (supervisorExist) {
        return res.status(409).json({
          success: false,
          message: 'Email sudah terdaftar di sistem',
          data: null
        });
      }

      // Buat supervisor baru
      const supervisorBaru = new User({
        nama_lengkap: nama_lengkap.trim(),
        email: email.toLowerCase().trim(),
        jabatan: jabatan.trim(),
        password: password,
        role: 'penanggung-jawab',
        adalah_aktif: true
      });

      // Simpan ke database
      await supervisorBaru.save();

      // Return data tanpa password
      const hasilSimpan = supervisorBaru.toObject();
      delete hasilSimpan.password;

      res.status(201).json({
        success: true,
        message: 'Supervisor berhasil ditambahkan',
        data: hasilSimpan
      });
    } catch (error) {
      console.error('❌ Error saat menambah supervisor:', error.message);
      
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
        message: 'Terjadi kesalahan saat menambah supervisor',
        data: null
      });
    }
  },

  /**
   * Fungsi: ubahSupervisorById
   * Deskripsi: Mengubah data supervisor berdasarkan ID dengan validasi
   * 
   * Expected input dari req.body:
   * - nama_lengkap: string (opsional)
   * - email: string (opsional, unique)
   * - jabatan: string (opsional)
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async ubahSupervisorById(req, res) {
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

      // Cari supervisor berdasarkan ID
      const supervisor = await User.findOne({
        _id: id,
        role: 'penanggung-jawab'
      });

      // Jika supervisor tidak ditemukan
      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor tidak ditemukan',
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
        const emailExist = await User.findOne({
          email: email.toLowerCase(),
          _id: { $ne: id } // Exclude supervisor saat ini
        });

        if (emailExist) {
          return res.status(409).json({
            success: false,
            message: 'Email sudah terdaftar di sistem',
            data: null
          });
        }

        supervisor.email = email.toLowerCase().trim();
      }

      // Update field jika ada
      if (nama_lengkap) {
        supervisor.nama_lengkap = nama_lengkap.trim();
      }

      if (jabatan) {
        supervisor.jabatan = jabatan.trim();
      }

      // Simpan perubahan
      await supervisor.save();

      // Return data tanpa password
      const hasilUpdate = supervisor.toObject();
      delete hasilUpdate.password;

      res.status(200).json({
        success: true,
        message: 'Data supervisor berhasil diubah',
        data: hasilUpdate
      });
    } catch (error) {
      console.error('❌ Error saat mengubah data supervisor:', error.message);

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
        message: 'Terjadi kesalahan saat mengubah data supervisor',
        data: null
      });
    }
  },

  /**
   * Fungsi: hapusSupervisorById
   * Deskripsi: Menghapus supervisor berdasarkan ID
   * Catatan: Supervisor hanya bisa dihapus jika tidak ada karyawan yang supervised
   * 
   * @param {Object} req - Request object dari Express
   * @param {Object} res - Response object dari Express
   */
  async hapusSupervisorById(req, res) {
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

      // Cari supervisor
      const supervisor = await User.findOne({
        _id: id,
        role: 'penanggung-jawab'
      });

      // Jika supervisor tidak ditemukan
      if (!supervisor) {
        return res.status(404).json({
          success: false,
          message: 'Supervisor tidak ditemukan',
          data: null
        });
      }

      // Cek apakah ada karyawan yang di-supervisi
      const jumlahKaryawan = await User.countDocuments({
        penanggung_jawab_id: id,
        role: 'karyawan'
      });

      if (jumlahKaryawan > 0) {
        return res.status(400).json({
          success: false,
          message: `Supervisor memiliki ${jumlahKaryawan} karyawan yang masih supervised. Pindahkan karyawan terlebih dahulu.`,
          data: null
        });
      }

      // Hapus supervisor
      await User.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: 'Supervisor berhasil dihapus',
        data: null
      });
    } catch (error) {
      console.error('❌ Error saat menghapus supervisor:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan saat menghapus supervisor',
        data: null
      });
    }
  }
};

module.exports = kontrolerSupervisor;
