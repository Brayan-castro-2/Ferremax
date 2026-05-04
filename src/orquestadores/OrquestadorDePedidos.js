// src/orquestadores/OrquestadorDePedidos.js
// Lógica de negocio adaptada al schema real de Supabase FERREMAS

import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'

/**
 * Regla de negocio: descuento automático si el pedido tiene más de 4 artículos.
 * La promoción genérica "descuento por volumen" también puede venir de la tabla promociones.
 */
const DESCUENTO_VOLUMEN = 0.10   // 10%
const UMBRAL_DESCUENTO  = 4      // > 4 artículos

export const OrquestadorDePedidos = {

  /**
   * Inicia el proceso de compra:
   * 1. Calcula subtotal y aplica descuento si corresponde
   * 2. Valida stock real desde la tabla `productos`
   * 3. Descuenta el stock (reserva lógica)
   * 4. Persiste el pedido y sus detalles en Supabase
   *
   * @param {string} usuarioId      - UUID del usuario
   * @param {Array}  carrito        - [{ id, nombre, precio, cantidad }]
   * @param {Object} opciones       - { tipo_entrega: 'retiro'|'despacho', direccion: string }
   * @returns {Promise<Object>}     - { pedido, total, aplicaDescuento, descuentoMonto }
   */
  async iniciarProcesoDeCompra(usuarioId, carrito, opciones = {}) {
    try {
      const { tipo_entrega = 'retiro', direccion = '' } = opciones

      // 1. Calcular cantidades y subtotal
      let cantidadTotal = 0
      let subtotal      = 0

      for (const item of carrito) {
        cantidadTotal += item.cantidad
        subtotal      += item.cantidad * item.precio
      }

      // 2. Regla de descuento automático por volumen (>4 artículos)
      const aplicaDescuento  = cantidadTotal > UMBRAL_DESCUENTO
      const descuentoMonto   = aplicaDescuento ? subtotal * DESCUENTO_VOLUMEN : 0
      const total            = subtotal - descuentoMonto

      // 3. Validar stock en Supabase (Única Fuente de Verdad)
      for (const item of carrito) {
        const stockActual = await ServiciosSupabase.obtenerStockProducto(item.id)
        if (stockActual.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente para "${item.nombre}". ` +
            `Disponible: ${stockActual.stock}, solicitado: ${item.cantidad}.`
          )
        }
      }

      // 4. Descontar stock (reserva lógica)
      for (const item of carrito) {
        const stockActual  = await ServiciosSupabase.obtenerStockProducto(item.id)
        const nuevoStock   = stockActual.stock - item.cantidad
        await ServiciosSupabase.actualizarStock(item.id, nuevoStock)
      }

      // 5. Construir objetos para inserción
      const pedidoNuevo = {
        usuario_id:    usuarioId,
        estado:        'pendiente',
        tipo_entrega,
        direccion,
        total
      }

      const detalles = carrito.map(item => ({
        producto_id:     item.id,
        cantidad:        item.cantidad,
        precio_unitario: item.precio
      }))

      // 6. Persistir en Supabase
      const pedidoCreado = await ServiciosSupabase.crearPedidoConDetalles(pedidoNuevo, detalles)

      return {
        ok:            true,
        pedido:        pedidoCreado,
        subtotal,
        descuentoMonto,
        aplicaDescuento,
        total,
        mensaje:       aplicaDescuento
          ? `¡Descuento del 10% aplicado por compra de ${cantidadTotal} artículos!`
          : 'Pedido creado exitosamente.'
      }

    } catch (error) {
      console.error('[Orquestador] Error al iniciar compra:', error)
      throw error
    }
  },

  /**
   * Cambia el estado de un pedido.
   * Estados válidos según schema: pendiente → pagado → preparado → despachado | cancelado
   *
   * @param {number} pedidoId
   * @param {string} nuevoEstado
   */
  async gestionarEstado(pedidoId, nuevoEstado) {
    const estadosValidos = ['pendiente', 'pagado', 'preparado', 'despachado', 'cancelado']
    if (!estadosValidos.includes(nuevoEstado)) {
      throw new Error(`Estado inválido: "${nuevoEstado}". Válidos: ${estadosValidos.join(', ')}`)
    }
    return await ServiciosSupabase.actualizarEstadoPedido(pedidoId, nuevoEstado)
  },

  /**
   * Maneja excepciones (pago rechazado, cancelación):
   * - Revierte el stock descontado
   * - Marca el pedido como cancelado
   * - Notifica al Contador (log de consola, extensible a webhook)
   *
   * @param {number} pedidoId
   * @param {Array}  carritoOriginal  - los items originales para revertir stock
   * @param {string} motivo
   */
  async manejoDeExcepciones(pedidoId, carritoOriginal, motivo) {
    console.warn(`[Orquestador] Excepción en pedido ${pedidoId}: ${motivo}`)

    try {
      // Revertir stock
      for (const item of carritoOriginal) {
        const stockActual = await ServiciosSupabase.obtenerStockProducto(item.id)
        await ServiciosSupabase.actualizarStock(item.id, stockActual.stock + item.cantidad)
      }

      // Cancelar pedido
      await ServiciosSupabase.actualizarEstadoPedido(pedidoId, 'cancelado')

      this.notificarContador(pedidoId, motivo)
      return { ok: true, mensaje: 'Stock revertido. Pedido cancelado.' }

    } catch (err) {
      console.error('[Orquestador] Error grave al manejar excepción:', err)
      throw err
    }
  },

  notificarContador(pedidoId, motivo) {
    console.log(`\n===== ALERTA CONTADOR =====`)
    console.log(`Pedido #${pedidoId} — EXCEPCIÓN`)
    console.log(`Motivo: ${motivo}`)
    console.log(`Acción: stock revertido automáticamente.`)
    console.log(`===========================\n`)
  }
}
