-- ==============================================
-- LIS Sport Shop — Database Schema
-- ==============================================

CREATE DATABASE IF NOT EXISTS `lis_shop`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `lis_shop`;

-- ── Bảng sản phẩm ──
CREATE TABLE IF NOT EXISTS `products` (
  `id`          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `name`        VARCHAR(255) NOT NULL,
  `slug`        VARCHAR(255) NOT NULL UNIQUE,
  `description` TEXT,
  `price`       INT UNSIGNED NOT NULL DEFAULT 0,
  `sale_price`  INT UNSIGNED NOT NULL DEFAULT 0,
  `category`    VARCHAR(100) DEFAULT 'vo-the-thao',
  `stock`       INT NOT NULL DEFAULT 0,
  `images`      JSON,
  `colors`      JSON,
  `sizes`       JSON,
  `specs`       JSON,
  `is_active`   TINYINT(1) DEFAULT 1,
  `is_featured` TINYINT(1) DEFAULT 0,
  `created_at`  DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_category` (`category`),
  INDEX `idx_active`   (`is_active`),
  INDEX `idx_featured` (`is_featured`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Bảng đơn hàng ──
CREATE TABLE IF NOT EXISTS `orders` (
  `id`             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_code`     VARCHAR(20) NOT NULL UNIQUE,
  `customer_name`  VARCHAR(100) NOT NULL,
  `customer_phone` VARCHAR(20)  NOT NULL,
  `customer_email` VARCHAR(150),
  `address`        TEXT NOT NULL,
  `province`       VARCHAR(100),
  `items`          JSON NOT NULL,
  `subtotal`       INT UNSIGNED NOT NULL DEFAULT 0,
  `shipping_fee`   INT UNSIGNED NOT NULL DEFAULT 30000,
  `discount`       INT UNSIGNED NOT NULL DEFAULT 0,
  `total`          INT UNSIGNED NOT NULL DEFAULT 0,
  `payment_method` ENUM('cod','bank_transfer') DEFAULT 'cod',
  `payment_status` ENUM('pending','paid')      DEFAULT 'pending',
  `status`         ENUM('pending','processing','shipping','completed','cancelled') DEFAULT 'pending',
  `note`           TEXT,
  `created_at`     DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_status`     (`status`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Bảng admin ──
CREATE TABLE IF NOT EXISTS `admins` (
  `id`         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `username`   VARCHAR(50) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `name`       VARCHAR(100) DEFAULT 'Admin',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Cài đặt cửa hàng ──
CREATE TABLE IF NOT EXISTS `settings` (
  `key`   VARCHAR(100) PRIMARY KEY,
  `value` TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── Seed dữ liệu mẫu ──

-- Admin mặc định (password: Admin@LIS2025)
INSERT IGNORE INTO `admins` (`username`, `password`, `name`) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LIS Admin');

-- Cài đặt mặc định
INSERT IGNORE INTO `settings` (`key`, `value`) VALUES
('store_name',              'LIS — Life is Sport'),
('store_phone',             '0901234567'),
('store_zalo',              '0901234567'),
('store_address',           'TP. Hồ Chí Minh'),
('shipping_fee',            '30000'),
('free_shipping_threshold', '300000'),
('banner_text',             'Miễn phí vận chuyển cho đơn từ 300K · Đổi trả 7 ngày');

-- Sản phẩm mẫu
INSERT IGNORE INTO `products`
  (`name`, `slug`, `description`, `price`, `sale_price`, `category`, `stock`, `images`, `colors`, `sizes`, `specs`, `is_featured`)
VALUES
(
  'Vớ Thể Thao LIS Pro - Cổ Ngắn',
  'vo-the-thao-lis-pro-co-ngan',
  'Vớ thể thao cổ ngắn chất liệu co giãn 4 chiều, đế dày 5mm bấm chống trượt. Phù hợp gym, chạy bộ, cầu lông.',
  89000, 69000, 'vo-the-thao', 200,
  '["uploads/products/placeholder.png"]',
  '["Đen","Trắng","Navy"]',
  '["S (35-38)","M (39-42)","L (43-45)"]',
  '{"material":"80% Cotton · 15% Spandex · 5% Nylon","height":"Cổ ngắn 8cm","sole":"Đế dày 5mm chống trượt"}',
  1
),
(
  'Vớ Thể Thao LIS Pro - Cổ Cao',
  'vo-the-thao-lis-pro-co-cao',
  'Vớ thể thao cổ cao bảo vệ mắt cá, chất liệu premium co giãn, logo LIS thêu nổi bền màu.',
  99000, 79000, 'vo-the-thao', 150,
  '["uploads/products/placeholder.png"]',
  '["Đen","Trắng","Đỏ","Xanh"]',
  '["S (35-38)","M (39-42)","L (43-45)"]',
  '{"material":"80% Cotton · 15% Spandex · 5% Nylon","height":"Cổ cao 18cm","sole":"Đế dày 5mm chống trượt"}',
  1
),
(
  'Vớ Bóng Đá LIS Match',
  'vo-bong-da-lis-match',
  'Vớ chuyên biệt cho bóng đá, bảo vệ cẳng chân, đệm gót siêu dày, kháng khuẩn khử mùi hiệu quả.',
  129000, 99000, 'vo-bong-da', 100,
  '["uploads/products/placeholder.png"]',
  '["Trắng","Đen","Đỏ trắng","Xanh trắng"]',
  '["S (35-38)","M (39-42)","L (43-45)"]',
  '{"material":"75% Cotton · 20% Spandex · 5% Nylon","height":"Đến đầu gối 40cm","sole":"Đệm gót + mũi siêu dày"}',
  1
),
(
  'Combo 3 Đôi Vớ LIS Pro',
  'combo-3-doi-vo-lis-pro',
  'Tiết kiệm hơn với combo 3 đôi vớ LIS Pro. Tự chọn màu sắc và size cho từng đôi.',
  267000, 189000, 'combo', 80,
  '["uploads/products/placeholder.png"]',
  '["Mix màu tự chọn"]',
  '["S (35-38)","M (39-42)","L (43-45)"]',
  '{"include":"3 đôi vớ LIS Pro","material":"80% Cotton · 15% Spandex · 5% Nylon","note":"Tự chọn màu + size từng đôi"}',
  1
);
