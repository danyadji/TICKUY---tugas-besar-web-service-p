const db = require('../config/database');

class TicketCategory {
  static async create(categoryData) {
    try {
      const { event_id, nama_kategori, deskripsi, harga, kuota } = categoryData;
      const [result] = await db.query(
        `INSERT INTO ticket_categories (event_id, nama_kategori, deskripsi, harga, kuota) 
         VALUES (?, ?, ?, ?, ?)`,
        [event_id, nama_kategori, deskripsi, harga, kuota]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = 'SELECT * FROM ticket_categories WHERE 1=1';
      const params = [];

      if (filters.event_id) {
        query += ' AND event_id = ?';
        params.push(filters.event_id);
      }

      if (filters.status) {
        query += ' AND status = ?';
        params.push(filters.status);
      }

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM ticket_categories WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, categoryData) {
    try {
      const { nama_kategori, deskripsi, harga, kuota, status } = categoryData;
      const [result] = await db.query(
        `UPDATE ticket_categories 
         SET nama_kategori = ?, deskripsi = ?, harga = ?, kuota = ?, status = ?
         WHERE id = ?`,
        [nama_kategori, deskripsi, harga, kuota, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM ticket_categories WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async checkAvailability(id) {
    try {
      const category = await this.findById(id);
      if (!category) return null;

      const available = category.kuota - category.terjual;
      return {
        ...category,
        available,
        is_available: available > 0 && category.status === 'available'
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketCategory;
