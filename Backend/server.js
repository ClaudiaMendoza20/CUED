const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

const SUPABASE_URL = 'https://tazheiutbleaexmcsopy.supabase.co/rest/v1';
const SUPABASE_KEY = 'sb_publishable_i5hoZ9cKYlksVhpMcee_-Q_LQes-FOK';

const headers = {
  'Content-Type': 'application/json',
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`
};

// Helper para fetch a Supabase
async function supabase(tabla, options = {}) {
  const { method = 'GET', body, query = '' } = options;
  const res = await fetch(`${SUPABASE_URL}/${tabla}${query}`, {
    method,
    headers: { ...headers, 'Prefer': method === 'POST' ? 'return=representation' : '' },
    body: body ? JSON.stringify(body) : undefined
  });
  return res.json();
}

// LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const data = await supabase('usuarios', { query: `?username=eq.${username}&select=*` });
  if (!data.length) return res.json({ success: false, error: 'Usuario no encontrado' });
  const valid = await bcrypt.compare(password, data[0].password);
  if (!valid) return res.json({ success: false, error: 'Contraseña incorrecta' });
  res.json({ success: true, user: { id: data[0].id, nombre: data[0].nombre, rol: data[0].rol } });
});

// DASHBOARD
app.get('/api/dashboard', async (req, res) => {
  const proyectos = await supabase('proyectos', { query: '?select=count' });
  const calcE = await supabase('calculos_electricos', { query: '?select=count' });
  const cotiz = await supabase('cotizaciones', { query: '?select=count' });
  const recientes = await supabase('proyectos', { query: '?select=nombre,area,progreso&order=created_at.desc&limit=5' });
  res.json({
    proyectos: proyectos[0]?.count || 0,
    calculos: calcE[0]?.count || 0,
    cotizaciones: cotiz[0]?.count || 0,
    alertas: 0,
    recientes
  });
});

// PROYECTOS
app.get('/proyectos', async (req, res) => {
  const data = await supabase('proyectos', { query: '?order=created_at.desc' });
  res.json(data);
});

app.post('/proyectos', async (req, res) => {
  const data = await supabase('proyectos', { method: 'POST', body: req.body });
  res.json(data);
});

// ELÉCTRICO
app.post('/api/electrico', async (req, res) => {
  const data = await supabase('calculos_electricos', { method: 'POST', body: req.body });
  res.json(data);
});

// HIDRÁULICO
app.get('/hidraulico', async (req, res) => {
  const data = await supabase('calculos_hidraulicos', { query: '?order=created_at.desc&limit=10' });
  res.json(data);
});

app.post('/hidraulico', async (req, res) => {
  const data = await supabase('calculos_hidraulicos', { method: 'POST', body: req.body });
  res.json(data);
});

// HVAC
app.get('/hvac', async (req, res) => {
  const data = await supabase('calculos_hvac', { query: '?order=created_at.desc&limit=10' });
  res.json(data);
});

app.post('/hvac', async (req, res) => {
  const data = await supabase('calculos_hvac', { method: 'POST', body: req.body });
  res.json(data);
});

// INCENDIOS
app.post('/api/incendios', async (req, res) => {
  const data = await supabase('calculos_incendios', { method: 'POST', body: req.body });
  res.json(data);
});

// COTIZACIONES
app.post('/api/cotizacion', async (req, res) => {
  const { cliente, proyecto, items } = req.body;
  const total = items.reduce((s, i) => s + i.cant * i.precio, 0);
  const cotiz = await supabase('cotizaciones', { method: 'POST', body: { cliente, referencia: proyecto, total } });
  const cotizId = cotiz[0]?.id;
  if (cotizId && items.length) {
    const itemsData = items.map(i => ({ cotizacion_id: cotizId, descripcion: i.desc, cantidad: i.cant, precio_unitario: i.precio }));
    await supabase('cotizaciones_items', { method: 'POST', body: itemsData });
  }
  res.json({ success: true });
});

app.listen(3000, () => console.log('🚀 Servidor CUED en http://localhost:3000'));