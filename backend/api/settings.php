<?php
// backend/api/settings.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// GET /api/settings — Public (chỉ trả về thông tin cần thiết cho frontend)
function index(): void {
    $db   = getDB();
    $rows = $db->select('settings', ['key', 'value'], []);
    $map  = array_column($rows ?? [], 'value', 'key');

    // Chỉ expose những key công khai
    respond([
        'success' => true,
        'data'    => [
            'store_name'    => $map['store_name']    ?? 'LIS Sport',
            'store_phone'   => $map['store_phone']   ?? '',
            'store_zalo'    => $map['store_zalo']    ?? '',
            'banner_text'   => $map['banner_text']   ?? '',
            'shipping_fee'  => (int)($map['shipping_fee'] ?? 30000),
            'free_shipping_threshold' => (int)($map['free_shipping_threshold'] ?? 300000),
        ],
    ]);
}

// PUT /api/settings — Admin only
function update(): void {
    requireAuth();
    $db   = getDB();
    $body = getBody();

    foreach ($body as $key => $value) {
        $exists = $db->has('settings', ['key' => $key]);
        if ($exists) {
            $db->update('settings', ['value' => (string)$value], ['key' => $key]);
        } else {
            $db->insert('settings', ['key' => $key, 'value' => (string)$value]);
        }
    }

    respond(['success' => true, 'message' => 'Đã lưu cài đặt']);
}
