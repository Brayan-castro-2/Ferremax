// backend/src/services/products.service.js
// Tabla real: productos (id, nombre, descripcion, precio, stock, categoria, imagen_url, activo)

const { supabaseAdmin } = require('../lib/supabase')

const obtenerTodos = async (filtros = {}) => {
  let query = supabaseAdmin
    .from('productos')
    .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, activo')
    .eq('activo', true)

  if (filtros.categoria) {
    query = query.eq('categoria', filtros.categoria)
  }

  const { data, error } = await query
  if (error) {
    const err = new Error(`Error al obtener productos: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const obtenerPorId = async (id) => {
  const { data: producto, error } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, activo')
    .eq('id', id)
    .single()

  if (error || !producto) {
    const err = new Error(`Producto ${id} no encontrado.`)
    err.status = 404
    throw err
  }

  const ahora = new Date().toISOString()
  const [{ data: reservas }, { data: inventario }] = await Promise.all([
    supabaseAdmin
      .from('reservas')
      .select('cantidad')
      .eq('producto_id', id)
      .eq('estado', 'activa')
      .gt('expira_en', ahora),
    supabaseAdmin
      .from('inventario')
      .select('id, cantidad, ubicacion')
      .eq('producto_id', id)
  ])

  const stockReservado = (reservas || []).reduce((acc, r) => acc + r.cantidad, 0)

  return {
    ...producto,
    stock_disponible: producto.stock - stockReservado,
    stock_reservado: stockReservado,
    reservas_activas: (reservas || []).length,
    inventario: inventario || []
  }
}

const obtenerCategorias = async () => {
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('categoria')
    .eq('activo', true)

  if (error) {
    const err = new Error(`Error al obtener categorías: ${error.message}`)
    err.status = 500
    throw err
  }

  const unicas = [...new Set((data || []).map(p => p.categoria).filter(Boolean))]
  return unicas.sort()
}

const crear = async (payload) => {
  const { nombre, precio, descripcion, stock, categoria, imagen_url, activo } = payload

  if (!nombre || precio === undefined) {
    const err = new Error('nombre y precio son obligatorios.')
    err.status = 400
    throw err
  }
  if (typeof precio !== 'number' || precio < 0) {
    const err = new Error('precio debe ser un número >= 0.')
    err.status = 400
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('productos')
    .insert([{
      nombre,
      precio,
      descripcion: descripcion ?? null,
      stock: stock ?? 0,
      categoria: categoria ?? null,
      imagen_url: imagen_url ?? null,
      activo: activo ?? true
    }])
    .select()
    .single()

  if (error) {
    const err = new Error(`Error al crear producto: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

const actualizar = async (id, payload) => {
  const camposPermitidos = ['nombre', 'descripcion', 'precio', 'stock', 'categoria', 'imagen_url', 'activo']
  const actualizacion = {}
  for (const key of camposPermitidos) {
    if (payload[key] !== undefined) actualizacion[key] = payload[key]
  }

  if (Object.keys(actualizacion).length === 0) {
    const err = new Error('Debes enviar al menos un campo para actualizar.')
    err.status = 400
    throw err
  }
  if (actualizacion.precio !== undefined && (typeof actualizacion.precio !== 'number' || actualizacion.precio < 0)) {
    const err = new Error('precio debe ser un número >= 0.')
    err.status = 400
    throw err
  }
  if (actualizacion.stock !== undefined && (typeof actualizacion.stock !== 'number' || actualizacion.stock < 0)) {
    const err = new Error('stock debe ser un número >= 0.')
    err.status = 400
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('productos')
    .update(actualizacion)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Producto ${id} no encontrado o error al actualizar: ${error?.message || 'sin datos'}`)
    err.status = error ? 500 : 404
    throw err
  }
  return data
}

const eliminar = async (id) => {
  // Soft-delete — preserva pedidos históricos.
  const { data, error } = await supabaseAdmin
    .from('productos')
    .update({ activo: false })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Producto ${id} no encontrado.`)
    err.status = 404
    throw err
  }
  return { mensaje: `Producto "${data.nombre}" desactivado.`, producto: data }
}

module.exports = { obtenerTodos, obtenerPorId, obtenerCategorias, crear, actualizar, eliminar }
