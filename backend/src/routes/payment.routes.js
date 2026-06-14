const express = require('express')
const router = express.Router()
const paymentController = require('../controllers/payment.controller')
const { requireAuth } = require('../middlewares/auth.middleware')

// Ruta para que el frontend inicie el proceso de pago (permite invitados)
router.post('/create', paymentController.createTransaction)

// Ruta a la que Transbank redirigirá (POST) después de que el usuario pague
// No ponemos requireAuth aquí porque la petición viene desde Transbank (servidor a servidor)
router.post('/commit', paymentController.commitTransaction)

// Transbank a veces envía por GET si hay anulaciones o timeouts
router.get('/commit', paymentController.commitTransaction)

module.exports = router
