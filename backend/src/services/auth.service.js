// backend/src/services/auth.service.js
// Autenticación vía Supabase Auth (GoTrue).
// public.usuarios guarda el perfil (rol, nombre); auth.users guarda el password.

const { supabase, supabaseAdmin } = require('../lib/supabase')

const loginUsuario = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password
  })

  if (error) {
    const err = new Error('Credenciales incorrectas o usuario no encontrado.')
    err.status = 401
    throw err
  }

  const { data: perfil } = await supabaseAdmin
    .from('usuarios')
    .select('nombre, email, password_changed, roles(nombre)')
    .eq('id', data.user.id)
    .single()

  return {
    token: data.session.access_token,
    usuario: {
      id: data.user.id,
      email: perfil?.email || data.user.email,
      nombre: perfil?.nombre || data.user.email,
      rol: perfil?.roles?.nombre || 'Cliente',
      passwordChanged: perfil?.password_changed !== false
    }
  }
}

const cambiarPassword = async (userId, passwordActual, passwordNuevo) => {
  const { data: usuario } = await supabaseAdmin
    .from('usuarios')
    .select('email')
    .eq('id', userId)
    .single()

  if (!usuario?.email) {
    const err = new Error('Usuario no encontrado.')
    err.status = 400
    throw err
  }

  const { error: errSignIn } = await supabase.auth.signInWithPassword({
    email: usuario.email.toLowerCase().trim(),
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
    const err = new Error(errUpdate.message || 'No se pudo actualizar la contraseña.')
    err.status = 400
    throw err
  }

  return { mensaje: 'Contraseña actualizada exitosamente.' }
}

module.exports = { loginUsuario, cambiarPassword }
