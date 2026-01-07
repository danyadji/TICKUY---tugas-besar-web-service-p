const express = require('express');
const { body } = require('express-validator');
const EventController = require('../controllers/eventController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const eventValidation = [
  body('nama_event').notEmpty().withMessage('Nama event harus diisi').isLength({ min: 3 }).withMessage('Nama event minimal 3 karakter'),
  body('lokasi').notEmpty().withMessage('Lokasi harus diisi'),
  body('tanggal_mulai').notEmpty().withMessage('Tanggal mulai harus diisi').isISO8601().withMessage('Format tanggal tidak valid'),
  body('tanggal_selesai').notEmpty().withMessage('Tanggal selesai harus diisi').isISO8601().withMessage('Format tanggal tidak valid'),
  body('status').optional().isIn(['draft', 'published', 'cancelled']).withMessage('Status harus draft, published, atau cancelled')
];

// Public routes
router.get('/', EventController.getAllEvents);

// Specific routes BEFORE dynamic routes (untuk avoid conflict dengan /:id)
router.get('/pending', verifyToken, isAdmin, EventController.getPendingEvents);
router.get('/my-events', verifyToken, EventController.getMyEvents);

// Dynamic route (harus setelah specific routes)
router.get('/:id', EventController.getEventById);

// User routes (authenticated, bukan admin)
router.post('/organizer', verifyToken, eventValidation, EventController.createEventByUser);

// Admin only routes
router.post('/', verifyToken, isAdmin, eventValidation, EventController.createEvent);
router.put('/:id', verifyToken, isAdmin, eventValidation, EventController.updateEvent);
router.delete('/:id', verifyToken, isAdmin, EventController.deleteEvent);
router.put('/:id/approve', verifyToken, isAdmin, EventController.approveEvent);
router.put('/:id/reject', verifyToken, isAdmin, EventController.rejectEvent);

module.exports = router;
