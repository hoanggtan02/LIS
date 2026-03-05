<?php
// backend/api/admin.php — Extra admin endpoints (đổi mật khẩu)
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// Endpoint này được gọi từ router nếu cần mở rộng
// Hiện tại đổi mật khẩu có thể thêm vào router trong index.php:
// ['PUT', '#^/api/admin/password$#', 'admin', 'changePassword'],

function changePassword(): void {
    $payload = requireAuth();
    $db      = getDB();
    $body    = getBody();

    $admin = $db->get('admins', ['id','password'], ['id' => $payload['admin_id']]);
    if (!$admin) respond(['success' => false, 'message' => 'Không tìm thấy admin'], 404);

    if (!verifyPassword($body['old_password'] ?? '', $admin['password'])) {
        respond(['success' => false, 'message' => 'Mật khẩu cũ không đúng'], 400);
    }

    $newPw = $body['new_password'] ?? '';
    if (strlen($newPw) < 8) {
        respond(['success' => false, 'message' => 'Mật khẩu mới tối thiểu 8 ký tự'], 422);
    }

    $db->update('admins', ['password' => hashPassword($newPw)], ['id' => $admin['id']]);
    respond(['success' => true, 'message' => 'Đổi mật khẩu thành công']);
}
