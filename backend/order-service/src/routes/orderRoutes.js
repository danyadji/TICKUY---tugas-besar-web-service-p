const express = require('express');
const { body } = require('express-validator');
const OrderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const orderValidation = [
  body('event_id').notEmpty().withMessage('Event ID harus diisi').isInt().withMessage('Event ID harus berupa angka'),
  body('ticket_category_id').notEmpty().withMessage('Ticket category ID harus diisi').isInt().withMessage('Ticket category ID harus berupa angka'),
  body('quantity').notEmpty().withMessage('Quantity harus diisi').isInt({ min: 1 }).withMessage('Quantity minimal 1')
];

router.post('/', verifyToken, orderValidation, OrderController.createOrder);
router.get('/', verifyToken, OrderController.getUserOrders);
router.get('/:id', verifyToken, OrderController.getOrderById);

module.exports = router;
