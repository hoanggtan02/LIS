# LIS — Life is Sport | Source hoàn chỉnh

## Cấu trúc dự án

```
LIS/
├── backend/              ← PHP REST API
│   ├── config/
│   │   ├── database.php  ← Cấu hình DB + Medoo
│   │   └── config.php    ← Hằng số toàn cục
│   ├── middleware/
│   │   ├── cors.php      ← Xử lý CORS
│   │   └── auth.php      ← JWT auth cho admin
│   ├── api/
│   │   ├── products.php  ← GET/POST/PUT/DELETE sản phẩm
│   │   ├── orders.php    ← GET/POST đơn hàng
│   │   ├── auth.php      ← Login admin
│   │   └── upload.php    ← Upload ảnh sản phẩm
│   ├── uploads/products/ ← Ảnh upload
│   └── index.php         ← Router chính
│
├── frontend/             ← Landing page + sản phẩm
│   ├── assets/           ← Logo, ảnh tĩnh
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   ├── api.js        ← Gọi API tập trung
│   │   └── main.js       ← Logic trang
│   └── index.html        ← Landing page
│
└── admin/                ← Trang quản lý
    ├── css/
    │   └── admin.css
    ├── js/
    │   ├── api.js
    │   ├── auth.js
    │   ├── products.js
    │   ├── orders.js
    │   └── dashboard.js
    └── pages/
        ├── index.html    ← Dashboard
        ├── login.html
        ├── products.html
        └── orders.html
```

## Cài đặt

### Yêu cầu
- PHP >= 7.4
- MySQL / MariaDB
- Web server: Apache (XAMPP/LAMP) hoặc Nginx

### Bước 1 — Database
```sql
-- Chạy file: backend/config/schema.sql
```

### Bước 2 — Cấu hình
```php
// backend/config/config.php
define('DB_HOST', 'localhost');
define('DB_NAME', 'lis_shop');
define('DB_USER', 'root');
define('DB_PASS', '');
define('JWT_SECRET', 'your_secret_key');
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'Admin@LIS2025');
```

### Bước 3 — Medoo
```bash
composer require catfan/medoo
```

### Bước 4 — Deploy
- Đặt `backend/` vào web root: `http://localhost/lis/backend/`
- Đặt `frontend/` vào: `http://localhost/lis/frontend/`
- Đặt `admin/` vào: `http://localhost/lis/admin/`

## API Endpoints

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | /api/products | Lấy danh sách sản phẩm |
| GET | /api/products/{id} | Chi tiết sản phẩm |
| POST | /api/products | Thêm sản phẩm (admin) |
| PUT | /api/products/{id} | Sửa sản phẩm (admin) |
| DELETE | /api/products/{id} | Xoá sản phẩm (admin) |
| GET | /api/orders | Lấy đơn hàng (admin) |
| POST | /api/orders | Tạo đơn hàng mới |
| PUT | /api/orders/{id}/status | Cập nhật trạng thái (admin) |
| POST | /api/auth/login | Đăng nhập admin |
| POST | /api/upload | Upload ảnh (admin) |
