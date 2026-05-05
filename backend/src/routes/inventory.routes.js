// backend/src/routes/inventory.routes.js
// Rutas básicas del Módulo de Inventario (Sin roles por ahora para Test en Postman)

const express = require('express')
const router = express.Router()
const inventoryController = require('../controllers/inventory.controller')

/**
 * GET /api/inventory
 * Obtiene todo el stock físico (Público para testeo)
 */
router.get('/', inventoryController.getInventory)

/**
 * PATCH /api/inventory/:id
 * Actualiza la cantidad de un producto en el inventario (Público para testeo)
 */
router.patch('/:id', inventoryController.updateStock)

module.exports = router
