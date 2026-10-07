import { store, branchName, newId } from './store.js';
import {
    root,
    e,
    heading,
    stats,
    badge,
    statusBadge,
    action,
    table,
    searchbar,
    bindSearch,
    onAction,
    openForm,
    branchField,
} from './ui.js';

export function renderEquipment() {
    const machines = store.search(store.rows('equipment'));
    root.innerHTML =
        heading('Phòng & máy chụp', 'Theo dõi tình trạng thiết bị và vật tư trong từng máy.') +
        searchbar('Tìm máy chụp hoặc concept…') +
        /* HTML */ `<div class="equipment-grid">
            ${
                machines
                    .map(
                        (row) =>
                            /* HTML */ `<article class="panel equipment-card">
                                <div class="equipment-top">
                                    <span class="booth-number">${e(row.id)}</span
                                    >${statusBadge(row.status)}
                                </div>
                                <h2>${e(row.name)}</h2>
                                <p>${e(row.concept)} · ${e(branchName(row.branch))}</p>
                                <div class="resource-row">
                                    <span>Giấy in</span><strong>${row.paper} tờ</strong>
                                </div>
                                <div class="meter">
                                    <span
                                        style="width:${Math.min((row.paper / 300) * 100, 100)}%;background:${row.paper < 50 ? '#be8237' : '#8d2036'}"
                                    ></span>
                                </div>
                                <div class="resource-row">
                                    <span>Mực in</span><strong>${row.ink}%</strong>
                                </div>
                                <div class="meter">
                                    <span
                                        style="width:${row.ink}%;background:${row.ink < 20 ? '#be8237' : '#8d2036'}"
                                    ></span>
                                </div>
                                <div class="equipment-bottom">
                                    ${action('Cập nhật tình trạng', 'edit-machine', `data-id="${row.id}"`)}
                                </div>
                            </article>`
                    )
                    .join('') || '<p class="empty-state">Không tìm thấy máy chụp.</p>'
            }
        </div>`;
    bindSearch(renderEquipment);
    onAction('edit-machine', (id) => {
        const row = store.data.equipment.find((item) => item.id === id);
        openForm(
            `Cập nhật ${row.name}`,
            [
                {
                    name: 'status',
                    label: 'Tình trạng hoạt động',
                    type: 'select',
                    value: row.status,
                    options: ['Sẵn sàng', 'Đang chụp', 'Bảo trì'],
                },
                { name: 'paper', label: 'Giấy còn lại (tờ)', type: 'number', value: row.paper },
                { name: 'ink', label: 'Mực còn lại (%)', type: 'number', max: 100, value: row.ink },
                { name: 'note', label: 'Ghi chú kỹ thuật', value: row.note || '', optional: true },
            ],
            (values) => {
                Object.assign(row, values);
                renderEquipment();
            }
        );
    });
}

export function renderMedia() {
    const rows = store.search(store.rows('media'));
    root.innerHTML =
        heading(
            'Ảnh & kho tư liệu',
            'Tra cứu ảnh theo cơ sở và quản lý tư liệu phục vụ nội dung.'
        ) +
        searchbar('Tìm tên bộ ảnh hoặc loại tư liệu…') +
        /* HTML */ `<div class="media-grid">
                ${
                    rows
                        .map(
                            (row, i) =>
                                /* HTML */ `<button
                                    class="media-card"
                                    data-action="view-media"
                                    data-id="${row.id}"
                                >
                                    <div class="media-image">
                                        <img
                                            src="assets/images/sample-friends.jpg"
                                            alt="Ảnh minh họa ${e(row.name)}"
                                            style="filter:${i % 2 ? 'grayscale(1)' : 'none'}"
                                        /><span class="badge">${e(row.type)}</span>
                                    </div>
                                    <div class="media-card-body">
                                        <h3>${e(row.name)}</h3>
                                        <p>${e(branchName(row.branch))} · ${e(row.date)}</p>
                                        <span>Xem bộ ảnh</span>
                                    </div>
                                </button>`
                        )
                        .join('') || '<p class="empty-state">Không tìm thấy ảnh phù hợp.</p>'
                }
            </div>
            <p class="demo-label">
                Các bộ ảnh dùng chung một ảnh minh họa. Chưa tải hoặc đồng bộ ảnh khách hàng lên máy
                chủ.
            </p>`;
    bindSearch(renderMedia);
    onAction('view-media', (id) => {
        const row = store.data.media.find((item) => item.id === id);
        document.querySelector('#media-title').textContent = row.name;
        document.querySelector('#media-dialog').showModal();
    });
}

export function renderInventory() {
    const all = store.rows('inventory');
    const rows = store.search(all);
    root.innerHTML =
        heading(
            'Vật tư & phụ kiện',
            'Theo dõi tồn kho, bổ sung vật tư và kiểm kê phụ kiện.',
            action('Thêm mặt hàng', 'add-item')
        ) +
        stats([
            ['Danh mục', all.length + ' mặt hàng', 'Tại cơ sở đang chọn'],
            [
                'Cần bổ sung',
                all.filter((x) => x.stock <= x.minimum).length + ' mặt hàng',
                'Chạm hoặc dưới định mức',
            ],
            [
                'Phụ kiện hỏng',
                all.reduce((s, x) => s + x.damaged, 0) + ' chiếc',
                'Được ghi nhận khi kiểm kê',
            ],
            [
                'Lịch sử thay đổi',
                store.rows('movements').length + ' lượt',
                'Các thao tác thử trong phiên này',
            ],
        ]) +
        /* HTML */ `<section class="panel">
                ${searchbar('Tìm tên vật tư, phụ kiện…')}${table(
                    ['Mặt hàng', 'Cơ sở', 'Loại', 'Tồn / định mức', 'Tình trạng', 'Thao tác'],
                    rows.map((row) => [
                        /* HTML */ `<strong>${e(row.name)}</strong><small>${e(row.id)}</small>`,
                        e(branchName(row.branch)),
                        e(row.type),
                        /* HTML */ `<strong>${row.stock}</strong> / ${row.minimum} ${e(row.unit)}`,
                        row.stock <= row.minimum
                            ? badge('Cần bổ sung', 'warning')
                            : row.damaged
                              ? badge(`${row.damaged} hỏng`, 'danger')
                              : badge('Đủ sử dụng', 'success'),
                        /* HTML */ `<div class="row-actions">
                            ${action(row.type === 'Phụ kiện' ? 'Kiểm kê' : 'Nhập / xuất', 'move-item', `data-id="${row.id}"`)}${action('Sửa', 'edit-item', `data-id="${row.id}"`)}
                        </div>`,
                    ])
                )}
            </section>
            <section class="panel">
                <div class="panel-heading"><h2>Lịch sử nhập, xuất và kiểm kê</h2></div>
                ${table(
                    ['Thời điểm', 'Mặt hàng', 'Cơ sở', 'Nội dung', 'Thay đổi'],
                    store
                        .rows('movements')
                        .slice()
                        .reverse()
                        .map((row) => [
                            e(row.time),
                            e(row.name),
                            e(branchName(row.branch)),
                            e(row.note),
                            e(row.change),
                        ])
                )}
            </section>`;
    bindSearch(renderInventory);
    onAction('add-item', () => editItem());
    onAction('edit-item', (id) => editItem(store.data.inventory.find((item) => item.id === id)));
    onAction('move-item', (id) => moveItem(store.data.inventory.find((item) => item.id === id)));
}

function editItem(row = null) {
    const fields = [
        { name: 'name', label: 'Tên mặt hàng', value: row?.name },
        branchField(row?.branch),
        {
            name: 'type',
            label: 'Loại',
            type: 'select',
            value: row?.type || 'Vật tư',
            options: ['Vật tư', 'Phụ kiện'],
        },
        { name: 'unit', label: 'Đơn vị tính', value: row?.unit || 'chiếc' },
        { name: 'minimum', label: 'Định mức cảnh báo', type: 'number', value: row?.minimum ?? 10 },
    ];
    if (!row) fields.push({ name: 'stock', label: 'Tồn đầu kỳ', type: 'number', value: 0 });
    openForm(row ? 'Sửa danh mục' : 'Thêm mặt hàng', fields, (values) => {
        if (row) Object.assign(row, values);
        else store.data.inventory.push({ ...values, id: newId('VT'), damaged: 0 });
        renderInventory();
    });
}

function moveItem(row) {
    if (row.type === 'Phụ kiện') {
        openForm(
            `Kiểm kê ${row.name}`,
            [
                {
                    type: 'note',
                    label: `Hiện có ${row.stock} ${row.unit} sử dụng được và ${row.damaged} hỏng. Nhập lại số lượng kiểm đếm thực tế.`,
                },
                { name: 'stock', label: 'Số lượng sử dụng được', type: 'number', value: row.stock },
                { name: 'damaged', label: 'Số lượng hỏng', type: 'number', value: row.damaged },
                { name: 'note', label: 'Ghi chú kiểm kê / thất thoát', value: '' },
            ],
            (values) => {
                const before = row.stock;
                Object.assign(row, { stock: values.stock, damaged: values.damaged });
                logMovement(
                    row,
                    values.note,
                    `${before} → ${row.stock} ${row.unit}; ${row.damaged} hỏng`
                );
                renderInventory();
            }
        );
    } else {
        openForm(
            `Nhập / xuất ${row.name}`,
            [
                { type: 'note', label: `Số lượng hiện tại: ${row.stock} ${row.unit}.` },
                {
                    name: 'operation',
                    label: 'Nghiệp vụ',
                    type: 'select',
                    value: 'Nhập',
                    options: ['Nhập', 'Xuất'],
                },
                { name: 'quantity', label: 'Số lượng', type: 'number', min: 1, value: 1 },
                { name: 'note', label: 'Lý do nhập / xuất' },
            ],
            (values) => {
                if (values.operation === 'Xuất' && values.quantity > row.stock)
                    throw new Error('Số lượng xuất không được vượt tồn kho.');
                row.stock += values.operation === 'Nhập' ? values.quantity : -values.quantity;
                logMovement(row, values.note, `${values.operation} ${values.quantity} ${row.unit}`);
                renderInventory();
            }
        );
    }
}
function logMovement(row, note, change) {
    store.data.movements.push({
        id: newId('LS'),
        branch: row.branch,
        name: row.name,
        note,
        change,
        time: new Date().toLocaleString('vi-VN'),
    });
}
