# Panduan Setup Database Microservices

## 🎯 Arsitektur Database Terpisah

Sebelum: **1 Database** (`tickuy_db`)
```
tickuy_db
├── users
├── events
├── ticket_categories
├── orders
├── payments
└── tickets
```

Sekarang: **3 Database Terpisah** (True Microservices!)
```
tickuy_auth_db          tickuy_event_db         tickuy_order_db
└── users               ├── events              ├── orders
                        └── ticket_categories    ├── payments
                                                └── tickets
```

---

## 🚀 Cara Setup

### Step 1: Jalankan SQL Script

```bash
# Di MySQL Command Line atau MySQL Workbench
mysql -u root -p < backend/SETUP_MICROSERVICE_DATABASES.sql
```

Atau copy-paste isi file `SETUP_MICROSERVICE_DATABASES.sql` ke MySQL Workbench.

### Step 2: Restart Semua Backend Services

```bash
# Ctrl+C untuk stop backend yang jalan
# Lalu start ulang
cd backend
npm run dev
```

Backend akan otomatis konek ke database masing-masing:
- **auth-service** → `tickuy_auth_db` (port 3001)
- **event-service** → `tickuy_event_db` (port 3002)
- **order-service** → `tickuy_order_db` (port 3003)

### Step 3: Verifikasi

```sql
-- Cek database yang ada
SHOW DATABASES LIKE 'tickuy_%';

-- Harusnya muncul:
-- tickuy_auth_db
-- tickuy_event_db
-- tickuy_order_db
```

---

## ⚠️ Perubahan Penting

### 1. **Tidak Ada Foreign Key Antar Database**

Sebelum (1 DB):
```sql
-- Bisa pakai FK
FOREIGN KEY (created_by) REFERENCES users(id)
```

Sekarang (3 DB):
```sql
-- Tidak bisa FK karena beda database
-- Hanya INDEX saja
INDEX idx_created_by (created_by)
```

### 2. **Service Harus Validate via API**

Contoh: Order service perlu event data
```javascript
// SEBELUM (query langsung):
SELECT * FROM events WHERE id = ?

// SEKARANG (via API call):
const eventResponse = await axios.get(
  'http://localhost:3002/api/events/' + eventId
);
```

### 3. **Join Query Tidak Bisa**

Sebelum:
```sql
SELECT o.*, u.nama, e.nama_event 
FROM orders o
JOIN users u ON o.user_id = u.id
JOIN events e ON o.event_id = e.id
```

Sekarang: **TIDAK BISA!** Harus ambil data terpisah via API.

---

## 📊 Mapping Service → Database

| Service | Database | Tables | Port |
|---------|----------|--------|------|
| **auth-service** | `tickuy_auth_db` | users | 3001 |
| **event-service** | `tickuy_event_db` | events, ticket_categories | 3002 |
| **order-service** | `tickuy_order_db` | orders, payments, tickets | 3003 |

---

## ✅ Keuntungan Arsitektur Ini

1. **Isolation**: Jika 1 DB down, service lain tetap jalan
2. **Scalability**: Bisa scale DB per service
3. **Security**: Service hanya akses DB-nya sendiri
4. **True Microservices**: Sesuai best practice
5. **Independent Deployment**: Deploy 1 service tidak ganggu lainnya

---

## ⚠️ Kekurangan & Solusi

### Kekurangan 1: Tidak Ada Referential Integrity
**Masalah**: Bisa saja `created_by=999` tapi user tidak ada
**Solusi**: Validate via API sebelum insert
```javascript
// Cek user exist via API
const userExists = await axios.get(`http://localhost:3001/api/users/${userId}`);
if (!userExists) throw new Error('User not found');
```

### Kekurangan 2: Query Lebih Lambat
**Masalah**: Harus API call, tidak bisa JOIN
**Solusi**: 
- Caching (Redis)
- Denormalization (simpan nama user di events)
- Aggregate service

### Kekurangan 3: Transaction Tidak Cross-DB
**Masalah**: Tidak bisa rollback cross-database
**Solusi**: 
- Saga pattern
- Eventual consistency
- Compensation logic

---

## 🔧 Jika Ada Error

### Error: "Unknown database 'tickuy_auth_db'"
**Solusi**: Jalankan ulang `SETUP_MICROSERVICE_DATABASES.sql`

### Error: "Access denied for user 'root'@'localhost'"
**Solusi**: 
```sql
-- Grant permissions
GRANT ALL PRIVILEGES ON tickuy_auth_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON tickuy_event_db.* TO 'root'@'localhost';
GRANT ALL PRIVILEGES ON tickuy_order_db.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Error: "Table doesn't exist"
**Solusi**: Pastikan SQL script sudah dijalankan lengkap

---

## 🎓 Untuk Tugas Akhir/Skripsi

Dengan arsitektur ini, bisa jelasin:

✅ **"Saya implement TRUE microservices dengan database terpisah"**
✅ **"Each service has its own database untuk isolation"**
✅ **"Communication via REST API, bukan direct database query"**
✅ **"Scalable architecture - bisa scale DB per service"**

Nilai tambah: ⭐⭐⭐⭐⭐

---

## 📖 Next: Migrate Data Lama

Jika sudah ada data di `tickuy_db`, jalankan migration:

```sql
-- Copy users
INSERT INTO tickuy_auth_db.users 
SELECT * FROM tickuy_db.users;

-- Copy events
INSERT INTO tickuy_event_db.events 
SELECT * FROM tickuy_db.events;

-- Copy ticket_categories
INSERT INTO tickuy_event_db.ticket_categories 
SELECT * FROM tickuy_db.ticket_categories;

-- Copy orders
INSERT INTO tickuy_order_db.orders 
SELECT * FROM tickuy_db.orders;

-- Copy payments
INSERT INTO tickuy_order_db.payments 
SELECT * FROM tickuy_db.payments;

-- Copy tickets
INSERT INTO tickuy_order_db.tickets 
SELECT * FROM tickuy_db.tickets;
```

Selesai! Database microservices siap digunakan! 🚀
