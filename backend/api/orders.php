<?php
// backend/api/orders.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// POST /api/orders — Đặt hàng (public)
function store(): void {
    $db   = getDB();
    $body = getBody();

    // Validate
    $required = ['customer_name', 'customer_phone', 'address', 'items'];
    foreach ($required as $f) {
        if (empty($body[$f])) {
            respond(['success' => false, 'message' => "Thiếu thông tin: $f"], 422);
        }
    }
    if (!is_array($body['items']) || count($body['items']) === 0) {
        respond(['success' => false, 'message' => 'Giỏ hàng trống'], 422);
    }

    // Validate + tính tiền từng sản phẩm
    $validatedItems = [];
    $subtotal = 0;

    foreach ($body['items'] as $item) {
        $p = $db->get('products', ['id','name','price','sale_price','stock'], [
            'id'        => (int)($item['product_id'] ?? 0),
            'is_active' => 1,
        ]);
        if (!$p) respond(['success' => false, 'message' => 'Sản phẩm không tồn tại'], 422);

        $qty = max(1, (int)($item['quantity'] ?? 1));
        if ($p['stock'] < $qty) {
            respond(['success' => false, 'message' => "Sản phẩm \"{$p['name']}\" không đủ hàng (còn {$p['stock']})"], 422);
        }

        $price = ($p['sale_price'] > 0) ? $p['sale_price'] : $p['price'];
        $subtotal += $price * $qty;

        $validatedItems[] = [
            'product_id' => $p['id'],
            'name'       => $p['name'],
            'price'      => $price,
            'quantity'   => $qty,
            'color'      => $item['color'] ?? '',
            'size'       => $item['size']  ?? '',
        ];
    }

    // Shipping fee
    $settings = $db->select('settings', ['key','value'], []) ?? [];
    $settingsMap = array_column($settings, 'value', 'key');
    $freeThreshold = (int)($settingsMap['free_shipping_threshold'] ?? 300000);
    $shippingFee   = (int)($settingsMap['shipping_fee'] ?? 30000);
    $shipping = ($subtotal >= $freeThreshold) ? 0 : $shippingFee;
    $total = $subtotal + $shipping;

    // Order code: LIS + ngày + random
    $code = 'LIS' . date('Ymd') . strtoupper(substr(uniqid(), -4));

    $db->insert('orders', [
        'order_code'      => $code,
        'customer_name'   => trim($body['customer_name']),
        'customer_phone'  => trim($body['customer_phone']),
        'customer_email'  => trim($body['customer_email'] ?? ''),
        'address'         => trim($body['address']),
        'province'        => trim($body['province'] ?? ''),
        'items'           => json_encode($validatedItems),
        'subtotal'        => $subtotal,
        'shipping_fee'    => $shipping,
        'discount'        => 0,
        'total'           => $total,
        'payment_method'  => $body['payment_method'] ?? 'cod',
        'note'            => trim($body['note'] ?? ''),
        'status'          => 'pending',
        'payment_status'  => 'pending',
    ]);

    // Trừ tồn kho
    foreach ($validatedItems as $item) {
        $db->update('products', ['stock[-]' => $item['quantity']], ['id' => $item['product_id']]);
    }

    respond([
        'success'    => true,
        'order_code' => $code,
        'total'      => $total,
        'message'    => 'Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm.',
    ], 201);
}

// GET /api/orders — Admin: danh sách đơn hàng
function index(): void {
    requireAuth();
    $db = getDB();

    $where = [];
    if (!empty($_GET['status']))   $where['status']   = $_GET['status'];
    if (!empty($_GET['search']))   $where['OR'] = [
        'order_code[~]'     => $_GET['search'],
        'customer_name[~]'  => $_GET['search'],
        'customer_phone[~]' => $_GET['search'],
    ];

    $limit  = min((int)($_GET['limit']  ?? 20), 100);
    $offset = (int)($_GET['offset'] ?? 0);

    $total  = $db->count('orders', $where);
    $orders = $db->select('orders', '*', array_merge($where, [
        'ORDER' => ['created_at' => 'DESC'],
        'LIMIT' => [$offset, $limit],
    ]));

    // Stats
    $stats = [
        'total'      => $db->count('orders'),
        'pending'    => $db->count('orders', ['status' => 'pending']),
        'processing' => $db->count('orders', ['status' => 'processing']),
        'shipping'   => $db->count('orders', ['status' => 'shipping']),
        'completed'  => $db->count('orders', ['status' => 'completed']),
        'cancelled'  => $db->count('orders', ['status' => 'cancelled']),
        'revenue'    => $db->sum('orders', 'total', ['status[!]' => 'cancelled']) ?? 0,
    ];

    respond([
        'success' => true,
        'data'    => array_map('parseOrder', $orders),
        'total'   => $total,
        'stats'   => $stats,
    ]);
}

// GET /api/orders/{id} — Admin: chi tiết đơn
function show(string $id): void {
    requireAuth();
    $db    = getDB();
    $order = $db->get('orders', '*', ['id' => (int)$id]);
    if (!$order) respond(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
    respond(['success' => true, 'data' => parseOrder($order)]);
}

// GET /api/orders/track/{code} — Public: tra cứu đơn hàng
function track(string $code): void {
    $db    = getDB();
    $order = $db->get('orders', ['order_code','customer_name','status','total','created_at','items','shipping_fee'], [
        'order_code' => strtoupper($code),
    ]);
    if (!$order) respond(['success' => false, 'message' => 'Không tìm thấy đơn hàng'], 404);
    respond(['success' => true, 'data' => parseOrder($order)]);
}

// PUT /api/orders/{id}/status — Admin: cập nhật trạng thái
function updateStatus(string $id): void {
    requireAuth();
    $db   = getDB();
    $body = getBody();

    $validStatuses = ['pending','processing','shipping','completed','cancelled'];
    $status = $body['status'] ?? '';
    if (!in_array($status, $validStatuses, true)) {
        respond(['success' => false, 'message' => 'Trạng thái không hợp lệ'], 422);
    }

    $db->update('orders', ['status' => $status], ['id' => (int)$id]);
    respond(['success' => true, 'message' => 'Cập nhật trạng thái thành công']);
}

function parseOrder(array $o): array {
    $o['items'] = json_decode($o['items'] ?? '[]', true) ?: [];
    return $o;
}
