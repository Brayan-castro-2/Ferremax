// backend/src/routes/orders.routes.js
// Módulo de pedidos — esqueleto preparado

const express  = require('express')
const router   = express.Router()
const { verifyToken }    = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

/**
 * POST /api/orders
 * Cliente o Vendedor — crea un pedido (dispara crearReserva internamente)
 */
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Cliente', 'Vendedor', 'Administrador'),
  (req, res) => res.json({ mensaje: 'TODO: implementar crearPedido con reserva lógica' })
)

/**
 * GET /api/orders/mis-pedidos
 * Cliente — ve sus propios pedidos
 */
router.get('/mis-pedidos',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Cliente'),
  (req, res) => res.json({ mensaje: 'TODO: obtener pedidos del usuario autenticado' })
)

/**
 * GET /api/orders
 * Vendedor / Admin — ve todos los pedidos
 */
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  (req, res) => res.json({ mensaje: 'TODO: obtener todos los pedidos' })
)

/**
 * PATCH /api/orders/:id/estado
 * Vendedor / Admin — cambia estado del pedido
 */
router.patch('/:id/estado',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  (req, res) => res.json({ mensaje: 'TODO: actualizar estado del pedido' })
)

module.exports = router
