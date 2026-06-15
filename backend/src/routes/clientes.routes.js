// backend/src/routes/clientes.routes.js

const express = require('express')
const router  = express.Router()
const clientesController = require('../controllers/clientes.controller')
const { verifyToken } = require('../middlewares/auth.middleware')
const { requireRoles, requirePasswordChanged } = require('../middlewares/roles.middleware')

// POST /api/clientes/registro — público (alta de cliente nuevo)
router.post('/registro', clientesController.registrar)

// GET /api/clientes/mi-perfil — el cliente ve su propio perfil
router.get('/mi-perfil',
  verifyToken,
  requireRoles('Cliente'),
  clientesController.miPerfil
)

// GET /api/clientes — staff lista todos
router.get('/',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador', 'Vendedor'),
  clientesController.listar
)

// GET /api/clientes/:id — staff o el propio cliente
router.get('/:id',
  verifyToken,
  clientesController.obtener
)

// PUT /api/clientes/:id — propio o staff (chequeo dentro del controller)
router.put('/:id',
  verifyToken,
  clientesController.actualizar
)

// PATCH /api/clientes/:id — partial update, mismas reglas que PUT
router.patch('/:id',
  verifyToken,
  clientesController.actualizar
)

// DELETE /api/clientes/:id — solo Administrador
router.delete('/:id',
  verifyToken,
  requirePasswordChanged,
  requireRoles('Administrador'),
  clientesController.eliminar
)

module.exports = router
