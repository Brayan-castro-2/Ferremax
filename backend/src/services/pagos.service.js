// backend/src/services/pagos.service.js
// Gestión de filas en `pagos` — flujo Vendedor crea, Contador confirma/rechaza.
// (Distinto de payment.service.js que es solo el wrapper de Transbank Webpay.)

const { supabaseAdmin } = require('../lib/supabase')

const METODOS = ['tarjeta', 'transferencia', 'efectivo', 'webpay']
const ESTADOS = ['pendiente', 'confirmado', 'rechazado']

const SELECT_BASE = `
  id, pedido_id, metodo, estado, fecha, confirmado_por, fecha_confirmacion,
  pedidos:pedido_id ( id, total, estado, usuario_id, cliente_id, tipo_entrega ),
  confirmador:confirmado_por ( id, nombre, email )
`

const crear = async (payload) => {
  const { pedido_id, metodo } = payload

  if (!pedido_id || !metodo) {
    const err = new Error('pedido_id y metodo son obligatorios.')
    err.status = 400
    throw err
  }
  if (!METODOS.includes(metodo)) {
    const err = new Error(`metodo inválido. Válidos: ${METODOS.join(', ')}.`)
    err.status = 400
    throw err
  }

  // Verifica que el pedido exista
  const { data: pedido, error: errPed } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado')
    .eq('id', pedido_id)
    .maybeSingle()

  if (errPed || !pedido) {
    const err = new Error(`Pedido ${pedido_id} no encontrado.`)
    err.status = 404
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .insert([{ pedido_id, metodo, estado: 'pendiente' }])
    .select(SELECT_BASE)
    .single()

  if (error) {
    if (error.code === '23505') {
      const err = new Error(`El pedido ${pedido_id} ya tiene un pago registrado.`)
      err.status = 409
      throw err
    }
    const err = new Error(`Error al crear pago: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

const listar = async (filtros = {}) => {
  let query = supabaseAdmin
    .from('pagos')
    .select(SELECT_BASE)
    .order('fecha', { ascending: false })

  if (filtros.estado) {
    if (!ESTADOS.includes(filtros.estado)) {
      const err = new Error(`estado inválido. Válidos: ${ESTADOS.join(', ')}.`)
      err.status = 400
      throw err
    }
    query = query.eq('estado', filtros.estado)
  }
  if (filtros.metodo) query = query.eq('metodo', filtros.metodo)

  const { data, error } = await query
  if (error) {
    const err = new Error(`Error al listar pagos: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const obtenerPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('pagos')
    .select(SELECT_BASE)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener pago: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`Pago ${id} no encontrado.`)
    err.status = 404
    throw err
  }
  return data
}

const _cambiarEstado = async (id, nuevoEstado, contadorId) => {
  if (!ESTADOS.includes(nuevoEstado)) {
    const err = new Error(`estado inválido.`)
    err.status = 400
    throw err
  }

  const { data: actual } = await supabaseAdmin
    .from('pagos')
    .select('id, estado')
    .eq('id', id)
    .maybeSingle()

  if (!actual) {
    const err = new Error(`Pago ${id} no encontrado.`)
    err.status = 404
    throw err
  }
  if (actual.estado !== 'pendiente') {
    const err = new Error(`El pago ya está "${actual.estado}". Solo se pueden modificar pagos pendientes.`)
    err.status = 409
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('pagos')
    .update({
      estado: nuevoEstado,
      confirmado_por: contadorId,
      fecha_confirmacion: new Date().toISOString()
    })
    .eq('id', id)
    .select(SELECT_BASE)
    .single()

  if (error || !data) {
    const err = new Error(`Error al actualizar pago: ${error?.message || 'sin datos'}`)
    err.status = 500
    throw err
  }
  return data
}

const confirmar = (id, contadorId) => _cambiarEstado(id, 'confirmado', contadorId)
const rechazar = (id, contadorId) => _cambiarEstado(id, 'rechazado', contadorId)

module.exports = {
  crear,
  listar,
  obtenerPorId,
  confirmar,
  rechazar,
  METODOS,
  ESTADOS
}
