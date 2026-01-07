const Ticket = require('../models/Ticket');
const Order = require('../models/Order');
const EventService = require('../services/eventService');

class TicketController {
  static async getUserTickets(req, res) {
    try {
      const user_id = req.user.id;
      const tickets = await Ticket.findByUserId(user_id);

      // Enrich tickets with event data
      const enrichedTickets = await Promise.all(
        tickets.map(async (ticket) => {
          try {
            const event = await EventService.getEvent(ticket.event_id);
            const category = await EventService.getTicketCategory(ticket.ticket_category_id);
            
            return {
              ...ticket,
              event_name: event.nama_event,
              event_date: event.tanggal,
              event_location: event.lokasi,
              category_name: category.nama_kategori,
              nomor_tiket: ticket.ticket_number
            };
          } catch (error) {
            console.error(`Error fetching event data for ticket ${ticket.id}:`, error);
            return {
              ...ticket,
              event_name: 'Unknown Event',
              event_date: null,
              event_location: 'Unknown Location',
              category_name: 'Unknown Category',
              nomor_tiket: ticket.ticket_number
            };
          }
        })
      );

      res.json({
        success: true,
        data: enrichedTickets
      });
    } catch (error) {
      console.error('Error get tickets:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }

  static async getTicketById(req, res) {
    try {
      const { id } = req.params;
      const ticket = await Ticket.findById(id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Tiket tidak ditemukan'
        });
      }

      // Cek ownership via order
      const order = await Order.findById(ticket.order_id);
      if (!order || (order.user_id !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Akses ditolak'
        });
      }

      // Enrich with event data
      try {
        const event = await EventService.getEvent(ticket.event_id);
        const category = await EventService.getTicketCategory(ticket.ticket_category_id);
        
        ticket.event_name = event.nama_event;
        ticket.event_date = event.tanggal;
        ticket.event_location = event.lokasi;
        ticket.category_name = category.nama_kategori;
        ticket.nomor_tiket = ticket.ticket_number;
      } catch (error) {
        console.error('Error fetching event data:', error);
      }

      res.json({
        success: true,
        data: ticket
      });
    } catch (error) {
      console.error('Error get ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }

  static async validateTicket(req, res) {
    try {
      const { ticket_id } = req.body;

      const ticket = await Ticket.findById(ticket_id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Tiket tidak ditemukan'
        });
      }

      if (ticket.status === 'USED') {
        return res.status(400).json({
          success: false,
          message: 'Tiket sudah digunakan',
          data: {
            used_at: ticket.used_at,
            scanned_by: ticket.scanned_by
          }
        });
      }

      if (ticket.status !== 'ACTIVE') {
        return res.status(400).json({
          success: false,
          message: `Tiket tidak valid. Status: ${ticket.status}`
        });
      }

      await Ticket.updateStatus(ticket_id, 'USED', req.user.id);

      res.json({
        success: true,
        message: 'Tiket valid dan berhasil digunakan',
        data: {
          ticket_number: ticket.ticket_number,
          event_id: ticket.event_id,
          validated_at: new Date(),
          validated_by: req.user.id
        }
      });
    } catch (error) {
      console.error('Error validate ticket:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server'
      });
    }
  }
}

module.exports = TicketController;
