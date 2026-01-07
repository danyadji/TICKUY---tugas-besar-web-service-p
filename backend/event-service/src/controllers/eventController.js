const { validationResult } = require('express-validator');
const Event = require('../models/Event');

class EventController {
  // POST /events - Create event (admin only)
  static async createEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status } = req.body;

      const eventId = await Event.create({
        nama_event,
        deskripsi,
        lokasi,
        tanggal_mulai,
        tanggal_selesai,
        banner_url,
        status,
        created_by: req.user.id
      });

      res.status(201).json({
        success: true,
        message: 'Event berhasil dibuat',
        data: {
          id: eventId,
          nama_event,
          status: status || 'draft'
        }
      });
    } catch (error) {
      console.error('Error create event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // GET /events - Get all events (public)
  static async getAllEvents(req, res) {
    try {
      const { status, search } = req.query;
      const filters = {};

      if (status) filters.status = status;
      if (search) filters.search = search;

      const events = await Event.findAll(filters);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error get events:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // GET /events/:id - Get event detail with categories (public)
  static async getEventById(req, res) {
    try {
      const { id } = req.params;
      const event = await Event.getWithCategories(id);

      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error('Error get event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // PUT /events/:id - Update event (admin only)
  static async updateEvent(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status } = req.body;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      const updated = await Event.update(id, {
        nama_event,
        deskripsi,
        lokasi,
        tanggal_mulai,
        tanggal_selesai,
        banner_url,
        status
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Event berhasil diupdate'
      });
    } catch (error) {
      console.error('Error update event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // DELETE /events/:id - Delete event (admin only)
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      const deleted = await Event.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Event berhasil dihapus'
      });
    } catch (error) {
      console.error('Error delete event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // POST /events/organizer - User biasa buat event (pending approval)
  static async createEventByUser(req, res) {
    try {
      console.log('📝 Create event by user - Request body:', req.body);
      console.log('👤 User ID:', req.user?.id);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('❌ Validation errors:', errors.array());
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      // Anti-spam: limit max pending events per user
      console.log('🔍 Checking pending count for user:', req.user.id);
      const pendingCount = await Event.countPending(req.user.id);
      console.log('📊 Pending count:', pendingCount);
      
      if (pendingCount >= 10) {
        return res.status(400).json({
          success: false,
          message: 'Anda sudah memiliki 10 event pending. Tunggu approval terlebih dahulu.'
        });
      }

      const { nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url } = req.body;

      console.log('💾 Creating event with data:', {
        nama_event,
        deskripsi: deskripsi?.substring(0, 50) + '...',
        lokasi,
        tanggal_mulai,
        tanggal_selesai,
        status: 'pending',
        created_by: req.user.id
      });

      const eventId = await Event.create({
        nama_event,
        deskripsi,
        lokasi,
        tanggal_mulai,
        tanggal_selesai,
        banner_url,
        status: 'pending',  // Default pending untuk user biasa
        created_by: req.user.id
      });

      console.log('✅ Event created successfully with ID:', eventId);

      res.status(201).json({
        success: true,
        message: 'Event berhasil diajukan. Menunggu approval admin.',
        data: {
          id: eventId,
          nama_event,
          status: 'pending'
        }
      });
    } catch (error) {
      console.error('❌ Error create event by user:', error);
      console.error('Stack trace:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  // GET /events/my-events - User lihat event yang dibuatnya
  static async getMyEvents(req, res) {
    try {
      const events = await Event.findByCreator(req.user.id);

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error get my events:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // PUT /events/:id/approve - Admin approve event
  static async approveEvent(req, res) {
    try {
      const { id } = req.params;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      if (event.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Hanya event dengan status pending yang bisa di-approve'
        });
      }

      const approved = await Event.approve(id, req.user.id);

      if (!approved) {
        return res.status(500).json({
          success: false,
          message: 'Gagal approve event'
        });
      }

      res.json({
        success: true,
        message: 'Event berhasil di-approve dan dipublikasikan'
      });
    } catch (error) {
      console.error('Error approve event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // PUT /events/:id/reject - Admin reject event
  static async rejectEvent(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const event = await Event.findById(id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      if (event.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Hanya event dengan status pending yang bisa ditolak'
        });
      }

      const rejected = await Event.reject(id, reason || 'Tidak memenuhi syarat');

      if (!rejected) {
        return res.status(500).json({
          success: false,
          message: 'Gagal reject event'
        });
      }

      res.json({
        success: true,
        message: 'Event berhasil ditolak'
      });
    } catch (error) {
      console.error('Error reject event:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // GET /events/pending - Admin lihat semua event pending
  static async getPendingEvents(req, res) {
    try {
      const events = await Event.getPending();

      res.json({
        success: true,
        data: events
      });
    } catch (error) {
      console.error('Error get pending events:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = EventController;
