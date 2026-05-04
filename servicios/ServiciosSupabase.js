// servicios/ServiciosSupabase.js
import { createClient } from '@supabase/supabase-js';

// Configuración Stateless: Las credenciales deben venir de variables de entorno
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'tu-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Módulo: ServiciosSupabase (Capa de Datos)
 * Este módulo maneja la interacción directa con la base de datos Supabase de forma Stateless.
 * Se asume que el inventario consultado aquí es la "Única Fuente de Verdad" para todas las sucursales.
 */
export const ServiciosSupabase = {
  
  // ==========================================
  // TABLA: productos
  // ==========================================

  /**
   * Obtiene la información de stock de un producto específico.
   * @param {string} idProducto - El ID del producto.
   * @returns {Promise<Object>} Datos del producto incluyendo stock_fisico y stock_disponible.
   */
  async obtenerStockProducto(idProducto) {
    const { data, error } = await supabase
      .from('productos')
      .select('stock_fisico, stock_disponible')
      .eq('id', idProducto)
      .single();

    if (error) throw new Error(`Error al obtener stock: ${error.message}`);
    return data;
  },

  /**
   * Actualiza el stock disponible (reserva lógica o liberación).
   * @param {string} idProducto - El ID del producto.
   * @param {number} nuevoStockDisponible - El nuevo valor del stock disponible.
   */
  async actualizarStockDisponible(idProducto, nuevoStockDisponible) {
    const { data, error } = await supabase
      .from('productos')
      .update({ stock_disponible: nuevoStockDisponible })
      .eq('id', idProducto)
      .select();

    if (error) throw new Error(`Error al actualizar stock disponible: ${error.message}`);
    return data;
  },

  // ==========================================
  // TABLA: usuarios
  // ==========================================

  /**
   * Autentica u obtiene el rol del usuario, verificando si necesita cambio de contraseña.
   * Roles soportados: Administrador, Vendedor, Bodeguero, Contador, Cliente.
   * @param {string} email - Correo del usuario.
   * @returns {Promise<Object>} Datos del usuario incluyendo rol y cambio_password_obligatorio.
   */
  async obtenerUsuario(email) {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, rol, cambio_password_obligatorio')
      .eq('email', email)
      .single();

    if (error) throw new Error(`Error al obtener usuario: ${error.message}`);
    return data;
  },

  // ==========================================
  // TABLA: pedidos y detalles_pedido
  // ==========================================

  /**
   * Crea un nuevo pedido y sus detalles. Representa la persistencia de las transacciones digitales.
   * @param {Object} pedido - Datos del pedido (id_usuario, total, estado, etc.).
   * @param {Array} detalles - Lista de artículos del pedido.
   * @returns {Promise<Object>} El pedido creado en base de datos.
   */
  async crearPedidoConDetalles(pedido, detalles) {
    // 1. Crear la cabecera del pedido
    const { data: pedidoCreado, error: errorPedido } = await supabase
      .from('pedidos')
      .insert([pedido])
      .select()
      .single();

    if (errorPedido) throw new Error(`Error al crear pedido: ${errorPedido.message}`);

    // 2. Asociar el ID del pedido recién creado a los detalles
    const detallesConPedidoId = detalles.map(d => ({ ...d, id_pedido: pedidoCreado.id }));

    // 3. Insertar los detalles del pedido
    const { error: errorDetalles } = await supabase
      .from('detalles_pedido')
      .insert(detallesConPedidoId);

    if (errorDetalles) {
      // Compensación manual si falla la inserción de detalles para mantener integridad
      await supabase.from('pedidos').delete().eq('id', pedidoCreado.id);
      throw new Error(`Error al crear detalles del pedido: ${errorDetalles.message}`);
    }

    return pedidoCreado;
  },

  /**
   * Actualiza el estado de un pedido existente.
   * @param {string} idPedido - ID del pedido.
   * @param {string} nuevoEstado - El nuevo estado (Pendiente, Pagado, Preparado, Despachado).
   */
  async actualizarEstadoPedido(idPedido, nuevoEstado) {
    const { data, error } = await supabase
      .from('pedidos')
      .update({ estado: nuevoEstado })
      .eq('id', idPedido)
      .select()
      .single();

    if (error) throw new Error(`Error al actualizar estado del pedido: ${error.message}`);
    return data;
  }
};
