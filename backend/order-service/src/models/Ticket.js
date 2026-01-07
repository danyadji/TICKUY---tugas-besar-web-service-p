const db = require('../config/database');

class Ticket {
  static async create(ticketData) {
    try {
      const { ticket_number, order_id, event_id, ticket_category_id, qr_code_data } = ticketData;
      const [result] = await db.query(
        `INSERT INTO tickets (ticket_number, order_id, event_id, ticket_category_id, qr_code_data, status) 
         VALUES (?, ?, ?, ?, ?, 'ACTIVE')`,
        [ticket_number, order_id, event_id, ticket_category_id, qr_code_data]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByOrderId(order_id) {
    try {
      const [rows] = await db.query('SELECT * FROM tickets WHERE order_id = ?', [order_id]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM tickets WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(user_id) {
    try {
      const [rows] = await db.query(
        `SELECT t.*, o.user_id FROM tickets t
         INNER JOIN orders o ON t.order_id = o.id
         WHERE o.user_id = ? AND o.status = 'PAID'
         ORDER BY t.created_at DESC`,
        [user_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status, scanned_by = null) {
    try {
      const used_at = status === 'USED' ? new Date() : null;
      const [result] = await db.query(
        'UPDATE tickets SET status = ?, used_at = ?, scanned_by = ? WHERE id = ?',
        [status, used_at, scanned_by, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateQRCode(id, qr_code_data) {
    try {
      const [result] = await db.query(
        'UPDATE tickets SET qr_code_data = ? WHERE id = ?',
        [qr_code_data, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static generateTicketNumber(eventId, categoryId, index) {
    const paddedIndex = String(index).padStart(5, '0');
    return `TKT-EVENT${eventId}-CAT${categoryId}-${paddedIndex}`;
  }
}

module.exports = Ticket;
