// backend/src/services/sucursales.service.js
// CRUD de sucursales — 4 RM + 3 regiones según el caso FERREMAS

const { supabaseAdmin } = require('../lib/supabase')

const obtenerTodas = async (filtros = {}) => {
  let query = supabaseAdmin
    .from('sucursales')
    .select('id, nombre, direccion, comuna, ciudad, region, telefono, activa, creada_en')
    .order('id')

  if (filtros.activa !== undefined) {
    query = query.eq('activa', filtros.activa === 'true' || filtros.activa === true)
  }
  if (filtros.region) {
    query = query.ilike('region', `%${filtros.region}%`)
  }

  const { data, error } = await query
  if (error) {
    const err = new Error(`Error al obtener sucursales: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const obtenerPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('sucursales')
    .select('id, nombre, direccion, comuna, ciudad, region, telefono, activa, creada_en')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener sucursal: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`Sucursal ${id} no encontrada.`)
    err.status = 404
    throw err
  }
  return data
}

const crear = async (payload) => {
  const { nombre, direccion, comuna, ciudad, region, telefono } = payload

  if (!nombre || !direccion || !ciudad || !region) {
    const err = new Error('nombre, direccion, ciudad y region son obligatorios.')
    err.status = 400
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('sucursales')
    .insert([{ nombre, direccion, comuna, ciudad, region, telefono, activa: true }])
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      const err = new Error(`Ya existe una sucursal con nombre "${nombre}".`)
      err.status = 409
      throw err
    }
    const err = new Error(`Error al crear sucursal: ${error.message}`)
    err.status = 500
    throw err
  }
  return data
}

const actualizar = async (id, payload) => {
  const camposPermitidos = ['nombre', 'direccion', 'comuna', 'ciudad', 'region', 'telefono', 'activa']
  const actualizacion = {}
  for (const key of camposPermitidos) {
    if (payload[key] !== undefined) actualizacion[key] = payload[key]
  }

  if (Object.keys(actualizacion).length === 0) {
    const err = new Error('Debes enviar al menos un campo para actualizar.')
    err.status = 400
    throw err
  }

  const { data, error } = await supabaseAdmin
    .from('sucursales')
    .update(actualizacion)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Sucursal ${id} no encontrada o error al actualizar: ${error?.message || 'sin datos'}`)
    err.status = error ? 500 : 404
    throw err
  }
  return data
}

const eliminar = async (id) => {
  // Soft-delete — marca como inactiva en vez de borrar (preserva FKs en inventario/pedidos)
  const { data, error } = await supabaseAdmin
    .from('sucursales')
    .update({ activa: false })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Sucursal ${id} no encontrada.`)
    err.status = 404
    throw err
  }
  return { mensaje: `Sucursal "${data.nombre}" desactivada correctamente.`, sucursal: data }
}

module.exports = { obtenerTodas, obtenerPorId, crear, actualizar, eliminar }
