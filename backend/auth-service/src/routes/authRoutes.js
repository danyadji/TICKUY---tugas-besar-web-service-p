const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('nama').notEmpty().withMessage('Nama harus diisi'),
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').isLength({ min: 6 }).withMessage('Password minimal 6 karakter'),
  body('role').optional().isIn(['user', 'admin']).withMessage('Role harus user atau admin')
];

const loginValidation = [
  body('email').isEmail().withMessage('Email tidak valid'),
  body('password').notEmpty().withMessage('Password harus diisi')
];

// Public routes
router.post('/register', registerValidation, AuthController.register);
router.post('/login', loginValidation, AuthController.login);
router.post('/register-admin', AuthController.registerAdmin);

// Protected routes (memerlukan token)
router.get('/profile', verifyToken, AuthController.getProfile);
router.put('/profile', verifyToken, AuthController.updateProfile);

// Admin only routes
router.get('/users', verifyToken, isAdmin, AuthController.getAllUsers);
router.delete('/users/:id', verifyToken, isAdmin, AuthController.deleteUser);

module.exports = router;
