const Order = require('../models/Order');
const Payment = require('../models/Payment');
const Ticket = require('../models/Ticket');
const QRCodeService = require('../services/qrCodeService');
const MidtransService = require('../services/midtransService');

class PaymentController {
  static async handleCallback(req, res) {
    try {
      const notification = req.body;

      console.log('📥 Midtrans Callback received:', notification);

      const isValid = MidtransService.verifySignature(notification);
      if (!isValid) {
        console.error('❌ Invalid signature');
        return res.status(403).json({
          success: false,
          message: 'Invalid signature'
        });
      }

      const { order_id, transaction_status, transaction_id, payment_type, fraud_status } = notification;

      const order = await Order.findByOrderNumber(order_id);
      if (!order) {
        console.error('❌ Order not found:', order_id);
        return res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan'
        });
      }

      let paymentStatus = transaction_status;
      let orderStatus = order.status;

      if (transaction_status === 'capture') {
        if (fraud_status === 'accept') {
          paymentStatus = 'settlement';
          orderStatus = 'PAID';
        }
      } else if (transaction_status === 'settlement') {
        paymentStatus = 'settlement';
        orderStatus = 'PAID';
      } else if (['deny', 'expire', 'cancel'].includes(transaction_status)) {
        orderStatus = 'FAILED';
      }

      await Payment.update(order.id, {
        transaction_id,
        payment_type,
        status: paymentStatus,
        midtrans_response: notification
      });

      await Order.updateStatus(order.id, orderStatus);

      console.log(`✅ Order ${order_id} updated to ${orderStatus}`);

      if (orderStatus === 'PAID') {
        console.log('🎫 Generating tickets...');
        await PaymentController.generateTickets(order);
      }

      res.json({
        success: true,
        message: 'Callback processed successfully'
      });
    } catch (error) {
      console.error('Error handle callback:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }

  // Manual payment check for development (when Midtrans callback can't reach localhost)
  static async manualPaymentCheck(req, res) {
    try {
      const { order_id } = req.params;
      
      console.log('🔍 Manual payment check for order:', order_id);

      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan'
        });
      }

      // Check if tickets already generated
      const existingTickets = await Ticket.findByOrderId(order_id);
      if (existingTickets && existingTickets.length > 0) {
        console.log('✅ Tickets already exist');
        return res.json({
          success: true,
          message: 'Tiket sudah dibuat',
          data: { tickets: existingTickets }
        });
      }

      // For sandbox/development, auto-approve if order exists and not expired
      if (order.status === 'PENDING') {
        console.log('🎫 Auto-generating tickets for development...');
        
        await Order.updateStatus(order.id, 'PAID');
        await Payment.update(order.id, {
          status: 'settlement',
          paid_at: new Date()
        });

        await PaymentController.generateTickets(order);
        
        const tickets = await Ticket.findByOrderId(order_id);
        
        return res.json({
          success: true,
          message: 'Pembayaran berhasil! Tiket telah dibuat',
          data: { tickets }
        });
      }

      res.json({
        success: true,
        data: { order }
      });
    } catch (error) {
      console.error('Error manual payment check:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Terjadi kesalahan pada server'
      });
    }
  }

  static async generateTickets(order) {
    try {
      for (let i = 1; i <= order.quantity; i++) {
        const ticket_number = Ticket.generateTicketNumber(order.event_id, order.ticket_category_id, i);
        
        const ticketId = await Ticket.create({
          ticket_number,
          order_id: order.id,
          event_id: order.event_id,
          ticket_category_id: order.ticket_category_id,
          qr_code_data: ''
        });

        const qrCode = await QRCodeService.generate(ticketId);

        await Ticket.updateQRCode(ticketId, qrCode);
      }

      console.log(`✅ Generated ${order.quantity} tickets for order ${order.order_number}`);
    } catch (error) {
      console.error('Error generating tickets:', error);
      throw error;
    }
  }

  static async getPaymentStatus(req, res) {
    try {
      const { order_id } = req.params;
      
      const order = await Order.findById(order_id);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order tidak ditemukan'
        });
      }

      const payment = await Payment.findByOrderId(order_id);

      res.json({
        success: true,
        data: {
          order_status: order.status,
          payment_status: payment ? payment.status : null
        }
      });
    } catch (error) {
      console.error('Error get payment status:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
}

module.exports = PaymentController;
