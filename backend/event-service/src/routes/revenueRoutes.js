const express = require('express');
const RevenueController = require('../controllers/revenueController');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Organizer routes
router.get('/my-revenue', verifyToken, RevenueController.getMyRevenue);

module.exports = router;
