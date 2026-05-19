// sidebar.js — Genera el sidebar en todas las páginas
function renderSidebar(activePage) {
    const user = checkAuth();
    if (!user) return '';

    const pages = [
        { href: 'dashboard.html',    icon: 'fa-chart-line',         label: 'Dashboard',         key: 'dashboard' },
        { href: 'proyectos.html',    icon: 'fa-folder',             label: 'Proyectos',          key: 'proyectos' },
        { separator: 'ELÉCTRICO' },
        { href: 'electrico.html',    icon: 'fa-bolt',               label: 'Cálculo Eléctrico', key: 'electrico' },
        { href: 'caida_tension.html',icon: 'fa-arrow-trend-down',   label: 'Caída de Tensión',  key: 'caida' },
        { href: 'motores.html',      icon: 'fa-gear',               label: 'Motores Trifásicos',key: 'motores' },
        { href: 'cuadro_carga.html', icon: 'fa-table',              label: 'Cuadros de Carga',  key: 'cuadros' },
        { separator: 'HIDRÁULICO' },
        { href: 'hidraulico.html',   icon: 'fa-droplet',            label: 'Hidráulico',        key: 'hidraulico' },
        { href: 'cisterna.html',     icon: 'fa-database',           label: 'Cisterna',          key: 'cisterna' },
        { href: 'sanitario.html',    icon: 'fa-toilet',             label: 'Sanitario / UM',    key: 'sanitario' },
        { href: 'pluvial.html',      icon: 'fa-cloud-rain',         label: 'Pluvial',           key: 'pluvial' },
        { separator: 'GAS' },
        { href: 'gas.html',          icon: 'fa-wind',               label: 'Gas / Aire',        key: 'gas' },
        { href: 'gas_lp.html',       icon: 'fa-fire-flame-curved',  label: 'Gas LP Completo',   key: 'gas_lp' },
        { separator: 'INSTALACIONES' },
        { href: 'hvac.html',         icon: 'fa-fan',                label: 'HVAC',              key: 'hvac' },
        { href: 'incendios.html',    icon: 'fa-fire',               label: 'Contra Incendios',  key: 'incendios' },
        { separator: 'GESTIÓN' },
        { href: 'cotizacion.html',   icon: 'fa-file-invoice-dollar',label: 'Cotizaciones',      key: 'cotizacion' },
        { href: 'usuarios.html',     icon: 'fa-users',              label: 'Usuarios',          key: 'usuarios' },
    ];

    const menuHTML = pages.map(p => {
        if (p.separator) {
            return `<div style="font-size:9px;letter-spacing:1.5px;color:rgba(255,255,255,0.18);
                    padding:12px 14px 4px;margin-top:6px;text-transform:uppercase;
                    border-top:1px solid rgba(255,255,255,0.04)">${p.separator}</div>`;
        }
        const isActive = p.key === activePage;
        return `<a href="${p.href}" class="${isActive ? 'active' : ''}">
                    <i class="fa ${p.icon}"></i>${p.label}
                </a>`;
    }).join('');

    const initial = (user.nombre || user.username || 'A')[0].toUpperCase();

    return `
    <div class="sidebar">
        <div class="sidebar-top">
            <div class="logo"><span>CUED</span> Solutions</div>
            <div class="menu" style="overflow-y:auto;max-height:calc(100vh - 170px);
                scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent">
                ${menuHTML}
            </div>
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