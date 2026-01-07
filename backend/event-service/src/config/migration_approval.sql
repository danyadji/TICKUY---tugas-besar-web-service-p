-- Migration: Add approval system untuk events
-- Jalankan script ini di MySQL untuk update tabel events yang sudah ada

USE tickuy_db;

-- 1. Update status enum untuk include 'pending' dan 'rejected'
ALTER TABLE events 
MODIFY status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending';

-- 2. Tambah kolom untuk approval system
ALTER TABLE events 
ADD COLUMN IF NOT EXISTS approved_by INT NULL AFTER created_by,
ADD COLUMN IF NOT EXISTS approved_at DATETIME NULL AFTER approved_by,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT NULL AFTER approved_at;

-- 3. Tambah foreign key untuk approved_by (jika belum ada)
-- ALTER TABLE events 
-- ADD CONSTRAINT fk_events_approved_by 
-- FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Verifikasi perubahan
DESCRIBE events;

-- 5. Update existing events yang statusnya 'draft' atau 'published' (opsional)
-- UPDATE events SET status = 'published' WHERE status = 'draft' AND created_by IN (SELECT id FROM users WHERE role = 'admin');

SELECT 'Migration completed successfully!' as status;
