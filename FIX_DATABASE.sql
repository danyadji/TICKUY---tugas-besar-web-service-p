-- JALANKAN SCRIPT INI DI MYSQL UNTUK FIX ERROR!
-- Copy-paste ke MySQL Command Line atau MySQL Workbench

USE tickuy_db;

-- Cek apakah kolom approved_by sudah ada
SHOW COLUMNS FROM events;

-- Jika kolom approved_by, approved_at, rejection_reason BELUM ADA, jalankan ini:
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS approved_by INT NULL AFTER created_by,
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL AFTER approved_at;

-- Update status enum untuk include 'pending' dan 'rejected'
ALTER TABLE events 
MODIFY COLUMN status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending';

-- Verifikasi perubahan
DESCRIBE events;

-- Tampilkan pesan sukses
SELECT 'Migration completed! Kolom baru sudah ditambahkan.' AS Status;
