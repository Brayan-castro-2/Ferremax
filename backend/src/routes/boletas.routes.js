// backend/src/routes/boletas.routes.js
// Facturación — Vista Vendedor: "Gestionar facturación".

const express = require('express')
const router  = express.Router()
const boletasController = require('../controllers/boletas.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// GET /api/boletas — Contador / Admin lista todas
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  boletasController.listar
)

// GET /api/boletas/:id — detalle
router.get('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador', 'Vendedor'),
  boletasController.obtener
)

// GET /api/boletas/pedido/:pedidoId — buscar boleta por pedido
router.get('/pedido/:pedidoId',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador', 'Vendedor'),
  boletasController.obtenerPorPedido
)

// POST /api/boletas — Vendedor / Admin emite boleta para un pedido
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  boletasController.emitir
)

module.exports = router
