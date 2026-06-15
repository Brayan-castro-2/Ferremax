// backend/src/controllers/pagos.controller.js

const pagosService = require('../services/pagos.service')

const listar = async (req, res, next) => {
  try {
    const pagos = await pagosService.listar({ estado: req.query.estado, metodo: req.query.metodo })
    return res.status(200).json({ total: pagos.length, pagos })
  } catch (err) {
    next(err)
  }
}

const listarPendientes = async (req, res, next) => {
  try {
    const pagos = await pagosService.listar({ estado: 'pendiente' })
    return res.status(200).json({ total: pagos.length, pagos })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const pago = await pagosService.obtenerPorId(id)
    return res.status(200).json(pago)
  } catch (err) {
    next(err)
  }
}

const crear = async (req, res, next) => {
  try {
    const pago = await pagosService.crear(req.body)
    return res.status(201).json({ mensaje: 'Pago registrado en estado pendiente.', pago })
  } catch (err) {
    next(err)
  }
}

const confirmar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const pago = await pagosService.confirmar(id, req.user.id)
    return res.status(200).json({ mensaje: 'Pago confirmado.', pago })
  } catch (err) {
    next(err)
  }
}

const rechazar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const pago = await pagosService.rechazar(id, req.user.id)
    return res.status(200).json({ mensaje: 'Pago rechazado.', pago })
  } catch (err) {
    next(err)
  }
}

module.exports = { listar, listarPendientes, obtener, crear, confirmar, rechazar }
