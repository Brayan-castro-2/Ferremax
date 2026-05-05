// backend/src/services/products.service.js
// Servicio de catálogo de productos — interacción con Supabase

const { supabase } = require('../lib/supabase')

/**
 * obtenerTodos — lista todos los productos activos.
 * Incluye: id, nombre, descripcion, precio, stock, categoria.
 *
 * @param {Object} filtros - { categoria?, precioMin?, precioMax?, busqueda? }
 * @returns {Promise<Array>}
 */
const obtenerTodos = async (filtros = {}) => {
  let query = supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, stock, categoria, activo')
    .eq('activo', true)
    .order('categoria')
    .order('nombre')

  // Filtros opcionales (query params desde el frontend)
  if (filtros.categoria) {
    query = query.ilike('categoria', `%${filtros.categoria}%`)
  }
  if (filtros.busqueda) {
    query = query.or(`nombre.ilike.%${filtros.busqueda}%,descripcion.ilike.%${filtros.busqueda}%`)
  }
  if (filtros.precioMin) {
    query = query.gte('precio', Number(filtros.precioMin))
  }
  if (filtros.precioMax) {
    query = query.lte('precio', Number(filtros.precioMax))
  }

  const { data, error } = await query

  if (error) {
    const err = new Error(`Error al obtener productos: ${error.message}`)
    err.status = 500
    throw err
  }

  return data
}

/**
 * obtenerPorId — ficha técnica completa de un producto.
 * Incluye además el detalle del inventario (tabla inventario).
 *
 * @param {number} id
 * @returns {Promise<Object>}
 */
const obtenerPorId = async (id) => {
  // Producto principal
  const { data: producto, error } = await supabase
    .from('productos')
    .select('id, nombre, descripcion, precio, stock, categoria, activo')
    .eq('id', id)
    .single()

  if (error || !producto) {
    const err = new Error(`Producto con id ${id} no encontrado.`)
    err.status = 404
    throw err
  }

  // Detalle de inventario (ubicación en bodega)
  const { data: inventario } = await supabase
    .from('inventario')
    .select('id, cantidad, ubicacion')
    .eq('producto_id', id)

  // Reservas activas vigentes (TTL)
  const { data: reservas } = await supabase
    .from('reservas')
    .select('cantidad, expira_en')
    .eq('producto_id', id)
    .eq('estado', 'activa')
    .gt('expira_en', new Date().toISOString())

  const cantidadReservada = reservas
    ? reservas.reduce((acc, r) => acc + r.cantidad, 0)
    : 0

  return {
    ...producto,
    stock_disponible: Math.max(0, producto.stock - cantidadReservada),
    stock_reservado:  cantidadReservada,
    inventario:       inventario || [],
    reservas_activas: reservas?.length || 0
  }
}

/**
 * obtenerCategorias — lista las categorías únicas de productos activos.
 * Útil para el filtro del catálogo en el frontend.
 */
const obtenerCategorias = async () => {
  const { data, error } = await supabase
    .from('productos')
    .select('categoria')
    .eq('activo', true)
    .order('categoria')

  if (error) throw new Error(error.message)

  const categorias = [...new Set(data.map(p => p.categoria).filter(Boolean))]
  return categorias
}

module.exports = { obtenerTodos, obtenerPorId, obtenerCategorias }
