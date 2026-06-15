// backend/src/controllers/inventory.controller.js

const inventoryService = require('../services/inventory.service')

const getInventory = async (req, res, next) => {
  try {
    const data = await inventoryService.getInventory()
    return res.status(200).json({ totalRegistros: data.length, inventario: data })
  } catch (err) {
    next(err)
  }
}

const getBySucursal = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El parámetro :id (sucursal) debe ser un número entero positivo.' })
    }
    const data = await inventoryService.getBySucursal(id)
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const getByProducto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El parámetro :id (producto) debe ser un número entero positivo.' })
    }
    const data = await inventoryService.getByProducto(id)
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const updateStock = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    const { cantidad } = req.body

    if (isNaN(id)) {
      return res.status(400).json({ error: 'El ID debe ser numérico.' })
    }
    if (cantidad === undefined || typeof cantidad !== 'number' || cantidad < 0) {
      return res.status(400).json({ error: 'Debes proveer una "cantidad" numérica >= 0.' })
    }

    const actualizado = await inventoryService.updateStock(id, cantidad)
    return res.status(200).json({ mensaje: 'Stock actualizado.', registro: actualizado })
  } catch (err) {
    next(err)
  }
}

const crearRegistro = async (req, res, next) => {
  try {
    const registro = await inventoryService.crearRegistro(req.body)
    return res.status(201).json({ mensaje: 'Registro de inventario creado.', registro })
  } catch (err) {
    next(err)
  }
}

module.exports = { getInventory, getBySucursal, getByProducto, updateStock, crearRegistro }
