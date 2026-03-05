<?php
// backend/index.php — Router chính
require_once __DIR__ . '/middleware/cors.php';
handleCors();

$uri    = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$method = $_SERVER['REQUEST_METHOD'];

// Strip base path nếu deploy trong subfolder
// Ví dụ: /lis/backend/api/products → /api/products
$basePath = '/backend'; // Thay đổi nếu cần
$uri = preg_replace('#^' . preg_quote($basePath, '#') . '#', '', $uri);

// ── Routing ──
$routes = [
    // Auth
    ['POST', '#^/api/auth/login$#',   'auth',     'login'],

    // Products — public
    ['GET',  '#^/api/products$#',           'products', 'index'],
    ['GET',  '#^/api/products/(\d+)$#',     'products', 'show'],
    ['GET',  '#^/api/products/slug/(.+)$#', 'products', 'showBySlug'],

    // Products — admin
    ['POST',   '#^/api/products$#',       'products', 'store'],
    ['PUT',    '#^/api/products/(\d+)$#', 'products', 'update'],
    ['DELETE', '#^/api/products/(\d+)$#', 'products', 'destroy'],

    // Orders
    ['POST', '#^/api/orders$#',                    'orders', 'store'],
    ['GET',  '#^/api/orders$#',                    'orders', 'index'],
    ['GET',  '#^/api/orders/(\d+)$#',              'orders', 'show'],
    ['GET',  '#^/api/orders/track/([A-Z0-9]+)$#',  'orders', 'track'],
    ['PUT',  '#^/api/orders/(\d+)/status$#',       'orders', 'updateStatus'],

    // Upload
    ['POST', '#^/api/upload$#', 'upload', 'handle'],

    // Settings
    ['GET', '#^/api/settings$#', 'settings', 'index'],
    ['PUT', '#^/api/settings$#', 'settings', 'update'],

    // Admin extras
    ['PUT', '#^/api/admin/password$#', 'admin', 'changePassword'],
];

$matched = false;
foreach ($routes as [$routeMethod, $pattern, $controller, $action]) {
    if ($method !== $routeMethod) continue;
    if (preg_match($pattern, $uri, $matches)) {
        $params = array_slice($matches, 1);
        require_once __DIR__ . "/api/{$controller}.php";
        call_user_func_array($action, $params);
        $matched = true;
        break;
    }
}

if (!$matched) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint không tồn tại']);
}

// ── Helper functions ──
function respond(mixed $data, int $code = 200): void {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function getBody(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function slug(string $str): string {
    $str = mb_strtolower($str, 'UTF-8');
    $map = ['à'=>'a','á'=>'a','ả'=>'a','ã'=>'a','ạ'=>'a','ă'=>'a','ắ'=>'a','ặ'=>'a','ằ'=>'a','ẳ'=>'a','ẵ'=>'a','â'=>'a','ấ'=>'a','ầ'=>'a','ẩ'=>'a','ẫ'=>'a','ậ'=>'a','đ'=>'d','è'=>'e','é'=>'e','ẻ'=>'e','ẽ'=>'e','ẹ'=>'e','ê'=>'e','ế'=>'e','ề'=>'e','ể'=>'e','ễ'=>'e','ệ'=>'e','ì'=>'i','í'=>'i','ỉ'=>'i','ĩ'=>'i','ị'=>'i','ò'=>'o','ó'=>'o','ỏ'=>'o','õ'=>'o','ọ'=>'o','ô'=>'o','ố'=>'o','ồ'=>'o','ổ'=>'o','ỗ'=>'o','ộ'=>'o','ơ'=>'o','ớ'=>'o','ờ'=>'o','ở'=>'o','ỡ'=>'o','ợ'=>'o','ù'=>'u','ú'=>'u','ủ'=>'u','ũ'=>'u','ụ'=>'u','ư'=>'u','ứ'=>'u','ừ'=>'u','ử'=>'u','ữ'=>'u','ự'=>'u','ỳ'=>'y','ý'=>'y','ỷ'=>'y','ỹ'=>'y','ỵ'=>'y'];
    $str = strtr($str, $map);
    $str = preg_replace('/[^a-z0-9\s-]/', '', $str);
    $str = preg_replace('/[\s-]+/', '-', trim($str));
    return $str;
}
