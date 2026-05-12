// backend/src/controllers/currency.controller.js

const currencyService = require('../services/currency.service')

/**
 * GET /api/currency/dolar
 * Público — valor referencial USD en CLP (mindicador.cl).
 */
const getValorDolar = async (req, res, next) => {
  try {
    const resultado = await currencyService.obtenerValorDolar()
    return res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { getValorDolar }
