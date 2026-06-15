// backend/src/controllers/devoluciones.controller.js

const devolucionesService = require('../services/devoluciones.service')

const solicitar = async (req, res, next) => {
  try {
    const pedidoId = parseInt(req.body?.pedido_id, 10)
    if (isNaN(pedidoId) || pedidoId <= 0) {
      return res.status(400).json({ error: 'pedido_id debe ser entero positivo.' })
    }
    const devolucion = await devolucionesService.solicitar(pedidoId, req.user.id, req.body?.motivo)
    return res.status(201).json({ mensaje: 'Solicitud de devolución creada.', devolucion })
  } catch (err) {
    next(err)
  }
}

const listar = async (req, res, next) => {
  try {
    const devoluciones = await devolucionesService.listar({ estado: req.query.estado })
    return res.status(200).json({ total: devoluciones.length, devoluciones })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const devolucion = await devolucionesService.obtenerPorId(id)
    return res.status(200).json(devolucion)
  } catch (err) {
    next(err)
  }
}

const misDevoluciones = async (req, res, next) => {
  try {
    const devoluciones = await devolucionesService.obtenerMisDevoluciones(req.user.id)
    return res.status(200).json({ total: devoluciones.length, devoluciones })
  } catch (err) {
    next(err)
  }
}

const aprobar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const devolucion = await devolucionesService.procesar(id, 'aprobada', req.user.id, {
      notas_internas: req.body?.notas_internas
    })
    return res.status(200).json({ mensaje: 'Devolución aprobada.', devolucion })
  } catch (err) {
    next(err)
  }
}

const rechazar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const devolucion = await devolucionesService.procesar(id, 'rechazada', req.user.id, {
      notas_internas: req.body?.notas_internas
    })
    return res.status(200).json({ mensaje: 'Devolución rechazada.', devolucion })
  } catch (err) {
    next(err)
  }
}

const procesar = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)
    if (isNaN(id) || id <= 0) return res.status(400).json({ error: ':id debe ser entero positivo.' })
    const monto = req.body?.monto_devuelto != null ? Number(req.body.monto_devuelto) : undefined
    if (monto != null && (isNaN(monto) || monto < 0)) {
      return res.status(400).json({ error: 'monto_devuelto debe ser un número >= 0.' })
    }
    const devolucion = await devolucionesService.procesar(id, 'procesada', req.user.id, {
      notas_internas: req.body?.notas_internas,
      monto_devuelto: monto
    })
    return res.status(200).json({ mensaje: 'Devolución procesada (reembolso registrado).', devolucion })
  } catch (err) {
    next(err)
  }
}

module.exports = { solicitar, listar, obtener, misDevoluciones, aprobar, rechazar, procesar }
