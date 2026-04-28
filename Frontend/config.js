// =============================================
// CUED SOLUTIONS - Configuración Global
// =============================================

const SUPABASE_URL = 'https://tazheiutbleaexmcsopy.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_i5hoZ9cKYlksVhpMcee_-Q_LQes-FOK';
const API_URL = 'http://localhost:3000';

// Helper para llamadas a Supabase directamente desde el frontend
async function sbFetch(tabla, options = {}) {
    const { method = 'GET', body, query = '' } = options;
    const res = await fetch(`${SUPABASE_URL}/${tabla}${query}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`,
            'Prefer': method === 'POST' ? 'return=representation' : ''
        },
        body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
    }
    return res.json();
}

// Helper para llamadas al backend (con token JWT)
async function apiFetch(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    const { method = 'GET', body } = options;
    const res = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: body ? JSON.stringify(body) : undefined
    });
    return res.json();
}

// Verificar sesión - si no hay login, redirigir
function checkAuth() {
    const user = localStorage.getItem('cued_user');
    if (!user) {
        window.location.href = 'login.html';
        return null;
    }
    return JSON.parse(user);
}

// Logout
function logout() {
    localStorage.removeItem('cued_user');
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}