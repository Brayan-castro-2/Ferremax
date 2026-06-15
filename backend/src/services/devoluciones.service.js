// backend/src/services/devoluciones.service.js
// Gestión de riesgos — flujo de devoluciones/reembolsos.
// Cliente solicita → Admin/Contador aprueba o rechaza → procesa devolución.

const { supabaseAdmin } = require('../lib/supabase')

const ESTADOS = ['solicitada', 'aprobada', 'rechazada', 'procesada']

const SELECT_BASE = `
  id, pedido_id, motivo, estado, solicitada_por, procesada_por,
  fecha_solicitud, fecha_procesada, notas_internas, monto_devuelto,
  pedidos:pedido_id ( id, total, estado, tipo_entrega, usuario_id )
`

/**
 * Cliente solicita una devolución para un pedido propio.
 * Solo se permite si el pedido NO está cancelado.
 *
 * @param {number} pedidoId
 * @param {string} clienteId - UUID del cliente
 * @param {string} motivo - obligatorio
 */
const solicitar = async (pedidoId, clienteId, motivo) => {
  if (!motivo || typeof motivo !== 'string' || motivo.trim().length < 5) {
    const err = new Error('El motivo debe tener al menos 5 caracteres.')
    err.status = 400
    throw err
  }

  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado, usuario_id, total')
    .eq('id', pedidoId)
    .maybeSingle()

  if (!pedido) {
    const err = new Error(`Pedido ${pedidoId} no encontrado.`)
    err.status = 404
    throw err
  }
  if (pedido.usuario_id !== clienteId) {
    const err = new Error('Solo puedes solicitar devolución de tus propios pedidos.')
    err.status = 403
    throw err
  }
  if (pedido.estado === 'cancelado') {
    const err = new Error('No puedes solicitar devolución de un pedido cancelado.')
    err.status = 409
    throw err
  }

  // Bloquear duplicados — una sola solicitud activa por pedido
  const { data: existente } = await supabaseAdmin
    .from('devoluciones')
    .select('id, estado')
    .eq('pedido_id', pedidoId)
    .in('estado', ['solicitada', 'aprobada'])
    .maybeSingle()

  if (existente) {
    const err = new Error(`Ya existe una solicitud de devolución activa (#${existente.id}) en estado "${existente.estado}".`)
    err.status = 409
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('devoluciones')
    .insert([{
      pedido_id: pedidoId,
      motivo: motivo.trim().slice(0, 1000),
      estado: 'solicitada',
      solicitada_por: clienteId
    }])
    .select(SELECT_BASE)
    .single()

  if (error) {
    const err = new Error(`Error al crear solicitud: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

const listar = async (filtros = {}) => {
  let query = supabaseAdmin
    .from('devoluciones')
    .select(SELECT_BASE)
    .order('fecha_solicitud', { ascending: false })

  if (filtros.estado) {
    if (!ESTADOS.includes(filtros.estado)) {
      const err = new Error(`Estado inválido. Válidos: ${ESTADOS.join(', ')}.`)
      err.status = 400
      throw err
    }
    query = query.eq('estado', filtros.estado)
  }

  const { data, error } = await query
  if (error) {
    const err = new Error(`Error al listar devoluciones: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const obtenerPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('devoluciones')
    .select(SELECT_BASE)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener devolución: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`Devolución ${id} no encontrada.`)
    err.status = 404
    throw err
  }
  return data
}

const obtenerMisDevoluciones = async (clienteId) => {
  const { data, error } = await supabaseAdmin
    .from('devoluciones')
    .select(SELECT_BASE)
    .eq('solicitada_por', clienteId)
    .order('fecha_solicitud', { ascending: false })

  if (error) {
    const err = new Error(`Error al obtener tus devoluciones: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

/**
 * Staff cambia el estado de una devolución.
 *
 * @param {number} id
 * @param {string} nuevoEstado - 'aprobada' | 'rechazada' | 'procesada'
 * @param {string} staffId
 * @param {{ notas_internas?: string, monto_devuelto?: number }} extras
 */
const procesar = async (id, nuevoEstado, staffId, extras = {}) => {
  if (!['aprobada', 'rechazada', 'procesada'].includes(nuevoEstado)) {
    const err = new Error(`Estado inválido. Solo se permite: aprobada, rechazada, procesada.`)
    err.status = 400
    throw err
  }

  const { data: actual } = await supabaseAdmin
    .from('devoluciones')
    .select('id, estado')
    .eq('id', id)
    .maybeSingle()

  if (!actual) {
    const err = new Error(`Devolución ${id} no encontrada.`)
    err.status = 404
    throw err
  }
  if (actual.estado === 'procesada' || actual.estado === 'rechazada') {
    const err = new Error(`La devolución ya está cerrada en estado "${actual.estado}".`)
    err.status = 409
    throw err
  }

  const update = {
    estado: nuevoEstado,
    procesada_por: staffId,
    fecha_procesada: new Date().toISOString()
  }
  if (extras.notas_internas) update.notas_internas = String(extras.notas_internas).slice(0, 1000)
  if (typeof extras.monto_devuelto === 'number' && extras.monto_devuelto >= 0) {
    update.monto_devuelto = extras.monto_devuelto
  }

  const { data, error } = await supabaseAdmin
    .from('devoluciones')
    .update(update)
    .eq('id', id)
    .select(SELECT_BASE)
    .single()

  if (error || !data) {
    const err = new Error(`Error al actualizar devolución: ${error?.message || 'sin datos'}`)
    err.status = 500
    throw err
  }
  return data
}

module.exports = { solicitar, listar, obtenerPorId, obtenerMisDevoluciones, procesar, ESTADOS }
