// =============================================
// CUED SOLUTIONS - server.js con .env seguro
// =============================================

require('dotenv').config(); // 🔐 Carga las variables del .env

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// 🔐 Variables desde .env (nunca hardcodeadas)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const JWT_SECRET   = process.env.JWT_SECRET;
const PORT         = process.env.PORT || 3000;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Faltan variables de entorno. Revisa tu archivo .env');
  process.exit(1);
}

// =============================================
// HELPER: fetch a Supabase REST API
// =============================================
async function supabase(tabla, options = {}) {
  const { method = 'GET', body, query = '', single = false } = options;

  const res = await fetch(`${SUPABASE_URL}/${tabla}${query}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Prefer': method === 'POST' ? 'return=representation' : (single ? 'return=single' : '')
    },
    body: body ? JSON.stringify(body) : undefined
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Supabase error en ${tabla}:`, err);
    throw new Error(err);
  }

  return res.json();
}

// =============================================
// MIDDLEWARE: verificar JWT
// =============================================
function authMiddleware(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
}

// =============================================
// RUTAS PÚBLICAS
// =============================================

app.get('/', (req, res) => {
  res.json({ status: '🚀 CUED Solutions API funcionando' });
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const data = await supabase('usuarios', {
      query: `?username=eq.${encodeURIComponent(username)}&select=*`
    });

    if (!data.length) {
      return res.json({ success: false, error: 'Usuario no encontrado' });
    }

    const user = data[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.json({ success: false, error: 'Contraseña incorrecta' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, rol: user.rol },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({
      success: true,
      token,
      user: { id: user.id, nombre: user.nombre, rol: user.rol }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Error del servidor' });
  }
});

// =============================================
// RUTAS PROTEGIDAS (requieren token)
// =============================================

// DASHBOARD
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const [proyectos, calcE, cotiz, recientes] = await Promise.all([
      supabase('proyectos', { query: '?select=id' }),
      supabase('calculos_electricos', { query: '?select=id' }),
      supabase('cotizaciones', { query: '?select=id' }),
      supabase('proyectos', { query: '?select=nombre,area,progreso&order=created_at.desc&limit=5' })
    ]);

    res.json({
      proyectos: proyectos.length,
      calculos: calcE.length,
      cotizaciones: cotiz.length,
      alertas: 0,
      recientes
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al cargar dashboard' });
  }
});

// PROYECTOS
app.get('/proyectos', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('proyectos', { query: '?order=created_at.desc' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener proyectos' });
  }
});

app.post('/proyectos', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('proyectos', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar proyecto' });
  }
});

// ELÉCTRICO
app.post('/api/electrico', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_electricos', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar cálculo eléctrico' });
  }
});

app.get('/api/electrico', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_electricos', {
      query: '?order=created_at.desc&limit=20'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cálculos eléctricos' });
  }
});

// HIDRÁULICO
app.get('/hidraulico', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_hidraulicos', {
      query: '?order=created_at.desc&limit=20'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cálculos hidráulicos' });
  }
});

app.post('/hidraulico', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_hidraulicos', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar cálculo hidráulico' });
  }
});

// HVAC
app.get('/hvac', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_hvac', {
      query: '?order=created_at.desc&limit=20'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cálculos HVAC' });
  }
});

app.post('/hvac', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_hvac', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar cálculo HVAC' });
  }
});

// CONTRA INCENDIOS
app.post('/api/incendios', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('calculos_incendios', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar cálculo de incendios' });
  }
});

// CUADROS DE CARGA
app.get('/api/cuadros', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('cuadros_carga', {
      query: '?order=created_at.desc'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cuadros de carga' });
  }
});

app.post('/api/cuadros', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('cuadros_carga', {
      method: 'POST',
      body: { ...req.body, usuario_id: req.user.id }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar cuadro de carga' });
  }
});

// COTIZACIONES
app.post('/api/cotizacion', authMiddleware, async (req, res) => {
  try {
    const { cliente, proyecto, items } = req.body;
    const total = items.reduce((s, i) => s + (i.cant * i.precio), 0);

    // Guardar cotización
    const cotiz = await supabase('cotizaciones', {
      method: 'POST',
      body: { cliente, referencia: proyecto, total, usuario_id: req.user.id }
    });

    const cotizId = cotiz[0]?.id;

    // Guardar items
    if (cotizId && items.length) {
      const itemsData = items.map(i => ({
        cotizacion_id: cotizId,
        descripcion: i.desc,
        cantidad: i.cant,
        precio_unitario: i.precio
      }));

      await supabase('cotizaciones_items', { method: 'POST', body: itemsData });
    }

    res.json({ success: true, id: cotizId });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar cotización' });
  }
});

app.get('/api/cotizaciones', authMiddleware, async (req, res) => {
  try {
    const data = await supabase('cotizaciones', {
      query: '?order=created_at.desc&limit=20'
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener cotizaciones' });
  }
});

// =============================================
// ARRANCAR SERVIDOR
// =============================================
app.listen(PORT, () => {
  console.log(`🚀 CUED Solutions API corriendo en http://localhost:${PORT}`);
  console.log(`📡 Conectado a Supabase: ${SUPABASE_URL}`);
});