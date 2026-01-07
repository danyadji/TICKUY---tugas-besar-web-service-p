-- ================================================
-- MIGRASI DATA dari tickuy_db ke 3 database microservices
-- ================================================

-- 1. MIGRASI USERS ke tickuy_auth_db
-- ================================================
USE tickuy_auth_db;

-- Kosongkan dulu tabel users (hapus admin default)
DELETE FROM users;

-- Copy semua data users dari tickuy_db
INSERT INTO tickuy_auth_db.users (id, nama, email, password, role, created_at, updated_at)
SELECT id, nama, email, password, role, created_at, updated_at
FROM tickuy_db.users;

SELECT CONCAT('✓ Berhasil migrasi ', COUNT(*), ' users') AS Status FROM tickuy_auth_db.users;


-- 2. MIGRASI EVENTS & TICKET_CATEGORIES ke tickuy_event_db
-- ================================================
USE tickuy_event_db;

-- Copy semua data events dari tickuy_db (jika ada)
-- Note: tickuy_db.events tidak punya kolom approved_by, approved_at, rejection_reason
-- Kolom status di tickuy_db: 'draft','published','cancelled' (belum ada 'pending','rejected')
INSERT INTO tickuy_event_db.events (id, nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, status, created_by, created_at, updated_at)
SELECT id, nama_event, deskripsi, lokasi, tanggal_mulai, tanggal_selesai, banner_url, 
       CASE 
         WHEN status = 'draft' THEN 'draft'
         WHEN status = 'published' THEN 'published'
         WHEN status = 'cancelled' THEN 'cancelled'
         ELSE 'pending'
       END as status,
       created_by, created_at, updated_at
FROM tickuy_db.events
WHERE EXISTS (SELECT 1 FROM tickuy_db.events LIMIT 1);

SELECT CONCAT('✓ Berhasil migrasi ', COUNT(*), ' events') AS Status FROM tickuy_event_db.events;

-- Copy semua data ticket_categories dari tickuy_db (jika ada)
INSERT INTO tickuy_event_db.ticket_categories (id, event_id, nama_kategori, deskripsi, harga, kuota, terjual, status, created_at, updated_at)
SELECT id, event_id, nama_kategori, deskripsi, harga, kuota, terjual, status, created_at, updated_at
FROM tickuy_db.ticket_categories
WHERE EXISTS (SELECT 1 FROM tickuy_db.ticket_categories LIMIT 1);

SELECT CONCAT('✓ Berhasil migrasi ', COUNT(*), ' ticket categories') AS Status FROM tickuy_event_db.ticket_categories;


-- 3. MIGRASI ORDERS, PAYMENTS, TICKETS ke tickuy_order_db
-- ================================================
-- Note: Tabel orders, payments, tickets tidak ada di tickuy_db (database lama)
-- Skip migrasi untuk tabel-tabel ini

USE tickuy_order_db;
SELECT '✓ tickuy_order_db siap digunakan (tidak ada data lama untuk dimigrasi)' AS Status;


-- ================================================
-- VERIFIKASI MIGRASI
-- ================================================
SELECT '========================================' AS Info;
SELECT 'RINGKASAN MIGRASI DATA' AS Info;
SELECT '========================================' AS Info;

SELECT 'tickuy_auth_db' AS DB_Name, 'users' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_auth_db.users
UNION ALL
SELECT 'tickuy_event_db' AS DB_Name, 'events' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_event_db.events
UNION ALL
SELECT 'tickuy_event_db' AS DB_Name, 'ticket_categories' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_event_db.ticket_categories
UNION ALL
SELECT 'tickuy_order_db' AS DB_Name, 'orders' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_order_db.orders
UNION ALL
SELECT 'tickuy_order_db' AS DB_Name, 'payments' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_order_db.payments
UNION ALL
SELECT 'tickuy_order_db' AS DB_Name, 'tickets' AS Table_Name, COUNT(*) AS Total_Records FROM tickuy_order_db.tickets;

SELECT '========================================' AS Info;
SELECT '✓ MIGRASI SELESAI! tickuy_db siap dihapus' AS Info;
SELECT '========================================' AS Info;
