// backend/src/controllers/orders.controller.js
// Controladores de pedidos

const ordersService = require('../services/orders.service')

/**
 * POST /api/orders
 * Cliente, Vendedor o Administrador — crea pedido con validación de stock y descuento automático.
 */
const crearPedido = async (req, res, next) => {
  try {
    const usuarioId = req.user.id
    const resultado = await ordersService.crearPedidoCompleto(usuarioId, req.body)
    return res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders/mis-pedidos
 * Cliente — lista pedidos del usuario autenticado.
 */
const listarMisPedidos = async (req, res, next) => {
  try {
    const pedidos = await ordersService.obtenerMisPedidos(req.user.id)
    return res.status(200).json({ total: pedidos.length, pedidos })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/orders
 * Vendedor / Administrador — todos los pedidos con datos del cliente.
 */
const listarTodos = async (req, res, next) => {
  try {
    const pedidos = await ordersService.obtenerTodosPedidos()
    return res.status(200).json({ total: pedidos.length, pedidos })
  } catch (err) {
    next(err)
  }
}

/**
 * PATCH /api/orders/:id/estado
 * Body: { estado: string }
 */
const cambiarEstado = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'El parámetro :id debe ser un número entero positivo.',
        code: 'INVALID_ORDER_ID'
      })
    }

    const nuevoEstado = req.body?.estado
    if (typeof nuevoEstado !== 'string' || !nuevoEstado.trim()) {
      return res.status(400).json({
        error: 'Debes enviar body.estado con el nuevo estado del pedido.',
        code: 'MISSING_ESTADO'
      })
    }

    const resultado = await ordersService.actualizarEstadoPedido(id, nuevoEstado.trim())
    return res.status(200).json({
      pedido: resultado.pedido,
      estadoAnterior: resultado.estadoAnterior,
      mensaje: 'Estado actualizado correctamente.'
    })
  } catch (err) {
    next(err)
  }
}

module.exports = {
  crearPedido,
  listarMisPedidos,
  listarTodos,
  cambiarEstado
}
