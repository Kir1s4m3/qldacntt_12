/** Run with a local PHP server and Playwright installed; see README. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.TEST_BASE_URL || 'http://127.0.0.1:8088';
const screenshots = path.join(__dirname, 'artifacts');
fs.mkdirSync(screenshots, { recursive: true });
(async () => {
    const browser = await chromium.launch({
        headless: true,
        channel: process.env.BROWSER_CHANNEL || 'msedge',
    });
    try {
        const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        page.on('response', (response) => {
            if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
        });
        await page.goto(base);
        await page.getByRole('heading', { name: 'Hôm nay, bạn là phiên bản nào?' }).waitFor();
        assert.equal(await page.locator('#payment-qr').count(), 0);
        await page.screenshot({
            path: path.join(screenshots, 'kiosk-desktop.png'),
            fullPage: true,
        });
        await page.locator('[data-camera="mono"]').click();
        await page.locator('#next-button').click();
        await page.locator('[data-frame="grid"]').click();
        await page.locator('#next-button').click();
        await page.locator('#plus').click();
        assert.match(await page.locator('.price-row.total').innerText(), /120.000/);
        await page.locator('#back-button').click();
        await page.locator('#next-button').click();
        assert.match(await page.locator('.copy-controls strong').innerText(), /3/);
        await page.locator('#next-button').click();
        assert.equal(await page.locator('#payment-qr svg').count(), 1);
        assert.equal(await page.locator('#next-button').isDisabled(), true);
        await page.locator('#pay-failed').click();
        assert.match(await page.locator('#payment-status').innerText(), /Chưa nhận/);
        await page.screenshot({ path: path.join(screenshots, 'payment.png'), fullPage: true });
        await page.locator('#pay-success').click();
        await page.locator('#start-capture').click();
        await page.locator('#caption').waitFor({ timeout: 25000 });
        await page.locator('#caption').fill('Khoảnh khắc thử nghiệm');
        await page.locator('[data-color="#f2d8df"]').click();
        assert.equal(await page.locator('#caption').inputValue(), 'Khoảnh khắc thử nghiệm');
        await page.locator('#next-button').click();
        await page.locator('#finished-photo canvas').waitFor();
        const photoCount = await page.evaluate(
            () => JSON.parse(sessionStorage.getItem('photorain.gallery')).photos.length
        );
        assert.equal(photoCount, 4);
        await page.screenshot({ path: path.join(screenshots, 'finished.png'), fullPage: true });
        const downloadEvent = page.waitForEvent('download');
        await page.locator('#download-strip').click();
        assert.equal((await downloadEvent).suggestedFilename(), 'photo-rain.png');
        await page.getByRole('link', { name: 'Mở trang nhận ảnh' }).click();
        await page.locator('#download-gallery').waitFor();
        assert.equal(await page.locator('.gallery-thumbnails img').count(), 4);
        await page.locator('#gallery-state').selectOption('expired');
        await page.getByRole('heading', { name: 'Liên kết này không còn hiệu lực.' }).waitFor();
        await page.locator('#gallery-state').selectOption('ready');
        console.log(
            'PASS kiosk: selection, price, payment gates, capture, decoration, PNG and gallery'
        );

        await page.goto(base + '/admin.php?page=inventory');
        await page.locator('#branch-filter').selectOption('cg');
        await page.locator('[data-action="move-item"][data-id="VT01"]').click();
        await page.locator('[name="operation"]').selectOption('Xuất');
        await page.locator('[name="quantity"]').fill('999');
        await page.locator('[name="note"]').fill('Kiểm thử xuất vượt tồn');
        await page.locator('#save-button').click();
        assert.match(await page.locator('#form-error').innerText(), /vượt tồn kho/);
        await page.locator('[name="quantity"]').fill('10');
        await page.locator('#save-button').click();
        await page.locator('#edit-dialog').waitFor({ state: 'hidden' });
        let record = await page.evaluate(() =>
            JSON.parse(sessionStorage.getItem('photorain.admin.v1')).inventory.find(
                (x) => x.id === 'VT01'
            )
        );
        assert.equal(record.stock, 310);
        await page.reload();
        assert.match(await page.locator('tbody tr').first().innerText(), /310/);
        await page.locator('#table-search').fill('không có kết quả này');
        await page.getByText('Không có dữ liệu phù hợp. Hãy thử điều kiện khác.').waitFor();
        console.log('PASS inventory: branch filter, stock validation, changes retained and search');

        await page.goto(base + '/admin.php?page=team');
        await page.locator('[data-action="add-shift"]').click();
        await page.locator('[name="name"]').selectOption('Nguyễn Minh Anh');
        await page.locator('[name="date"]').fill('2026-10-08');
        await page.locator('[name="start"]').fill('09:00');
        await page.locator('[name="end"]').fill('12:00');
        await page.locator('#save-button').click();
        assert.match(await page.locator('#form-error').innerText(), /trùng thời gian/);
        await page.locator('#edit-dialog [data-close-dialog]').click();
        await page.locator('[data-action="attendance"][data-id="CA04"]').click();
        await page.locator('[name="checkout"]').fill('07:00');
        await page.locator('#save-button').click();
        assert.match(await page.locator('#form-error').innerText(), /sau giờ vào/);
        await page.locator('[name="checkout"]').fill('14:00');
        await page.locator('#save-button').click();
        await page.locator('[data-action="tab-payroll"]').click();
        await page.locator('[data-action="approve-payroll"][data-id="L01"]').click();
        await page.locator('#save-button').click();
        assert.equal(await page.locator('[data-action="edit-payroll"][data-id="L01"]').count(), 0);
        console.log('PASS staffing: overlapping shifts, attendance order and payroll approval');

        await page.goto(base + '/admin.php?page=accounts');
        await page.locator('[data-action="add-account"]').click();
        await page.locator('[name="name"]').fill('Kiểm thử');
        await page.locator('[name="email"]').fill('minhanh@example.com');
        await page.locator('#save-button').click();
        assert.match(await page.locator('#form-error').innerText(), /đã được sử dụng/);
        await page.locator('#edit-dialog [data-close-dialog]').click();
        await page.locator('[data-action="toggle-account"][data-id="TK01"]').click();
        await page.locator('#save-button').click();
        assert.match(await page.locator('tbody tr').first().innerText(), /Đã khóa/);
        console.log('PASS accounts: duplicate email and lock simulation');

        await page.goto(base + '/admin.php?page=reports');
        await page.locator('[data-action="close-shift"]').click();
        assert.match(await page.locator('.closing-summary').innerText(), /290.000/);
        await page.locator('#save-button').click();
        await page.locator('[data-action="close-shift"]').click();
        await page.locator('#save-button').click();
        assert.match(await page.locator('#form-error').innerText(), /đã có ca/);
        await page.locator('#edit-dialog [data-close-dialog]').click();
        await page.locator('#branch-filter').selectOption('all');
        assert.match(await page.locator('.stat-card').first().innerText(), /630.000/);
        await page.locator('#booth-filter').selectOption('Máy chụp 01');
        assert.match(await page.locator('.stat-card').first().innerText(), /220.000/);
        const csv = page.waitForEvent('download');
        await page.locator('[data-action="export-report"]').click();
        assert.equal((await csv).suggestedFilename(), 'doanh-thu-mau.csv');
        console.log('PASS reports: reconciled totals, booth filter, duplicate closing and CSV');

        for (const route of [
            'overview',
            'media',
            'equipment',
            'inventory',
            'team',
            'reports',
            'accounts',
        ]) {
            await page.goto(base + '/admin.php?page=' + route);
            await page.locator('#admin-content h1').waitFor();
            await page.screenshot({
                path: path.join(screenshots, route + '-desktop.png'),
                fullPage: true,
            });
        }
        await page.setViewportSize({ width: 390, height: 844 });
        for (const route of [
            '/',
            '/gallery.php',
            '/admin.php',
            '/admin.php?page=inventory',
            '/admin.php?page=reports',
        ]) {
            await page.goto(base + route);
            await page.locator('h1').waitFor();
            const overflow = await page.evaluate(
                () => document.documentElement.scrollWidth > window.innerWidth + 1
            );
            assert.equal(overflow, false, `Horizontal page overflow at ${route}`);
            const name = route.includes('inventory')
                ? 'inventory'
                : route.includes('reports')
                  ? 'reports'
                  : route.includes('gallery')
                    ? 'gallery'
                    : route.includes('admin')
                      ? 'admin'
                      : 'kiosk';
            await page.screenshot({
                path: path.join(screenshots, name + '-mobile.png'),
                fullPage: true,
            });
        }
        await page.locator('#menu-toggle').click();
        assert.equal(await page.locator('#menu-toggle').getAttribute('aria-expanded'), 'true');
        assert.deepEqual(errors, [], 'Unexpected JS or HTTP errors');
        console.log('PASS all management routes, 390px responsive layouts and zero JS/HTTP errors');
    } finally {
        await browser.close();
    }
})().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
