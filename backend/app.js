// backend/app.js
// Punto de entrada de la aplicación Express — FERREMAS API

const express     = require('express')
const cors        = require('cors')
const rateLimit   = require('express-rate-limit')
require('dotenv').config()

// ── Rutas ─────────────────────────────────────────────────────────────
const authRoutes       = require('./src/routes/auth.routes')
const productRoutes    = require('./src/routes/products.routes')
const currencyRoutes   = require('./src/routes/currency.routes')
const orderRoutes      = require('./src/routes/orders.routes')
const inventoryRoutes  = require('./src/routes/inventory.routes')
const paymentRoutes    = require('./src/routes/payment.routes')
const sucursalesRoutes = require('./src/routes/sucursales.routes')
const clientesRoutes   = require('./src/routes/clientes.routes')
const pagosRoutes      = require('./src/routes/pagos.routes')
const boletasRoutes    = require('./src/routes/boletas.routes')
const reportesRoutes     = require('./src/routes/reportes.routes')
const devolucionesRoutes = require('./src/routes/devoluciones.routes')

const app = express()

// ── Middlewares globales ───────────────────────────────────────────────

// CORS — solo acepta requests del frontend configurado
app.use(cors({
  origin:      process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
}))

// Parseo de JSON
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Rate Limiting — protege la API de abuso (escalabilidad multi-sucursal)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max:      200,             // max 200 requests por IP por ventana
  standardHeaders: true,
  legacyHeaders:   false,
  message: { error: 'Demasiadas solicitudes. Intenta de nuevo en 15 minutos.' }
})
app.use('/api', apiLimiter)

// ── Header informativo (Stateless) ─────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-API-Version', '1.0')
  res.setHeader('X-Powered-By',  'FERREMAS-API')
  next()
})

// ── Health check ───────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'OK',
    service:   'FERREMAS API',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development'
  })
})

// ── Rutas API ──────────────────────────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/products',   productRoutes)
app.use('/api/currency',   currencyRoutes)
app.use('/api/orders',     orderRoutes)
app.use('/api/inventory',  inventoryRoutes)
app.use('/api/payment',    paymentRoutes)
app.use('/api/sucursales', sucursalesRoutes)
app.use('/api/clientes',   clientesRoutes)
app.use('/api/pagos',      pagosRoutes)
app.use('/api/boletas',    boletasRoutes)
app.use('/api/reportes',     reportesRoutes)
app.use('/api/devoluciones', devolucionesRoutes)

// ── 404 handler ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error:   'Ruta no encontrada',
    path:    req.originalUrl,
    method:  req.method
  })
})

// ── Error handler global ───────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[Error] ${req.method} ${req.path}:`, err.message)
  res.status(err.status || 500).json({
    error:   err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

module.exports = app
