const { validationResult } = require('express-validator');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const EventService = require('../services/eventService');
const MidtransService = require('../services/midtransService');

class OrderController {
  static async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { event_id, ticket_category_id, quantity } = req.body;
      const user_id = req.user.id;

      console.log('📦 Creating order:', { event_id, ticket_category_id, quantity, user_id });

      await EventService.checkAvailability(ticket_category_id, quantity);
      const category = await EventService.getTicketCategory(ticket_category_id);
      const event = await EventService.getEvent(event_id);

      console.log('✅ Category and event fetched successfully');

      const total_amount = category.harga * quantity;
      const order_number = Order.generateOrderNumber();
      const expired_at = new Date(Date.now() + 15 * 60 * 1000);

      const orderId = await Order.create({
        order_number,
        user_id,
        event_id,
        ticket_category_id,
        quantity,
        total_amount,
        expired_at
      });

      const snapData = await MidtransService.createTransaction({
        order_number,
        gross_amount: total_amount,
        customer_details: {
          first_name: req.user.nama || 'Customer',
          email: req.user.email
        },
        item_details: [
          {
            id: ticket_category_id,
            price: category.harga,
            quantity: quantity,
            name: `${event.nama_event} - ${category.nama_kategori}`
          }
        ]
      });

      await Payment.create({
        order_id: orderId,
        midtrans_order_id: order_number,
        gross_amount: total_amount,
        snap_token: snapData.snap_token,
        snap_redirect_url: snapData.snap_redirect_url
      });

      res.status(201).json({
        success: true,
        message: 'Order berhasil dibuat',
        data: {
          order_id: orderId,
          order_number,
          total_amount,
          status: 'PENDING',
          snap_token: snapData.snap_token,
          snap_redirect_url: snapData.snap_redirect_url,
          expired_at
        }
      });
    } catch (error) {
      console.error('Error create order:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan pada server'
      });
    }
  }

  static async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const order = await Order.findById(id);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan'
        });
      }

      if (order.user_id !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak'
        });
      }

      const payment = await Payment.findByOrderId(id);
      const tickets = await Ticket.findByOrderId(id);

      res.json({
        success: true,
        data: {
          order,
          payment,
          tickets
        }
      });
    } catch (error) {
      console.error('Error get order:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }

  static async getUserOrders(req, res) {
    try {
      const user_id = req.user.id;
      const orders = await Order.findByUserId(user_id);

      res.json({
        success: true,
        data: orders
      });
    } catch (error) {
      console.error('Error get user orders:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
}

module.exports = OrderController;
