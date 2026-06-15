// backend/src/routes/sucursales.routes.js

const express = require('express')
const router  = express.Router()
const sucursalesController = require('../controllers/sucursales.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// GET /api/sucursales — público (para que el catálogo muestre opciones de retiro)
router.get('/', sucursalesController.listar)

// GET /api/sucursales/:id — público
router.get('/:id', sucursalesController.obtener)

// POST /api/sucursales — solo Administrador
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador'),
  sucursalesController.crear
)

// PUT /api/sucursales/:id — solo Administrador (reemplazo completo)
router.put('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador'),
  sucursalesController.actualizar
)

// DELETE /api/sucursales/:id — solo Administrador (soft delete: activa = false)
router.delete('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador'),
  sucursalesController.eliminar
)

module.exports = router
