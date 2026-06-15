// backend/src/routes/products.routes.js

const express            = require('express')
const router             = express.Router()
const productsController = require('../controllers/products.controller')
const { verifyToken }    = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// GET /api/products — público
router.get('/', productsController.listarProductos)

// GET /api/products/categorias — público
router.get('/categorias', productsController.listarCategorias)

// GET /api/products/:id — público (ficha técnica con stock_disponible)
router.get('/:id', productsController.obtenerFichaTecnica)

// POST /api/products — Admin / Bodeguero
router.post('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Bodeguero'),
  productsController.crear
)

// PUT /api/products/:id — Admin / Bodeguero (actualización)
router.put('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Bodeguero'),
  productsController.actualizar
)

// DELETE /api/products/:id — Admin (soft delete)
router.delete('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador'),
  productsController.eliminar
)

module.exports = router
