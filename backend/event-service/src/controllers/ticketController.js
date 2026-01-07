const { validationResult } = require('express-validator');
const TicketCategory = require('../models/TicketCategory');
const Event = require('../models/Event');

class TicketController {
  // POST /ticket-categories - Create ticket category (admin only)
  static async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { event_id, nama_kategori, deskripsi, harga, kuota } = req.body;

      // Cek apakah event exists
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      const categoryId = await TicketCategory.create({
        event_id,
        nama_kategori,
        deskripsi,
        harga,
        kuota
      });

      res.status(201).json({
        success: true,
        message: 'Kategori tiket berhasil dibuat',
        data: {
          id: categoryId,
          event_id,
          nama_kategori,
          harga,
          kuota
        }
      });
    } catch (error) {
      console.error('Error create category:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // GET /ticket-categories - Get all categories (public)
  static async getAllCategories(req, res) {
    try {
      const { event_id, status } = req.query;
      const filters = {};

      if (event_id) filters.event_id = parseInt(event_id);
      if (status) filters.status = status;

      console.log('Get categories with filters:', filters);

      const categories = await TicketCategory.findAll(filters);

      console.log('Categories found:', categories.length);

      res.json({
        success: true,
        data: categories,
        message: 'Kategori tiket berhasil diambil'
      });
    } catch (error) {
      console.error('Error get categories:', error);
      res.status(500).json({
        success: false,
        message: 'Gagal mengambil data kategori tiket',
        error: error.message
      });
    }
  }

  // GET /ticket-categories/:id - Get category detail (public)
  static async getCategoryById(req, res) {
    try {
      const { id } = req.params;
      const category = await TicketCategory.checkAvailability(id);

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tiket tidak ditemukan'
        });
      }

      res.json({
        success: true,
        data: category
      });
    } catch (error) {
      console.error('Error get category:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // PUT /ticket-categories/:id - Update category (admin only)
  static async updateCategory(req, res) {
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
      const { nama_kategori, deskripsi, harga, kuota, status } = req.body;

      const category = await TicketCategory.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tiket tidak ditemukan'
        });
      }

      // Validasi: kuota tidak boleh lebih kecil dari terjual
      if (kuota < category.terjual) {
        return res.status(400).json({
          success: false,
          message: `Kuota tidak boleh lebih kecil dari tiket yang sudah terjual (${category.terjual})`
        });
      }

      const updated = await TicketCategory.update(id, {
        nama_kategori,
        deskripsi,
        harga,
        kuota,
        status
      });

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tiket tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Kategori tiket berhasil diupdate'
      });
    } catch (error) {
      console.error('Error update category:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // DELETE /ticket-categories/:id - Delete category (admin only)
  static async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await TicketCategory.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tiket tidak ditemukan'
        });
      }

      // Validasi: tidak boleh hapus jika sudah ada yang terjual
      if (category.terjual > 0) {
        return res.status(400).json({
          success: false,
          message: 'Tidak dapat menghapus kategori yang sudah memiliki tiket terjual'
        });
      }

      const deleted = await TicketCategory.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Kategori tiket tidak ditemukan'
        });
      }

      res.json({
        success: true,
        message: 'Kategori tiket berhasil dihapus'
      });
    } catch (error) {
      console.error('Error delete category:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }

  // POST /ticket-categories/organizer - Create ticket category by event organizer
  static async createCategoryByOrganizer(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validasi gagal',
          errors: errors.array()
        });
      }

      const { event_id, nama_kategori, deskripsi, harga, kuota } = req.body;

      // Cek apakah event exists
      const event = await Event.findById(event_id);
      if (!event) {
        return res.status(404).json({
          success: false,
          message: 'Event tidak ditemukan'
        });
      }

      // Validasi: hanya creator event yang bisa menambahkan kategori tiket
      if (event.created_by !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Anda tidak memiliki akses untuk menambahkan kategori tiket ke event ini'
        });
      }

      const categoryId = await TicketCategory.create({
        event_id,
        nama_kategori,
        deskripsi,
        harga,
        kuota
      });

      res.status(201).json({
        success: true,
        message: 'Kategori tiket berhasil dibuat',
        data: {
          id: categoryId,
          event_id,
          nama_kategori,
          harga,
          kuota
        }
      });
    } catch (error) {
      console.error('Error create category by organizer:', error);
      res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan pada server',
        error: error.message
      });
    }
  }
}

module.exports = TicketController;
