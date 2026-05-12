// backend/src/routes/orders.routes.js
// Módulo de pedidos — esqueleto preparado

const express  = require('express')
const router   = express.Router()
const ordersController = require('../controllers/orders.controller')
const { verifyToken }    = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

/**
 * POST /api/orders
 * Cliente o Vendedor — crea un pedido (validación de stock, descuento por volumen)
 */
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Cliente', 'Vendedor', 'Administrador'),
  ordersController.crearPedido
)

/**
 * GET /api/orders/mis-pedidos
 * Cliente — ve sus propios pedidos
 */
router.get('/mis-pedidos',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Cliente'),
  ordersController.listarMisPedidos
)

/**
 * GET /api/orders
 * Vendedor / Admin — ve todos los pedidos
 */
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  ordersController.listarTodos
)

/**
 * PATCH /api/orders/:id/estado
 * Vendedor / Admin — cambia estado del pedido
 */
router.patch('/:id/estado',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  ordersController.cambiarEstado
)

module.exports = router
