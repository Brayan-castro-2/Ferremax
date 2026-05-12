// backend/src/services/auth.service.js
// Servicio de autenticación adaptado para Supabase Auth

const { supabase, supabaseAdmin } = require('../lib/supabase')

/**
 * loginUsuario — Actúa como proxy de Supabase Auth.
 * 
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>} Token y perfil del usuario
 */
const loginUsuario = async (email, password) => {
  // 1. Autenticar con el servicio de Auth de Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password
  })

  if (error) {
    const err = new Error('Credenciales incorrectas o usuario no encontrado.')
    err.status = 401
    throw err
  }

  // 2. Buscar datos de ROL en la tabla public.usuarios
  const { data: perfil, error: errPerfil } = await supabaseAdmin
    .from('usuarios')
    .select('nombre, roles(nombre)')
    .eq('id', data.user.id)
    .single()

  return {
    token: data.session.access_token,
    usuario: {
      id: data.user.id,
      email: data.user.email,
      nombre: perfil?.nombre || 'Nuevo Usuario',
      rol: perfil?.roles?.nombre || 'Cliente'
    }
  }
}

/**
 * cambiarPassword — Verifica la contraseña actual y actualiza vía Admin API.
 *
 * @param {string} userId         - UUID (req.user.id)
 * @param {string} passwordActual
 * @param {string} passwordNuevo
 * @returns {Promise<{ mensaje: string }>}
 */
const cambiarPassword = async (userId, passwordActual, passwordNuevo) => {
  const { data: usuario, error: errUsuario } = await supabaseAdmin
    .from('usuarios')
    .select('email')
    .eq('id', userId)
    .single()

  if (errUsuario || !usuario?.email) {
    const err = new Error('Usuario no encontrado.')
    err.status = 400
    throw err
  }

  const email = usuario.email.toLowerCase().trim()

  const { error: errSignIn } = await supabase.auth.signInWithPassword({
    email,
    password: passwordActual
  })

  if (errSignIn) {
    const err = new Error('La contraseña actual no es correcta.')
    err.status = 400
    throw err
  }

  const { error: errUpdate } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: passwordNuevo
  })

  if (errUpdate) {
    const err = new Error(
      errUpdate.message || 'No se pudo actualizar la contraseña. Revisa los requisitos de seguridad.'
    )
    err.status = 400
    throw err
  }

  return { mensaje: 'Contraseña actualizada exitosamente.' }
}

module.exports = { loginUsuario, cambiarPassword }
