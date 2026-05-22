const SB_URL = 'https://tazheiutbleaexmcsopy.supabase.co/rest/v1';
const SB_KEY = 'sb_publishable_i5hoZ9cKYlksVhpMcee_-Q_LQes-FOK';
const SB_H   = { 'Content-Type':'application/json','apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY };

async function sbFetch(tabla, opts={}) {
    const { method='GET', body, query='' } = opts;
    const r = await fetch(`${SB_URL}/${tabla}${query}`, {
        method,
        headers: { ...SB_H, 'Prefer': method==='POST'?'return=representation':'' },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) { const e=await r.text(); throw new Error(e); }
    return r.json();
}
async function sbDel(tabla, query) {
    const r = await fetch(`${SB_URL}/${tabla}${query}`, { method:'DELETE', headers:SB_H });
    if (!r.ok) { const e=await r.text(); throw new Error(e); }
}
async function sbPatch(tabla, query, body) {
    const r = await fetch(`${SB_URL}/${tabla}${query}`, {
        method:'PATCH', headers:SB_H, body:JSON.stringify(body)
    });
    if (!r.ok) { const e=await r.text(); throw new Error(e); }
}

function checkAuth() {
    const u = localStorage.getItem('cued_user');
    if (!u) { window.location.href='login.html'; return null; }
    return JSON.parse(u);
}
function logout() {
    localStorage.removeItem('cued_user');
    sessionStorage.removeItem('proy_activo');
    window.location.href = 'login.html';
}
function toast(msg, tipo='ok') {
    document.querySelector('.toast-n')?.remove();
    const el = document.createElement('div');
    el.className = `toast-n ${tipo}`;
    el.innerHTML = `<i class="fa fa-${tipo==='ok'?'circle-check':'circle-xmark'}"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(()=>{ el.style.opacity='0'; el.style.transition='.3s'; setTimeout(()=>el.remove(),300); }, 2600);
}
function confirmar(msg) { return confirm(msg); }
function getProyecto()  { const p=sessionStorage.getItem('proy_activo'); return p?JSON.parse(p):null; }
function setProyecto(p) { sessionStorage.setItem('proy_activo', JSON.stringify(p)); }

// Helper: muestra/oculta alerta inline
function showA(id) {
    const el = document.getElementById(id); if(!el) return;
    el.style.display='block';
    setTimeout(()=>el.style.display='none', 3200);
}
