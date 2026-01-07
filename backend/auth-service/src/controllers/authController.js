const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

class AuthController {
  // Register user baru
  static async register(req, res) {
    try {
      // Validasi input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { nama, email, password, role } = req.body;

      // Cek apakah email sudah terdaftar
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Simpan user ke database
      const userId = await User.create({
        nama,
        email,
        password: hashedPassword,
        role: role || 'user'
      });

      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil',
        data: {
          id: userId,
          nama,
          email,
          role: role || 'user'
        }
      });
    } catch (error) {
      console.error('Error register:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      // Validasi input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Cari user berdasarkan email
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Verifikasi password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Email atau password salah'
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        success: true,
        message: 'Login berhasil',
        data: {
          user: {
            id: user.id,
            nama: user.nama,
            email: user.email,
            role: user.role
          },
          token
        }
      });
    } catch (error) {
      console.error('Error login:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Get profil user yang sedang login
  static async getProfile(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      console.error('Error get profile:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Update profil user
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const { nama, email } = req.body;

      // Cek apakah email sudah digunakan user lain
      const existingUser = await User.findByEmail(email);
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah digunakan'
        });
      }

      const updated = await User.update(userId, {
        nama,
        email,
        role: req.user.role // Pertahankan role yang sama
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Profil berhasil diupdate'
      });
    } catch (error) {
      console.error('Error update profile:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Get semua users (hanya admin)
  static async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      
      res.json({
        success: true,
        data: users
      });
    } catch (error) {
      console.error('Error get all users:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Delete user (hanya admin)
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Cek apakah user mencoba menghapus dirinya sendiri
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus akun sendiri'
        });
      }

      const deleted = await User.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'User tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'User berhasil dihapus'
      });
    } catch (error) {
      console.error('Error delete user:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // Register admin dengan secret key
  static async registerAdmin(req, res) {
    try {
      const { nama, email, password, secretKey } = req.body;

      // Validasi secret key
      const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'TICKUY_ADMIN_2026';
      if (secretKey !== ADMIN_SECRET) {
        return res.status(403).json({
          success: false,
          message: 'Secret key tidak valid'
        });
      }

      // Cek email sudah terdaftar
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email sudah terdaftar'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Buat admin
      const userId = await User.create({
        nama,
        email,
        password: hashedPassword,
        role: 'admin'
      });

      res.status(201).json({
        success: true,
        message: 'Admin berhasil dibuat',
        data: {
          id: userId,
          nama,
          email,
          role: 'admin'
        }
      });
    } catch (error) {
      console.error('Error register admin:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = AuthController;
