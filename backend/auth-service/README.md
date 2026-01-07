# TICKUY Auth Service

Auth Service untuk aplikasi TICKUY - Platform Ticketing Event

## 📁 Struktur Folder

```
auth-service/
├── src/
│   ├── config/
│   │   ├── database.js      # Konfigurasi koneksi MySQL
│   │   └── database.sql     # SQL schema
│   ├── controllers/
│   │   └── authController.js # Controller untuk auth
│   ├── middleware/
│   │   └── auth.js          # Middleware JWT & role checking
│   ├── models/
│   │   └── User.js          # Model User
│   └── routes/
│       └── authRoutes.js    # Routes auth
├── .env.example             # Template environment variables
├── .gitignore
├── package.json
└── server.js                # Entry point aplikasi
```

## 🚀 Instalasi

1. Clone project dan masuk ke folder auth-service
2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env` dan sesuaikan konfigurasi:
```bash
cp .env.example .env
```

4. Buat database di MySQL:
```bash
mysql -u root -p < src/config/database.sql
```

5. Jalankan server:
```bash
# Development
npm run dev

# Production
npm start
```

## 📋 API Endpoints

### Public Endpoints

**POST /api/auth/register**
- Deskripsi: Register user baru
- Body:
```json
{
  "nama": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"  // optional, default: "user"
}
```

**POST /api/auth/login**
- Deskripsi: Login user
- Body:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Memerlukan Token)

**GET /api/auth/profile**
- Deskripsi: Get profil user yang sedang login
- Headers: `Authorization: Bearer <token>`

**PUT /api/auth/profile**
- Deskripsi: Update profil user
- Headers: `Authorization: Bearer <token>`
- Body:
```json
{
  "nama": "John Doe Updated",
  "email": "john.updated@example.com"
}
```

### Admin Only Endpoints

**GET /api/auth/users**
- Deskripsi: Get semua users
- Headers: `Authorization: Bearer <token>`
- Role: admin

**DELETE /api/auth/users/:id**
- Deskripsi: Hapus user berdasarkan ID
- Headers: `Authorization: Bearer <token>`
- Role: admin

## 🔒 Keamanan

- Password di-hash menggunakan bcryptjs
- Autentikasi menggunakan JWT (JSON Web Token)
- Role-based access control (user & admin)
- Token expire dalam 7 hari (konfigurasi di .env)

## 📝 Catatan

- Pastikan MySQL sudah terinstall dan berjalan
- Sesuaikan konfigurasi database di file `.env`
- Untuk development, gunakan `npm run dev` agar auto-reload
