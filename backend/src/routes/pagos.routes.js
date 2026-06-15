// backend/src/routes/pagos.routes.js
// Gestión de registros de pago. Flujo Vista Contador del caso FERREMAS.

const express = require('express')
const router  = express.Router()
const pagosController = require('../controllers/pagos.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// GET /api/pagos — Contador / Admin lista todos (filtros ?estado=&metodo=)
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  pagosController.listar
)

// GET /api/pagos/pendientes — Contador ve los pagos por confirmar
router.get('/pendientes',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  pagosController.listarPendientes
)

// GET /api/pagos/:id — detalle
router.get('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador', 'Vendedor'),
  pagosController.obtener
)

// POST /api/pagos — Vendedor registra un pago para un pedido
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  pagosController.crear
)

// PATCH /api/pagos/:id/confirmar — Contador confirma transferencia ★ caso profe
router.patch('/:id/confirmar',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  pagosController.confirmar
)

// PATCH /api/pagos/:id/rechazar — Contador rechaza pago
router.patch('/:id/rechazar',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  pagosController.rechazar
)

module.exports = router
