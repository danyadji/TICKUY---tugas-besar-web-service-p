const express = require('express');
const { body } = require('express-validator');
const TicketController = require('../controllers/ticketController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

const validateTicketValidation = [
  body('ticket_id').notEmpty().withMessage('Ticket ID harus diisi').isInt().withMessage('Ticket ID harus berupa angka')
];

router.get('/', verifyToken, TicketController.getUserTickets);
router.get('/:id', verifyToken, TicketController.getTicketById);
router.post('/validate', verifyToken, isAdmin, validateTicketValidation, TicketController.validateTicket);

module.exports = router;
