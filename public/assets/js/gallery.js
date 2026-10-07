import { escapeHtml as e, download } from './shared.js';
const content = document.querySelector('#gallery-content');
let result = null;
try {
    result = JSON.parse(sessionStorage.getItem('photorain.gallery'));
} catch {}
const isPhoto = (value) =>
    typeof value === 'string' && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value);
const hasCapture = Boolean(
    isPhoto(result?.strip) &&
    Array.isArray(result.photos) &&
    result.photos.length === 4 &&
    result.photos.every(isPhoto)
);
const sample = 'assets/images/sample-friends.jpg';
function render(state = 'ready') {
    if (state !== 'ready') {
        const loading = state === 'loading';
        content.innerHTML = /* HTML */ `<div class="gallery-state">
            <span class="eyebrow">PHOTO RAIN</span>
            <h1>
                ${loading ? 'Ảnh của bạn đang trên đường đến.' : 'Liên kết này không còn hiệu lực.'}
            </h1>
            <p>
                ${loading ? 'Vui lòng chờ ảnh đồng bộ. Bạn có thể kiểm tra lại sau ít phút.' : 'Vui lòng liên hệ nhân viên tại cơ sở đã chụp để được hỗ trợ.'}
            </p>
            <button class="button button-primary" id="retry-gallery">
                ${loading ? 'Kiểm tra lại' : 'Xem lại giao diện mẫu'}
            </button>
            <p class="demo-label" style="margin-top:20px">
                Trạng thái mô phỏng để kiểm tra giao diện.
            </p>
        </div>`;
        content.querySelector('#retry-gallery').onclick = () => {
            document.querySelector('#gallery-state').value = 'ready';
            render();
        };
        return;
    }
    content.innerHTML = /* HTML */ `<div class="gallery-hero">
            <span class="eyebrow">MADE OF LITTLE MOMENTS</span>
            <h1>Một ngày vui, giữ lại mãi.</h1>
            <p>Bộ ảnh của bạn đã sẵn sàng. Tải về và chia sẻ niềm vui nhé.</p>
        </div>
        <div class="gallery-layout">
            <div class="gallery-photo">
                <img
                    src="${hasCapture ? result.strip : sample}"
                    alt="${hasCapture ? 'Bộ ảnh vừa chụp' : 'Bộ ảnh minh họa'}"
                />
            </div>
            <div class="gallery-detail">
                <span class="badge success">Ảnh sẵn sàng</span>
                <h2 style="margin-top:20px">Khoảnh khắc của bạn</h2>
                <div class="price-row">
                    <span>Camera</span><strong>${hasCapture ? e(result.camera) : 'Classic'}</strong>
                </div>
                <div class="price-row">
                    <span>Khung ảnh</span
                    ><strong>${hasCapture ? e(result.frame) : 'Khung minh họa'}</strong>
                </div>
                <div class="price-row">
                    <span>Số ảnh</span><strong>${hasCapture ? result.photos.length : 1} ảnh</strong>
                </div>
                <button id="download-gallery" class="button button-primary">
                    ${hasCapture ? 'Tải bộ ảnh PNG' : 'Tải ảnh mẫu'}
                </button>
                <div class="gallery-thumbnails">
                    ${(hasCapture ? result.photos : [sample]).map((src, index) => /* HTML */ `<a href="${src}" download="photo-rain-${index + 1}.jpg" aria-label="Tải ảnh ${index + 1}"><img src="${src}" alt="Ảnh ${index + 1}" /></a>`).join('')}
                </div>
                <p class="demo-label" style="margin-top:20px">
                    ${hasCapture ? 'Ảnh được giữ trong phiên trình duyệt này, chưa tải lên máy chủ. Bấm từng ảnh nhỏ để tải ảnh riêng.' : 'Bạn đang xem ảnh mẫu. Hoàn thành một lượt chụp để xem bộ ảnh của mình.'}
                </p>
            </div>
        </div>`;
    content.querySelector('#download-gallery').onclick = () =>
        download(
            hasCapture ? result.strip : sample,
            hasCapture ? 'photo-rain.png' : 'photo-rain-mau.jpg'
        );
}
document.querySelector('#gallery-state').onchange = (event) => render(event.target.value);
render();
