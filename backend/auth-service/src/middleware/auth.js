const jwt = require('jsonwebtoken');

// Middleware untuk verifikasi JWT token
const verifyToken = (req, res, next) => {
  try {
    // Ambil token dari header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token tidak ditemukan'
      });
    }

    // Verifikasi token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({
          success: false,
          message: 'Token tidak valid atau sudah kadaluarsa'
        });
      }

      // Simpan data user ke request
      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server',
      error: error.message
    });
  }
};

// Middleware untuk cek role admin
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses'
    });
  }
  next();
};

// Middleware untuk cek role user atau admin
const isUser = (req, res, next) => {
  if (req.user.role !== 'user' && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak'
    });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isUser
};
