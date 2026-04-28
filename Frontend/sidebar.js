// sidebar.js - Genera el sidebar en todas las páginas
function renderSidebar(activePage) {
    const user = checkAuth();
    if (!user) return;

    const pages = [
        { href: 'dashboard.html', icon: 'fa-chart-line', label: 'Dashboard', key: 'dashboard' },
        { href: 'proyectos.html', icon: 'fa-folder', label: 'Proyectos', key: 'proyectos' },
        { href: 'electrico.html', icon: 'fa-bolt', label: 'Eléctrico', key: 'electrico' },
        { href: 'hidraulico.html', icon: 'fa-droplet', label: 'Hidráulico', key: 'hidraulico' },
        { href: 'gas.html', icon: 'fa-wind', label: 'Gas / Aire', key: 'gas' },
        { href: 'hvac.html', icon: 'fa-fan', label: 'HVAC', key: 'hvac' },
        { href: 'incendios.html', icon: 'fa-fire', label: 'Contra Incendios', key: 'incendios' },
        { href: 'cuadro_carga.html', icon: 'fa-table', label: 'Cuadros de Carga', key: 'cuadros' },
        { href: 'cotizacion.html', icon: 'fa-file-invoice-dollar', label: 'Cotizaciones', key: 'cotizacion' },
        { href: 'usuarios.html', icon: 'fa-users', label: 'Usuarios', key: 'usuarios' },
    ];

    const menuHTML = pages.map(p => `
        <a href="${p.href}" class="${p.key === activePage ? 'active' : ''}">
            <i class="fa ${p.icon}"></i>${p.label}
        </a>
    `).join('');

    const initial = (user.nombre || user.username || 'A')[0].toUpperCase();

    return `
    <div class="sidebar">
        <div class="sidebar-top">
            <div class="logo"><span>CUED</span> Solutions</div>
            <div class="menu">${menuHTML}</div>
        </div>
        <div class="sidebar-bottom">
            <div class="user-info">
                <div class="user-avatar">${initial}</div>
                <div>
                    <div class="user-name">${user.nombre || user.username}</div>
                    <div class="user-role">${(user.rol || 'admin').toUpperCase()}</div>
                </div>
            </div>
            <button class="btn-logout" onclick="logout()">
                <i class="fa fa-arrow-right-from-bracket"></i>Salir
            </button>
        </div>
    </div>`;
}