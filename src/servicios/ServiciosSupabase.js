// src/servicios/ServiciosSupabase.js
// Capa de datos — adaptada al schema real de FERREMAS en Supabase

import { supabase, isMockup } from '@/lib/supabase.js'

/**
 * ServiciosSupabase — CRUD sobre el schema real de Supabase.
 * Todas las funciones lanzan Error si Supabase no está disponible en modo mockup.
 */
export const ServiciosSupabase = {

  // ==========================================
  // TABLA: roles
  // ==========================================

  /** Obtiene todos los roles del sistema */
  async obtenerRoles() {
    const { data, error } = await supabase.from('roles').select('*').order('id')
    if (error) throw new Error(`Error al obtener roles: ${error.message}`)
    return data
  },

  // ==========================================
  // TABLA: usuarios
  // ==========================================

  /**
   * Busca un usuario por email y trae su rol mediante JOIN.
   * NOTA: La verificación de contraseña se realiza en el backend/Edge Function.
   * En este cliente frontend solo se consulta la existencia del usuario.
   * @param {string} email
   * @returns {Promise<Object>} Usuario con rol_nombre incluido
   */
  async obtenerUsuarioPorEmail(email) {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nombre, email, rol_id, activo, roles(nombre)')
      .eq('email', email)
      .eq('activo', true)
      .single()

    if (error) throw new Error(`Usuario no encontrado: ${error.message}`)

    // Aplanar el JOIN: roles.nombre → rol_nombre
    return {
      ...data,
      rol_nombre: data.roles?.nombre || null,
      roles: undefined
    }
  },

  /**
   * Obtiene todos los usuarios (solo para Administrador)
   */
  async obtenerUsuarios() {
    const { data, error } = await supabase
      .from('usuario')
      .select('id, nombre, email, rol_id, activo, creado_en, roles(nombre)')
      .order('creado_en', { ascending: false })

    if (error) throw new Error(`Error al obtener usuarios: ${error.message}`)
    return data.map(u => ({ ...u, rol_nombre: u.roles?.nombre, roles: undefined }))
  },

  // ==========================================
  // TABLA: productos
  // ==========================================

  /**
   * Obtiene todos los productos activos del catálogo.
   */
  async obtenerProductos() {
    if (!supabase) {
      throw new Error('Supabase no está inicializado. Verifica el archivo .env.local')
    }

    let { data, error } = await supabase
      .from('productos')
      .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, activo')
      .eq('activo', true)
      .order('id')

    if (error && error.message.includes('relation') && error.message.includes('does not exist')) {
      console.warn('🔴 Tabla "productos" no existe, intentando con "producto" (singular)...')
      const result = await supabase
        .from('producto')
        .select('id, nombre, descripcion, precio, stock, categoria, imagen_url, activo')
        .eq('activo', true)
        .order('id')
      
      data = result.data
      error = result.error
    }

    if (error) {
      console.error('🔴 Error completo Supabase:', error)
      if (error.message.includes('row-level security') || error.code === '42501') {
        throw new Error('Configura las políticas RLS en Supabase para permitir acceso.')
      }
      throw new Error(error.message)
    }

    return data
  },

  /**
   * Obtiene el stock actual de un producto.
   * @param {number} productoId
   */
  async obtenerStockProducto(productoId) {
    const { data, error } = await supabase
      .from('producto')
      .select('id, nombre, stock')
      .eq('id', productoId)
      .single()

    if (error) throw new Error(`Error al obtener stock: ${error.message}`)
    return data
  },

  /**
   * Actualiza el stock de un producto (uso interno del orquestador).
   * @param {number} productoId
   * @param {number} nuevoStock
   */
  async actualizarStock(productoId, nuevoStock) {
    const { data, error } = await supabase
      .from('producto')
      .update({ stock: nuevoStock })
      .eq('id', productoId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar stock: ${error.message}`)
    return data
  },

  // ==========================================
  // TABLA: inventario
  // ==========================================

  /**
   * Obtiene el inventario completo con JOIN a productos.
   */
  async obtenerInventario() {
    const { data, error } = await supabase
      .from('inventario')
      .select('id, cantidad, ubicacion, producto(id, nombre, categoria, precio, stock)')
      .order('id')

    if (error) throw new Error(`Error al obtener inventario: ${error.message}`)
    return data
  },

  // ==========================================
  // TABLA: pedidos + detalle_pedido
  // ==========================================

  /**
   * Crea un pedido completo con sus detalles en una sola operación.
   * @param {Object} pedido - { usuario_id, estado, tipo_entrega, direccion, total }
   * @param {Array}  detalles - [{ id_producto, cantidad, precio_unitario }]
   * @returns {Promise<Object>} Pedido creado
   */
  async crearPedidoConDetalles(pedido, detalles) {
    // 1. Crear cabecera del pedido
    const { data: pedidoCreado, error: errorPedido } = await supabase
      .from('pedido')
      .insert([pedido])
      .select()
      .single()

    if (errorPedido) throw new Error(`Error al crear pedido: ${errorPedido.message}`)

    // 2. Insertar detalles con el id del pedido recién creado
    const detallesConId = detalles.map(d => ({ ...d, id_pedido: pedidoCreado.id }))
    const { error: errorDetalles } = await supabase
      .from('detalle_pedido')
      .insert(detallesConId)

    if (errorDetalles) {
      // Rollback manual
      await supabase.from('pedido').delete().eq('id', pedidoCreado.id)
      throw new Error(`Error al crear detalle_pedido: ${errorDetalles.message}`)
    }

    // 3. Registrar en historial
    await supabase.from('historial_pedidos').insert([{
      id_pedido: pedidoCreado.id,
      estado: pedido.estado
    }])

    return pedidoCreado
  },

  /**
   * Obtiene los pedidos de un usuario con sus detalles.
   * @param {string} usuarioId - UUID
   */
  async obtenerPedidosUsuario(usuarioId) {
    const { data, error } = await supabase
      .from('pedido')
      .select(`
        id, estado, tipo_entrega, direccion, total, creado_en,
        detalle_pedido(id, cantidad, precio_unitario, producto(nombre, categoria))
      `)
      .eq('usuario_id', usuarioId)
      .order('creado_en', { ascending: false })

    if (error) throw new Error(`Error al obtener pedidos: ${error.message}`)
    return data
  },

  /**
   * Obtiene todos los pedidos (para Vendedor/Admin).
   */
  async obtenerTodosPedidos() {
    const { data, error } = await supabase
      .from('pedido')
      .select(`
        id, estado, tipo_entrega, total, creado_en,
        usuarios(nombre, email)
      `)
      .order('creado_en', { ascending: false })
      .limit(50)

    if (error) throw new Error(`Error al obtener pedidos: ${error.message}`)
    return data.map(p => ({
      ...p,
      cliente_nombre: p.usuarios?.nombre,
      cliente_email:  p.usuarios?.email,
      usuarios: undefined
    }))
  },

  /**
   * Actualiza el estado de un pedido y registra en historial.
   * @param {number} pedidoId
   * @param {string} nuevoEstado
   */
  async actualizarEstadoPedido(pedidoId, nuevoEstado) {
    const { data, error } = await supabase
      .from('pedido')
      .update({ estado: nuevoEstado })
      .eq('id', pedidoId)
      .select()
      .single()

    if (error) throw new Error(`Error al actualizar estado: ${error.message}`)

    // Registrar en historial
    await supabase.from('historial_pedidos').insert([{
      id_pedido: pedidoId,
      estado: nuevoEstado
    }])

    return data
  },

  // ==========================================
  // TABLA: pagos
  // ==========================================

  /**
   * Registra un pago para un pedido.
   * @param {Object} pago - { id_pedido, metodo, estado }
   */
  async registrarPago(pago) {
    const { data, error } = await supabase
      .from('pagos')
      .insert([pago])
      .select()
      .single()

    if (error) throw new Error(`Error al registrar pago: ${error.message}`)
    return data
  },

  // ==========================================
  // TABLA: promociones
  // ==========================================

  /**
   * Obtiene las promociones activas vigentes a la fecha de hoy.
   */
  async obtenerPromocionesActivas() {
    const hoy = new Date().toISOString().split('T')[0]
    const { data, error } = await supabase
      .from('promociones')
      .select('*')
      .eq('activa', true)
      .lte('fecha_inicio', hoy)
      .gte('fecha_fin', hoy)

    if (error) throw new Error(`Error al obtener promociones: ${error.message}`)
    return data
  }
}
