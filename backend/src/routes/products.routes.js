// backend/src/routes/products.routes.js

const express            = require('express')
const router             = express.Router()
const productsController = require('../controllers/products.controller')
const { verifyToken }    = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

/**
 * GET /api/products
 * Público — cualquiera puede ver el catálogo
 */
router.get('/', productsController.listarProductos)

/**
 * GET /api/products/categorias
 * Público — lista categorías para filtros
 */
router.get('/categorias', productsController.listarCategorias)

/**
 * GET /api/products/:id
 * Público — ficha técnica de un producto con stock_disponible
 */
router.get('/:id', productsController.obtenerFichaTecnica)

// ── Rutas protegidas (ejemplo para operaciones de staff) ──

/**
 * PATCH /api/products/:id/stock
 * Solo Bodeguero o Administrador puede actualizar stock
 * Requiere contraseña no-default (requirePasswordChanged)
 */
// router.patch('/:id/stock',
//   verifyToken,
//   requirePasswordChanged,
//   requireRoles('Administrador', 'Bodeguero'),
//   productsController.actualizarStock
// )

module.exports = router
