// backend/src/services/inventory.service.js
// Inventario por sucursal — soporta stock distribuido en las 7 tiendas.

const { supabaseAdmin } = require('../lib/supabase')

const SELECT_BASE = `
  id,
  cantidad,
  ubicacion,
  producto_id,
  sucursal_id,
  productos:producto_id ( id, nombre, categoria, precio ),
  sucursales:sucursal_id ( id, nombre, ciudad, region )
`

const getInventory = async () => {
  const { data, error } = await supabaseAdmin
    .from('inventario')
    .select(SELECT_BASE)
    .order('producto_id')
    .order('sucursal_id')

  if (error) {
    const err = new Error(`Error al obtener inventario: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const getBySucursal = async (sucursalId) => {
  const { data: sucursal, error: errSuc } = await supabaseAdmin
    .from('sucursales')
    .select('id, nombre, ciudad, region')
    .eq('id', sucursalId)
    .maybeSingle()

  if (errSuc || !sucursal) {
    const err = new Error(`Sucursal ${sucursalId} no encontrada.`)
    err.status = 404
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('inventario')
    .select(SELECT_BASE)
    .eq('sucursal_id', sucursalId)
    .order('producto_id')

  if (error) {
    const err = new Error(`Error al obtener inventario de sucursal: ${error.message}`)
    err.status = 500
    throw err
  }

  const items = data || []
  return {
    sucursal,
    totalRegistros: items.length,
    cantidadTotal: items.reduce((acc, i) => acc + (i.cantidad || 0), 0),
    inventario: items
  }
}

const getByProducto = async (productoId) => {
  const { data: producto, error: errProd } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, stock, precio')
    .eq('id', productoId)
    .maybeSingle()

  if (errProd || !producto) {
    const err = new Error(`Producto ${productoId} no encontrado.`)
    err.status = 404
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('inventario')
    .select(SELECT_BASE)
    .eq('producto_id', productoId)
    .order('sucursal_id')

  if (error) {
    const err = new Error(`Error al obtener stock por sucursal: ${error.message}`)
    err.status = 500
    throw err
  }

  const items = data || []
  return {
    producto,
    sucursalesConStock: items.filter(i => i.cantidad > 0).length,
    cantidadTotal: items.reduce((acc, i) => acc + (i.cantidad || 0), 0),
    distribucion: items
  }
}

const updateStock = async (id, cantidad) => {
  const { data, error } = await supabaseAdmin
    .from('inventario')
    .update({ cantidad })
    .eq('id', id)
    .select(SELECT_BASE)
    .single()

  if (error || !data) {
    const err = new Error(`Registro de inventario ${id} no encontrado: ${error?.message || 'sin datos'}`)
    err.status = 404
    throw err
  }
  return data
}

const crearRegistro = async (payload) => {
  const { producto_id, sucursal_id, cantidad, ubicacion } = payload

  if (!producto_id || !sucursal_id || cantidad === undefined) {
    const err = new Error('producto_id, sucursal_id y cantidad son obligatorios.')
    err.status = 400
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('inventario')
    .insert([{
      producto_id,
      sucursal_id,
      cantidad,
      ubicacion: ubicacion || null
    }])
    .select(SELECT_BASE)
    .single()

  if (error) {
    const err = new Error(`Error al crear registro de inventario: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

module.exports = {
  getInventory,
  getBySucursal,
  getByProducto,
  updateStock,
  crearRegistro
}
