import { store, branchName } from './store.js';
import { root, e, money, heading, stats, statusBadge, transactionTable } from './ui.js';
export function renderOverview() {
    const rows = store.rows('transactions').filter((row) => row.time.startsWith('2026-10-07'));
    const paid = rows.filter((row) => row.status === 'Thành công');
    const total = paid.reduce((sum, row) => sum + row.amount, 0);
    const machines = store.rows('equipment');
    const low = store.rows('inventory').filter((row) => row.stock <= row.minimum);
    const hours = [8, 10, 12, 14, 16, 18, 20];
    const buckets = hours.map((hour) =>
        paid
            .filter((row) => {
                const h = Number(row.time.slice(11, 13));
                return h >= hour && h < hour + 2;
            })
            .reduce((sum, row) => sum + row.amount, 0)
    );
    const max = Math.max(...buckets, 1);
    root.innerHTML =
        heading(
            'Một ngày mới, những khoảnh khắc mới.',
            'Tổng quan hoạt động hai cơ sở · dữ liệu mẫu ngày 07/10/2026',
            /* HTML */ `<a class="button button-outline" href="admin.php?page=reports"
                >Xem báo cáo</a
            >`
        ) +
        stats([
            ['Doanh thu', money(total), 'Giao dịch thanh toán thành công'],
            ['Lượt thanh toán', paid.length + ' lượt', 'Ngày 07/10/2026'],
            [
                'Máy đang vận hành',
                `${machines.filter((row) => row.status !== 'Bảo trì').length} / ${machines.length}`,
                'Sẵn sàng hoặc đang chụp',
            ],
            ['Cần bổ sung vật tư', low.length + ' mặt hàng', 'Theo định mức của từng cơ sở'],
        ]) +
        /* HTML */ `<div class="dashboard-grid">
                <section class="panel">
                    <div class="panel-heading">
                        <div>
                            <h2>Nhịp chụp trong ngày</h2>
                            <p>Doanh thu theo khung giờ</p>
                        </div>
                        <span class="badge neutral">07 tháng 10</span>
                    </div>
                    <div
                        class="chart-bars"
                        role="img"
                        aria-label="Doanh thu theo từng khung 2 giờ ngày 7 tháng 10"
                    >
                        ${buckets
                            .map(
                                (amount, i) =>
                                    /* HTML */ `<div class="chart-column">
                                        <span>${amount ? amount / 1000 + 'k' : '0'}</span>
                                        <div
                                            class="chart-bar"
                                            style="height:${Math.max((amount / max) * 155, 3)}px"
                                            title="${hours[i]}h: ${money(amount)}"
                                        ></div>
                                        <small>${hours[i]}:00</small>
                                    </div>`
                            )
                            .join('')}
                    </div>
                    <div class="chart-legend"><span></span> Doanh thu thành công · VND</div>
                </section>
                <section class="panel">
                    <div class="panel-heading">
                        <h2>Cần chú ý</h2>
                        <span class="badge warning"
                            >${low.length + machines.filter((x) => x.status === 'Bảo trì').length}
                            mục</span
                        >
                    </div>
                    <div class="attention-list">
                        ${machines
                            .filter((x) => x.status === 'Bảo trì')
                            .map(
                                (row) =>
                                    /* HTML */ `<a href="admin.php?page=equipment"
                                        ><span class="attention-symbol danger">!</span>
                                        <div>
                                            <strong>${e(row.name)} đang bảo trì</strong
                                            ><small
                                                >${e(branchName(row.branch))} · Kiểm tra trước khi
                                                mở lượt</small
                                            >
                                        </div></a
                                    >`
                            )
                            .join('')}${low
                            .map(
                                (row) =>
                                    /* HTML */ `<a href="admin.php?page=inventory"
                                        ><span class="attention-symbol">!</span>
                                        <div>
                                            <strong>${e(row.name)} sắp hết</strong
                                            ><small
                                                >${e(branchName(row.branch))} · Còn ${row.stock}
                                                ${e(row.unit)}</small
                                            >
                                        </div></a
                                    >`
                            )
                            .join(
                                ''
                            )}${!low.length && !machines.some((x) => x.status === 'Bảo trì') ? '<p class="empty-state">Không có cảnh báo.</p>' : ''}
                    </div>
                </section>
            </div>
            <section class="panel">
                <div class="panel-heading">
                    <h2>Giao dịch gần đây</h2>
                    <a class="text-link" href="admin.php?page=reports">Xem tất cả</a>
                </div>
                ${transactionTable(rows.slice(0, 5))}
            </section>
            <div class="section-heading">
                <h2>Không gian đang vận hành</h2>
                <a class="text-link" href="admin.php?page=equipment">Quản lý máy chụp</a>
            </div>
            <div class="booth-grid">
                ${machines
                    .map(
                        (row) =>
                            /* HTML */ `<div class="booth-card">
                                <div class="booth-number">${e(row.id)}</div>
                                <div>
                                    <strong>${e(row.name)}</strong
                                    ><small>${e(branchName(row.branch))} · ${e(row.concept)}</small>
                                </div>
                                ${statusBadge(row.status)}
                            </div>`
                    )
                    .join('')}
            </div>`;
}
