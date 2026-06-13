// backend/src/services/products.service.js
// Adaptado al nuevo esquema de la BD (tabla: producto)

const { supabase } = require('../lib/supabase')

const MOCK_PRODUCTS = [
  { id_producto: 1, nombre: 'Taladro Percutor 700W (MOCK)', descripcion: 'Simulado', precio: 79990, stock: 15, categoria: 'Herramientas', activa: true },
  { id_producto: 2, nombre: 'Sierra Circular 1200W (MOCK)', descripcion: 'Corte preciso', precio: 124990, stock: 8, categoria: 'Herramientas', activa: true },
  { id_producto: 3, nombre: 'Set de Llaves Combinadas (MOCK)', descripcion: 'Acero al cromo vanadio', precio: 15990, stock: 50, categoria: 'Herramientas Manuales', activa: true },
  { id_producto: 4, nombre: 'Caja de Clavos 2" (MOCK)', descripcion: '100 unidades', precio: 4500, stock: 100, categoria: 'Ferretería', activa: true },
]

const obtenerTodos = async (filtros = {}) => {
  try {
    const { data, error } = await supabase
      .from('producto')
      .select('id_producto, nombre, descripcion, precio, stock, categoria')

    if (error) throw error
    return data

  } catch (err) {
    console.warn('⚠️ Usando MOCK DATA para productos:', err.message)
    return MOCK_PRODUCTS
  }
}

const obtenerPorId = async (id) => {
  try {
    const { data, error } = await supabase
      .from('producto')
      .select('id_producto, nombre, descripcion, precio, stock, categoria')
      .eq('id_producto', id)
      .single()

    if (error) throw error
    return data

  } catch (err) {
    const local = MOCK_PRODUCTS.find(p => p.id_producto == id)
    if (local) return local
    throw new Error(`Producto ${id} no encontrado.`)
  }
}

const obtenerCategorias = async () => {
  return ['Herramientas Eléctricas', 'Herramientas Manuales', 'Pintura', 'Ferretería']
}

module.exports = { obtenerTodos, obtenerPorId, obtenerCategorias }
