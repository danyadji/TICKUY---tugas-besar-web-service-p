const db = require('../config/database');

class Order {
  static async create(orderData) {
    try {
      const { order_number, user_id, event_id, ticket_category_id, quantity, total_amount, expired_at } = orderData;
      const [result] = await db.query(
        `INSERT INTO orders (order_number, user_id, event_id, ticket_category_id, quantity, total_amount, status, expired_at) 
         VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
        [order_number, user_id, event_id, ticket_category_id, quantity, total_amount, expired_at]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await db.query('SELECT * FROM orders WHERE id = ?', [id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByOrderNumber(order_number) {
    try {
      const [rows] = await db.query('SELECT * FROM orders WHERE order_number = ?', [order_number]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateStatus(id, status) {
    try {
      const [result] = await db.query(
        'UPDATE orders SET status = ? WHERE id = ?',
        [status, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(user_id) {
    try {
      const [rows] = await db.query(
        'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [user_id]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static generateOrderNumber() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `TKY-${year}${month}${day}-${random}`;
  }
}

module.exports = Order;
