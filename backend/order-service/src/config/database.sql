-- Order Service Database Schema
USE tickuy_db;

-- Table orders
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_category_id INT NOT NULL,
  quantity INT NOT NULL,
  total_amount DECIMAL(15,2) NOT NULL,
  status ENUM('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
  expired_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_user_id (user_id),
  INDEX idx_order_number (order_number),
  INDEX idx_status (status)
);

-- Table payments
CREATE TABLE IF NOT EXISTS payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_id INT NOT NULL,
  midtrans_order_id VARCHAR(255) UNIQUE,
  transaction_id VARCHAR(255),
  payment_type VARCHAR(50),
  gross_amount DECIMAL(15,2) NOT NULL,
  status ENUM('pending', 'settlement', 'capture', 'deny', 'cancel', 'expire', 'failure') DEFAULT 'pending',
  snap_token TEXT,
  snap_redirect_url TEXT,
  midtrans_response JSON,
  paid_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id),
  INDEX idx_midtrans_order_id (midtrans_order_id),
  INDEX idx_status (status)
);

-- Table tickets
CREATE TABLE IF NOT EXISTS tickets (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  order_id INT NOT NULL,
  user_id INT NOT NULL,
  event_id INT NOT NULL,
  ticket_category_id INT NOT NULL,
  qr_code_data TEXT,
  status ENUM('ACTIVE', 'USED', 'CANCELLED', 'REFUNDED') DEFAULT 'ACTIVE',
  used_at DATETIME,
  scanned_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_ticket_number (ticket_number),
  INDEX idx_user_id (user_id),
  INDEX idx_order_id (order_id),
  INDEX idx_status (status)
);
