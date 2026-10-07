import { initDialogs } from './shared.js';
import { store } from './admin/store.js';
import { openForm } from './admin/ui.js';
import { renderOverview } from './admin/overview.js';
import { renderMedia, renderEquipment, renderInventory } from './admin/operations.js';
import { renderTeam, renderAccounts } from './admin/people.js';
import { renderReports } from './admin/reports.js';

// The page registry is the only routing switch used by the UI.
const pages = {
    overview: renderOverview,
    media: renderMedia,
    equipment: renderEquipment,
    inventory: renderInventory,
    team: renderTeam,
    reports: renderReports,
    accounts: renderAccounts,
};
const render = pages[store.page] || renderOverview;
const branch = document.querySelector('#branch-filter');
if (!['all', ...Object.keys(store.data.branches)].includes(store.branch)) store.branch = 'all';
branch.value = store.branch;
branch.onchange = () => {
    store.branch = branch.value;
    store.booth = 'all';
    try {
        sessionStorage.setItem('photorain.branch', store.branch);
    } catch {}
    render();
};
document.querySelector('#reset-demo').onclick = () =>
    openForm(
        'Đặt lại dữ liệu mẫu',
        [
            {
                type: 'note',
                label: 'Các thay đổi thử trong khu vực quản lý sẽ được xóa và thay bằng dữ liệu mẫu ban đầu. Ảnh vừa chụp không bị ảnh hưởng.',
            },
        ],
        () => {
            store.reset();
            render();
        },
        'Đặt lại'
    );
const toggle = document.querySelector('#menu-toggle');
toggle.onclick = () => {
    const open = document.querySelector('#sidebar').classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
};
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelector('#sidebar').classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
    }
});
initDialogs();
render();
