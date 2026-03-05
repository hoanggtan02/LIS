<?php
// backend/api/upload.php
require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../middleware/auth.php';

function handle(): void {
    requireAuth();

    if (empty($_FILES['image'])) {
        respond(['success' => false, 'message' => 'Không có file được gửi'], 422);
    }

    $file = $_FILES['image'];

    if ($file['error'] !== UPLOAD_ERR_OK) {
        respond(['success' => false, 'message' => 'Lỗi upload file'], 400);
    }
    if ($file['size'] > MAX_FILE_SIZE) {
        respond(['success' => false, 'message' => 'File quá lớn (tối đa 5MB)'], 422);
    }

    $finfo    = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_TYPES, true)) {
        respond(['success' => false, 'message' => 'Chỉ chấp nhận JPG, PNG, WebP'], 422);
    }

    $ext      = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = 'product_' . uniqid() . '.' . strtolower($ext);
    $dest     = UPLOAD_DIR . $filename;

    if (!is_dir(UPLOAD_DIR)) mkdir(UPLOAD_DIR, 0755, true);

    if (!move_uploaded_file($file['tmp_name'], $dest)) {
        respond(['success' => false, 'message' => 'Không thể lưu file'], 500);
    }

    respond([
        'success' => true,
        'url'     => UPLOAD_URL . $filename,
        'filename'=> $filename,
    ]);
}
