// backend/src/routes/reportes.routes.js
// Vista Administrador y Contador — informes de ventas y desempeño.

const express = require('express')
const router  = express.Router()
const reportesController = require('../controllers/reportes.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// Todos los reportes requieren Admin o Contador
const adminOContador = [
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Contador')
]

// GET /api/reportes/ventas-mes?anio=2026&mes=6
router.get('/ventas-mes', ...adminOContador, reportesController.ventasMes)

// GET /api/reportes/ventas-por-sucursal
router.get('/ventas-por-sucursal', ...adminOContador, reportesController.ventasPorSucursal)

// GET /api/reportes/productos-mas-vendidos?limite=10
router.get('/productos-mas-vendidos', ...adminOContador, reportesController.productosMasVendidos)

// GET /api/reportes/stock-bajo?umbral=5
router.get('/stock-bajo', ...adminOContador, reportesController.stockBajo)

module.exports = router
