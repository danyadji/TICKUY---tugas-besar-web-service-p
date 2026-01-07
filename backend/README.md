# TICKUY Backend - Microservices

Backend TICKUY menggunakan arsitektur microservices dengan 3 service independen:
- **auth-service** (Port 3001) - Authentication & User Management
- **event-service** (Port 3002) - Event & Ticket Category Management  
- **order-service** (Port 3003) - Order, Payment & Ticket Management

## 📁 Struktur Folder

```
backend/
├── package.json              # Root package untuk menjalankan semua service
├── README.md                 # File ini
├── auth-service/
│   ├── package.json
│   ├── server.js
│   └── src/
├── event-service/
│   ├── package.json
│   ├── server.js
│   └── src/
└── order-service/
    ├── package.json
    ├── server.js
    └── src/
```

## 🚀 Cara Menjalankan

### Pertama Kali (Install Dependencies)

Dari folder `backend/`, jalankan:

```bash
npm run install:all
```

Perintah ini akan menginstall dependencies untuk:
1. Root backend (concurrently)
2. auth-service
3. event-service  
4. order-service

### Development Mode (dengan auto-reload)

```bash
npm run dev
```

Perintah ini akan menjalankan **semua service sekaligus** dalam mode development dengan nodemon.

### Production Mode

```bash
npm start
```

Perintah ini akan menjalankan **semua service sekaligus** dalam mode production.

### Menjalankan Service Individual

Jika hanya ingin menjalankan satu service:

```bash
npm run dev:auth      # Hanya auth-service
npm run dev:event     # Hanya event-service
npm run dev:order     # Hanya order-service
```

## ✅ Verifikasi

Setelah menjalankan, cek apakah semua service sudah berjalan:

- Auth Service: http://localhost:3001
- Event Service: http://localhost:3002
- Order Service: http://localhost:3003

## 📝 Catatan

- Setiap service tetap independen dengan kode dan database terpisah
- Service berjalan di port yang berbeda
- Menggunakan `concurrently` untuk menjalankan multiple processes
- Cocok untuk development dan demo tugas akhir
