const express = require('express');
const { body } = require('express-validator');
const TicketController = require('../controllers/ticketController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('event_id').notEmpty().withMessage('Event ID harus diisi').isInt().withMessage('Event ID harus berupa angka'),
  body('nama_kategori').notEmpty().withMessage('Nama kategori harus diisi').isLength({ min: 2 }).withMessage('Nama kategori minimal 2 karakter'),
  body('harga').notEmpty().withMessage('Harga harus diisi').isFloat({ min: 0 }).withMessage('Harga harus berupa angka positif'),
  body('kuota').notEmpty().withMessage('Kuota harus diisi').isInt({ min: 1 }).withMessage('Kuota harus berupa angka positif')
];

const updateCategoryValidation = [
  body('nama_kategori').notEmpty().withMessage('Nama kategori harus diisi'),
  body('harga').notEmpty().withMessage('Harga harus diisi').isFloat({ min: 0 }).withMessage('Harga harus positif'),
  body('kuota').notEmpty().withMessage('Kuota harus diisi').isInt({ min: 1 }).withMessage('Kuota harus positif'),
  body('status').optional().isIn(['available', 'sold_out', 'inactive']).withMessage('Status tidak valid')
];

// Public routes
router.get('/', TicketController.getAllCategories);
router.get('/:id', TicketController.getCategoryById);

// User routes (untuk event organizer)
router.post('/organizer', verifyToken, categoryValidation, TicketController.createCategoryByOrganizer);

// Admin only routes
router.post('/', verifyToken, isAdmin, categoryValidation, TicketController.createCategory);
router.put('/:id', verifyToken, isAdmin, updateCategoryValidation, TicketController.updateCategory);
router.delete('/:id', verifyToken, isAdmin, TicketController.deleteCategory);

module.exports = router;
