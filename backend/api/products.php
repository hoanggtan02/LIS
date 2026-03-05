<?php
// backend/api/products.php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../middleware/auth.php';

// GET /api/products — Danh sách (public)
function index(): void {
    $db = getDB();

    $where = ['is_active' => 1];

    if (!empty($_GET['category']))
        $where['category'] = $_GET['category'];

    if (!empty($_GET['featured']))
        $where['is_featured'] = 1;

    if (!empty($_GET['search'])) {
        $keyword = '%' . $_GET['search'] . '%';
        $where['OR'] = [
            'name[~]'        => $_GET['search'],
            'description[~]' => $_GET['search'],
        ];
    }

    $limit  = min((int)($_GET['limit']  ?? 20), 100);
    $offset = (int)($_GET['offset'] ?? 0);

    $total    = $db->count('products', $where);
    $products = $db->select('products', '*', array_merge($where, [
        'ORDER' => ['is_featured' => 'DESC', 'created_at' => 'DESC'],
        'LIMIT' => [$offset, $limit],
    ]));

    respond([
        'success'  => true,
        'data'     => array_map('parseProduct', $products),
        'total'    => $total,
        'limit'    => $limit,
        'offset'   => $offset,
    ]);
}

// GET /api/products/{id} — Chi tiết theo ID (public)
function show(string $id): void {
    $db = getDB();
    $p  = $db->get('products', '*', ['id' => (int)$id, 'is_active' => 1]);
    if (!$p) respond(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
    respond(['success' => true, 'data' => parseProduct($p)]);
}

// GET /api/products/slug/{slug} — Chi tiết theo slug (public)
function showBySlug(string $slug): void {
    $db = getDB();
    $p  = $db->get('products', '*', ['slug' => $slug, 'is_active' => 1]);
    if (!$p) respond(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);
    respond(['success' => true, 'data' => parseProduct($p)]);
}

// POST /api/products — Thêm sản phẩm (admin)
function store(): void {
    requireAuth();
    $db   = getDB();
    $body = getBody();

    $name = trim($body['name'] ?? '');
    if (!$name) respond(['success' => false, 'message' => 'Tên sản phẩm không được trống'], 422);

    $productSlug = slug($name);
    // Đảm bảo slug unique
    $count = $db->count('products', ['slug[~]' => $productSlug]);
    if ($count > 0) $productSlug .= '-' . time();

    $id = $db->insert('products', [
        'name'        => $name,
        'slug'        => $productSlug,
        'description' => $body['description'] ?? '',
        'price'       => (int)($body['price'] ?? 0),
        'sale_price'  => (int)($body['sale_price'] ?? 0),
        'category'    => $body['category'] ?? 'vo-the-thao',
        'stock'       => (int)($body['stock'] ?? 0),
        'images'      => json_encode($body['images'] ?? []),
        'colors'      => json_encode($body['colors'] ?? []),
        'sizes'       => json_encode($body['sizes'] ?? []),
        'specs'       => json_encode($body['specs'] ?? []),
        'is_featured' => (int)($body['is_featured'] ?? 0),
        'is_active'   => 1,
    ]);

    respond(['success' => true, 'id' => $db->id(), 'message' => 'Thêm sản phẩm thành công'], 201);
}

// PUT /api/products/{id} — Cập nhật (admin)
function update(string $id): void {
    requireAuth();
    $db   = getDB();
    $body = getBody();

    $existing = $db->get('products', '*', ['id' => (int)$id]);
    if (!$existing) respond(['success' => false, 'message' => 'Không tìm thấy sản phẩm'], 404);

    $updateData = [];
    $fields = ['name','description','price','sale_price','category','stock','is_featured','is_active'];
    foreach ($fields as $f) {
        if (array_key_exists($f, $body)) {
            $updateData[$f] = in_array($f, ['price','sale_price','stock','is_featured','is_active'])
                ? (int)$body[$f] : $body[$f];
        }
    }
    foreach (['images','colors','sizes','specs'] as $f) {
        if (array_key_exists($f, $body)) $updateData[$f] = json_encode($body[$f]);
    }

    if (!empty($updateData)) {
        $db->update('products', $updateData, ['id' => (int)$id]);
    }

    respond(['success' => true, 'message' => 'Cập nhật thành công']);
}

// DELETE /api/products/{id} — Ẩn sản phẩm (admin)
function destroy(string $id): void {
    requireAuth();
    $db = getDB();
    $db->update('products', ['is_active' => 0], ['id' => (int)$id]);
    respond(['success' => true, 'message' => 'Đã ẩn sản phẩm']);
}

// ── Helper: parse JSON fields ──
function parseProduct(array $p): array {
    $p['images'] = json_decode($p['images'] ?? '[]', true) ?: [];
    $p['colors'] = json_decode($p['colors'] ?? '[]', true) ?: [];
    $p['sizes']  = json_decode($p['sizes']  ?? '[]', true) ?: [];
    $p['specs']  = json_decode($p['specs']  ?? '{}', true) ?: [];

    $p['display_price']  = ($p['sale_price'] > 0) ? $p['sale_price'] : $p['price'];
    $p['original_price'] = ($p['sale_price'] > 0) ? $p['price'] : null;
    $p['discount_pct']   = ($p['sale_price'] > 0 && $p['price'] > 0)
        ? round((1 - $p['sale_price'] / $p['price']) * 100) : 0;

    return $p;
}
