# Event Service - Design Document
**TICKUY Platform - Backend Architecture**

---

## 📁 Struktur Folder Event Service

```
event-service/
├── src/
│   ├── config/
│   │   ├── database.js           # Koneksi MySQL pool
│   │   └── database.sql          # Schema DDL
│   │
│   ├── models/
│   │   ├── Event.js              # Model Event
│   │   └── TicketCategory.js    # Model Kategori Tiket
│   │
│   ├── controllers/
│   │   ├── eventController.js    # Handler logic events
│   │   └── ticketController.js   # Handler logic ticket categories
│   │
│   ├── middleware/
│   │   ├── auth.js               # JWT verification & role checking
│   │   └── validation.js         # Request validation middleware
│   │
│   ├── routes/
│   │   ├── eventRoutes.js        # Routes untuk events
│   │   └── ticketRoutes.js       # Routes untuk ticket categories
│   │
│   └── utils/
│       ├── responseHelper.js     # Standardized API response
│       └── errorHandler.js       # Custom error handler
│
├── .env.example                   # Environment variables template
├── .gitignore
├── package.json
├── server.js                      # Entry point aplikasi
└── README.md
```

---

## 🗄️ Database Schema

### Tabel: `events`

```sql
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_event VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(255) NOT NULL,
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME NOT NULL,
  banner_url VARCHAR(500),
  status ENUM('draft', 'published', 'cancelled') DEFAULT 'draft',
  created_by INT NOT NULL,              -- ID admin yang membuat
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_tanggal (tanggal_mulai, tanggal_selesai),
  INDEX idx_created_by (created_by)
);
```

**Field Explanation:**
- `id`: Primary key
- `nama_event`: Nama event (misal: "Konser Sheila on 7")
- `deskripsi`: Detail lengkap event
- `lokasi`: Venue event
- `tanggal_mulai`: Waktu mulai event
- `tanggal_selesai`: Waktu selesai event
- `banner_url`: URL gambar banner event
- `status`: Status event (draft/published/cancelled)
- `created_by`: Foreign key ke tabel users (admin)

---

### Tabel: `ticket_categories`

```sql
CREATE TABLE ticket_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  nama_kategori VARCHAR(100) NOT NULL,     -- misal: "VIP", "Regular", "VVIP"
  deskripsi TEXT,
  harga DECIMAL(15,2) NOT NULL,            -- Harga tiket
  kuota INT NOT NULL,                       -- Total kuota tersedia
  terjual INT DEFAULT 0,                    -- Jumlah yang sudah terjual
  status ENUM('available', 'sold_out', 'inactive') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id),
  INDEX idx_status (status),
  
  -- Constraint: terjual tidak boleh lebih dari kuota
  CHECK (terjual <= kuota)
);
```

**Field Explanation:**
- `id`: Primary key
- `event_id`: Foreign key ke tabel events (1 event punya banyak kategori)
- `nama_kategori`: Nama kategori tiket (VIP, Regular, dll)
- `harga`: Harga tiket dalam rupiah
- `kuota`: Total tiket yang tersedia untuk kategori ini
- `terjual`: Counter berapa tiket yang sudah terjual
- `status`: Status ketersediaan tiket

---

## 🔗 Relasi Data

```
users (dari auth-service)
  ↓ (1:N)
events
  ↓ (1:N)
ticket_categories
  ↓ (1:N)
orders (akan dibuat di order-service)
```

**Relationship Details:**
- 1 Admin (user) → Bisa membuat banyak Events
- 1 Event → Bisa memiliki banyak Ticket Categories
- 1 Ticket Category → Bisa dibeli dalam banyak Orders

**Business Rules:**
- Soft delete: Jika event dihapus, ticket categories ikut terhapus (CASCADE)
- Kuota management: Field `terjual` akan di-increment saat ada pembelian
- Status auto-update: `sold_out` ketika `terjual >= kuota`

---

## 🛣️ API Endpoints

### Base URL: `/api/events`

#### 1. **POST /api/events**
- **Method**: POST
- **Auth**: Required (Admin only)
- **Description**: Buat event baru
- **Request Body**:
  ```json
  {
    "nama_event": "Konser Sheila on 7",
    "deskripsi": "Konser nostalgia...",
    "lokasi": "GBK Stadium",
    "tanggal_mulai": "2026-03-15T19:00:00",
    "tanggal_selesai": "2026-03-15T23:00:00",
    "banner_url": "https://...",
    "status": "draft"
  }
  ```
- **Response**: Event object + id
- **Middleware**: `verifyToken`, `isAdmin`, `validateEvent`

---

#### 2. **GET /api/events**
- **Method**: GET
- **Auth**: Public (No token required)
- **Description**: Ambil daftar semua events
- **Query Params**:
  - `status` (optional): filter by status
  - `search` (optional): search by nama_event
  - `limit` (optional): pagination limit
  - `page` (optional): pagination page
- **Response**: Array of events dengan informasi ticket categories
- **Middleware**: `none` (public access)

---

#### 3. **GET /api/events/:id**
- **Method**: GET
- **Auth**: Public
- **Description**: Ambil detail 1 event beserta ticket categories
- **Response**: Event object + array ticket_categories
- **Middleware**: `none` (public access)

---

#### 4. **PUT /api/events/:id**
- **Method**: PUT
- **Auth**: Required (Admin only)
- **Description**: Update event
- **Request Body**: Same as POST (partial update)
- **Response**: Updated event object
- **Middleware**: `verifyToken`, `isAdmin`, `validateEvent`

---

#### 5. **DELETE /api/events/:id**
- **Method**: DELETE
- **Auth**: Required (Admin only)
- **Description**: Hapus event (dan cascade ticket categories)
- **Response**: Success message
- **Middleware**: `verifyToken`, `isAdmin`
- **Note**: Tidak bisa delete jika ada tiket yang sudah terjual

---

### Base URL: `/api/ticket-categories`

#### 6. **POST /api/ticket-categories**
- **Method**: POST
- **Auth**: Required (Admin only)
- **Description**: Buat kategori tiket untuk sebuah event
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "nama_kategori": "VIP",
    "deskripsi": "Akses VIP lounge + meet & greet",
    "harga": 500000,
    "kuota": 100
  }
  ```
- **Response**: Ticket category object
- **Middleware**: `verifyToken`, `isAdmin`, `validateTicketCategory`

---

#### 7. **GET /api/ticket-categories**
- **Method**: GET
- **Auth**: Public
- **Description**: Ambil semua kategori tiket
- **Query Params**:
  - `event_id` (optional): filter by event
  - `status` (optional): filter by availability
- **Response**: Array of ticket categories
- **Middleware**: `none`

---

#### 8. **GET /api/ticket-categories/:id**
- **Method**: GET
- **Auth**: Public
- **Description**: Detail kategori tiket
- **Response**: Ticket category object
- **Middleware**: `none`

---

#### 9. **PUT /api/ticket-categories/:id**
- **Method**: PUT
- **Auth**: Required (Admin only)
- **Description**: Update kategori tiket (harga, kuota, dll)
- **Request Body**: Same as POST (partial update)
- **Response**: Updated ticket category
- **Middleware**: `verifyToken`, `isAdmin`, `validateTicketCategory`
- **Note**: Tidak bisa kurangi kuota jika sudah ada yang terjual

---

#### 10. **DELETE /api/ticket-categories/:id**
- **Method**: DELETE
- **Auth**: Required (Admin only)
- **Description**: Hapus kategori tiket
- **Response**: Success message
- **Middleware**: `verifyToken`, `isAdmin`
- **Note**: Tidak bisa delete jika ada tiket yang sudah terjual

---

## 📊 Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/events | ✅ | Admin | Buat event baru |
| GET | /api/events | ❌ | Public | List semua events |
| GET | /api/events/:id | ❌ | Public | Detail event |
| PUT | /api/events/:id | ✅ | Admin | Update event |
| DELETE | /api/events/:id | ✅ | Admin | Hapus event |
| POST | /api/ticket-categories | ✅ | Admin | Buat kategori tiket |
| GET | /api/ticket-categories | ❌ | Public | List kategori tiket |
| GET | /api/ticket-categories/:id | ❌ | Public | Detail kategori |
| PUT | /api/ticket-categories/:id | ✅ | Admin | Update kategori |
| DELETE | /api/ticket-categories/:id | ✅ | Admin | Hapus kategori |

**Total: 10 endpoints**
- **4 Public endpoints** (GET operations)
- **6 Protected endpoints** (Admin only - POST, PUT, DELETE)

---

## 🔐 Security & Validation

### JWT Middleware
```javascript
// Reuse dari auth-service
- verifyToken: Validasi JWT token di header
- isAdmin: Check role === 'admin'
```

### Input Validation Rules

**Event Validation:**
- `nama_event`: Required, min 3 chars, max 255 chars
- `lokasi`: Required, min 3 chars
- `tanggal_mulai`: Required, must be future date
- `tanggal_selesai`: Required, must be after tanggal_mulai
- `status`: Must be in ['draft', 'published', 'cancelled']

**Ticket Category Validation:**
- `event_id`: Required, must exist in events table
- `nama_kategori`: Required, min 2 chars
- `harga`: Required, must be positive number
- `kuota`: Required, must be positive integer
- `terjual`: Auto-managed, cannot be manually set

---

## 🔄 Business Logic

### Event Status Flow
```
draft → published → cancelled
  ↓
(dapat di-edit)
```

### Ticket Availability Logic
```javascript
// Auto-update status based on sales
if (terjual >= kuota) {
  status = 'sold_out'
} else if (status === 'sold_out' && terjual < kuota) {
  status = 'available'  // Jika ada refund
}
```

### Data Integrity Rules
1. **Cascade Delete**: Event dihapus → Ticket categories ikut terhapus
2. **Delete Protection**: Tidak bisa hapus event/category jika ada transaksi
3. **Kuota Management**: Field `terjual` di-increment via transaction
4. **Date Validation**: tanggal_selesai > tanggal_mulai

---

## 🔌 Integration Points

### Dengan Auth Service
- Validasi JWT token dari auth-service
- Check role admin via JWT payload
- Foreign key `created_by` → `users.id`

### Dengan Order Service (Future)
- Order service akan read ticket_categories untuk cek availability
- Order service akan update field `terjual` saat checkout
- Trigger notifikasi ke event service saat status berubah

### Dengan Payment Service (Future)
- Payment success → Increment `terjual`
- Payment failed/refund → Decrement `terjual`

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.5",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "express-validator": "^7.0.1",
  "multer": "^1.4.5-lts.1"  // Untuk upload banner
}
```

---

## 🎯 Next Steps for Implementation

1. ✅ Setup folder structure
2. ✅ Create database schema
3. ⬜ Implement models (Event, TicketCategory)
4. ⬜ Implement controllers with business logic
5. ⬜ Setup routes dengan validation
6. ⬜ Implement JWT middleware (copy from auth-service)
7. ⬜ Test semua endpoints dengan Postman
8. ⬜ Add image upload untuk banner (optional)

---

**Design by:** Backend Engineer Senior  
**Date:** January 6, 2026  
**Version:** 1.0
