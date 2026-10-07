<?php
declare(strict_types=1);
require dirname(__DIR__) . '/app/bootstrap.php';
$navigation = [
    'overview' => ['Tổng quan', 'home'],
    'media' => ['Ảnh & kho tư liệu', 'frame'],
    'equipment' => ['Phòng & máy chụp', 'camera'],
    'inventory' => ['Vật tư & phụ kiện', 'box'],
    'team' => ['Ca làm & tiền lương', 'users'],
    'reports' => ['Chốt ca & doanh thu', 'chart'],
    'accounts' => ['Tài khoản & phân quyền', 'shield'],
];
$page = is_string($_GET['page'] ?? null) ? $_GET['page'] : 'overview';
if (!isset($navigation[$page])) {
    http_response_code(404);
    $page = 'overview';
}
$demo = require dirname(__DIR__) . '/app/data/demo.php';
require dirname(__DIR__) . '/app/views/admin.php';
