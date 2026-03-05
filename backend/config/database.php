<?php
// backend/config/database.php
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/../../vendor/autoload.php';

use Medoo\Medoo;

function getDB(): Medoo {
    static $db = null;
    if ($db === null) {
        try {
            $db = new Medoo([
                'type'     => 'mysql',
                'host'     => DB_HOST,
                'port'     => DB_PORT,
                'database' => DB_NAME,
                'username' => DB_USER,
                'password' => DB_PASS,
                'charset'  => DB_CHARSET,
                'option'   => [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
                ],
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Database connection failed']);
            exit;
        }
    }
    return $db;
}
