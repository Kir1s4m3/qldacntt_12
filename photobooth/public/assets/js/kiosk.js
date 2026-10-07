import { money, escapeHtml as e, toast, initDialogs, drawQr, download } from './shared.js';

// In-memory UI state. Server-side validation will replace payment simulation.
const config = JSON.parse(document.querySelector('#app-config').textContent);
const state = {
    step: 0,
    camera: config.cameras[0].id,
    frame: config.frames[0].id,
    copies: 2,
    paid: false,
    photos: [],
    color: '#ffffff',
    caption: 'a little moment, a lot of joy.',
    busy: false,
};
const content = document.querySelector('#kiosk-content');
const next = document.querySelector('#next-button');
const back = document.querySelector('#back-button');
const sample = 'assets/images/sample-friends.jpg';
let stream = null;
const currentCamera = () => config.cameras.find((item) => item.id === state.camera);
const currentFrame = () => config.frames.find((item) => item.id === state.frame);
const total = () => currentFrame().price + (state.copies - 2) * config.extra_copy_price;
const heading = (number, title, description) =>
    /* HTML */ `<div class="step-heading">
        <span class="eyebrow">${number} / YOUR LITTLE MOMENT</span>
        <h1>${title}</h1>
        <p>${description}</p>
    </div>`;

function preview() {
    return /* HTML */ `<div
        class="frame-preview ${state.frame === 'grid' ? 'grid' : ''}"
        style="background:${state.color}"
    >
        ${Array.from({ length: 4 }, (_, i) => /* HTML */ `<img src="${state.photos[i] || sample}" style="filter:${state.photos.length ? 'none' : currentCamera().filter}" alt="Ảnh vị trí ${i + 1}" />`).join('')}<span
            class="frame-brand"
            >PHOTO RAIN</span
        >
    </div>`;
}

function render() {
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.toggle('active', index === state.step);
        step.classList.toggle('complete', index < state.step);
        if (index === state.step) step.setAttribute('aria-current', 'step');
        else step.removeAttribute('aria-current');
    });
    back.disabled = state.step === 0 || state.step >= 4;
    next.disabled = state.step === 3 || state.step === 4 || state.busy;
    next.hidden = state.step === 6;
    back.hidden = state.step === 6;
    next.textContent = state.step === 5 ? 'Hoàn tất & in ảnh' : 'Tiếp theo';
    document.querySelector('#selection-summary').textContent = state.step
        ? `${currentCamera().name} · ${currentFrame().name} · ${state.copies} bản in · ${money(total())}`
        : 'Một chút tự nhiên. Một chút là chính bạn.';
    [
        cameraScreen,
        frameScreen,
        copiesScreen,
        paymentScreen,
        captureScreen,
        decorateScreen,
        finishScreen,
    ][state.step]();
}

function cameraScreen() {
    content.innerHTML =
        heading(
            '01',
            'Hôm nay, bạn là phiên bản nào?',
            'Chọn sắc ảnh bạn thích. Những khoảnh khắc còn lại, cứ tự nhiên nhé.'
        ) +
        /* HTML */ `<div class="camera-options">
                ${config.cameras
                    .map(
                        (camera) =>
                            /* HTML */ `<button
                                class="choice-card ${camera.id === state.camera ? 'selected' : ''}"
                                data-camera="${camera.id}"
                                aria-pressed="${camera.id === state.camera}"
                            >
                                <span class="choice-check">✓</span
                                ><img
                                    class="camera-image"
                                    src="${sample}"
                                    alt="Minh họa sắc ảnh ${camera.name}"
                                    style="filter:${camera.filter}"
                                /><span class="choice-meta"
                                    ><span class="choice-number">${camera.code}</span
                                    ><span
                                        ><strong>${camera.name}</strong
                                        ><small>${camera.description}</small></span
                                    ></span
                                >
                            </button>`
                    )
                    .join('')}
            </div>
            <p class="selection-tip">Ảnh minh họa · chọn camera, rồi nhấn Tiếp theo</p>`;
    content.querySelectorAll('[data-camera]').forEach(
        (button) =>
            (button.onclick = () => {
                state.camera = button.dataset.camera;
                render();
            })
    );
}

function frameScreen() {
    content.innerHTML =
        heading(
            '02',
            'Một chiếc khung cho kỷ niệm.',
            'Chọn bố cục yêu thích. Mỗi lượt bao gồm 2 bản in.'
        ) +
        /* HTML */ `<div class="frame-options">
            ${config.frames
                .map(
                    (frame) =>
                        /* HTML */ `<button
                            class="choice-card frame-choice ${frame.id === state.frame ? 'selected' : ''}"
                            data-frame="${frame.id}"
                            aria-pressed="${frame.id === state.frame}"
                        >
                            <div class="frame-preview ${frame.id === 'grid' ? 'grid' : ''}">
                                ${Array.from({ length: 4 }, () => /* HTML */ `<img src="${sample}" style="filter:${currentCamera().filter}" alt="Vị trí ảnh minh họa" />`).join('')}<span
                                    class="frame-brand"
                                    >PHOTO RAIN</span
                                >
                            </div>
                            <strong>${frame.name}</strong>
                            <p>${frame.description}</p>
                            <span class="badge">${money(frame.price)} / lượt</span>
                        </button>`
                )
                .join('')}
        </div>`;
    content.querySelectorAll('[data-frame]').forEach(
        (button) =>
            (button.onclick = () => {
                state.frame = button.dataset.frame;
                render();
            })
    );
}

function copiesScreen() {
    content.innerHTML =
        heading(
            '03',
            'Chia nhau một chút kỷ niệm.',
            'Chọn số bản in để mỗi người đều có một tấm mang về.'
        ) +
        /* HTML */ `<div class="split-step">
            <div class="preview-stage">${preview()}</div>
            <div>
                <span class="eyebrow">SỐ LƯỢNG BẢN IN</span>
                <h2>Bạn muốn in bao nhiêu bản?</h2>
                <div class="copy-controls">
                    <button
                        id="minus"
                        aria-label="Giảm bản in"
                        ${state.copies <= 2 ? 'disabled' : ''}
                    >
                        −</button
                    ><strong aria-live="polite">${state.copies}</strong
                    ><button
                        id="plus"
                        aria-label="Tăng bản in"
                        ${state.copies >= 8 ? 'disabled' : ''}
                    >
                        +
                    </button>
                </div>
                <p>Đã bao gồm 2 bản. Thêm mỗi bản ${money(config.extra_copy_price)}.</p>
                <div class="price-row">
                    <span>${currentFrame().name} · 2 bản</span
                    ><strong>${money(currentFrame().price)}</strong>
                </div>
                <div class="price-row">
                    <span>Bản in thêm (${state.copies - 2})</span
                    ><strong>${money((state.copies - 2) * config.extra_copy_price)}</strong>
                </div>
                <div class="price-row total">
                    <span>Tổng thanh toán</span><strong>${money(total())}</strong>
                </div>
            </div>
        </div>`;
    content.querySelector('#minus').onclick = () => {
        state.copies = Math.max(2, state.copies - 1);
        render();
    };
    content.querySelector('#plus').onclick = () => {
        state.copies = Math.min(8, state.copies + 1);
        render();
    };
}

function paymentScreen() {
    content.innerHTML =
        heading(
            '04',
            'Sắp đến giờ tỏa sáng rồi.',
            'Hoàn tất thanh toán để bắt đầu lượt chụp của bạn.'
        ) +
        /* HTML */ `<div class="split-step">
            <div>
                <span class="eyebrow">LƯỢT CHỤP CỦA BẠN</span>
                <h2>${currentFrame().name} · ${state.copies} bản in</h2>
                <div class="price-row">
                    <span>Camera</span><strong>${currentCamera().name}</strong>
                </div>
                <div class="price-row"><span>Vị trí</span><strong>${e(config.booth)}</strong></div>
                <div class="price-row total">
                    <span>Tổng thanh toán</span><strong>${money(total())}</strong>
                </div>
                <div class="notice">
                    QR minh họa, không dùng để chuyển tiền. Dùng nút mô phỏng để thử luồng thanh
                    toán.
                </div>
            </div>
            <div class="payment-panel">
                <div id="payment-qr" class="qr-box"></div>
                <div id="payment-status" class="payment-status" role="status">
                    Đang chờ thanh toán
                </div>
                <div class="payment-actions">
                    <button id="pay-success" class="button button-primary button-small">
                        Mô phỏng thành công</button
                    ><button id="pay-failed" class="button button-outline button-small">
                        Thử lỗi
                    </button>
                </div>
                <span class="demo-chip">Không phát sinh giao dịch thật</span>
            </div>
        </div>`;
    drawQr(
        content.querySelector('#payment-qr'),
        `PHOTO RAIN DEMO - NOT A PAYMENT - ${total()} VND`
    );
    content.querySelector('#pay-success').onclick = () => {
        state.paid = true;
        state.step = 4;
        render();
        toast('Thanh toán mô phỏng thành công. Lượt chụp đã sẵn sàng.');
    };
    content.querySelector('#pay-failed').onclick = () =>
        (content.querySelector('#payment-status').textContent =
            'Chưa nhận được thanh toán. Thử lại hoặc gọi nhân viên.');
}

function captureScreen() {
    content.innerHTML =
        heading(
            '05',
            'Cứ cười theo cách của bạn.',
            'Chúng mình sẽ chụp 4 tấm. Mỗi tấm có 3 giây để bạn tạo dáng.'
        ) +
        /* HTML */ `<div class="capture-stage">
                <img
                    id="sample-preview"
                    src="${sample}"
                    alt="Ảnh mẫu cho lượt chụp"
                    style="filter:${currentCamera().filter}"
                /><video
                    id="camera-preview"
                    autoplay
                    playsinline
                    muted
                    hidden
                    style="filter:${currentCamera().filter}"
                ></video
                ><span class="capture-tag" id="capture-tag">Chế độ ảnh mẫu</span>
                <div class="countdown" id="countdown" hidden></div>
            </div>
            <div class="capture-actions">
                <button id="start-capture" class="button button-primary">Bắt đầu chụp 4 tấm</button
                ><button id="enable-camera" class="button button-outline">
                    Dùng webcam của tôi
                </button>
            </div>
            <p class="shot-count" id="shot-count">
                Ảnh chỉ được giữ trong phiên trình duyệt này.
            </p>`;
    content.querySelector('#enable-camera').onclick = enableCamera;
    content.querySelector('#start-capture').onclick = takePhotos;
}

async function enableCamera() {
    const button = content.querySelector('#enable-camera');
    button.disabled = true;
    const captureButton = content.querySelector('#start-capture');
    captureButton.disabled = true;
    try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user' },
            audio: false,
        });
        const video = content.querySelector('#camera-preview');
        video.srcObject = stream;
        video.hidden = false;
        await video.play();
        content.querySelector('#sample-preview').hidden = true;
        content.querySelector('#capture-tag').textContent = 'Webcam của bạn';
    } catch {
        stopCamera();
        button.disabled = false;
        toast('Chưa mở được webcam. Cho phép camera trong trình duyệt hoặc tiếp tục bằng ảnh mẫu.');
    } finally {
        captureButton.disabled = false;
    }
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
function stopCamera() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
}

async function takePhotos() {
    if (state.busy || !state.paid) return;
    state.busy = true;
    state.photos = [];
    content.querySelectorAll('button').forEach((button) => (button.disabled = true));
    try {
        const source = stream
            ? content.querySelector('video')
            : content.querySelector('#sample-preview');
        if (source instanceof HTMLImageElement) await source.decode();
        const counter = content.querySelector('#countdown');
        for (let index = 0; index < 4; index++) {
            content.querySelector('#shot-count').textContent = `Chuẩn bị chụp tấm ${index + 1} / 4`;
            counter.hidden = false;
            for (let seconds = 3; seconds > 0; seconds--) {
                counter.textContent = seconds;
                await wait(1000);
            }
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const context = canvas.getContext('2d');
            context.filter = currentCamera().filter;
            const width = source.videoWidth || source.naturalWidth;
            const height = source.videoHeight || source.naturalHeight;
            const cropHeight = Math.min(height, width * 0.75),
                cropWidth = cropHeight / 0.75;
            if (stream) {
                context.translate(800, 0);
                context.scale(-1, 1);
            }
            context.drawImage(
                source,
                (width - cropWidth) / 2,
                (height - cropHeight) / 2,
                cropWidth,
                cropHeight,
                0,
                0,
                800,
                600
            );
            state.photos.push(canvas.toDataURL('image/jpeg', 0.85));
            counter.textContent = '✓';
            await wait(250);
        }
        stopCamera();
        state.step = 5;
        state.busy = false;
        render();
    } catch {
        state.busy = false;
        stopCamera();
        render();
        toast('Không tải được ảnh. Vui lòng thử chụp lại.');
    }
}

function decorateScreen() {
    content.innerHTML =
        heading(
            '06',
            'Thêm một chút dấu ấn riêng.',
            'Chọn màu khung và một lời nhắn cho bộ ảnh của bạn.'
        ) +
        /* HTML */ `<div class="split-step">
            <div class="preview-stage">${preview()}</div>
            <div>
                <h2>Chiếc khung của bạn</h2>
                <label>Màu khung</label>
                <div class="color-options">
                    ${[
                        ['#ffffff', 'Trắng'],
                        ['#f2d8df', 'Hồng'],
                        ['#e6e2f1', 'Tím'],
                        ['#dfe9e1', 'Xanh'],
                        ['#f3e5cf', 'Kem'],
                    ]
                        .map(
                            ([color, label]) =>
                                /* HTML */ `<button
                                    class="color-swatch ${state.color === color ? 'selected' : ''}"
                                    style="background:${color}"
                                    data-color="${color}"
                                    aria-label="${label}"
                                    aria-pressed="${state.color === color}"
                                ></button>`
                        )
                        .join('')}
                </div>
                <label class="field"
                    >Lời nhắn trên ảnh<input
                        id="caption"
                        maxlength="48"
                        value="${e(state.caption)}"
                        placeholder="Một lời nhắn nhỏ…"
                /></label>
                <p class="muted">Tối đa 48 ký tự. Cả 4 ảnh sẽ được ghép vào khung đã chọn.</p>
            </div>
        </div>`;
    content.querySelectorAll('[data-color]').forEach(
        (button) =>
            (button.onclick = () => {
                state.color = button.dataset.color;
                render();
            })
    );
    content.querySelector('#caption').oninput = (event) => (state.caption = event.target.value);
}

async function makeStrip() {
    const canvas = document.createElement('canvas'),
        grid = state.frame === 'grid';
    canvas.width = grid ? 920 : 480;
    canvas.height = grid ? 830 : 1500;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = state.color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < 4; index++) {
        const img = new Image();
        img.src = state.photos[index];
        await img.decode();
        const width = grid ? 420 : 432,
            height = grid ? 315 : 324;
        ctx.drawImage(
            img,
            grid ? 28 + (index % 2) * 444 : 24,
            grid ? 28 + Math.floor(index / 2) * 339 : 24 + index * 348,
            width,
            height
        );
    }
    ctx.fillStyle = '#3e2830';
    ctx.textAlign = 'center';
    ctx.font = 'bold 25px Arial';
    ctx.fillText('PHOTO RAIN', canvas.width / 2, canvas.height - 55);
    ctx.font = '16px Arial';
    ctx.fillText(state.caption, canvas.width / 2, canvas.height - 25, canvas.width - 35);
    return canvas;
}

async function finishScreen() {
    content.innerHTML =
        heading(
            '07',
            'Kỷ niệm đã sẵn sàng mang về.',
            'Giữ một bản cho mình, gửi một bản cho người bạn thương.'
        ) +
        /* HTML */ `<div class="finish-view">
            <div class="finish-grid">
                <div id="finished-photo"></div>
                <div>
                    <span class="badge success">Đã hoàn tất lượt chụp</span>
                    <h2 style="margin-top:20px">Nhận ảnh số của bạn</h2>
                    <div class="qr-box" id="download-qr"></div>
                    <p class="demo-label">Bản local: mở trang nhận ảnh trên cùng trình duyệt.</p>
                    <div class="payment-actions">
                        <button id="download-strip" class="button button-primary" disabled>
                            Tải ảnh PNG</button
                        ><a class="button button-outline" href="gallery.php">Mở trang nhận ảnh</a>
                    </div>
                </div>
            </div>
            <div class="notice">
                Đã mô phỏng yêu cầu in ${state.copies} bản. Chưa kết nối máy in hoặc lưu ảnh lên máy
                chủ.
            </div>
            <button id="new-session" class="button button-quiet" style="margin-top:15px">
                Bắt đầu lượt chụp mới
            </button>
        </div>`;
    try {
        const canvas = await makeStrip();
        content.querySelector('#finished-photo').append(canvas);
        const result = {
            strip: canvas.toDataURL('image/png'),
            photos: state.photos,
            camera: currentCamera().name,
            frame: currentFrame().name,
            copies: state.copies,
            createdAt: new Date().toISOString(),
        };
        try {
            sessionStorage.setItem('photorain.gallery', JSON.stringify(result));
        } catch {
            toast('Bộ nhớ trình duyệt đã đầy. Bạn vẫn có thể tải ảnh trực tiếp tại đây.');
        }
        drawQr(content.querySelector('#download-qr'), new URL('gallery.php', location.href).href);
        const button = content.querySelector('#download-strip');
        button.disabled = false;
        button.onclick = () => download(result.strip, 'photo-rain.png');
    } catch {
        toast('Chưa ghép được ảnh. Vui lòng thử lại.');
    }
    content.querySelector('#new-session').onclick = () => {
        // Xóa dữ liệu lượt trước khi bắt đầu một lượt khách mới.
        Object.assign(state, {
            step: 0,
            camera: config.cameras[0].id,
            frame: config.frames[0].id,
            copies: 2,
            paid: false,
            photos: [],
            color: '#ffffff',
            caption: 'a little moment, a lot of joy.',
            busy: false,
        });
        try {
            sessionStorage.removeItem('photorain.gallery');
        } catch {}
        render();
    };
}

back.onclick = () => {
    if (state.step > 0 && state.step < 4) {
        state.step--;
        render();
    }
};
next.onclick = () => {
    if (state.step === 3 || state.step === 4 || state.busy) return;
    state.step++;
    render();
};
document.querySelector('#help-button').onclick = () =>
    document.querySelector('#help-dialog').showModal();
window.addEventListener('pagehide', stopCamera);
initDialogs();
render();
