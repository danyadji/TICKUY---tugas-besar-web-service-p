const db = require('../config/database');

class User {
  // Cari user berdasarkan email
  static async findByEmail(email) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Cari user berdasarkan ID
  static async findById(id) {
    try {
      const [rows] = await db.query(
        'SELECT id, nama, email, role, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Buat user baru
  static async create(userData) {
    try {
      const { nama, email, password, role = 'user' } = userData;
      const [result] = await db.query(
        'INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)',
        [nama, email, password, role]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Update user
  static async update(id, userData) {
    try {
      const { nama, email, role } = userData;
      const [result] = await db.query(
        'UPDATE users SET nama = ?, email = ?, role = ? WHERE id = ?',
        [nama, email, role, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Hapus user
  static async delete(id) {
    try {
      const [result] = await db.query(
        'DELETE FROM users WHERE id = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get semua users (untuk admin)
  static async findAll() {
    try {
      const [rows] = await db.query(
        'SELECT id, nama, email, role, created_at FROM users'
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
