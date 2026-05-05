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
 * cambiarPassword — Delegado a Supabase Auth.
 * 
 * @param {string} token - El token de sesión del usuario
 * @param {string} passwordNuevo
 */
const cambiarPassword = async (token, passwordNuevo) => {
  // Para actualizar el password en Supabase Auth necesitamos el cliente con la sesión
  // O usar el admin client
  const { error } = await supabase.auth.admin.updateUserById(
    // Aquí necesitaríamos el ID que viene en el token decodificado
  )
  
  // Por simplicidad en este flujo, se recomienda hacerlo desde el frontend usando:
  // supabase.auth.updateUser({ password: new_password })
  
  throw new Error('El cambio de contraseña debe realizarse preferiblemente desde el cliente usando supabase.auth.updateUser.')
}

module.exports = { loginUsuario, cambiarPassword }
