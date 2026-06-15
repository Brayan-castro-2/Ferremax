// backend/src/controllers/sucursales.controller.js

const sucursalesService = require('../services/sucursales.service')

const listar = async (req, res, next) => {
  try {
    const filtros = { activa: req.query.activa, region: req.query.region }
    const sucursales = await sucursalesService.obtenerTodas(filtros)
    return res.status(200).json({ total: sucursales.length, sucursales })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El parámetro :id debe ser un número entero positivo.' })
    }
    const sucursal = await sucursalesService.obtenerPorId(id)
    return res.status(200).json(sucursal)
  } catch (err) {
    next(err)
  }
}

const crear = async (req, res, next) => {
  try {
    const sucursal = await sucursalesService.crear(req.body)
    return res.status(201).json({ mensaje: 'Sucursal creada exitosamente.', sucursal })
  } catch (err) {
    next(err)
  }
}

const actualizar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El parámetro :id debe ser un número entero positivo.' })
    }
    const sucursal = await sucursalesService.actualizar(id, req.body)
    return res.status(200).json({ mensaje: 'Sucursal actualizada.', sucursal })
  } catch (err) {
    next(err)
  }
}

const eliminar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ error: 'El parámetro :id debe ser un número entero positivo.' })
    }
    const resultado = await sucursalesService.eliminar(id)
    return res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, obtener, crear, actualizar, eliminar }
