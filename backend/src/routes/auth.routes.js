// backend/src/routes/auth.routes.js

const express        = require('express')
const router         = express.Router()
const authController = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth.middleware')

/**
 * POST /api/auth/login
 * Público — no requiere token
 */
router.post('/login', authController.login)

/**
 * POST /api/auth/change-password
 * Privado — requiere token válido
 * ⚠️ NO incluir requirePasswordChanged aquí (es la ruta para cambiar contraseña)
 */
router.post('/change-password', verifyToken, authController.changePassword)

/**
 * GET /api/auth/me
 * Privado — devuelve datos del usuario autenticado
 */
router.get('/me', verifyToken, authController.me)

module.exports = router
