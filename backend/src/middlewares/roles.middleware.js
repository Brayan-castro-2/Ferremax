// backend/src/middlewares/roles.middleware.js
// Middleware de validación de roles — Arquitectura RBAC stateless

/**
 * requireRoles(...roles) — factory que devuelve un middleware Express.
 * Verifica que req.user.rolNombre esté incluido en los roles permitidos.
 *
 * Debe usarse DESPUÉS de verifyToken.
 *
 * Ejemplos de uso:
 *   router.get('/admin', verifyToken, requireRoles('Administrador'), controller)
 *   router.get('/staff', verifyToken, requireRoles('Administrador', 'Vendedor', 'Bodeguero'), controller)
 *
 * Roles disponibles (tabla `roles` en Supabase):
 *   Administrador | Vendedor | Bodeguero | Contador | Cliente
 */
const requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado.', code: 'NOT_AUTHENTICATED' })
    }

    const userRole = req.user.rolNombre

    if (!roles.includes(userRole)) {
      return res.status(403).json({
        error:          `Acceso denegado. Se requiere uno de los roles: ${roles.join(', ')}.`,
        code:           'INSUFFICIENT_ROLE',
        tuRol:          userRole,
        rolesRequeridos: roles
      })
    }

    next()
  }
}

/**
 * requirePasswordChanged — bloquea acceso si el staff no ha cambiado su contraseña.
 * El flag `passwordChanged: false` viene en el JWT cuando el usuario usa contraseña default (RUT).
 * Úsalo en endpoints que no sean /change-password.
 */
const requirePasswordChanged = (req, res, next) => {
  const staffRoles = ['Administrador', 'Vendedor', 'Bodeguero', 'Contador']

  if (staffRoles.includes(req.user?.rolNombre) && req.user?.passwordChanged === false) {
    return res.status(403).json({
      error:  'Debes cambiar tu contraseña antes de continuar. Usa POST /api/auth/change-password.',
      code:   'PASSWORD_CHANGE_REQUIRED'
    })
  }

  next()
}

module.exports = { requireRoles, requirePasswordChanged }
