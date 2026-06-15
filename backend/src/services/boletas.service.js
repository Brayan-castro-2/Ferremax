// backend/src/services/boletas.service.js
// Facturación — emisión de boletas por pedido. Vista Vendedor: "Gestionar facturación".

const { supabaseAdmin } = require('../lib/supabase')

const SELECT_BASE = `
  id, pedido_id, numero_boleta, subtotal, descuento, total, fecha_emision, emitida_por,
  pedidos:pedido_id ( id, total, estado, usuario_id, cliente_id, tipo_entrega ),
  emisor:emitida_por ( id, nombre, email )
`

/**
 * Genera el siguiente número correlativo: B-YYYY-NNNNN (8 dígitos).
 */
const _siguienteNumero = async () => {
  const { count, error } = await supabaseAdmin
    .from('boletas')
    .select('id', { count: 'exact', head: true })

  if (error) {
    throw new Error(`Error al contar boletas: ${error.message}`)
  }
  const anio = new Date().getFullYear()
  const consecutivo = String((count || 0) + 1).padStart(8, '0')
  return `B-${anio}-${consecutivo}`
}

/**
 * emitir — crea boleta para un pedido. Calcula subtotal/descuento/total desde detalle_pedido.
 *
 * @param {number} pedidoId
 * @param {string} usuarioId - UUID del Vendedor/Contador/Admin que emite
 */
const emitir = async (pedidoId, usuarioId) => {
  const { data: pedido, error: errPed } = await supabaseAdmin
    .from('pedidos')
    .select(`
      id, estado, total,
      detalle_pedido(cantidad, precio_unitario)
    `)
    .eq('id', pedidoId)
    .maybeSingle()

  if (errPed || !pedido) {
    const err = new Error(`Pedido ${pedidoId} no encontrado.`)
    err.status = 404
    throw err
  }
  if (pedido.estado === 'cancelado') {
    const err = new Error('No se puede emitir boleta de un pedido cancelado.')
    err.status = 409
    throw err
  }

  const subtotal = (pedido.detalle_pedido || []).reduce(
    (acc, d) => acc + Number(d.cantidad) * Number(d.precio_unitario),
    0
  )
  const total = Number(pedido.total)
  const descuento = Math.max(0, subtotal - total)
  const numero = await _siguienteNumero()

  const { data, error } = await supabaseAdmin
    .from('boletas')
    .insert([{
      pedido_id: pedidoId,
      numero_boleta: numero,
      subtotal,
      descuento,
      total,
      emitida_por: usuarioId
    }])
    .select(SELECT_BASE)
    .single()

  if (error) {
    if (error.code === '23505') {
      const err = new Error(`Este pedido ya tiene una boleta emitida.`)
      err.status = 409
      throw err
    }
    const err = new Error(`Error al emitir boleta: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

const obtenerPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('boletas')
    .select(SELECT_BASE)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener boleta: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`Boleta ${id} no encontrada.`)
    err.status = 404
    throw err
  }
  return data
}

const obtenerPorPedido = async (pedidoId) => {
  const { data, error } = await supabaseAdmin
    .from('boletas')
    .select(SELECT_BASE)
    .eq('pedido_id', pedidoId)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener boleta: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`No hay boleta emitida para el pedido ${pedidoId}.`)
    err.status = 404
    throw err
  }
  return data
}

const listar = async () => {
  const { data, error } = await supabaseAdmin
    .from('boletas')
    .select(SELECT_BASE)
    .order('fecha_emision', { ascending: false })

  if (error) {
    const err = new Error(`Error al listar boletas: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

module.exports = { emitir, obtenerPorId, obtenerPorPedido, listar }
