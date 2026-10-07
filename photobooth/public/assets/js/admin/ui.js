import { escapeHtml as e, money, toast } from '../shared.js';
import { store, branchName } from './store.js';
export { e, money, toast };
export const root = document.querySelector('#admin-content');
export const badge = (label, type = '') =>
    /* HTML */ `<span class="badge ${type}">${e(label)}</span>`;
export function statusBadge(label) {
    const success = ['Thành công', 'Sẵn sàng', 'Hoạt động', 'Đã duyệt', 'Đã chốt', 'Hoàn tất'];
    const danger = ['Bảo trì', 'Đã khóa', 'Hỏng'];
    return badge(
        label,
        success.includes(label) ? 'success' : danger.includes(label) ? 'danger' : 'warning'
    );
}
export const action = (label, id, extra = '') =>
    /* HTML */ `<button class="button button-outline button-small" data-action="${e(id)}" ${extra}>
        ${e(label)}
    </button>`;
export function heading(title, description, buttons = '') {
    return /* HTML */ `<div class="page-heading">
        <div>
            <span class="eyebrow">PHOTO RAIN / STUDIO MANAGEMENT</span>
            <h1>${title}</h1>
            <p>${description}</p>
        </div>
        <div class="heading-actions">${buttons}</div>
    </div>`;
}
export function stats(items) {
    return /* HTML */ `<div class="stats-grid">
        ${items.map(([label, value, note]) => /* HTML */ `<div class="stat-card"><span>${e(label)}</span><strong>${e(value)}</strong><small>${e(note)}</small></div>`).join('')}
    </div>`;
}
export function table(headers, rows) {
    return /* HTML */ `<div class="table-scroll">
        <table>
            <thead>
                <tr>
                    ${headers.map((header) => /* HTML */ `<th scope="col">${e(header)}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                ${
                    rows.length
                        ? rows
                              .map(
                                  (cells) =>
                                      /* HTML */ `<tr>
                                          ${cells.map((cell) => /* HTML */ `<td>${cell}</td>`).join('')}
                                      </tr>`
                              )
                              .join('')
                        : /* HTML */ `<tr>
                              <td colspan="${headers.length}">
                                  <div class="empty-state">
                                      Không có dữ liệu phù hợp. Hãy thử điều kiện khác.
                                  </div>
                              </td>
                          </tr>`
                }
            </tbody>
        </table>
    </div>`;
}
export function searchbar(placeholder = 'Tìm kiếm…', extra = '') {
    return /* HTML */ `<div class="table-toolbar">
        <label class="search-input"
            ><span aria-hidden="true">⌕</span
            ><input
                id="table-search"
                type="search"
                value="${e(store.query)}"
                placeholder="${e(placeholder)}"
                aria-label="${e(placeholder)}" /></label
        >${extra}
    </div>`;
}
export function bindSearch(render) {
    const input = root.querySelector('#table-search');
    if (!input) return;
    input.oninput = () => {
        store.query = input.value;
        render();
        const replacement = root.querySelector('#table-search');
        replacement.focus();
    };
}
export function onAction(name, callback) {
    root.querySelectorAll(`[data-action="${name}"]`).forEach(
        (button) => (button.onclick = () => callback(button.dataset.id, button))
    );
}
export const branchField = (value) => ({
    name: 'branch',
    label: 'Cơ sở',
    type: 'select',
    value: value || (store.branch === 'all' ? 'cg' : store.branch),
    options: Object.entries(store.data.branches),
});

// Reusable accessible modal. Page modules supply fields and domain validation.
export function openForm(title, fields, onSubmit, submitLabel = 'Lưu thay đổi') {
    const dialog = document.querySelector('#edit-dialog');
    const form = document.querySelector('#edit-form');
    form.oninput = null;
    document.querySelector('#dialog-title').textContent = title;
    document.querySelector('#form-error').textContent = '';
    document.querySelector('#save-button').textContent = submitLabel;
    document.querySelector('#dialog-fields').innerHTML = fields
        .map((field) => {
            if (field.type === 'note') return /* HTML */ `<p class="notice">${e(field.label)}</p>`;
            const required = field.optional ? '' : 'required';
            let control;
            if (field.type === 'select') {
                control = /* HTML */ `<select name="${field.name}" ${required}>
                    ${field.options
                        .map((option) => {
                            const [value, label] = Array.isArray(option)
                                ? option
                                : [option, option];
                            return /* HTML */ `<option
                                value="${e(value)}"
                                ${String(field.value) === String(value) ? 'selected' : ''}
                            >
                                ${e(label)}
                            </option>`;
                        })
                        .join('')}
                </select>`;
            } else {
                control = /* HTML */ `<input
                    name="${field.name}"
                    type="${field.type || 'text'}"
                    value="${e(field.value ?? '')}"
                    ${required}
                    ${field.type === 'number' ? `min="${field.min ?? 0}" step="${field.step ?? 1}" ${field.max !== undefined ? `max="${field.max}"` : ''}` : 'maxlength="100"'}
                />`;
            }
            return /* HTML */ `<label class="field">${e(field.label)}${control}</label>`;
        })
        .join('');
    form.onsubmit = (event) => {
        event.preventDefault();
        const values = Object.fromEntries(new FormData(form));
        fields.forEach((field) => {
            if (field.type === 'number') values[field.name] = Number(values[field.name]);
            else if (typeof values[field.name] === 'string')
                values[field.name] = values[field.name].trim();
        });
        try {
            if (
                fields.some(
                    (field) => field.type !== 'note' && !field.optional && values[field.name] === ''
                )
            )
                throw new Error('Vui lòng điền đầy đủ thông tin.');
            onSubmit(values);
            store.save();
            dialog.close();
            toast('Đã cập nhật dữ liệu mẫu trong phiên này.');
        } catch (error) {
            document.querySelector('#form-error').textContent = error.message;
        }
    };
    dialog.showModal();
}

export function exportCsv(headers, rows, filename) {
    // Guard against spreadsheet formulas in user-entered text.
    const cell = (value) =>
        '"' +
        (/^[=+@\-\t\r]/.test(String(value)) ? "'" : '') +
        String(value ?? '').replaceAll('"', '""') +
        '"';
    const csv = '\uFEFF' + [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function transactionTable(rows) {
    return table(
        ['Giao dịch', 'Cơ sở / máy chụp', 'Thời gian', 'Số tiền', 'Trạng thái'],
        rows.map((row) => [
            /* HTML */ `<strong>${e(row.id)}</strong>`,
            `${e(branchName(row.branch))}<small>${e(row.booth)}</small>`,
            e(row.time.replace('T', ' · ')),
            /* HTML */ `<strong>${money(row.amount)}</strong>`,
            statusBadge(row.status),
        ])
    );
}
