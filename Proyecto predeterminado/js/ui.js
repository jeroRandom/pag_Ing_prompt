// FoodControl - Iconos y utilidades de interfaz
// Los iconos son SVG en línea para que funcionen incluso sin conexión.

const FOODCONTROL_ICONS = {
    logo: '<path d="M7 3v7a2 2 0 0 0 2 2h0V3M9 3v9M5 3v5a2 2 0 0 0 2 2M12 3h3a3 3 0 0 1 0 6h-1v12" />',
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9 21v-6h6v6"/>',
    menu: '<path d="M4 3v7a2 2 0 0 0 4 0V3M6 3v18"/><path d="M14 3v18M14 3a4 4 0 0 1 0 8h-1v10"/>',
    orders: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2.8h6V4"/><path d="M9 9h6M9 13h6M9 17h3"/>',
    tables: '<path d="M3 10h18M5 10V5h14v5M12 10v11M7 21h10"/>',
    sales: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
    money: '<circle cx="12" cy="12" r="9"/><path d="M12 7v10M15 9.5c-.6-.9-1.6-1.5-3-1.5-1.6 0-2.8.8-2.8 2s1 1.8 2.8 2.1c1.8.3 3 1 3 2.2 0 1.2-1.2 2-3 2-1.4 0-2.5-.6-3.1-1.5"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="M4 20h4l10-10-4-4L4 16v4Z"/><path d="M13.5 5.5l4 4"/>',
    trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6M14 11v6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    logout: '<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4"/><path d="M10 8l-4 4 4 4M6 12h10"/>',
    check: '<path d="M4 12l5 5L20 6"/>',
    alert: '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 9v5M12 17.5v.5"/>',
    box: '<path d="M3 7l9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    arrow: '<path d="M5 12h14M15 8l4 4-4 4"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    bars: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    cart: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>'
};

function renderFoodControlIcons() {
    document.querySelectorAll('[data-icon]').forEach(function(el) {
        const name = el.getAttribute('data-icon');
        const icon = FOODCONTROL_ICONS[name];
        if (!icon) return;
        el.innerHTML = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icon + '</svg>';
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    sidebar.classList.toggle('active');
    if (overlay) overlay.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
}

document.addEventListener('DOMContentLoaded', function() {
    renderFoodControlIcons();

    // Cerrar el menú móvil después de navegar
    document.querySelectorAll('.sidebar .nav-item').forEach(function(link) {
        link.addEventListener('click', closeSidebar);
    });
});
