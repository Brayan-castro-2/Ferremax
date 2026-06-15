// backend/src/controllers/clientes.controller.js

const clientesService = require('../services/clientes.service')

const registrar = async (req, res, next) => {
  try {
    const resultado = await clientesService.registrar(req.body)
    return res.status(201).json(resultado)
  } catch (err) {
    next(err)
  }
}

const listar = async (req, res, next) => {
  try {
    const clientes = await clientesService.obtenerTodos()
    return res.status(200).json({ total: clientes.length, clientes })
  } catch (err) {
    next(err)
  }
}

const obtener = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!id) return res.status(400).json({ error: 'Falta :id en la ruta.' })
    const cliente = await clientesService.obtenerPorId(id)
    return res.status(200).json(cliente)
  } catch (err) {
    next(err)
  }
}

const miPerfil = async (req, res, next) => {
  try {
    const cliente = await clientesService.obtenerPorId(req.user.id)
    return res.status(200).json(cliente)
  } catch (err) {
    next(err)
  }
}

const actualizar = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!id) return res.status(400).json({ error: 'Falta :id en la ruta.' })

    // Si el usuario es Cliente, solo puede editar su propio perfil
    const esStaff = ['Administrador', 'Vendedor'].includes(req.user.rolNombre)
    if (!esStaff && req.user.id !== id) {
      return res.status(403).json({ error: 'Solo puedes modificar tu propio perfil.' })
    }

    const cliente = await clientesService.actualizar(id, req.body)
    return res.status(200).json({ mensaje: 'Cliente actualizado.', cliente })
  } catch (err) {
    next(err)
  }
}

const eliminar = async (req, res, next) => {
  try {
    const id = req.params.id
    if (!id) return res.status(400).json({ error: 'Falta :id en la ruta.' })
    const resultado = await clientesService.eliminar(id)
    return res.status(200).json(resultado)
  } catch (err) {
    next(err)
  }
}

module.exports = { registrar, listar, obtener, miPerfil, actualizar, eliminar }
