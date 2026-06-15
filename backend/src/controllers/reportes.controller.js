// backend/src/controllers/reportes.controller.js

const reportesService = require('../services/reportes.service')

const ventasMes = async (req, res, next) => {
  try {
    const data = await reportesService.ventasDelMes(req.query.anio, req.query.mes)
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const ventasPorSucursal = async (req, res, next) => {
  try {
    const data = await reportesService.ventasPorSucursal()
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const productosMasVendidos = async (req, res, next) => {
  try {
    const data = await reportesService.productosMasVendidos(req.query.limite || 10)
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

const stockBajo = async (req, res, next) => {
  try {
    const data = await reportesService.stockBajo(req.query.umbral || 5)
    return res.status(200).json(data)
  } catch (err) {
    next(err)
  }
}

module.exports = { ventasMes, ventasPorSucursal, productosMasVendidos, stockBajo }
