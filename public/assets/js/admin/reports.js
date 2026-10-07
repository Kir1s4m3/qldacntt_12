import { store, branchName, newId } from './store.js';
import {
    root,
    e,
    money,
    heading,
    stats,
    table,
    statusBadge,
    action,
    transactionTable,
    onAction,
    openForm,
    branchField,
    exportCsv,
} from './ui.js';
function reportRows() {
    return store
        .rows('transactions')
        .filter(
            (row) =>
                row.time.slice(0, 10) >= store.dateFrom &&
                row.time.slice(0, 10) <= store.dateTo &&
                (store.booth === 'all' || row.booth === store.booth)
        );
}
export function renderReports() {
    const rows = reportRows();
    const success = rows.filter((row) => row.status === 'Thành công');
    const amount = success.reduce((sum, row) => sum + row.amount, 0);
    const booths = [...new Set(store.rows('transactions').map((row) => row.booth))];
    root.innerHTML =
        heading(
            'Chốt ca & doanh thu',
            'Đối chiếu giao dịch và theo dõi kết quả theo từng cơ sở, máy chụp.',
            action('Xuất CSV', 'export-report') + action('Chốt ca', 'close-shift')
        ) +
        /* HTML */ `<div class="report-filters">
            <label class="field"
                >Từ ngày<input id="date-from" type="date" value="${store.dateFrom}" /></label
            ><label class="field"
                >Đến ngày<input id="date-to" type="date" value="${store.dateTo}" /></label
            ><label class="field"
                >Máy chụp<select id="booth-filter">
                    <option value="all">Tất cả máy</option>
                    ${booths.map((name) => /* HTML */ `<option ${name === store.booth ? 'selected' : ''}>${e(name)}</option>`).join('')}
                </select></label
            >
        </div>` +
        stats([
            ['Doanh thu', money(amount), 'Chỉ tính giao dịch thành công'],
            [
                'Thanh toán thành công',
                success.length + ' giao dịch',
                'Trong khoảng thời gian đã chọn',
            ],
            [
                'Chưa hoàn tất',
                rows.filter((x) => x.status !== 'Thành công').length + ' giao dịch',
                'Không tính vào doanh thu',
            ],
            [
                'Trung bình / giao dịch',
                money(success.length ? amount / success.length : 0),
                'Doanh thu / số giao dịch thành công',
            ],
        ]) +
        /* HTML */ `<section class="panel">
                <div class="panel-heading">
                    <h2>Chi tiết giao dịch</h2>
                    <span class="badge neutral">${rows.length} giao dịch</span>
                </div>
                ${transactionTable(rows)}
            </section>
            <section class="panel">
                <div class="panel-heading">
                    <h2>Các ca đã chốt</h2>
                    <span class="muted">Lưu trong phiên thử nghiệm</span>
                </div>
                ${table(
                    [
                        'Cơ sở',
                        'Ngày / khoảng giờ',
                        'Giao dịch thành công',
                        'Tổng tiền',
                        'Người chốt',
                        'Trạng thái',
                    ],
                    store
                        .rows('closings')
                        .map((row) => [
                            e(branchName(row.branch)),
                            `${e(row.date)}<small>${e(row.start)} – ${e(row.end)}</small>`,
                            row.count,
                            money(row.amount),
                            e(row.name),
                            statusBadge('Đã chốt'),
                        ])
                )}
            </section>`;
    for (const id of ['date-from', 'date-to'])
        root.querySelector('#' + id).onchange = () => {
            const from = root.querySelector('#date-from').value,
                to = root.querySelector('#date-to').value;
            if (!from || !to || to < from) {
                root.querySelector('#date-to').setCustomValidity(
                    'Ngày kết thúc phải từ ngày bắt đầu trở đi.'
                );
                root.querySelector('#date-to').reportValidity();
                return;
            }
            store.dateFrom = from;
            store.dateTo = to;
            renderReports();
        };
    root.querySelector('#booth-filter').onchange = (event) => {
        store.booth = event.target.value;
        renderReports();
    };
    onAction('export-report', () =>
        exportCsv(
            ['Mã', 'Cơ sở', 'Máy', 'Thời gian', 'Số tiền', 'Trạng thái'],
            rows.map((row) => [
                row.id,
                branchName(row.branch),
                row.booth,
                row.time,
                row.amount,
                row.status,
            ]),
            'doanh-thu-mau.csv'
        )
    );
    onAction('close-shift', closeShift);
}
function closingSummary(values) {
    const rows = store.data.transactions.filter(
        (row) =>
            row.branch === values.branch &&
            row.status === 'Thành công' &&
            row.time >= `${values.date}T${values.start}` &&
            row.time < `${values.date}T${values.end}`
    );
    return { count: rows.length, amount: rows.reduce((sum, row) => sum + row.amount, 0) };
}
function closeShift() {
    openForm(
        'Kiểm tra và xác nhận chốt ca',
        [
            branchField(),
            { name: 'date', label: 'Ngày chốt', type: 'date', value: store.dateFrom },
            { name: 'start', label: 'Bắt đầu ca', type: 'time', value: '14:00' },
            { name: 'end', label: 'Kết thúc ca', type: 'time', value: '22:00' },
            { name: 'name', label: 'Người xác nhận', value: 'Nhân viên trực ca' },
        ],
        (values) => {
            if (values.end <= values.start) throw new Error('Giờ kết thúc phải sau giờ bắt đầu.');
            if (
                store.data.closings.some(
                    (row) =>
                        row.branch === values.branch &&
                        row.date === values.date &&
                        row.start < values.end &&
                        row.end > values.start
                )
            )
                throw new Error('Khoảng thời gian này đã có ca được chốt. Không thể chốt trùng.');
            store.data.closings.push({ ...values, ...closingSummary(values), id: newId('CHOT') });
            renderReports();
        },
        'Xác nhận chốt ca'
    );
    const output = document.createElement('div');
    output.className = 'closing-summary';
    output.setAttribute('role', 'status');
    document.querySelector('#dialog-fields').append(output);
    const form = document.querySelector('#edit-form');
    function update() {
        const values = Object.fromEntries(new FormData(form));
        const summary = closingSummary(values);
        output.innerHTML = /* HTML */ `<span>${summary.count} giao dịch thành công</span
            ><strong>${money(summary.amount)}</strong
            ><small>Khoảng giờ tính từ đầu ca đến trước thời điểm kết thúc ca.</small>`;
    }
    form.oninput = update;
    update();
}
