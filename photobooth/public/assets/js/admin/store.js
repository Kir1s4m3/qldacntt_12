// A single replaceable data layer. Only this module reads browser storage.
const initial = JSON.parse(document.querySelector('#admin-data').textContent);
const KEY = 'photorain.admin.v1';
let data = structuredClone(initial.data);
try {
    const saved = JSON.parse(sessionStorage.getItem(KEY));
    if (saved && Object.keys(data).every((key) => key in saved)) data = saved;
} catch {
    /* A new session starts from the PHP fixtures. */
}
// Đồng bộ tên thiết bị trong phiên cũ, giữ nguyên các thay đổi dữ liệu của người dùng.
for (const collection of ['equipment', 'transactions']) {
    const field = collection === 'equipment' ? 'name' : 'booth';
    for (const row of data[collection]) {
        if (typeof row[field] === 'string') {
            row[field] = row[field].replace(/^Bốt(?=\s+\d)/i, 'Máy chụp');
        }
    }
}

export const store = {
    page: initial.page,
    data,
    branch: sessionStorage.getItem('photorain.branch') || 'all',
    query: '',
    tab: 'shifts',
    dateFrom: '2026-10-07',
    dateTo: '2026-10-07',
    booth: 'all',
    rows(collection) {
        return this.data[collection].filter(
            (row) => this.branch === 'all' || row.branch === this.branch
        );
    },
    search(rows) {
        const query = this.query.trim().toLocaleLowerCase('vi');
        return rows.filter((row) =>
            Object.values(row).join(' ').toLocaleLowerCase('vi').includes(query)
        );
    },
    save() {
        try {
            sessionStorage.setItem(KEY, JSON.stringify(this.data));
        } catch {
            throw new Error('Không thể lưu phiên thử nghiệm. Bộ nhớ trình duyệt đã đầy.');
        }
    },
    reset() {
        this.data = structuredClone(initial.data);
        this.save();
    },
};
export const branchName = (id) => store.data.branches[id] || id;
export function newId(prefix) {
    return prefix + Date.now().toString(36).toUpperCase();
}
export function successfulTransactions() {
    return store.rows('transactions').filter((row) => row.status === 'Thành công');
}
