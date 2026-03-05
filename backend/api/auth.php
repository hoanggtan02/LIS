<?php
// backend/api/auth.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

function login(): void {
    $db   = getDB();
    $body = getBody();

    $username = trim($body['username'] ?? '');
    $password = $body['password'] ?? '';

    if (!$username || !$password) {
        respond(['success' => false, 'message' => 'Vui lòng nhập đầy đủ thông tin'], 422);
    }

    $admin = $db->get('admins', '*', ['username' => $username]);
    if (!$admin || !verifyPassword($password, $admin['password'])) {
        respond(['success' => false, 'message' => 'Sai tên đăng nhập hoặc mật khẩu'], 401);
    }

    $token = generateJWT(['admin_id' => $admin['id'], 'username' => $admin['username']]);

    respond([
        'success' => true,
        'token'   => $token,
        'admin'   => ['id' => $admin['id'], 'username' => $admin['username'], 'name' => $admin['name']],
        'expires' => time() + JWT_EXPIRE,
    ]);
}
