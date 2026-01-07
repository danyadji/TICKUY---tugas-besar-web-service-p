# 🎫 EVENT SERVICE - SETUP & RUN

## 1️⃣ Install Dependencies
```bash
cd backend/event-service
npm install
```

## 2️⃣ Setup Database
Jalankan SQL schema:
```bash
mysql -u root -p tickuy_db < src/config/database.sql
```

Atau manual via MySQL client:
```sql
USE tickuy_db;
-- Copy paste isi database.sql
```

## 3️⃣ Jalankan Server
```bash
npm run dev
```

Server berjalan di: `http://localhost:3002`

---

## 📋 API ENDPOINTS

### Events (5 endpoints)

**POST /api/events** (Admin Only)
```json
{
  "nama_event": "Konser Sheila on 7",
  "deskripsi": "Konser nostalgia...",
  "lokasi": "GBK Stadium",
  "tanggal_mulai": "2026-03-15T19:00:00",
  "tanggal_selesai": "2026-03-15T23:00:00",
  "banner_url": "https://example.com/banner.jpg",
  "status": "draft"
}
```
Headers: `Authorization: Bearer <admin-jwt-token>`

**GET /api/events** (Public)

**GET /api/events/:id** (Public)

**PUT /api/events/:id** (Admin Only)

**DELETE /api/events/:id** (Admin Only)

---

### Ticket Categories (5 endpoints)

**POST /api/ticket-categories** (Admin Only)
```json
{
  "event_id": 1,
  "nama_kategori": "VIP",
  "deskripsi": "Akses VIP lounge",
  "harga": 500000,
  "kuota": 100
}
```
Headers: `Authorization: Bearer <admin-jwt-token>`

**GET /api/ticket-categories** (Public)

**GET /api/ticket-categories/:id** (Public)

**PUT /api/ticket-categories/:id** (Admin Only)

**DELETE /api/ticket-categories/:id** (Admin Only)

---

## ✅ TESTING FLOW

1. Login ke Auth Service sebagai admin → Dapatkan JWT token
2. Buat event dengan POST /api/events
3. Buat kategori tiket dengan POST /api/ticket-categories
4. Lihat event di GET /api/events
5. Update/Delete sebagai admin

---

**Port:** 3002  
**JWT Secret:** Same as auth-service  
**Database:** tickuy_db (shared)
