# Order & Payment Service - Design Document
**TICKUY Platform - Backend Architecture**

---

## 📁 Struktur Folder Order Service

```
order-service/
├── src/
│   ├── config/
│   │   ├── database.js              # Koneksi MySQL pool
│   │   ├── database.sql             # Schema DDL
│   │   └── midtrans.js              # Konfigurasi Midtrans SDK
│   │
│   ├── models/
│   │   ├── Order.js                 # Model Order
│   │   ├── Payment.js               # Model Payment
│   │   └── Ticket.js                # Model Ticket (E-ticket)
│   │
│   ├── controllers/
│   │   ├── orderController.js       # Handler order logic
│   │   ├── paymentController.js     # Handler payment & callback
│   │   └── ticketController.js      # Handler ticket & QR code
│   │
│   ├── services/
│   │   ├── midtransService.js       # Integrasi Midtrans API
│   │   ├── qrCodeService.js         # Generate QR Code
│   │   └── ticketService.js         # Business logic ticket
│   │
│   ├── middleware/
│   │   ├── auth.js                  # JWT verification
│   │   ├── validation.js            # Request validation
│   │   └── midtransSignature.js     # Validasi signature Midtrans
│   │
│   ├── routes/
│   │   ├── orderRoutes.js           # Routes order
│   │   ├── paymentRoutes.js         # Routes payment
│   │   └── ticketRoutes.js          # Routes ticket
│   │
│   └── utils/
│       ├── responseHelper.js        # Standardized response
│       ├── errorHandler.js          # Error handler
│       └── ticketGenerator.js       # Generate ticket number
│
├── public/
│   └── qrcodes/                     # Folder penyimpanan QR codes
│
├── .env.example                      # Environment variables
├── .gitignore
├── package.json
├── server.js                         # Entry point
└── README.md
```

---

## 🗄️ Database Schema

### Tabel: `orders`

```sql
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,      -- Format: TKY-20260106-001
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_category_id INT NOT NULL,
  quantity INT NOT NULL,                          -- Jumlah tiket dibeli
  total_amount DECIMAL(15,2) NOT NULL,            -- Total harga
  status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
  expired_at DATETIME,                            -- Batas waktu pembayaran (15 menit)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id),
  
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status),
  INDEX idx_expired_at (expired_at)
);
```

**Field Explanation:**
- `order_number`: Nomor order unik (auto-generated)
- `user_id`: ID pembeli (dari auth-service)
- `event_id`: Event yang dibeli
- `ticket_category_id`: Kategori tiket yang dipilih
- `quantity`: Jumlah tiket yang dibeli
- `total_amount`: Total pembayaran (harga × quantity)
- `status`: Status order (PENDING → PAID/FAILED)
- `expired_at`: Order akan expired dalam 15 menit jika tidak dibayar

---

### Tabel: `payments`

```sql
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  payment_method VARCHAR(50),                     -- gopay, qris, bank_transfer, dll
  transaction_id VARCHAR(255) UNIQUE,             -- Transaction ID dari Midtrans
  gross_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'failure') DEFAULT 'pending',
  payment_url TEXT,                               -- URL redirect untuk pembayaran
  midtrans_response JSON,                         -- Raw response dari Midtrans
  paid_at DATETIME,                               -- Waktu pembayaran berhasil
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  
  INDEX idx_order_id (order_id),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status)
);
```

**Field Explanation:**
- `order_id`: Relasi ke tabel orders
- `payment_method`: Metode pembayaran yang dipilih user
- `transaction_id`: ID transaksi dari Midtrans
- `status`: Status pembayaran dari Midtrans
- `payment_url`: URL untuk redirect ke halaman pembayaran
- `midtrans_response`: Simpan raw response untuk debugging
- `paid_at`: Timestamp saat payment berhasil

---

### Tabel: `tickets`

```sql
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,      -- Format: TKT-EVENT001-VIP-00001
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_category_id INT NOT NULL,
  qr_code_url VARCHAR(500),                       -- Path/URL QR code
  qr_code_data TEXT,                              -- Data yang di-encode di QR
  status ENUM('ACTIVE', 'USED', 'CANCELLED', 'REFUNDED') DEFAULT 'ACTIVE',
  used_at DATETIME,                               -- Waktu tiket di-scan
  scanned_by INT,                                 -- Admin yang scan
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id),
  FOREIGN KEY (ticket_category_id) REFERENCES ticket_categories(id),
  FOREIGN KEY (scanned_by) REFERENCES users(id),
  
  INDEX idx_ticket_number (ticket_number),
  INDEX idx_qr_code_data (qr_code_data(255)),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_order_id (order_id)
);
```

**Field Explanation:**
- `ticket_number`: Nomor tiket unik per tiket
- `order_id`: Relasi ke order (1 order bisa punya banyak tiket)
- `qr_code_url`: Path file QR code (disimpan di server)
- `qr_code_data`: Data terenkripsi di QR code
- `status`: Status tiket (ACTIVE → USED saat di-scan)
- `used_at`: Waktu tiket di-scan di gate
- `scanned_by`: Admin yang melakukan scan

---

## 🔗 Relasi Data

```
users
  ↓ (1:N)
orders
  ↓ (1:1)          ↓ (1:N)
payments         tickets
```

**Relationship Details:**
- 1 User → Banyak Orders
- 1 Order → 1 Payment record
- 1 Order → Banyak Tickets (sesuai quantity)
- 1 Event + 1 Category → Bisa ada di banyak Orders

**Cascade Rules:**
- Order deleted → Payments & Tickets juga terhapus (CASCADE)
- Payment PAID → Trigger generate tickets

---

## 🛣️ API Endpoints

### Base URL: `/api/orders`

#### 1. **POST /api/orders**
- **Method**: POST
- **Auth**: Required (User/Admin)
- **Description**: Buat order baru dan inisiasi pembayaran
- **Request Body**:
  ```json
  {
    "event_id": 1,
    "ticket_category_id": 2,
    "quantity": 2,
    "payment_method": "gopay"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "data": {
      "order_id": 123,
      "order_number": "TKY-20260106-001",
      "total_amount": 1000000,
      "status": "PENDING",
      "payment_url": "https://app.sandbox.midtrans.com/snap/...",
      "expired_at": "2026-01-06T10:15:00Z"
    }
  }
  ```
- **Middleware**: `verifyToken`, `validateOrder`
- **Process Flow**:
  1. Validasi user login
  2. Cek availability tiket (kuota masih ada?)
  3. Hitung total_amount
  4. Buat record order dengan status PENDING
  5. Set expired_at (now + 15 menit)
  6. Request ke Midtrans Snap API
  7. Simpan payment record
  8. Return payment_url untuk redirect
  9. **BELUM generate tiket** (tunggu payment sukses)

---

#### 2. **GET /api/orders**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Ambil daftar order milik user yang login
- **Query Params**:
  - `status` (optional): filter by status
  - `limit`, `page`: pagination
- **Response**: Array of orders dengan detail event & payment
- **Middleware**: `verifyToken`

---

#### 3. **GET /api/orders/:id**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Detail order tertentu
- **Response**: Order object + payment info + tickets (jika ada)
- **Middleware**: `verifyToken`, `checkOwnership`

---

#### 4. **PUT /api/orders/:id/cancel**
- **Method**: PUT
- **Auth**: Required (User/Admin)
- **Description**: Cancel order (hanya jika status PENDING)
- **Response**: Success message
- **Middleware**: `verifyToken`, `checkOwnership`
- **Note**: Kembalikan kuota tiket

---

### Base URL: `/api/payments`

#### 5. **POST /api/payments/callback**
- **Method**: POST
- **Auth**: None (dari Midtrans server)
- **Description**: Webhook callback dari Midtrans
- **Request Body**: (Auto dari Midtrans)
  ```json
  {
    "transaction_status": "settlement",
    "order_id": "TKY-20260106-001",
    "transaction_id": "xxx-xxx-xxx",
    "gross_amount": "1000000.00",
    "payment_type": "gopay",
    "signature_key": "..."
  }
  ```
- **Response**: `{ success: true }`
- **Middleware**: `validateMidtransSignature`
- **Process Flow**:
  1. Validasi signature Midtrans (security)
  2. Find order by order_number
  3. Update payment status
  4. **IF status = 'settlement' (PAID)**:
     - Update order status → PAID
     - **Generate tickets** (sesuai quantity)
     - **Generate QR codes** untuk setiap tiket
     - Update kuota tiket (increment `terjual`)
     - Send email e-ticket (optional)
  5. **IF status = 'deny' / 'expire' / 'cancel'**:
     - Update order status → FAILED/EXPIRED/CANCELLED
     - Kembalikan kuota tiket
  6. Return 200 OK ke Midtrans

---

#### 6. **GET /api/payments/status/:order_id**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Cek status pembayaran order
- **Response**: Payment status + order status
- **Middleware**: `verifyToken`, `checkOwnership`

---

### Base URL: `/api/tickets`

#### 7. **GET /api/tickets**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Ambil semua tiket milik user yang login
- **Query Params**:
  - `status` (optional): filter by status
  - `event_id` (optional): filter by event
- **Response**: Array of tickets dengan QR code URL
- **Middleware**: `verifyToken`

---

#### 8. **GET /api/tickets/:id**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Detail e-ticket + QR code
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "ticket_number": "TKT-EVENT001-VIP-00001",
      "event": { "nama_event": "...", "tanggal": "..." },
      "category": { "nama_kategori": "VIP" },
      "qr_code_url": "/qrcodes/xxx.png",
      "status": "ACTIVE"
    }
  }
  ```
- **Middleware**: `verifyToken`, `checkOwnership`

---

#### 9. **POST /api/tickets/verify**
- **Method**: POST
- **Auth**: Required (Admin only)
- **Description**: Scan & verify QR code di gate
- **Request Body**:
  ```json
  {
    "qr_code_data": "encrypted-string-from-qr"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "valid": true,
    "ticket": {
      "ticket_number": "TKT-EVENT001-VIP-00001",
      "event": "Konser Sheila on 7",
      "status": "ACTIVE"
    }
  }
  ```
- **Middleware**: `verifyToken`, `isAdmin`
- **Process Flow**:
  1. Decrypt QR code data
  2. Find ticket by ticket_number
  3. Validasi:
     - Status = ACTIVE? (tidak USED/CANCELLED)
     - Event date masih berlaku?
  4. **IF valid**:
     - Update status → USED
     - Set used_at timestamp
     - Set scanned_by = admin ID
  5. Return ticket info

---

#### 10. **GET /api/tickets/:id/download**
- **Method**: GET
- **Auth**: Required (User/Admin)
- **Description**: Download e-ticket PDF (optional enhancement)
- **Response**: PDF file
- **Middleware**: `verifyToken`, `checkOwnership`

---

## 📊 Endpoint Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | /api/orders | ✅ | User/Admin | Buat order & inisiasi payment |
| GET | /api/orders | ✅ | User/Admin | List order user |
| GET | /api/orders/:id | ✅ | User/Admin | Detail order |
| PUT | /api/orders/:id/cancel | ✅ | User/Admin | Cancel order |
| POST | /api/payments/callback | ❌ | Midtrans | Webhook callback |
| GET | /api/payments/status/:order_id | ✅ | User/Admin | Cek status payment |
| GET | /api/tickets | ✅ | User/Admin | List tiket user |
| GET | /api/tickets/:id | ✅ | User/Admin | Detail e-ticket |
| POST | /api/tickets/verify | ✅ | Admin | Scan QR di gate |
| GET | /api/tickets/:id/download | ✅ | User/Admin | Download PDF |

**Total: 10 endpoints**
- **6 User endpoints** (order & ticket management)
- **1 Admin endpoint** (verify QR)
- **1 Public endpoint** (Midtrans callback - no auth)
- **2 Utility endpoints** (status check, download)

---

## 🔄 Flow Eksekusi Lengkap

### 🛒 **CHECKOUT SAMPAI TIKET JADI**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    USER FLOW: CHECKOUT TO E-TICKET                   │
└─────────────────────────────────────────────────────────────────────┘

[1] USER: Pilih event & kategori tiket di frontend
         ↓
[2] USER: Klik "Beli Tiket" (quantity: 2)
         ↓
[3] FRONTEND → POST /api/orders
    Request Body:
    {
      "event_id": 1,
      "ticket_category_id": 2,
      "quantity": 2,
      "payment_method": "gopay"
    }
         ↓
[4] ORDER SERVICE:
    ✓ Validasi JWT token (user logged in?)
    ✓ Cek kuota tiket (masih tersedia?)
    ✓ Hitung total_amount = harga × quantity
    ✓ Generate order_number: "TKY-20260106-001"
    ✓ Insert ke table `orders` (status: PENDING)
    ✓ Set expired_at = now + 15 menit
         ↓
[5] ORDER SERVICE → MIDTRANS SERVICE:
    ✓ Call Midtrans Snap API
    ✓ Request body:
      {
        "transaction_details": {
          "order_id": "TKY-20260106-001",
          "gross_amount": 1000000
        },
        "customer_details": { ... },
        "enabled_payments": ["gopay"]
      }
         ↓
[6] MIDTRANS RESPONSE:
    ✓ Return snap_token & redirect_url
    ✓ Insert ke table `payments`:
      - transaction_id
      - payment_url
      - status: pending
         ↓
[7] RESPONSE TO FRONTEND:
    {
      "order_id": 123,
      "order_number": "TKY-20260106-001",
      "payment_url": "https://app.sandbox.midtrans.com/snap/v2/...",
      "expired_at": "2026-01-06T10:15:00Z"
    }
         ↓
[8] FRONTEND: Redirect user ke payment_url (Midtrans Snap)
         ↓
[9] USER: Bayar menggunakan GoPay/QRIS/dll di Midtrans
         ↓
[10] MIDTRANS: Proses pembayaran
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                         PAYMENT SUCCESS                              │
└─────────────────────────────────────────────────────────────────────┘

[11] MIDTRANS → POST /api/payments/callback (Webhook)
     Request Body:
     {
       "transaction_status": "settlement",
       "order_id": "TKY-20260106-001",
       "transaction_id": "MT-123456",
       "gross_amount": "1000000.00",
       "signature_key": "..."
     }
         ↓
[12] ORDER SERVICE:
     ✓ Validasi signature_key (security)
     ✓ Find order by order_number
     ✓ Update payment status → settlement
     ✓ Update order status → PAID
         ↓
[13] TRIGGER: Generate Tickets
     FOR i = 1 to quantity (2 tiket):
       ✓ Generate ticket_number: "TKT-EVENT001-VIP-00001"
       ✓ Create QR code data (encrypted):
          - ticket_number
          - user_id
          - event_id
          - timestamp
       ✓ Generate QR code image → save ke /public/qrcodes/xxx.png
       ✓ Insert ke table `tickets`:
          - ticket_number
          - qr_code_url
          - qr_code_data
          - status: ACTIVE
     END FOR
         ↓
[14] UPDATE KUOTA:
     ✓ ticket_categories.terjual += quantity
     ✓ IF terjual >= kuota:
         status = 'sold_out'
         ↓
[15] OPTIONAL: Send email dengan e-ticket attachment
         ↓
[16] RESPONSE TO MIDTRANS: 200 OK
         ↓
[17] USER: Buka halaman "My Tickets"
     GET /api/tickets
         ↓
[18] RESPONSE:
     [
       {
         "ticket_number": "TKT-EVENT001-VIP-00001",
         "event": "Konser Sheila on 7",
         "category": "VIP",
         "qr_code_url": "/qrcodes/xxx.png",
         "status": "ACTIVE"
       },
       { ... tiket ke-2 ... }
     ]
         ↓
[19] FRONTEND: Tampilkan e-ticket dengan QR code
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                          ✅ TIKET JADI!                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 🚪 **SCAN QR DI GATE (ADMIN FLOW)**

```
[1] USER: Datang ke venue event
    Tunjukkan QR code di HP
         ↓
[2] ADMIN: Login ke admin panel
    Buka halaman "Scan QR"
         ↓
[3] ADMIN: Scan QR code menggunakan kamera/scanner
         ↓
[4] FRONTEND → POST /api/tickets/verify
    Request Body:
    {
      "qr_code_data": "encrypted-string-dari-qr-code"
    }
         ↓
[5] ORDER SERVICE:
    ✓ Decrypt qr_code_data
    ✓ Extract ticket_number
    ✓ Find ticket di database
         ↓
[6] VALIDASI:
    ✓ Ticket exists?
    ✓ Status = ACTIVE? (bukan USED/CANCELLED)
    ✓ Event date = hari ini?
    ✓ QR signature valid?
         ↓
[7] IF VALID:
    ✓ Update tickets.status → USED
    ✓ Set used_at = NOW()
    ✓ Set scanned_by = admin.id
         ↓
[8] RESPONSE:
    {
      "valid": true,
      "ticket": {
        "ticket_number": "TKT-EVENT001-VIP-00001",
        "user": "John Doe",
        "event": "Konser Sheila on 7",
        "category": "VIP"
      },
      "message": "✅ Tiket valid! Silakan masuk."
    }
         ↓
[9] FRONTEND: Tampilkan success message (hijau)
    Play sound "beep" ✅
         ↓
[10] USER: Masuk ke venue
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                     ✅ TIKET BERHASIL DIGUNAKAN                      │
└─────────────────────────────────────────────────────────────────────┘

CATATAN:
- Jika scan ulang QR yang sama → Invalid (status sudah USED)
- Jika QR palsu/expired → Invalid
- Jika scan QR di tanggal berbeda → Invalid
```

---

## 🔐 Security & Validation

### Midtrans Signature Validation
```javascript
// Validasi setiap webhook callback
const crypto = require('crypto');

function validateSignature(payload) {
  const { order_id, status_code, gross_amount, signature_key } = payload;
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  
  const hash = crypto
    .createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  
  return hash === signature_key;
}
```

### QR Code Encryption
```javascript
// Data yang di-encode di QR code
{
  "ticket_number": "TKT-EVENT001-VIP-00001",
  "user_id": 123,
  "event_id": 1,
  "issued_at": "2026-01-06T10:00:00Z",
  "signature": "encrypted-hash"  // Prevent forgery
}
```

### Order Expiration
```javascript
// Cron job untuk auto-cancel expired orders
// Jalankan setiap 1 menit
*/1 * * * * node src/jobs/expireOrders.js

// Logic:
// 1. Find orders dengan status PENDING dan expired_at < NOW
// 2. Update status → EXPIRED
// 3. Kembalikan kuota tiket
```

---

## 📦 Dependencies

```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.5",
  "jsonwebtoken": "^9.0.2",
  "dotenv": "^16.3.1",
  "cors": "^2.8.5",
  "midtrans-client": "^1.3.1",        // SDK Midtrans
  "qrcode": "^1.5.3",                  // Generate QR code
  "node-cron": "^3.0.3",               // Cron job untuk expiration
  "crypto": "^1.0.1",                  // Encryption
  "express-validator": "^7.0.1"
}
```

---

## 🔌 Integration Points

### Dengan Auth Service
- Validasi JWT token
- Get user info (ID, email, nama)

### Dengan Event Service
- Read event & ticket_category data
- Update field `terjual` di ticket_categories
- Check availability sebelum checkout

### Dengan Midtrans (External)
- **Snap API**: Inisiasi pembayaran
- **Webhook**: Notifikasi status payment
- **Transaction Status API**: Manual check status

---

## 📝 Environment Variables

```env
# Order Service
PORT=3003

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=tickuy_db

# Midtrans Configuration (SANDBOX)
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_SNAP_URL=https://app.sandbox.midtrans.com/snap/v1/transactions

# QR Code
QR_CODE_DIR=./public/qrcodes
QR_CODE_ENCRYPTION_KEY=your-secret-key-for-qr-encryption

# Order Expiration
ORDER_EXPIRATION_MINUTES=15

# JWT (from auth-service)
JWT_SECRET=same-as-auth-service
```

---

## � QR CODE VALIDATION SYSTEM

### Endpoint: POST /api/tickets/validate

Fitur validasi QR Code untuk admin penyelenggara event di gate masuk.

#### **Specification**

- **Method**: POST
- **URL**: `/api/tickets/validate`
- **Auth**: Required (Admin only)
- **Description**: Validasi QR code tiket saat pengunjung masuk ke venue event
- **Middleware**: `verifyToken`, `isAdmin`

#### **Request**

**Headers**:
```http
Authorization: Bearer <admin-jwt-token>
Content-Type: application/json
```

**Body**:
```json
{
  "ticket_id": 123
}
```

**Business Logic**:
- QR code hanya berisi `ticket_id` (simple & secure)
- Tidak perlu enkripsi kompleks, cukup ID saja
- Validasi dilakukan di backend dengan JWT admin

---

### 🔄 Alur Validasi Lengkap

```
┌─────────────────────────────────────────────────────────────────────┐
│                    QR CODE VALIDATION FLOW                           │
└─────────────────────────────────────────────────────────────────────┘

[1] USER: Tiba di venue event
    Buka e-ticket di smartphone
    Tunjukkan QR code ke admin gate
         ↓
[2] ADMIN: Login ke admin panel (mobile/web)
    Token JWT tersimpan di session/localStorage
         ↓
[3] ADMIN: Scan QR code menggunakan kamera
    Frontend decode QR → Extract ticket_id
         ↓
[4] FRONTEND → POST /api/tickets/validate
    Headers: Authorization: Bearer <admin-jwt-token>
    Body: { "ticket_id": 123 }
         ↓
[5] MIDDLEWARE VALIDATION:
    ✓ verifyToken() → Validasi JWT
    ✓ isAdmin() → Check role === 'admin'
    ✓ IF tidak valid → Return 401/403
         ↓
[6] CONTROLLER LOGIC:
    ✓ Find ticket by ID di database
         ↓
[7] VALIDASI TIKET:
    
    Check #1: Apakah tiket ditemukan?
    ❌ NOT FOUND → Return error
    ✅ FOUND → Lanjut
    
    Check #2: Apakah event_id sesuai dengan event hari ini?
    ❌ WRONG EVENT → Return error "Tiket bukan untuk event ini"
    ✅ MATCH → Lanjut
    
    Check #3: Apakah status tiket = ACTIVE?
    ❌ USED → Return error "Tiket sudah digunakan"
    ❌ CANCELLED → Return error "Tiket dibatalkan"
    ❌ REFUNDED → Return error "Tiket sudah direfund"
    ✅ ACTIVE → Lanjut
    
    Check #4: Apakah tanggal event valid?
    ❌ EVENT EXPIRED → Return error "Event sudah berlalu"
    ❌ EVENT NOT STARTED → Return error "Event belum dimulai"
    ✅ EVENT TODAY → Lanjut
         ↓
[8] ✅ SEMUA VALIDASI LOLOS:
    
    UPDATE DATABASE:
    ✓ tickets.status → 'USED'
    ✓ tickets.used_at → CURRENT_TIMESTAMP
    ✓ tickets.scanned_by → admin.id (dari JWT)
         ↓
[9] RESPONSE SUCCESS:
    {
      "success": true,
      "message": "Tiket valid! Silakan masuk.",
      "data": {
        "ticket_number": "TKT-EVENT001-VIP-00001",
        "user_name": "John Doe",
        "event_name": "Konser Sheila on 7",
        "category": "VIP",
        "status": "USED",
        "scanned_at": "2026-01-06T19:30:45Z",
        "scanned_by": "Admin Surya"
      }
    }
         ↓
[10] FRONTEND:
     ✓ Tampilkan success screen (warna hijau)
     ✓ Play sound "beep" ✅
     ✓ Show message: "✅ TIKET VALID - SILAKAN MASUK"
     ✓ Tampilkan detail: Nama, Kategori, Event
         ↓
[11] USER: Masuk ke venue event 🎉
         ↓
┌─────────────────────────────────────────────────────────────────────┐
│                    ✅ VALIDASI BERHASIL                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

### ✅ Skenario Sukses (Happy Path)

#### **Skenario 1: Tiket Valid Pertama Kali**

**Kondisi Awal**:
- Ticket exists di database
- Status = `ACTIVE`
- Event date = hari ini
- Admin sudah login dengan JWT valid

**Request**:
```json
POST /api/tickets/validate
Authorization: Bearer eyJhbGc...

{
  "ticket_id": 123
}
```

**Response**:
```json
{
  "success": true,
  "message": "Tiket valid! Silakan masuk.",
  "data": {
    "ticket_id": 123,
    "ticket_number": "TKT-EVENT001-VIP-00001",
    "user": {
      "id": 45,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "event": {
      "id": 1,
      "name": "Konser Sheila on 7",
      "date": "2026-01-06T19:00:00Z",
      "location": "GBK Stadium"
    },
    "category": {
      "name": "VIP",
      "price": 500000
    },
    "validation": {
      "status": "USED",
      "scanned_at": "2026-01-06T19:30:45Z",
      "scanned_by": {
        "id": 2,
        "name": "Admin Surya"
      }
    }
  }
}
```

**HTTP Status**: `200 OK`

**Database Update**:
```sql
UPDATE tickets 
SET 
  status = 'USED',
  used_at = '2026-01-06 19:30:45',
  scanned_by = 2
WHERE id = 123;
```

**Frontend Action**:
- Tampilkan layar hijau dengan ✅
- Play sound sukses
- Tampilkan detail tiket
- Auto close after 3 detik

---

### ❌ Skenario Gagal (Error Cases)

#### **Skenario 2: Tiket Sudah Pernah Digunakan**

**Kondisi Awal**:
- Ticket exists
- Status = `USED` (sudah di-scan sebelumnya)

**Request**:
```json
POST /api/tickets/validate
{
  "ticket_id": 123
}
```

**Response**:
```json
{
  "success": false,
  "message": "Tiket sudah digunakan!",
  "error": {
    "code": "TICKET_ALREADY_USED",
    "details": {
      "ticket_number": "TKT-EVENT001-VIP-00001",
      "status": "USED",
      "first_scan": {
        "scanned_at": "2026-01-06T18:15:30Z",
        "scanned_by": "Admin Budi"
      }
    }
  }
}
```

**HTTP Status**: `400 Bad Request`

**Database**: Tidak ada update

**Frontend Action**:
- Tampilkan layar merah dengan ❌
- Play sound error (buzzer)
- Tampilkan peringatan: "TIKET SUDAH DIGUNAKAN"
- Show detail kapan & oleh siapa di-scan pertama kali

---

#### **Skenario 3: Tiket Tidak Ditemukan**

**Kondisi**: ticket_id tidak ada di database

**Response**:
```json
{
  "success": false,
  "message": "Tiket tidak ditemukan!",
  "error": {
    "code": "TICKET_NOT_FOUND",
    "details": "ID tiket tidak valid atau tiket tidak terdaftar dalam sistem."
  }
}
```

**HTTP Status**: `404 Not Found`

---

#### **Skenario 4: Tiket Bukan Untuk Event Ini**

**Kondisi**: 
- Ticket exists
- event_id tiket ≠ event_id yang sedang berlangsung

**Response**:
```json
{
  "success": false,
  "message": "Tiket bukan untuk event ini!",
  "error": {
    "code": "WRONG_EVENT",
    "details": {
      "ticket_for": "Konser Dewa 19",
      "current_event": "Konser Sheila on 7"
    }
  }
}
```

**HTTP Status**: `400 Bad Request`

---

#### **Skenario 5: Event Belum Dimulai**

**Kondisi**: 
- Tanggal hari ini < event.tanggal_mulai

**Response**:
```json
{
  "success": false,
  "message": "Event belum dimulai!",
  "error": {
    "code": "EVENT_NOT_STARTED",
    "details": {
      "event_start": "2026-01-08T19:00:00Z",
      "current_time": "2026-01-06T19:30:00Z",
      "message": "Event akan dimulai pada 8 Januari 2026"
    }
  }
}
```

**HTTP Status**: `400 Bad Request`

---

#### **Skenario 6: Event Sudah Selesai**

**Kondisi**: 
- Tanggal hari ini > event.tanggal_selesai

**Response**:
```json
{
  "success": false,
  "message": "Event sudah selesai!",
  "error": {
    "code": "EVENT_EXPIRED",
    "details": {
      "event_end": "2026-01-05T23:00:00Z",
      "current_time": "2026-01-06T19:30:00Z"
    }
  }
}
```

**HTTP Status**: `400 Bad Request`

---

#### **Skenario 7: Tiket Dibatalkan/Refund**

**Kondisi**: Status = `CANCELLED` atau `REFUNDED`

**Response**:
```json
{
  "success": false,
  "message": "Tiket tidak valid!",
  "error": {
    "code": "TICKET_CANCELLED",
    "details": {
      "status": "REFUNDED",
      "reason": "Tiket telah di-refund oleh user"
    }
  }
}
```

**HTTP Status**: `400 Bad Request`

---

#### **Skenario 8: Admin Tidak Terautentikasi**

**Kondisi**: JWT token tidak ada atau invalid

**Response**:
```json
{
  "success": false,
  "message": "Token tidak valid atau sudah kadaluarsa"
}
```

**HTTP Status**: `403 Forbidden`

---

#### **Skenario 9: Bukan Admin (User Biasa Coba Akses)**

**Kondisi**: JWT valid tapi role = 'user'

**Response**:
```json
{
  "success": false,
  "message": "Akses ditolak. Hanya admin yang dapat melakukan validasi tiket."
}
```

**HTTP Status**: `403 Forbidden`

---

### 🔐 Security Implementation

#### **1. JWT Middleware Protection**

```javascript
// middleware/auth.js

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak ditemukan'
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        success: false,
        message: 'Token tidak valid atau sudah kadaluarsa'
      });
    }
    
    req.user = decoded; // { id, email, role }
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Akses ditolak. Hanya admin yang dapat mengakses.'
    });
  }
  next();
};
```

#### **2. QR Code Content**

**QR Code hanya berisi ticket_id (simple & secure)**:
```json
{
  "ticket_id": 123
}
```

**Keuntungan**:
- ✅ Simple: Hanya 1 field
- ✅ Secure: Validasi dilakukan di backend, bukan di QR
- ✅ Fast: Decode cepat
- ✅ Small: QR code kecil, mudah di-scan

**TIDAK perlu**:
- ❌ Enkripsi kompleks di QR
- ❌ Timestamp di QR
- ❌ Signature di QR

**Reasoning**: 
Semua validasi (status, event date, ownership) dilakukan di backend dengan data real-time dari database. QR code hanya sebagai identifier.

#### **3. Rate Limiting** (Optional Enhancement)

Prevent brute force scanning:
```javascript
// Limit 10 scan attempts per minute per admin
const rateLimit = require('express-rate-limit');

const scanLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    message: 'Terlalu banyak percobaan scan. Coba lagi nanti.'
  }
});

// Apply to validation endpoint
router.post('/tickets/validate', scanLimiter, verifyToken, isAdmin, validateTicket);
```

---

### 📊 Validation Summary Table

| Kondisi | Status Check | Result | HTTP Status | Action |
|---------|-------------|--------|-------------|---------|
| Tiket ACTIVE, Event hari ini | ✅ PASS | Success | 200 | Update → USED |
| Tiket USED | ❌ FAIL | Already used | 400 | Reject |
| Tiket CANCELLED | ❌ FAIL | Cancelled | 400 | Reject |
| Tiket REFUNDED | ❌ FAIL | Refunded | 400 | Reject |
| Tiket not found | ❌ FAIL | Not found | 404 | Reject |
| Wrong event | ❌ FAIL | Wrong event | 400 | Reject |
| Event belum mulai | ❌ FAIL | Too early | 400 | Reject |
| Event sudah selesai | ❌ FAIL | Too late | 400 | Reject |
| No JWT token | ❌ FAIL | Unauthorized | 401 | Reject |
| User bukan admin | ❌ FAIL | Forbidden | 403 | Reject |

---

### 🎨 Frontend UI/UX Recommendations

#### **Success Screen (Green)**
```
┌─────────────────────────────┐
│                             │
│         ✅ VALID            │
│                             │
│   TIKET BERHASIL DIVALIDASI │
│                             │
│   Nama: John Doe            │
│   Event: Konser Sheila on 7 │
│   Kategori: VIP             │
│   Waktu: 19:30 WIB          │
│                             │
│   [ Tutup ]                 │
│                             │
└─────────────────────────────┘
Color: #00C853 (Green)
Sound: "Beep" ✅
Auto-close: 3 seconds
```

#### **Error Screen (Red)**
```
┌─────────────────────────────┐
│                             │
│         ❌ INVALID          │
│                             │
│   TIKET SUDAH DIGUNAKAN!    │
│                             │
│   Tiket ini sudah di-scan   │
│   pada 18:15 WIB            │
│   oleh Admin Budi           │
│                             │
│   [ OK ]                    │
│                             │
└─────────────────────────────┘
Color: #D32F2F (Red)
Sound: "Buzzer" ❌
Auto-close: 5 seconds
```

---

### 🔄 State Transition Diagram

```
TIKET STATUS FLOW:

ACTIVE ─────┬─────> USED  (sukses validasi)
            │
            ├─────> CANCELLED  (user cancel order)
            │
            └─────> REFUNDED  (refund payment)


USED ──────> USED  (tidak bisa kembali ke ACTIVE)
             ↓
        PERMANENT (one-time use)
```

**Aturan**:
1. Status `ACTIVE` → `USED` (one-way, irreversible)
2. Tiket dengan status `USED` tidak bisa di-scan lagi
3. Tidak ada "undo" untuk validasi
4. Admin harus hati-hati saat scan (confirmation prompt optional)

---

## 🎯 Business Rules

1. **Order Expiration**: Order otomatis EXPIRED jika tidak dibayar dalam 15 menit
2. **Stock Management**: Kuota di-hold saat order PENDING, released saat EXPIRED/CANCELLED
3. **Ticket Generation**: Hanya generate tiket setelah payment = settlement
4. **QR Security**: QR code hanya berisi ticket_id, validasi di backend
5. **One-time Use**: Tiket hanya bisa di-scan 1 kali (status ACTIVE → USED)
6. **Refund**: Jika ada refund, update tickets → REFUNDED, kembalikan kuota
7. **Admin Only**: Validasi QR hanya bisa dilakukan oleh role admin
8. **Event Date Validation**: Tiket hanya valid pada tanggal event berlangsung

---

## 🚀 Next Steps

1. ⬜ Setup folder structure
2. ⬜ Create database schema
3. ⬜ Implement Midtrans SDK integration
4. ⬜ Build order creation flow
5. ⬜ Build payment callback handler
6. ⬜ Implement ticket generator dengan QR code
7. ⬜ Build ticket verification (scan QR)
8. ⬜ Setup cron job untuk order expiration
9. ⬜ Testing dengan Midtrans Sandbox
10. ⬜ Integration testing dengan Event Service

---

**Design by:** Backend Engineer Senior  
**Date:** January 6, 2026  
**Version:** 1.0  
**Status:** Ready for Implementation 🚀
