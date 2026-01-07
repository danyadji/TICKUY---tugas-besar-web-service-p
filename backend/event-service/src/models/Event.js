const db = require('../config/database');

class Event {
  static async create(eventData) {
    try {
      const { nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status, created_by } = eventData;
      const [result] = await db.query(
        `INSERT INTO events (nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [nama_event, deskripsi || '', lokasi, tanggal_mulai, tanggal_selesai, banner_url || null, status || 'pending', created_by]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT e.*, 
               MIN(tc.harga) as min_price,
               MAX(tc.harga) as max_price
        FROM events e
        LEFT JOIN ticket_categories tc ON e.id = tc.event_id AND tc.status = 'available'
        WHERE 1=1
      `;
      const params = [];

      if (filters.status) {
        query += ' AND e.status = ?';
        params.push(filters.status);
      }

      if (filters.search) {
        query += ' AND e.nama_event LIKE ?';
        params.push(`%${filters.search}%`);
      }

      query += ' GROUP BY e.id ORDER BY e.tanggal_mulai DESC';

      const [rows] = await db.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM events WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id, eventData) {
    try {
      const { nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status } = eventData;
      const [result] = await db.query(
        `UPDATE events 
         SET nama_event = ?, deskripsi = ?, lokasi = ?, tanggal_mulai = ?, tanggal_selesai = ?, banner_url = ?, status = ?
         WHERE id = ?`,
        [nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await db.query('DELETE FROM events WHERE id = ?', [id]);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async getWithCategories(id) {
    try {
      const event = await this.findById(id);
      if (!event) return null;

      const [categories] = await db.query(
        'SELECT * FROM ticket_categories WHERE event_id = ?',
        [id]
      );

      return {
        ...event,
        categories
      };
    } catch (error) {
      throw error;
    }
  }

  // Find events by creator (for "My Events" page)
  static async findByCreator(userId) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM events WHERE created_by = ? ORDER BY created_at DESC',
        [userId]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Count pending events by user (for spam prevention)
  static async countPending(userId) {
    try {
      const [rows] = await db.query(
        'SELECT COUNT(*) as count FROM events WHERE created_by = ? AND status = ?',
        [userId, 'pending']
      );
      return rows[0].count;
    } catch (error) {
      throw error;
    }
  }

  // Approve event (admin only)
  static async approve(id, adminId) {
    try {
      const [result] = await db.query(
        `UPDATE events 
         SET status = 'published', approved_by = ?, approved_at = NOW()
         WHERE id = ?`,
        [adminId, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Reject event (admin only)
  static async reject(id, reason) {
    try {
      const [result] = await db.query(
        `UPDATE events 
         SET status = 'rejected', rejection_reason = ?
         WHERE id = ?`,
        [reason, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Get all pending events (for admin approval)
  static async getPending() {
    try {
      // Di microservices, tidak bisa JOIN ke tabel users yang ada di database lain
      // Frontend atau API Gateway yang akan fetch user info dari auth-service
      const [rows] = await db.query(
        `SELECT * FROM events 
         WHERE status = 'pending'
         ORDER BY created_at ASC`
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Event;
