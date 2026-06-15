// backend/src/routes/inventory.routes.js
// Inventario por sucursal — soporta el caso de uso del profe:
// "¿qué stock tiene la sucursal X?" / "¿en qué sucursales hay producto Y?"

const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventory.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// GET /api/inventory — todo el stock (público para testeo, ideal: restringir a staff)
router.get('/', inventoryController.getInventory)

// GET /api/inventory/sucursal/:id — stock completo de una sucursal específica
router.get('/sucursal/:id', inventoryController.getBySucursal)

// GET /api/inventory/producto/:id — en qué sucursales hay un producto y cuánto
router.get('/producto/:id', inventoryController.getByProducto)

// POST /api/inventory — alta de nuevo registro (Bodeguero / Admin)
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Bodeguero'),
  inventoryController.crearRegistro
)

// PATCH /api/inventory/:id — actualizar cantidad
router.patch('/:id', inventoryController.updateStock)

module.exports = router
