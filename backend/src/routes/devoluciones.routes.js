// backend/src/routes/devoluciones.routes.js
// Gestión de riesgos — flujo de devoluciones/reembolsos.

const express = require('express')
const router  = express.Router()
const devolucionesController = require('../controllers/devoluciones.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// POST /api/devoluciones — Cliente solicita devolución (body: { pedido_id, motivo })
router.post('/',
  verifyToken,
  requireRoles('Cliente', 'Administrador'),
  devolucionesController.solicitar
)

// GET /api/devoluciones/mis-devoluciones — Cliente ve las suyas
router.get('/mis-devoluciones',
  verifyToken,
  requireRoles('Cliente'),
  devolucionesController.misDevoluciones
)

// GET /api/devoluciones — Staff lista todas (filtros: ?estado=)
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador', 'Vendedor'),
  devolucionesController.listar
)

// GET /api/devoluciones/:id — detalle
router.get('/:id',
  verifyToken,
  devolucionesController.obtener
)

// PATCH /api/devoluciones/:id/aprobar — Admin/Contador aprueba
router.patch('/:id/aprobar',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  devolucionesController.aprobar
)

// PATCH /api/devoluciones/:id/rechazar — Admin/Contador rechaza
router.patch('/:id/rechazar',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  devolucionesController.rechazar
)

// PATCH /api/devoluciones/:id/procesar — Admin/Contador procesa reembolso
// Body: { monto_devuelto?: number, notas_internas?: string }
router.patch('/:id/procesar',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador'),
  devolucionesController.procesar
)

module.exports = router
