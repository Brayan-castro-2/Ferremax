// backend/src/services/inventory.service.js
// Servicio básico para el Módulo de Inventario

const { supabase } = require('../lib/supabase')

/**
 * Obtener todo el inventario (Stock físico)
 * Incluye un JOIN con la tabla de productos para tener los nombres.
 */
const getAllInventory = async () => {
  const { data, error } = await supabase
    .from('inventario')
    .select(`
      id,
      cantidad,
      ubicacion,
      producto_id,
      productos ( nombre, categoria )
    `)
    .order('id')

  if (error) {
    const err = new Error(`Error al obtener el inventario: ${error.message}`)
    err.status = 500
    throw err
  }

  return data
}

/**
 * Actualizar la cantidad de un producto en el inventario.
 * @param {number} inventarioId - El ID del registro en la tabla inventario
 * @param {number} nuevaCantidad - La nueva cantidad física
 */
const updateInventoryStock = async (inventarioId, nuevaCantidad) => {
  if (nuevaCantidad < 0) {
    const err = new Error('La cantidad no puede ser negativa')
    err.status = 400
    throw err
  }

  const { data, error } = await supabase
    .from('inventario')
    .update({ cantidad: nuevaCantidad })
    .eq('id', inventarioId)
    .select()
    .single()

  if (error) {
    const err = new Error(`Error al actualizar el stock: ${error.message}`)
    err.status = 500
    throw err
  }

  // Opcional: También podríamos sincronizar 'productos.stock' aquí si es necesario
  // await supabase.from('productos').update({ stock: nuevaCantidad }).eq('id', data.producto_id)

  return data
}

module.exports = { getAllInventory, updateInventoryStock }
