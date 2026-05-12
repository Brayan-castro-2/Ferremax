// backend/src/routes/currency.routes.js

const express = require('express')
const router = express.Router()
const currencyController = require('../controllers/currency.controller')

/**
 * GET /api/currency/dolar
 * Sin autenticación.
 */
router.get('/dolar', currencyController.getValorDolar)

module.exports = router
