<?php
// backend/config/config.php

// ── Database ──
define('DB_HOST', 'localhost');
define('DB_PORT', 3306);
define('DB_NAME', 'lis_shop');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// ── JWT ──
define('JWT_SECRET', 'LIS_SUPER_SECRET_KEY_CHANGE_IN_PRODUCTION_2025');
define('JWT_EXPIRE', 86400); // 24 giờ

// ── Upload ──
define('UPLOAD_DIR', __DIR__ . '/../uploads/products/');
define('UPLOAD_URL', '/backend/uploads/products/');
define('MAX_FILE_SIZE', 5 * 1024 * 1024); // 5MB
define('ALLOWED_TYPES', ['image/jpeg', 'image/png', 'image/webp']);

// ── CORS - Cho phép frontend gọi API ──
// Thay bằng domain thật khi lên production
define('ALLOWED_ORIGINS', [
    'http://localhost',
    'http://localhost:3000',
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'http://127.0.0.1',
    // Thêm domain production ở đây
    // 'https://lis-sport.vn',
]);

// ── App ──
define('APP_ENV', 'development'); // 'development' | 'production'
define('APP_DEBUG', APP_ENV === 'development');
