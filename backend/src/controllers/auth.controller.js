// backend/src/controllers/auth.controller.js
// Controladores de autenticación — delegan lógica al authService

const authService = require('../services/auth.service')

/**
 * POST /api/auth/login
 *
 * Body: { email: string, password: string }
 *
 * Respuesta exitosa:
 * {
 *   token: "eyJ...",
 *   usuario: { id, nombre, email, rol, passwordChanged },
 *   advertencia?: "Tu contraseña es el RUT por defecto..."
 * }
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email y contraseña son obligatorios.',
        code:  'MISSING_CREDENTIALS'
      })
    }

    const resultado = await authService.loginUsuario(email, password)

    return res.status(200).json(resultado)

  } catch (err) {
    next(err)  // Pasa al error handler global de app.js
  }
}

/**
 * POST /api/auth/change-password
 * Requiere: Bearer JWT (verifyToken)
 *
 * Body: { passwordActual: string, passwordNuevo: string }
 *
 * Respuesta exitosa:
 * { mensaje: "Contraseña actualizada exitosamente." }
 */
const changePassword = async (req, res, next) => {
  try {
    const { passwordActual, passwordNuevo } = req.body

    if (!passwordActual || !passwordNuevo) {
      return res.status(400).json({
        error: 'passwordActual y passwordNuevo son obligatorios.',
        code:  'MISSING_FIELDS'
      })
    }

    // req.user.id viene del JWT (middleware verifyToken)
    const resultado = await authService.cambiarPassword(
      req.user.id,
      passwordActual,
      passwordNuevo
    )

    return res.status(200).json(resultado)

  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/auth/me
 * Requiere: Bearer JWT
 * Devuelve los datos del usuario autenticado (desde el JWT, sin consultar DB)
 */
const me = (req, res) => {
  return res.status(200).json({
    usuario: req.user
  })
}

module.exports = { login, changePassword, me }
