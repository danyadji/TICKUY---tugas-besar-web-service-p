const express = require('express');
const PaymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

router.post('/callback', PaymentController.handleCallback);
router.get('/status/:order_id', verifyToken, PaymentController.getPaymentStatus);
router.post('/manual-check/:order_id', verifyToken, PaymentController.manualPaymentCheck);

module.exports = router;
