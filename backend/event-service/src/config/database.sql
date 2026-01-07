-- Event Service Database Schema
USE tickuy_db;

-- Table events
CREATE TABLE IF NOT EXISTS events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nama_event VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  lokasi VARCHAR(255) NOT NULL,
  tanggal_mulai DATETIME NOT NULL,
  tanggal_selesai DATETIME NOT NULL,
  banner_url VARCHAR(500),
  status ENUM('draft', 'pending', 'published', 'cancelled', 'rejected') DEFAULT 'pending',
  created_by INT NOT NULL,
  approved_by INT NULL,
  approved_at DATETIME NULL,
  rejection_reason TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_tanggal (tanggal_mulai, tanggal_selesai),
  INDEX idx_created_by (created_by)
);

-- Table ticket_categories
CREATE TABLE IF NOT EXISTS ticket_categories (
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
