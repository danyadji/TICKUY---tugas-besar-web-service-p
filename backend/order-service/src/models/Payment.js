const db = require('../config/database');

class Payment {
  static async create(paymentData) {
    try {
      const { order_id, midtrans_order_id, gross_amount, snap_token, snap_redirect_url } = paymentData;
      const [result] = await db.query(
        `INSERT INTO payments (order_id, midtrans_order_id, gross_amount, snap_token, snap_redirect_url, status) 
         VALUES (?, ?, ?, ?, ?, 'pending')`,
        [order_id, midtrans_order_id, gross_amount, snap_token, snap_redirect_url]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  static async findByOrderId(order_id) {
    try {
      const [rows] = await db.query('SELECT * FROM payments WHERE order_id = ?', [order_id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByMidtransOrderId(midtrans_order_id) {
    try {
      const [rows] = await db.query('SELECT * FROM payments WHERE midtrans_order_id = ?', [midtrans_order_id]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(order_id, paymentData) {
    try {
      const { transaction_id, payment_type, status, midtrans_response } = paymentData;
      const paid_at = status === 'settlement' ? new Date() : null;
      
      const [result] = await db.query(
        `UPDATE payments 
         SET transaction_id = ?, payment_type = ?, status = ?, midtrans_response = ?, paid_at = ?
         WHERE order_id = ?`,
        [transaction_id, payment_type, status, JSON.stringify(midtrans_response), paid_at, order_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Payment;
