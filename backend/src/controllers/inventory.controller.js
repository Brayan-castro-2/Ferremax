// backend/src/controllers/inventory.controller.js
// Controlador para el Módulo de Inventario

const inventoryService = require('../services/inventory.service')

/**
 * GET /api/inventory
 * Obtiene todo el stock físico del inventario.
 */
const getInventory = async (req, res, next) => {
  try {
    const data = await inventoryService.getInventory()
    return res.status(200).json({
      totalRegistros: data.length,
      inventario: data
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/inventory/:id
 * Actualiza la cantidad de un producto en el inventario.
 * Body esperado: { "cantidad": 50 }
 */
const updateStock = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { cantidad } = req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser numérico' })
    }

    if (cantidad === undefined || typeof cantidad !== 'number') {
      return res.status(400).json({ error: 'Debes proveer una "cantidad" numérica válida' })
    }

    const actualizado = await inventoryService.updateStock(id, cantidad)
    
    return res.status(200).json({
      mensaje: 'Stock actualizado con éxito',
      registro: actualizado
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { getInventory, updateStock }
