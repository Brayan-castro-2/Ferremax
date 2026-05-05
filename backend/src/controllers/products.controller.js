// backend/src/controllers/products.controller.js
// Controladores del catálogo de productos — ejemplo completo para Postman

const productsService = require('../services/products.service')

/**
 * GET /api/products
 * Público — no requiere autenticación.
 *
 * Query params opcionales:
 *   ?categoria=Herramientas%20Eléctricas
 *   ?busqueda=taladro
 *   ?precioMin=5000&precioMax=100000
 *
 * Respuesta:
 * {
 *   total: 12,
 *   productos: [{ id, nombre, descripcion, precio, stock, categoria, activo }]
 * }
 */
const listarProductos = async (req, res, next) => {
  try {
    const filtros = {
      categoria:  req.query.categoria,
      busqueda:   req.query.busqueda,
      precioMin:  req.query.precioMin,
      precioMax:  req.query.precioMax
    }

    const productos = await productsService.obtenerTodos(filtros)

    return res.status(200).json({
      total:     productos.length,
      productos
    })

  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/products/categorias
 * Público — lista categorías únicas para los filtros del frontend.
 *
 * Respuesta:
 * { categorias: ["Herramientas Eléctricas", "Pintura", ...] }
 */
const listarCategorias = async (req, res, next) => {
  try {
    const categorias = await productsService.obtenerCategorias()
    return res.status(200).json({ categorias })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/products/:id
 * Público — Ficha técnica completa de un producto.
 *
 * Respuesta:
 * {
 *   id, nombre, descripcion, precio, stock,
 *   stock_disponible,   // stock - reservas activas vigentes
 *   stock_reservado,    // cantidad reservada con TTL activo
 *   categoria, activo,
 *   inventario: [{ id, cantidad, ubicacion }],
 *   reservas_activas: 2
 * }
 */
const obtenerFichaTecnica = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10)

    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        error: 'El parámetro :id debe ser un número entero positivo.',
        code:  'INVALID_PRODUCT_ID'
      })
    }

    const producto = await productsService.obtenerPorId(id)
    return res.status(200).json(producto)

  } catch (err) {
    next(err)
  }
}

module.exports = { listarProductos, listarCategorias, obtenerFichaTecnica }
