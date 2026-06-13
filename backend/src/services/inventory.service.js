// backend/src/services/inventory.service.js
// Adaptado al nuevo esquema de BD (tablas: inventario y producto)

const { supabase } = require('../lib/supabase')

const MOCK_INVENTORY = [
  { id_inventario: 1, cantidad: 15, ubicacion: 'Pasillo A - Estante 3', id_sucursal: 1, producto: { nombre: 'Taladro Percutor 700W (MOCK)' } },
  { id_inventario: 2, cantidad: 8, ubicacion: 'Pasillo B - Estante 1', id_sucursal: 1, producto: { nombre: 'Sierra Circular 1200W (MOCK)' } },
  { id_inventario: 3, cantidad: 50, ubicacion: 'Bodega Principal', id_sucursal: 2, producto: { nombre: 'Set de Llaves Combinadas (MOCK)' } }
]

const getInventory = async () => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .select(`
        id_inventario,
        cantidad,
        ubicacion,
        id_sucursal,
        producto:id_producto (
          nombre
        )
      `)

    if (error) throw error
    if (!data || data.length === 0) return MOCK_INVENTORY // Fallback si está vacío

    return data
  } catch (err) {
    console.warn('⚠️ Usando MOCK DATA para inventario:', err.message)
    return MOCK_INVENTORY
  }
}

const updateStock = async (id_inventario, cantidad) => {
  try {
    const { data, error } = await supabase
      .from('inventario')
      .update({ cantidad })
      .eq('id_inventario', id_inventario)
      .select()

    if (error) throw error
    
    // Si la DB está vacía, simulamos la actualización en el mock
    if (!data || data.length === 0) {
      const item = MOCK_INVENTORY.find(i => i.id_inventario === id_inventario)
      if (item) {
        item.cantidad = cantidad
        return [item]
      }
    }
    
    return data
  } catch (err) {
    console.warn('⚠️ Simulando actualización en MOCK:', err.message)
    const item = MOCK_INVENTORY.find(i => i.id_inventario === id_inventario)
    if (item) item.cantidad = cantidad
    return [item]
  }
}

module.exports = {
  getInventory,
  updateStock
}
