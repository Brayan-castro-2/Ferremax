// backend/src/middlewares/auth.middleware.js
// Valida el access_token emitido por Supabase Auth (GoTrue) y carga el perfil.

const { supabase, supabaseAdmin } = require('../lib/supabase')

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error: errAuth } = await supabase.auth.getUser(token)

    if (errAuth || !user) {
      return res.status(401).json({ error: 'Token inválido o expirado', detalle: errAuth?.message })
    }

    const { data: usuario, error: errPerfil } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, password_changed, roles(nombre)')
      .eq('id', user.id)
      .single()

    if (errPerfil || !usuario) {
      return res.status(403).json({ error: 'Usuario no encontrado en la base de datos de Ferremas' })
    }

    req.user = {
      id: usuario.id,
      email: usuario.email,
      nombre: usuario.nombre,
      rolNombre: usuario.roles?.nombre || 'Cliente',
      passwordChanged: usuario.password_changed !== false
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', detalle: err.message })
  }
}

module.exports = { verifyToken }
