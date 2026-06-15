// backend/src/services/clientes.service.js
// CRUD de clientes — tabla SEPARADA de usuarios (con dirección obligatoria para despacho)

const { supabase, supabaseAdmin } = require('../lib/supabase')

/**
 * registrar — flujo público de registro de cliente.
 * Crea fila en auth.users (vía Supabase Auth) + fila en clientes con dirección.
 * El trigger handle_new_user también crea fila en usuarios con rol 'Cliente'.
 *
 * @param {Object} payload - { email, password, nombre, direccion, rut?, telefono?, comuna?, ciudad? }
 */
const registrar = async (payload) => {
  const { email, password, nombre, direccion, rut, telefono, comuna, ciudad } = payload

  if (!email || !password || !nombre || !direccion) {
    const err = new Error('email, password, nombre y direccion son obligatorios.')
    err.status = 400
    throw err
  }

  const emailNorm = String(email).toLowerCase().trim()

  // 1. Crear usuario en auth.users (auto-confirmado para evitar verificación por email en demo)
  const { data: authData, error: errAuth } = await supabaseAdmin.auth.admin.createUser({
    email: emailNorm,
    password,
    email_confirm: true,
    user_metadata: { nombre }
  })

  if (errAuth || !authData?.user) {
    const err = new Error(`Error al registrar usuario: ${errAuth?.message || 'desconocido'}`)
    err.status = errAuth?.status === 422 ? 409 : 500
    throw err
  }

  const userId = authData.user.id

  // 2. Insertar perfil en `clientes` (la fila en `usuarios` se crea automáticamente por trigger)
  const { data: cliente, error: errCli } = await supabaseAdmin
    .from('clientes')
    .insert([{
      id: userId,
      nombre,
      email: emailNorm,
      direccion,
      rut: rut || null,
      telefono: telefono || null,
      comuna: comuna || null,
      ciudad: ciudad || null
    }])
    .select()
    .single()

  if (errCli) {
    // Rollback — si falla el insert de clientes, borramos al user de auth para no dejar huérfano
    await supabaseAdmin.auth.admin.deleteUser(userId)
    const err = new Error(`Error al crear perfil de cliente: ${errCli.message}`)
    err.status = 500
    throw err
  }

  return {
    mensaje: 'Cliente registrado exitosamente. Ya puedes iniciar sesión.',
    cliente: {
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email,
      direccion: cliente.direccion
    }
  }
}

const obtenerTodos = async () => {
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, email, rut, telefono, direccion, comuna, ciudad, activo, creado_en')
    .order('creado_en', { ascending: false })

  if (error) {
    const err = new Error(`Error al obtener clientes: ${error.message}`)
    err.status = 500
    throw err
  }
  return data || []
}

const obtenerPorId = async (id) => {
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .select('id, nombre, email, rut, telefono, direccion, comuna, ciudad, activo, creado_en')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    const err = new Error(`Error al obtener cliente: ${error.message}`)
    err.status = 500
    throw err
  }
  if (!data) {
    const err = new Error(`Cliente ${id} no encontrado.`)
    err.status = 404
    throw err
  }
  return data
}

const actualizar = async (id, payload) => {
  const camposPermitidos = ['nombre', 'rut', 'telefono', 'direccion', 'comuna', 'ciudad', 'activo']
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
    .from('clientes')
    .update(actualizacion)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Cliente ${id} no encontrado o error al actualizar: ${error?.message || 'sin datos'}`)
    err.status = error ? 500 : 404
    throw err
  }
  return data
}

const eliminar = async (id) => {
  // Soft-delete — activo = false. No borramos para preservar pedidos históricos.
  const { data, error } = await supabaseAdmin
    .from('clientes')
    .update({ activo: false })
    .eq('id', id)
    .select()
    .single()

  if (error || !data) {
    const err = new Error(`Cliente ${id} no encontrado.`)
    err.status = 404
    throw err
  }
  return { mensaje: `Cliente "${data.nombre}" desactivado.`, cliente: data }
}

module.exports = { registrar, obtenerTodos, obtenerPorId, actualizar, eliminar }
