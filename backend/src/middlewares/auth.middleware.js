// backend/src/middlewares/auth.middleware.js
// Verifica nuestro JWT propio y busca en la nueva base de datos

const jwt = require('jsonwebtoken')
const { supabase } = require('../lib/supabase')

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret')
    
    // Si es el mock del profe
    if (decoded.sub === 'profe-1') {
      req.user = { id: decoded.sub, email: 'profe@ferremas.cl', nombre: 'Profesor', rolNombre: 'Administrador' }
      return next()
    }

    let usuarioEncontrado = null;
    let rolNombre = 'Cliente';

    if (decoded.tipo === 'staff') {
      const { data, error } = await supabase
        .from('usuario')
        .select('id_usuario, nombre, correo, rol:id_rol(nombre)')
        .eq('id_usuario', decoded.sub)
        .single()
      
      if (!error && data) {
        usuarioEncontrado = data;
        rolNombre = data.rol?.nombre || 'Administrador';
      }
    } else {
      const { data, error } = await supabase
        .from('cliente')
        .select('id_cliente, nombre, correo')
        .eq('id_cliente', decoded.sub)
        .single()
      
      if (!error && data) {
        usuarioEncontrado = data;
      }
    }

    if (!usuarioEncontrado) {
      return res.status(403).json({ error: 'Usuario no encontrado en la base de datos' })
    }

    req.user = {
      id: decoded.sub,
      email: usuarioEncontrado.correo,
      nombre: usuarioEncontrado.nombre,
      rolNombre: rolNombre
    }

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado', detalle: err.message })
  }
}

module.exports = { verifyToken }
