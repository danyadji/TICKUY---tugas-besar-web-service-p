-- ================================================
-- MICROSERVICES DATABASE SETUP
-- Split tickuy_db menjadi 3 database terpisah
-- ================================================

-- 1. AUTH SERVICE DATABASE
-- ================================================
DROP DATABASE IF EXISTS tickuy_auth_db;
CREATE DATABASE tickuy_auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tickuy_auth_db;

-- Tabel users (hanya untuk auth-service)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role)
);

-- Insert default admin
INSERT INTO users (nama, email, password, role) VALUES
('Admin TICKUY', 'admin@tickuy.com', '$2a$10$YourHashedPasswordHere', 'admin');


-- 2. EVENT SERVICE DATABASE
-- ================================================
DROP DATABASE IF EXISTS tickuy_event_db;
CREATE DATABASE tickuy_event_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tickuy_event_db;

-- Tabel events (hanya untuk event-service)
CREATE TABLE events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_event VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(255) NOT NULL,
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME NOT NULL,
  banner_url VARCHAR(500),
  status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending',
  created_by INT NOT NULL,  -- Reference ke users.id (di DB lain)
  approved_by INT NULL,      -- Reference ke users.id (di DB lain)
  approved_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_tanggal (tanggal_mulai, tanggal_selesai),
  INDEX idx_created_by (created_by)
  -- NOTE: Tidak ada FOREIGN KEY karena users di DB berbeda
);

-- Tabel ticket_categories
CREATE TABLE ticket_categories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  event_id INT NOT NULL,
  nama_kategori VARCHAR(100) NOT NULL,
  deskripsi TEXT,
  harga DECIMAL(15,2) NOT NULL,
  kuota INT NOT NULL,
  terjual INT DEFAULT 0,
  status ENUM('available', 'sold_out', 'inactive') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  INDEX idx_event_id (event_id),
  INDEX idx_status (status),
  CHECK (terjual <= kuota)
);


-- 3. ORDER SERVICE DATABASE
-- ================================================
DROP DATABASE IF EXISTS tickuy_order_db;
CREATE DATABASE tickuy_order_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tickuy_order_db;

-- Tabel orders
CREATE TABLE orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,        -- Reference ke users.id (di auth DB)
  ticket_category_id INT NOT NULL,  -- Reference ke ticket_categories.id (di event DB)
  jumlah_tiket INT NOT NULL,
  total_harga DECIMAL(15,2) NOT NULL,
  status_payment ENUM('pending', 'paid', 'failed', 'expired') DEFAULT 'pending',
  midtrans_order_id VARCHAR(255) UNIQUE,
  midtrans_transaction_id VARCHAR(255),
  payment_type VARCHAR(50),
  payment_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status_payment),
  INDEX idx_midtrans_order (midtrans_order_id)
  -- NOTE: Tidak ada FOREIGN KEY karena reference ke DB lain
);

-- Tabel payments
CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'success', 'failed', 'expired') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  payment_code VARCHAR(255),
  payment_url TEXT,
  expired_at DATETIME,
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id)
);

-- Tabel tickets
CREATE TABLE tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  ticket_category_id INT NOT NULL,  -- Reference ke ticket_categories.id (di event DB)
  kode_tiket VARCHAR(50) UNIQUE NOT NULL,
  qr_code TEXT,
  status ENUM('active', 'used', 'cancelled') DEFAULT 'active',
  used_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_kode_tiket (kode_tiket),
  INDEX idx_status (status)
  -- NOTE: ticket_category_id tidak ada FK karena di DB berbeda
);


-- ================================================
-- VERIFIKASI
-- ================================================
SELECT 'Database microservices berhasil dibuat!' AS Status;
SELECT SCHEMA_NAME FROM information_schema.SCHEMATA WHERE SCHEMA_NAME LIKE 'tickuy_%';
