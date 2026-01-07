const db = require('../config/database');
const axios = require('axios');

class RevenueController {
  // GET /api/revenue/my-revenue - Get organizer revenue
  static async getMyRevenue(req, res) {
    try {
      const user_id = req.user.id;

      // Get all events by organizer
      const [events] = await db.query(
        `SELECT id, nama_event, tanggal_mulai, status 
         FROM events 
         WHERE user_id = ? AND status = 'approved'`,
        [user_id]
      );

      if (events.length === 0) {
        return res.json({
          success: true,
          data: {
            total_revenue: 0,
            total_tickets_sold: 0,
            events: []
          }
        });
      }

      const eventIds = events.map(e => e.id);

      // Get ticket categories for these events
      const [categories] = await db.query(
        `SELECT event_id, id, nama_kategori, harga, kuota, terjual
         FROM ticket_categories
         WHERE event_id IN (${eventIds.join(',')})`,
        []
      );

      // Get orders data from order-service
      let totalRevenue = 0;
      let totalTicketsSold = 0;

      try {
        const orderResponse = await axios.get(
          `${process.env.ORDER_SERVICE_URL}/api/orders/by-events`,
          {
            params: { event_ids: eventIds.join(',') },
            headers: {
              Authorization: req.headers.authorization
            }
          }
        );

        if (orderResponse.data.success) {
          const orders = orderResponse.data.data || [];
          
          // Calculate from paid orders only
          orders.forEach(order => {
            if (order.status === 'PAID') {
              totalRevenue += parseFloat(order.total_amount);
              totalTicketsSold += order.quantity;
            }
          });
        }
      } catch (err) {
        console.log('Could not fetch orders, calculating from ticket categories');
        // Fallback: calculate from terjual
        categories.forEach(cat => {
          totalRevenue += cat.harga * cat.terjual;
          totalTicketsSold += cat.terjual;
        });
      }

      // Group categories by event
      const eventRevenue = events.map(event => {
        const eventCategories = categories.filter(c => c.event_id === event.id);
        const eventTicketsSold = eventCategories.reduce((sum, c) => sum + c.terjual, 0);
        const eventRevenue = eventCategories.reduce((sum, c) => sum + (c.harga * c.terjual), 0);

        return {
          event_id: event.id,
          nama_event: event.nama_event,
          tanggal_mulai: event.tanggal_mulai,
          tickets_sold: eventTicketsSold,
          revenue: eventRevenue,
          categories: eventCategories.map(c => ({
            nama_kategori: c.nama_kategori,
            harga: c.harga,
            kuota: c.kuota,
            terjual: c.terjual,
            revenue: c.harga * c.terjual
          }))
        };
      });

      res.json({
        success: true,
        data: {
          total_revenue: totalRevenue,
          total_tickets_sold: totalTicketsSold,
          platform_fee: totalRevenue * 0.1, // 10% fee
          net_revenue: totalRevenue * 0.9, // 90% untuk organizer
          events: eventRevenue
        }
      });
    } catch (error) {
      console.error('Error get revenue:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data revenue'
      });
    }
  }
}

module.exports = RevenueController;
