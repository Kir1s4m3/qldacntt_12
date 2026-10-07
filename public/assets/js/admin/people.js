import { store, branchName, newId } from './store.js';
import {
    root,
    e,
    money,
    heading,
    table,
    statusBadge,
    action,
    searchbar,
    bindSearch,
    onAction,
    openForm,
    branchField,
    exportCsv,
} from './ui.js';
const salary = (row) => row.base + row.hours * row.rate + row.bonus;
const roles = ['Chủ cửa hàng', 'Quản lý', 'Nhân viên trực ca', 'Kỹ thuật viên', 'Media'];

export function renderTeam() {
    const payroll = store.tab === 'payroll';
    const rows = store.search(store.rows(payroll ? 'payroll' : 'shifts'));
    root.innerHTML =
        heading(
            'Ca làm & tiền lương',
            'Lịch làm rõ ràng. Giờ công và thu nhập dễ đối chiếu.',
            action(
                payroll ? 'Xuất bảng lương' : 'Xếp ca mới',
                payroll ? 'export-payroll' : 'add-shift'
            )
        ) +
        /* HTML */ `<div class="tabs" role="tablist" aria-label="Ca làm và lương">
                <button
                    role="tab"
                    aria-selected="${!payroll}"
                    class="${!payroll ? 'active' : ''}"
                    data-action="tab-shifts"
                >
                    Lịch làm & chấm công</button
                ><button
                    role="tab"
                    aria-selected="${payroll}"
                    class="${payroll ? 'active' : ''}"
                    data-action="tab-payroll"
                >
                    Bảng lương
                </button>
            </div>
            <section class="panel">
                ${searchbar('Tìm tên nhân viên hoặc ngày…')}${payroll ? payrollTable(rows) : shiftsTable(rows)}
            </section>
            <p class="demo-label">
                ${payroll ? 'Công thức minh họa: lương cứng + giờ công × đơn giá + thưởng KPI. Dữ liệu lương mẫu chưa tự tổng hợp từ chấm công.' : 'Chấm công trong bản UI được nhập thủ công để thử giao diện; backend sẽ ghi nhận thời gian thực khi tích hợp.'}
            </p>`;
    bindSearch(renderTeam);
    onAction('tab-shifts', () => {
        store.tab = 'shifts';
        store.query = '';
        renderTeam();
    });
    onAction('tab-payroll', () => {
        store.tab = 'payroll';
        store.query = '';
        renderTeam();
    });
    onAction('add-shift', () => editShift());
    onAction('edit-shift', (id) => editShift(store.data.shifts.find((row) => row.id === id)));
    onAction('attendance', (id) => attendance(store.data.shifts.find((row) => row.id === id)));
    onAction('edit-payroll', (id) => editPayroll(store.data.payroll.find((row) => row.id === id)));
    onAction('approve-payroll', (id) => {
        const row = store.data.payroll.find((item) => item.id === id);
        openForm(
            'Duyệt phiếu lương',
            [
                {
                    type: 'note',
                    label: `Xác nhận duyệt ${money(salary(row))} cho ${row.name}, kỳ ${row.month}?`,
                },
            ],
            () => {
                row.status = 'Đã duyệt';
                renderTeam();
            },
            'Xác nhận duyệt'
        );
    });
    onAction('export-payroll', () =>
        exportCsv(
            [
                'Nhân viên',
                'Cơ sở',
                'Tháng',
                'Giờ công',
                'Đơn giá',
                'Lương cứng',
                'KPI',
                'Tổng lương',
                'Trạng thái',
            ],
            rows.map((row) => [
                row.name,
                branchName(row.branch),
                row.month,
                row.hours,
                row.rate,
                row.base,
                row.bonus,
                salary(row),
                row.status,
            ]),
            'bang-luong-mau.csv'
        )
    );
}
function shiftsTable(rows) {
    return table(
        ['Nhân viên', 'Cơ sở', 'Ngày / ca làm', 'Vào / ra', 'Giờ công', 'Thao tác'],
        rows.map((row) => {
            const hours =
                row.checkin && row.checkout
                    ? ((minutes(row.checkout) - minutes(row.checkin)) / 60).toFixed(2)
                    : '—';
            return [
                /* HTML */ `<strong>${e(row.name)}</strong>`,
                e(branchName(row.branch)),
                `${e(row.date)}<small>${e(row.start)} – ${e(row.end)}</small>`,
                `${e(row.checkin || '—')} / ${e(row.checkout || '—')}`,
                hours,
                /* HTML */ `<div class="row-actions">
                    ${action('Sửa ca', 'edit-shift', `data-id="${row.id}"`)}${action('Chấm công', 'attendance', `data-id="${row.id}"`)}
                </div>`,
            ];
        })
    );
}
function payrollTable(rows) {
    return table(
        [
            'Nhân viên / kỳ lương',
            'Cơ sở',
            'Giờ công',
            'Lương cứng / đơn giá',
            'KPI',
            'Tổng lương',
            'Trạng thái',
            'Thao tác',
        ],
        rows.map((row) => [
            /* HTML */ `<strong>${e(row.name)}</strong><small>${e(row.month)}</small>`,
            e(branchName(row.branch)),
            row.hours,
            `${money(row.base)}<small>${money(row.rate)} / giờ</small>`,
            money(row.bonus),
            /* HTML */ `<strong>${money(salary(row))}</strong>`,
            statusBadge(row.status),
            row.status === 'Đã duyệt'
                ? '<span class="muted">Đã khóa chỉnh sửa</span>'
                : /* HTML */ `<div class="row-actions">
                      ${action('Sửa', 'edit-payroll', `data-id="${row.id}"`)}${action('Duyệt', 'approve-payroll', `data-id="${row.id}"`)}
                  </div>`,
        ])
    );
}
function minutes(time) {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
}
function editShift(row = null) {
    const employees = [...new Set(store.data.accounts.map((item) => item.name))];
    openForm(
        row ? 'Điều chỉnh ca làm' : 'Xếp ca mới',
        [
            {
                name: 'name',
                label: 'Nhân viên',
                type: 'select',
                value: row?.name,
                options: employees,
            },
            branchField(row?.branch),
            { name: 'date', label: 'Ngày làm', type: 'date', value: row?.date || '2026-10-08' },
            { name: 'start', label: 'Bắt đầu ca', type: 'time', value: row?.start || '08:00' },
            { name: 'end', label: 'Kết thúc ca', type: 'time', value: row?.end || '14:00' },
        ],
        (values) => {
            if (values.end <= values.start)
                throw new Error(
                    'Giờ kết thúc phải sau giờ bắt đầu. Bản mẫu chưa hỗ trợ ca qua đêm.'
                );
            if (
                store.data.shifts.some(
                    (item) =>
                        item.id !== row?.id &&
                        item.name === values.name &&
                        item.date === values.date &&
                        item.start < values.end &&
                        item.end > values.start
                )
            )
                throw new Error('Nhân viên đã có ca trùng thời gian, kể cả tại cơ sở khác.');
            if (row) Object.assign(row, values);
            else store.data.shifts.push({ ...values, id: newId('CA'), checkin: '', checkout: '' });
            renderTeam();
        }
    );
}
function attendance(row) {
    openForm(
        `Chấm công · ${row.name}`,
        [
            {
                type: 'note',
                label: `Ngày ${row.date}, ca ${row.start}–${row.end}. Nhập giờ mẫu để kiểm tra giao diện.`,
            },
            { name: 'checkin', label: 'Giờ vào', type: 'time', value: row.checkin || row.start },
            {
                name: 'checkout',
                label: 'Giờ ra (có thể để trống)',
                type: 'time',
                value: row.checkout,
                optional: true,
            },
        ],
        (values) => {
            if (values.checkout && values.checkout <= values.checkin)
                throw new Error('Giờ ra phải sau giờ vào.');
            Object.assign(row, values);
            renderTeam();
        }
    );
}
function editPayroll(row) {
    if (row.status === 'Đã duyệt') return;
    openForm(
        `Lương tháng ${row.month} · ${row.name}`,
        [
            { name: 'hours', label: 'Giờ công', type: 'number', step: 0.25, value: row.hours },
            { name: 'rate', label: 'Đơn giá theo giờ (VND)', type: 'number', value: row.rate },
            { name: 'base', label: 'Lương cứng (VND)', type: 'number', value: row.base },
            { name: 'bonus', label: 'Thưởng KPI (VND)', type: 'number', value: row.bonus },
        ],
        (values) => {
            Object.assign(row, values);
            renderTeam();
        }
    );
}

export function renderAccounts() {
    const rows = store.search(store.rows('accounts'));
    root.innerHTML =
        heading(
            'Tài khoản & phân quyền',
            'Phân công quyền sử dụng theo vai trò của từng nhân sự.',
            action('Thêm tài khoản', 'add-account')
        ) +
        /* HTML */ `<section class="panel">
                ${searchbar('Tìm tên, email hoặc vai trò…')}${table(
                    ['Nhân sự', 'Email', 'Cơ sở', 'Vai trò', 'Trạng thái', 'Thao tác'],
                    rows.map((row) => [
                        /* HTML */ `<strong>${e(row.name)}</strong><small>${e(row.id)}</small>`,
                        e(row.email),
                        e(branchName(row.branch)),
                        e(row.role),
                        statusBadge(row.status),
                        /* HTML */ `<div class="row-actions">
                            ${action('Sửa quyền', 'edit-account', `data-id="${row.id}"`)}${action(row.status === 'Hoạt động' ? 'Khóa' : 'Mở khóa', 'toggle-account', `data-id="${row.id}"`)}
                        </div>`,
                    ])
                )}
            </section>
            <section class="panel">
                <div class="panel-heading"><h2>Phạm vi quyền dự kiến</h2></div>
                ${table(
                    ['Vai trò', 'Phạm vi công việc'],
                    [
                        [
                            'Chủ cửa hàng',
                            'Theo dõi hai cơ sở, duyệt lương, quản lý tài khoản và quyền.',
                        ],
                        ['Quản lý', 'Vận hành cơ sở, vật tư, xếp ca, kiểm tra công và doanh thu.'],
                        [
                            'Nhân viên trực ca',
                            'Lịch làm, chấm công, lương cá nhân, hỗ trợ khách và chốt ca.',
                        ],
                        ['Kỹ thuật viên', 'Tình trạng thiết bị, giấy mực và xử lý sự cố.'],
                        ['Media', 'Kho tư liệu và ảnh được cấp quyền.'],
                    ]
                )}
            </section>
            <div class="notice">
                Vai trò và khóa tài khoản hiện chỉ thay đổi dữ liệu mẫu. Chưa có đăng nhập, kiểm
                soát quyền hoặc thu hồi phiên truy cập thực tế.
            </div>`;
    bindSearch(renderAccounts);
    onAction('add-account', () => editAccount());
    onAction('edit-account', (id) => editAccount(store.data.accounts.find((row) => row.id === id)));
    onAction('toggle-account', (id) => {
        const row = store.data.accounts.find((item) => item.id === id);
        const locking = row.status === 'Hoạt động';
        openForm(
            locking ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
            [
                {
                    type: 'note',
                    label: `${locking ? 'Khóa' : 'Mở khóa'} tài khoản mẫu của ${row.name}?`,
                },
            ],
            () => {
                row.status = locking ? 'Đã khóa' : 'Hoạt động';
                renderAccounts();
            },
            'Xác nhận'
        );
    });
}
function editAccount(row = null) {
    openForm(
        row ? 'Cập nhật tài khoản và quyền' : 'Thêm tài khoản mẫu',
        [
            { name: 'name', label: 'Họ và tên', value: row?.name },
            { name: 'email', label: 'Email', type: 'email', value: row?.email },
            branchField(row?.branch),
            {
                name: 'role',
                label: 'Vai trò',
                type: 'select',
                value: row?.role || 'Nhân viên trực ca',
                options: roles,
            },
        ],
        (values) => {
            values.email = values.email.toLowerCase();
            if (
                store.data.accounts.some(
                    (item) => item.id !== row?.id && item.email.toLowerCase() === values.email
                )
            )
                throw new Error('Email đã được sử dụng bởi tài khoản khác.');
            if (row) Object.assign(row, values);
            else store.data.accounts.push({ ...values, id: newId('TK'), status: 'Hoạt động' });
            renderAccounts();
        }
    );
}
