<?php
$title = 'Nhận ảnh của bạn';
$stylesheet = 'kiosk';
require __DIR__ . '/partials/head.php';
?>
<header class="kiosk-header">
    <?php require __DIR__ . '/partials/brand.php'; ?>
    <span class="badge">YOUR LITTLE MOMENTS</span>
</header>
<main class="gallery-shell">
    <div id="gallery-content"></div>
    <div class="gallery-state-controls">
        <label for="gallery-state" class="demo-label">Xem thử trạng thái UI</label>
        <select class="control" id="gallery-state">
            <option value="ready">Ảnh sẵn sàng</option>
            <option value="loading">Ảnh đang đồng bộ</option>
            <option value="expired">Liên kết hết hạn</option>
        </select>
    </div>
</main>
<footer class="site-footer">
    <span>Photo Rain · Giữ lại một chút vui.</span>
    <a href="index.php">Về máy Photobooth</a>
    <a href="admin.php">Quản lý</a>
</footer>
<div id="toast" class="toast" role="status" hidden></div>
<script type="module" src="assets/js/gallery.js"></script>
</body>
</html>
