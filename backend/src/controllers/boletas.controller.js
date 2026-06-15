// backend/src/controllers/boletas.controller.js

const boletasService = require('../services/boletas.service')

const emitir = async (req, res, next) => {
  try {
    const pedidoId = parseInt(req.body.pedido_id, 10)
    if (isNaN(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({ error: 'pedido_id debe ser entero positivo.' })
    }
    const boleta = await boletasService.emitir(pedidoId, req.user.id)
    return res.status(201).json({ mensaje: 'Boleta emitida.', boleta })
  } catch (err) {
    next(err)
  }
}

const listar = async (req, res, next) => {
  try {
    const boletas = await boletasService.listar()
    return res.status(200).json({ total: boletas.length, boletas })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const boleta = await boletasService.obtenerPorId(id)
    return res.status(200).json(boleta)
  } catch (err) {
    next(err)
  }
}

const obtenerPorPedido = async (req, res, next) => {
  try {
    const pedidoId = parseInt(req.params.pedidoId, 10)
    if (isNaN(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({ error: ':pedidoId debe ser entero positivo.' })
    }
    const boleta = await boletasService.obtenerPorPedido(pedidoId)
    return res.status(200).json(boleta)
  } catch (err) {
    next(err)
  }
}

module.exports = { emitir, listar, obtener, obtenerPorPedido }
