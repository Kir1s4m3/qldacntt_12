<?php
$title = $navigation[$page][0];
$stylesheet = 'admin';
$bodyClass = 'admin-body';
require __DIR__ . '/partials/head.php';
?>
<aside class="sidebar" id="sidebar">
    <?php require __DIR__ . '/partials/brand.php'; ?>
    <div class="workspace-label">KHÔNG GIAN QUẢN LÝ</div>
    <nav aria-label="Chức năng quản lý">
        <?php foreach ($navigation as $key => [$label, $symbol]): ?>
            <a href="admin.php?page=<?= e($key) ?>"
               class="nav-item <?= $page === $key ? 'active' : '' ?>"
               <?= $page === $key ? 'aria-current="page"' : '' ?>>
                <?= icon($symbol) ?><span><?= e($label) ?></span>
            </a>
        <?php endforeach; ?>
    </nav>
    <div class="sidebar-bottom">
        <a class="nav-item" href="index.php"><?= icon('camera') ?> Giao diện Photobooth</a>
        <a class="nav-item" href="gallery.php"><?= icon('download') ?> Trang nhận ảnh</a>
        <div class="sidebar-note">Một nơi. Hai cơ sở.<br>Mọi khoảnh khắc được kết nối.</div>
    </div>
</aside>
<div class="admin-workspace">
    <header class="admin-topbar">
        <div class="topbar-title">
            <button id="menu-toggle" class="button button-quiet button-small"
                    aria-label="Mở menu" aria-expanded="false">
                <?= icon('menu') ?>
            </button>
            <span>Photo Rain <span class="muted">/</span> <?= e($title) ?></span>
        </div>
        <div class="topbar-right">
            <label class="sr-only" for="branch-filter">Cơ sở</label>
            <select class="control" id="branch-filter">
                <option value="all">Tất cả cơ sở</option>
                <?php foreach ($demo['branches'] as $key => $name): ?>
                    <option value="<?= e($key) ?>"><?= e($name) ?></option>
                <?php endforeach; ?>
            </select>
            <div class="avatar" title="Chủ cửa hàng – tài khoản minh họa">CH</div>
        </div>
    </header>
    <main class="admin-main">
        <div class="demo-banner">
            <span><strong>Bản UI thử nghiệm</strong> · dữ liệu mẫu,
                chưa kết nối cơ sở dữ liệu hoặc xác thực tài khoản.</span>
            <button id="reset-demo">Đặt lại dữ liệu mẫu</button>
        </div>
        <!-- Mỗi mô-đun quản lý render vào vùng nội dung này. -->
        <div id="admin-content"></div>
    </main>
    <footer class="admin-footer">
        Photo Rain Studio <span>Giao diện quản lý · phiên bản 0.1</span>
    </footer>
</div>
<!-- Biểu mẫu được dùng chung cho các thao tác thêm, sửa và xác nhận. -->
<dialog id="edit-dialog">
    <form id="edit-form" class="dialog-body">
        <span class="eyebrow">PHOTO RAIN / QUẢN LÝ</span>
        <h2 id="dialog-title"></h2>
        <div id="dialog-fields"></div>
        <p id="form-error" class="error-text" role="alert"></p>
        <div class="dialog-actions">
            <button type="button" class="button button-outline" data-close-dialog>Hủy</button>
            <button type="submit" class="button button-primary" id="save-button">Lưu thay đổi</button>
        </div>
    </form>
</dialog>
<dialog id="media-dialog">
    <div class="dialog-body">
        <h2 id="media-title"></h2>
        <img src="assets/images/sample-friends.jpg" alt="Ảnh minh họa" class="media-full">
        <p class="muted">Ảnh mẫu dành cho bản UI.</p>
        <div class="dialog-actions">
            <button class="button button-outline" data-close-dialog>Đóng</button>
            <a class="button button-primary" href="assets/images/sample-friends.jpg"
               download="photo-rain-mau.jpg">Tải ảnh mẫu</a>
        </div>
    </div>
</dialog>
<div id="toast" class="toast" role="status" hidden></div>
<script id="admin-data" type="application/json"><?= json_data(['page' => $page, 'data' => $demo]) ?></script>
<script type="module" src="assets/js/admin.js"></script>
</body>
</html>
