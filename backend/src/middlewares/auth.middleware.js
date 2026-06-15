// backend/src/middlewares/auth.middleware.js
// Verifica el JWT emitido por Supabase Auth
const { supabaseAdmin } = require('../lib/supabase')

/**
 * verifyToken — Valida el token de Supabase.
 * Ahora usa la clave secreta oficial de tu proyecto.
 */
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verificar el token directamente con Supabase Admin
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado', detalle: error?.message })
    }

    // Obtener datos del usuario desde public.usuarios
    const { data: usuario, error: errUsuario } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, roles(nombre)')
      .eq('id', user.id)
      .single()

    if (errUsuario || !usuario) {
      return res.status(403).json({ error: 'Usuario no encontrado en la base de datos de Ferremas' })
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rolNombre: usuario.roles?.nombre || 'Cliente'
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', detalle: err.message })
  }
}

module.exports = { verifyToken }