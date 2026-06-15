// backend/src/services/orders.service.js
// Pedidos — operaciones con Supabase (service role)

const { supabaseAdmin } = require('../lib/supabase')

const TIPOS_ENTREGA = ['retiro', 'despacho']
const ESTADOS_PEDIDO = [
  'pendiente',
  'confirmado',
  'en_proceso',
  'enviado',
  'entregado',
  'cancelado'
]

const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100

/**
 * Suma reservas activas vigentes por producto_id.
 * @param {number[]} productoIds
 * @returns {Promise<Map<number, number>>}
 */
const mapReservasActivasPorProducto = async (productoIds) => {
  const mapa = new Map()
  if (!productoIds.length) return mapa

  const ahora = new Date().toISOString()
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .select('producto_id, cantidad')
    .in('producto_id', productoIds)
    .eq('estado', 'activa')
    .gt('expira_en', ahora)

  if (error) {
    const err = new Error(`Error al consultar reservas: ${error.message}`)
    err.status = 500
    throw err
  }

  for (const r of data || []) {
    mapa.set(r.producto_id, (mapa.get(r.producto_id) || 0) + r.cantidad)
  }
  return mapa
}

/**
 * Valida y normaliza líneas del pedido.
 * @param {Array} items
 * @returns {{ lineas: Array<{producto_id:number,cantidad:number,precio_unitario:number}> }}
 */
const normalizarItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    const err = new Error('Debes enviar al menos un artículo en items.')
    err.status = 400
    throw err
  }

  const lineas = []
  for (const raw of items) {
    const producto_id = parseInt(raw.producto_id, 10)
    const cantidad = parseInt(raw.cantidad, 10)
    const precio_unitario = Number(raw.precio_unitario)

    if (isNaN(producto_id) || producto_id <= 0) {
      const err = new Error('Cada item debe tener producto_id entero positivo.')
      err.status = 400
      throw err
    }
    if (isNaN(cantidad) || cantidad <= 0) {
      const err = new Error('Cada item debe tener cantidad entera positiva.')
      err.status = 400
      throw err
    }
    if (!Number.isFinite(precio_unitario) || precio_unitario < 0) {
      const err = new Error('Cada item debe tener precio_unitario numérico >= 0.')
      err.status = 400
      throw err
    }

    lineas.push({
      producto_id,
      cantidad,
      precio_unitario: round2(precio_unitario)
    })
  }

  return { lineas }
}

/**
 * POST pedido — valida stock (físico menos reservas activas), inserta cabecera/detalle y descuenta stock.
 *
 * @param {string} usuarioId - UUID
 * @param {{ items: Array, tipo_entrega: string, direccion?: string }}} payload
 */
const crearPedidoCompleto = async (usuarioId, payload) => {
  const tipo_entrega = payload.tipo_entrega
  if (!TIPOS_ENTREGA.includes(tipo_entrega)) {
    const err = new Error(`tipo_entrega debe ser uno de: ${TIPOS_ENTREGA.join(', ')}.`)
    err.status = 400
    throw err
  }

  if (tipo_entrega === 'despacho') {
    const dir = typeof payload.direccion === 'string' ? payload.direccion.trim() : ''
    if (!dir) {
      const err = new Error('La dirección es obligatoria cuando tipo_entrega es despacho.')
      err.status = 400
      throw err
    }
  }

  const { lineas } = normalizarItems(payload.items)

  const qtyByProduct = new Map()
  for (const l of lineas) {
    qtyByProduct.set(l.producto_id, (qtyByProduct.get(l.producto_id) || 0) + l.cantidad)
  }

  const ids = [...qtyByProduct.keys()]

  const { data: productos, error: errProd } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, stock, activo')
    .in('id', ids)

  if (errProd) {
    const err = new Error(`Error al validar productos: ${errProd.message}`)
    err.status = 500
    throw err
  }

  if (!productos || productos.length !== ids.length) {
    const err = new Error('Uno o más productos no existen.')
    err.status = 404
    throw err
  }

  for (const p of productos) {
    if (!p.activo) {
      const err = new Error(`El producto "${p.nombre}" no está disponible.`)
      err.status = 400
      throw err
    }
  }

  const reservasMap = await mapReservasActivasPorProducto(ids)

  const snapshots = new Map()
  for (const p of productos) {
    const need = qtyByProduct.get(p.id)
    const reservado = reservasMap.get(p.id) || 0
    const disponible = p.stock - reservado
    if (disponible < need) {
      const err = new Error(
        `Stock insuficiente para "${p.nombre}". Disponible: ${disponible}, solicitado: ${need}.`
      )
      err.status = 409
      throw err
    }
    snapshots.set(p.id, { stock: p.stock, nombre: p.nombre })
  }

  const subtotal = round2(
    lineas.reduce((acc, l) => acc + l.cantidad * l.precio_unitario, 0)
  )
  const cantidadTotalArticulos = lineas.reduce((acc, l) => acc + l.cantidad, 0)
  const aplicaDescuento = cantidadTotalArticulos > 4
  const descuentoMonto = aplicaDescuento ? round2(subtotal * 0.1) : 0
  const total = round2(subtotal - descuentoMonto)

  const direccion =
    tipo_entrega === 'despacho'
      ? String(payload.direccion).trim()
      : (payload.direccion != null && String(payload.direccion).trim()) || null

  const notas_cliente =
    typeof payload.notas === 'string' && payload.notas.trim()
      ? payload.notas.trim().slice(0, 500)
      : null

  const pedidoRow = {
    usuario_id: usuarioId,
    estado: 'pendiente',
    tipo_entrega,
    direccion,
    notas_cliente,
    total
  }

  const { data: pedido, error: errPedido } = await supabaseAdmin
    .from('pedidos')
    .insert([pedidoRow])
    .select()
    .single()

  if (errPedido || !pedido) {
    const err = new Error(`Error al crear pedido: ${errPedido?.message || 'desconocido'}`)
    err.status = 500
    throw err
  }

  const detallesInsert = lineas.map((l) => ({
    pedido_id: pedido.id,
    producto_id: l.producto_id,
    cantidad: l.cantidad,
    precio_unitario: l.precio_unitario
  }))

  const { error: errDet } = await supabaseAdmin.from('detalle_pedido').insert(detallesInsert)

  if (errDet) {
    await supabaseAdmin.from('pedidos').delete().eq('id', pedido.id)
    const err = new Error(`Error al crear detalle del pedido: ${errDet.message}`)
    err.status = 500
    throw err
  }

  const yaDescontados = []

  try {
    for (const [productoId, needQty] of qtyByProduct) {
      const snap = snapshots.get(productoId)
      const nuevoStock = snap.stock - needQty
      const { error: errUpd } = await supabaseAdmin
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', productoId)

      if (errUpd) {
        const err = new Error(`Error al actualizar stock: ${errUpd.message}`)
        err.status = 500
        throw err
      }
      yaDescontados.push({ productoId, stockOriginal: snap.stock })
    }
  } catch (e) {
    for (const d of yaDescontados) {
      await supabaseAdmin.from('productos').update({ stock: d.stockOriginal }).eq('id', d.productoId)
    }
    await supabaseAdmin.from('detalle_pedido').delete().eq('pedido_id', pedido.id)
    await supabaseAdmin.from('pedidos').delete().eq('id', pedido.id)
    throw e
  }

  const { data: pedidoConDetalle, error: errFetch } = await supabaseAdmin
    .from('pedidos')
    .select(`
      id, usuario_id, estado, tipo_entrega, direccion, total, creado_en,
      detalle_pedido(id, producto_id, cantidad, precio_unitario, productos(nombre, categoria))
    `)
    .eq('id', pedido.id)
    .single()

  if (errFetch) {
    const err = new Error(`Pedido creado pero error al cargar detalle: ${errFetch.message}`)
    err.status = 500
    throw err
  }

  return {
    pedido: pedidoConDetalle,
    total,
    aplicaDescuento,
    descuentoMonto,
    mensaje: aplicaDescuento
      ? 'Pedido registrado con descuento del 10% por más de 4 artículos.'
      : 'Pedido registrado correctamente.'
  }
}

/**
 * Pedidos del usuario con detalle y productos.
 * @param {string} usuarioId
 */
const obtenerMisPedidos = async (usuarioId) => {
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select(`
      id, estado, tipo_entrega, direccion, total, creado_en, fecha_entrega,
      detalle_pedido(
        id, cantidad, precio_unitario, producto_id,
        productos(id, nombre, categoria, precio, imagen_url)
      ),
      boletas(id, numero_boleta, total, fecha_emision)
    `)
    .eq('usuario_id', usuarioId)
    .order('creado_en', { ascending: false })

  if (error) {
    const err = new Error(`Error al obtener pedidos: ${error.message}`)
    err.status = 500
    throw err
  }

  return data || []
}

/**
 * Todos los pedidos (staff) con datos del usuario.
 * NOTA: disambiguación de FK con !usuario_id porque pedidos.entregado_por también
 * referencia usuarios(id) — Supabase no sabría cuál usar sin ser explícito.
 */
const obtenerTodosPedidos = async () => {
  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select(`
      id, estado, tipo_entrega, direccion, total, creado_en, usuario_id,
      fecha_entrega, entregado_por,
      cliente:usuarios!usuario_id(nombre, email)
    `)
    .order('creado_en', { ascending: false })

  if (error) {
    const err = new Error(`Error al obtener pedidos: ${error.message}`)
    err.status = 500
    throw err
  }

  return (data || []).map((p) => ({
    ...p,
    cliente_nombre: p.cliente?.nombre,
    cliente_email: p.cliente?.email,
    cliente: undefined
  }))
}

/**
 * @param {number} pedidoId
 * @param {string} nuevoEstado
 * @param {{ motivo?: string }} opciones
 *
 * Si el nuevo estado es 'cancelado', revierte el stock automáticamente
 * vía cancelarYRevertirStock (defensa contra "stock fantasma" en cancelaciones).
 */
const actualizarEstadoPedido = async (pedidoId, nuevoEstado, opciones = {}) => {
  if (!ESTADOS_PEDIDO.includes(nuevoEstado)) {
    const err = new Error(`Estado inválido. Válidos: ${ESTADOS_PEDIDO.join(', ')}.`)
    err.status = 400
    throw err
  }

  const { data: actual, error: errGet } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado')
    .eq('id', pedidoId)
    .single()

  if (errGet || !actual) {
    const err = new Error(`Pedido con id ${pedidoId} no encontrado.`)
    err.status = 404
    throw err
  }

  if (nuevoEstado === 'cancelado') {
    const resultado = await cancelarYRevertirStock(pedidoId, opciones.motivo)
    return { pedido: resultado.pedido, estadoAnterior: actual.estado }
  }

  const { data: actualizado, error: errUpd } = await supabaseAdmin
    .from('pedidos')
    .update({ estado: nuevoEstado })
    .eq('id', pedidoId)
    .select()
    .single()

  if (errUpd || !actualizado) {
    const err = new Error(`Error al actualizar estado: ${errUpd?.message || 'desconocido'}`)
    err.status = 500
    throw err
  }

  return { pedido: actualizado, estadoAnterior: actual.estado }
}

/**
 * Cliente cancela su propio pedido. Solo permitido si:
 *  - El pedido es del usuario (usuario_id == clienteId)
 *  - El estado es 'pendiente'
 *
 * @param {number} pedidoId
 * @param {string} clienteId - UUID del cliente que solicita la cancelación
 * @param {string} [motivo]
 */
const cancelarMiPedido = async (pedidoId, clienteId, motivo) => {
  const { data: pedido } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado, usuario_id')
    .eq('id', pedidoId)
    .maybeSingle()

  if (!pedido) {
    const err = new Error(`Pedido ${pedidoId} no encontrado.`)
    err.status = 404
    throw err
  }
  if (pedido.usuario_id !== clienteId) {
    const err = new Error('No puedes cancelar un pedido que no es tuyo.')
    err.status = 403
    throw err
  }
  if (pedido.estado !== 'pendiente') {
    const err = new Error(`Solo puedes cancelar pedidos en estado "pendiente". Tu pedido está "${pedido.estado}".`)
    err.status = 409
    throw err
  }

  const resultado = await cancelarYRevertirStock(pedidoId, motivo || 'Cancelado por el cliente')
  return resultado
}

/**
 * Cancela un pedido y devuelve las cantidades al inventario.
 * @param {number} pedidoId
 * @param {string} [motivo] - Texto libre que se guarda en motivo_cancelacion
 */
const cancelarYRevertirStock = async (pedidoId, motivo) => {
  const { data: pedido, error: errPedido } = await supabaseAdmin
    .from('pedidos')
    .select(`
      id, estado,
      detalle_pedido(producto_id, cantidad)
    `)
    .eq('id', pedidoId)
    .single()

  if (errPedido || !pedido) {
    throw new Error(`Pedido ${pedidoId} no encontrado para revertir stock.`)
  }

  if (pedido.estado === 'cancelado') {
    return { mensaje: 'El pedido ya estaba cancelado.', pedido }
  }

  const detalles = pedido.detalle_pedido || []

  for (const item of detalles) {
    const { data: producto, error: errProd } = await supabaseAdmin
      .from('productos')
      .select('stock')
      .eq('id', item.producto_id)
      .single()

    if (!errProd && producto) {
      const nuevoStock = producto.stock + item.cantidad
      await supabaseAdmin
        .from('productos')
        .update({ stock: nuevoStock })
        .eq('id', item.producto_id)
    }
  }

  const { data: actualizado, error: errUpd } = await supabaseAdmin
    .from('pedidos')
    .update({
      estado: 'cancelado',
      motivo_cancelacion: motivo || null,
      fecha_cancelacion: new Date().toISOString()
    })
    .eq('id', pedidoId)
    .select()
    .single()

  if (errUpd) {
    throw new Error(`Error al actualizar el estado a cancelado: ${errUpd.message}`)
  }

  return { pedido: actualizado, mensaje: 'Pedido cancelado y stock devuelto exitosamente.' }
}

/**
 * Registrar entrega del pedido — flujo Vista Contador.
 * Marca quien entregó y cuándo. Si el estado no es 'entregado', lo actualiza.
 *
 * @param {number} pedidoId
 * @param {string} contadorId - UUID del Contador/usuario que registra la entrega
 */
const registrarEntrega = async (pedidoId, contadorId) => {
  const { data: pedido, error: errGet } = await supabaseAdmin
    .from('pedidos')
    .select('id, estado, fecha_entrega')
    .eq('id', pedidoId)
    .maybeSingle()

  if (errGet || !pedido) {
    const err = new Error(`Pedido ${pedidoId} no encontrado.`)
    err.status = 404
    throw err
  }
  if (pedido.estado === 'cancelado') {
    const err = new Error('No se puede registrar entrega de un pedido cancelado.')
    err.status = 409
    throw err
  }
  if (pedido.fecha_entrega) {
    const err = new Error('Este pedido ya tiene entrega registrada.')
    err.status = 409
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .update({
      entregado_por: contadorId,
      fecha_entrega: new Date().toISOString(),
      estado: 'entregado'
    })
    .eq('id', pedidoId)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Error al registrar entrega: ${error?.message || 'sin datos'}`)
    err.status = 500
    throw err
  }
  return data
}

module.exports = {
  crearPedidoCompleto,
  obtenerMisPedidos,
  obtenerTodosPedidos,
  actualizarEstadoPedido,
  cancelarYRevertirStock,
  cancelarMiPedido,
  registrarEntrega,
  TIPOS_ENTREGA,
  ESTADOS_PEDIDO
}
