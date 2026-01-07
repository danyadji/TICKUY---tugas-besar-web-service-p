# 🚀 CARA MENJALANKAN AUTH SERVICE

## 1️⃣ Install Dependencies
```bash
cd backend/auth-service
npm install
```

## 2️⃣ Setup Database

Buka MySQL dan jalankan:
```sql
CREATE DATABASE IF NOT EXISTS tickuy_db;
USE tickuy_db;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_email ON users(email);
CREATE INDEX idx_role ON users(role);
```

## 3️⃣ Konfigurasi .env

File `.env` sudah dibuat. Sesuaikan jika perlu:
- `DB_PASSWORD` - Password MySQL Anda
- `JWT_SECRET` - Ganti dengan secret key yang aman

## 4️⃣ Jalankan Server

**Development mode** (auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

Server akan berjalan di: `http://localhost:3001`

## 5️⃣ Test API

### Register User Baru
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

### Login
```bash
POST http://localhost:3001/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Response akan berisi **token JWT** yang digunakan untuk request selanjutnya.

### Get Profile (Protected)
```bash
GET http://localhost:3001/api/auth/profile
Authorization: Bearer <your-jwt-token>
```

### Register Admin (untuk testing)
```bash
POST http://localhost:3001/api/auth/register
Content-Type: application/json

{
  "nama": "Admin TICKUY",
  "email": "admin@tickuy.com",
  "password": "admin123",
  "role": "admin"
}
```

### Get All Users (Admin Only)
```bash
GET http://localhost:3001/api/auth/users
Authorization: Bearer <admin-jwt-token>
```

## 📋 Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/auth/register | ❌ | Public | Register user baru |
| POST | /api/auth/login | ❌ | Public | Login user |
| GET | /api/auth/profile | ✅ | User/Admin | Get profil |
| PUT | /api/auth/profile | ✅ | User/Admin | Update profil |
| GET | /api/auth/users | ✅ | Admin | List semua users |
| DELETE | /api/auth/users/:id | ✅ | Admin | Hapus user |

## ✅ Checklist

- [x] Database.js - Koneksi MySQL
- [x] User.js - Model dengan CRUD
- [x] authController.js - Register & Login dengan bcrypt + JWT
- [x] auth.js - JWT middleware & role checking
- [x] authRoutes.js - Routes dengan validation
- [x] server.js - Express server

## 🔐 Keamanan

- Password di-hash dengan **bcrypt** (10 rounds)
- JWT token expire dalam **7 hari**
- Role-based access control (user & admin)
- Input validation dengan **express-validator**
- CORS enabled untuk frontend integration

## 🎉 Auth Service Siap Digunakan!
