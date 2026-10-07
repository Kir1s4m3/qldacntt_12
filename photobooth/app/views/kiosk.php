<?php
$title = 'Máy chụp ảnh';
$stylesheet = 'kiosk';
$bodyClass = 'kiosk-body';
$steps = [
    ['camera', 'Camera'], ['frame', 'Khung ảnh'], ['copies', 'Bản in'],
    ['qr', 'Thanh toán'], ['camera', 'Chụp ảnh'], ['spark', 'Trang trí'], ['print', 'Nhận ảnh'],
];
require __DIR__ . '/partials/head.php';
?>
<header class="kiosk-header">
    <?php require __DIR__ . '/partials/brand.php'; ?>
    <div class="booth-location">
        <span class="status-dot"></span><?= e($config['branch']) ?>
        <span class="separator">/</span><?= e($config['booth']) ?>
    </div>
    <button class="button button-quiet" id="help-button">
        <?= icon('help') ?> Cần hỗ trợ?
    </button>
</header>
<main class="kiosk-shell">
    <nav class="stepper" aria-label="Các bước chụp ảnh">
        <?php foreach ($steps as $index => [$key, $label]): ?>
            <div class="step" data-step-index="<?= $index ?>">
                <span class="step-icon"><?= icon($key) ?></span>
                <span><?= e($label) ?></span>
            </div>
        <?php endforeach; ?>
    </nav>
    <!-- kiosk.js hiển thị nội dung của bước hiện tại tại đây. -->
    <div id="kiosk-content" class="kiosk-content" aria-live="polite"></div>
    <footer class="kiosk-controls">
        <button id="back-button" class="button button-outline">Quay lại</button>
        <div class="selection-summary" id="selection-summary"></div>
        <button id="next-button" class="button button-primary">Tiếp theo</button>
    </footer>
</main>
<footer class="site-footer">
    <span><?= e($config['tagline']) ?></span>
    <span class="demo-label">Bản trải nghiệm · thanh toán & in ảnh mô phỏng</span>
    <a href="admin.php">Khu vực quản lý</a>
</footer>
<dialog id="help-dialog">
    <div class="dialog-body">
        <span class="eyebrow">CHÚNG MÌNH Ở ĐÂY</span>
        <h2>Bạn cần một chút hỗ trợ?</h2>
        <p>Vui lòng liên hệ nhân viên trực ca tại quầy.
            Cho nhân viên biết bạn đang dùng <?= e($config['booth']) ?>.</p>
        <p class="muted">Đây là bản UI thử nghiệm. Mã thanh toán chưa kết nối ngân hàng.</p>
        <button class="button button-primary" data-close-dialog>Đã hiểu</button>
    </div>
</dialog>
<div id="toast" class="toast" role="status" hidden></div>
<!-- Truyền cấu hình PHP sang JS qua JSON đã escape, không ghép mã JavaScript. -->
<script id="app-config" type="application/json"><?= json_data($config) ?></script>
<script src="assets/vendor/qrcode.js" defer></script>
<script type="module" src="assets/js/kiosk.js"></script>
</body>
</html>
