export const money = (value) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(value));
export const escapeHtml = (value) =>
    String(value ?? '').replace(
        /[&<>"']/g,
        (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]
    );
export function toast(message) {
    const element = document.querySelector('#toast');
    if (!element) return;
    element.textContent = message;
    element.hidden = false;
    clearTimeout(element.hideTimer);
    element.hideTimer = setTimeout(() => (element.hidden = true), 4000);
}
export function initDialogs() {
    document
        .querySelectorAll('[data-close-dialog]')
        .forEach((button) =>
            button.addEventListener('click', () => button.closest('dialog').close())
        );
    document.querySelectorAll('dialog').forEach((dialog) =>
        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        })
    );
}
export function drawQr(target, text) {
    if (!target) return;
    if (typeof window.qrcode !== 'function') {
        target.textContent = 'Mã QR chưa tải được. Vui lòng tải lại trang.';
        return;
    }
    const qr = window.qrcode(0, 'M');
    qr.addData(text);
    qr.make();
    target.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 12, scalable: true });
    target.querySelector('svg')?.setAttribute('aria-label', 'Mã QR');
}
export function download(url, filename) {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
}
