const paymentService = require('../services/payment.service')
const ordersService = require('../services/orders.service')

const createTransaction = async (req, res, next) => {
  try {
    const { buyOrder, sessionId, amount, returnUrl } = req.body
    
    // Validaciones básicas
    if (!buyOrder || !sessionId || !amount || !returnUrl) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos para crear la transacción' })
    }

    const result = await paymentService.initTransaction({ buyOrder, sessionId, amount, returnUrl })
    
    // Se devuelve el token y la url de Transbank para que el frontend arme el form y redirija
    res.json(result)
  } catch (err) {
    next(err)
  }
}

const commitTransaction = async (req, res, next) => {
  const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:5173'
  try {
    const { token_ws } = req.body || req.query

    if (!token_ws) {
      return res.redirect(`${frontendUrl}/checkout?status=failed&error=NoToken`)
    }

    const result = await paymentService.confirmTransaction(token_ws)
    
    // El buyOrder viene como "ORDEN-XYZ" o "XYZ"
    const cleanOrderString = result.buy_order.replace('ORDEN-', '')
    const pedidoId = parseInt(cleanOrderString, 10)

    // Verificar si el pago fue exitoso (código de respuesta 0 es aprobado)
    if (result.status === 'AUTHORIZED' && result.response_code === 0) {
      // 1. Confirmar pedido en base de datos de Supabase
      await ordersService.actualizarEstadoPedido(pedidoId, 'confirmado')

      // 2. Redirigir al frontend a la confirmación de la orden con su ID
      res.redirect(`${frontendUrl}/pedido-confirmacion?id=${pedidoId}`)
    } else {
      // 1. Cancelar el pedido y devolver el stock reservado
      await ordersService.cancelarYRevertirStock(pedidoId)

      // 2. Redirigir al frontend mostrando que falló la transacción
      res.redirect(`${frontendUrl}/checkout?status=failed&error=${result.status || 'Rechazado'}`)
    }
  } catch (err) {
    console.error('Error al confirmar transacción de Transbank:', err)
    res.redirect(`${frontendUrl}/checkout?status=failed&error=Exception`)
  }
}

module.exports = {
  createTransaction,
  commitTransaction
}
