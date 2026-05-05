// backend/src/middlewares/auth.middleware.js
// Verifica el JWT emitido por Supabase Auth

const jwt = require('jsonwebtoken')
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
    // 1. Verificar el JWT con la clave secreta de Supabase
    // NOTA: Supabase a veces usa el secreto en base64. Si falla, se usa directo.
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (e) {
      // Intento con buffer si el secreto está en base64
      decoded = jwt.verify(token, Buffer.from(process.env.JWT_SECRET, 'base64'))
    }

    // 2. Obtener datos extendidos del usuario (Rol) desde la tabla public.usuarios
    // Usamos supabaseAdmin para saltarnos RLS si fuera necesario
    const { data: usuario, error } = await supabaseAdmin
      .from('usuarios')
      .select('id, nombre, email, roles(nombre)')
      .eq('id', decoded.sub) // En Supabase Auth, 'sub' es el ID del usuario
      .single()

    if (error || !usuario) {
      return res.status(403).json({ error: 'Usuario no encontrado en la base de datos de Ferremas' })
    }

    // 3. Inyectar usuario en la request para los siguientes middlewares
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
