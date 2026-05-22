const MODS_DEF = [
    {key:'electrico', icon:'fa-bolt',              label:'Eléctrico',     href:'electrico.html'},
    {key:'caida',     icon:'fa-arrow-trend-down',  label:'Caída Tensión', href:'caida_tension.html'},
    {key:'motores',   icon:'fa-gear',              label:'Motores',       href:'motores.html'},
    {key:'cuadros',   icon:'fa-table',             label:'Cuadros Carga', href:'cuadro_carga.html'},
    {key:'hidraulico',icon:'fa-droplet',           label:'Hidráulico',    href:'hidraulico.html'},
    {key:'cisterna',  icon:'fa-database',          label:'Cisterna',      href:'cisterna.html'},
    {key:'sanitario', icon:'fa-toilet',            label:'Sanitario',     href:'sanitario.html'},
    {key:'pluvial',   icon:'fa-cloud-rain',        label:'Pluvial',       href:'pluvial.html'},
    {key:'gas',       icon:'fa-wind',              label:'Gas / Aire',    href:'gas.html'},
    {key:'gas_lp',    icon:'fa-fire-flame-curved', label:'Gas LP',        href:'gas_lp.html'},
    {key:'hvac',      icon:'fa-fan',               label:'HVAC',          href:'hvac.html'},
    {key:'incendios', icon:'fa-fire',              label:'Incendios',     href:'incendios.html'},
];

async function initSidebar(activePage) {
    const c = document.getElementById('sidebar-container');
    if (!c) return;
    const user = checkAuth(); if (!user) return;

    let extras = [];
    try { extras = await sbFetch('modulos_extra',{query:'?activo=eq.true&order=orden.asc'}); } catch(e){}

    const proy = getProyecto();
    const modsProy = proy ? JSON.parse(proy.modulos||'[]') : [];

    // Banner proyecto activo
    const proyBanner = proy ? `
    <div class="proy-badge">
      <div class="pb-l">Proyecto activo</div>
      <div class="pb-n">${proy.nombre}</div>
      <a href="proyecto_detalle.html" style="font-size:10px;color:rgba(255,196,0,.55);text-decoration:none;margin-top:2px;display:block">Ver módulos →</a>
    </div>` : '';

    // Cálculos del proyecto (si hay uno activo)
    let calcSection = '';
    if (modsProy.length) {
        const items = MODS_DEF.filter(m=>modsProy.includes(m.key));
        calcSection = `
        <div class="sec-lbl">CÁLCULOS</div>
        <div class="menu">
          ${items.map(m=>`<a href="${m.href}" class="${activePage===m.key?'active':''}">
            <i class="fa ${m.icon}"></i>${m.label}
          </a>`).join('')}
          <a href="cotizacion.html" class="${activePage==='cotizacion'?'active':''}">
            <i class="fa fa-file-invoice-dollar"></i>Cotización / PDF
          </a>
        </div>`;
    }

    // Extras del admin
    const extItems = extras.map(e=>`<a href="${e.url||'#'}" class="${activePage==='ext_'+e.id?'active':''}">
      <i class="fa ${e.icono||'fa-calculator'}"></i>${e.nombre}
      <span style="margin-left:auto;font-size:8px;padding:1px 5px;background:var(--gold);color:var(--dark);border-radius:99px;font-weight:700">NUEVO</span>
    </a>`).join('');

    const adminSection = user.rol==='admin' ? `
    <div class="sec-lbl">ADMINISTRACIÓN</div>
    <div class="menu">
      <a href="admin.html" class="${activePage==='admin'?'active':''}">
        <i class="fa fa-shield-halved"></i>Panel Admin
      </a>
      ${extItems}
    </div>` : '';

    const ini = (user.nombre||user.username||'A')[0].toUpperCase();
    c.innerHTML = `<div class="sidebar">
      <div class="logo">
        <i class="fa fa-bolt" style="color:var(--gold)"></i>
        <div><span>CUED</span> Solutions<small>Engineering</small></div>
      </div>
      <div class="menu-wrap">
        ${proyBanner}
        <div class="sec-lbl">GESTIÓN</div>
        <div class="menu">
          <a href="proyectos.html" class="${activePage==='proyectos'?'active':''}">
            <i class="fa fa-folder-open"></i>Proyectos
          </a>
          ${proy?`<a href="proyecto_detalle.html" class="${activePage==='detalle'?'active':''}">
            <i class="fa fa-layer-group"></i>Módulos del Proyecto
          </a>`:''}
        </div>
        ${calcSection}
        ${adminSection}
      </div>
      <div class="sidebar-bottom">
        <div class="u-box">
          <div class="u-av">${ini}</div>
          <div>
            <div class="u-name">${user.nombre||user.username}</div>
            <div class="u-role">${(user.rol||'tecnico').toUpperCase()}</div>
          </div>
        </div>
        <a href="proyectos.html" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background:rgba(0,212,255,.08);border:1px solid rgba(0,212,255,.18);border-radius:7px;color:var(--blue);font-size:12px;text-decoration:none;margin-bottom:7px;transition:all .2s;font-family:Inter,sans-serif;">
          <i class="fa fa-house"></i>Menú principal
        </a>
        <button class="btn-out" onclick="logout()">
          <i class="fa fa-arrow-right-from-bracket"></i>Cerrar sesión
        </button>
      </div>
    </div>`;
}