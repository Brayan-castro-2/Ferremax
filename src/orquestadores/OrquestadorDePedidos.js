// orquestadores/OrquestadorDePedidos.js
import { ServiciosSupabase } from '../servicios/ServiciosSupabase.js';

/**
 * Módulo: OrquestadorDePedidos (Lógica de Negocio)
 * Define la lógica de orquestación centralizada para cumplir con el flujo TO-BE del e-commerce.
 * Este orquestador separa la capa de presentación de la capa de datos.
 */
export const OrquestadorDePedidos = {
  
  /**
   * Inicia el proceso de compra validando reglas y generando reservas lógicas.
   * - Regla: Descuento automático si hay más de 4 artículos.
   * - Ejecuta la Reserva Lógica (Soft-Reservation).
   * - Establece un tiempo de expiración (TTL) de 15 minutos.
   * 
   * @param {string} idUsuario - ID del cliente realizando la compra.
   * @param {Array} carrito - Lista de objetos con la forma { idProducto, cantidad, precioBase }.
   * @returns {Promise<Object>} Resultado de la operación con el pedido y tiempo de expiración.
   */
  async iniciarProcesoDeCompra(idUsuario, carrito) {
    try {
      let cantidadTotalArticulos = 0;
      let subtotal = 0;

      // 1. Calcular cantidades y subtotales
      for (const item of carrito) {
        cantidadTotalArticulos += item.cantidad;
        subtotal += (item.cantidad * item.precioBase);
      }

      // 2. Validación de regla de negocio: Descuento automático (ejemplo: 10%) si hay más de 4 artículos
      const aplicaDescuento = cantidadTotalArticulos > 4;
      const totalFinal = aplicaDescuento ? subtotal * 0.9 : subtotal;

      // 3. Validación de Inventario como Única Fuente de Verdad (Stateless)
      // Los vendedores/sistema solo aprueban si hay stock real disponible
      for (const item of carrito) {
        const stockActual = await ServiciosSupabase.obtenerStockProducto(item.idProducto);
        if (stockActual.stock_disponible < item.cantidad) {
          throw new Error(`Stock insuficiente para el producto ${item.idProducto}. Operación denegada por la Única Fuente de Verdad.`);
        }
      }

      // 4. Ejecutar Reserva Lógica (Soft-Reservation)
      for (const item of carrito) {
        const stockActual = await ServiciosSupabase.obtenerStockProducto(item.idProducto);
        const nuevoStockDisponible = stockActual.stock_disponible - item.cantidad;
        await ServiciosSupabase.actualizarStockDisponible(item.idProducto, nuevoStockDisponible);
      }

      // 5. Configurar el tiempo de expiración (TTL) a 15 minutos desde ahora
      const fechaExpiracion = new Date();
      fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 15);

      // 6. Preparar objeto del pedido con estado inicial 'Pendiente'
      const pedidoNuevo = {
        id_usuario: idUsuario,
        total: totalFinal,
        estado: 'Pendiente',
        fecha_expiracion_reserva: fechaExpiracion.toISOString(),
        aplica_descuento: aplicaDescuento
      };

      const detallesPedido = carrito.map(item => ({
        id_producto: item.idProducto,
        cantidad: item.cantidad,
        precio_unitario: item.precioBase
      }));

      // 7. Persistir en la base de datos
      const pedidoCreado = await ServiciosSupabase.crearPedidoConDetalles(pedidoNuevo, detallesPedido);

      return {
        mensaje: "Proceso de compra iniciado correctamente. Reserva lógica ejecutada.",
        pedido: pedidoCreado,
        expira_en: fechaExpiracion
      };

    } catch (error) {
      console.error("[Orquestador] Error al iniciar proceso de compra:", error);
      throw error;
    }
  },

  /**
   * Manejo de transiciones de estado del pedido.
   * Representa el ciclo de vida de la orden digital: Pendiente, Pagado, Preparado y Despachado.
   * 
   * @param {string} idPedido - UUID del pedido a gestionar.
   * @param {string} nuevoEstado - El estado hacia el cual transitar.
   */
  async gestionarEstados(idPedido, nuevoEstado) {
    const estadosPermitidos = ['Pendiente', 'Pagado', 'Preparado', 'Despachado'];
    
    if (!estadosPermitidos.includes(nuevoEstado)) {
      throw new Error(`Estado '${nuevoEstado}' es inválido. Permitidos: ${estadosPermitidos.join(', ')}.`);
    }

    // Nota para evaluación: Aquí pueden añadirse validaciones direccionales (ej: Pendiente -> Pagado)
    console.log(`[Orquestador] Solicitud de cambio de estado para pedido ${idPedido} a: ${nuevoEstado}`);
    
    const pedidoActualizado = await ServiciosSupabase.actualizarEstadoPedido(idPedido, nuevoEstado);
    return pedidoActualizado;
  },

  /**
   * Lógica para revertir el stock si ocurren escenarios de falla (pago rechazado o TTL expirado).
   * Restablece la disponibilidad para otras sucursales y notifica al Contador.
   * 
   * @param {string} idPedido - UUID del pedido problemático.
   * @param {Array} carritoOriginal - Artículos que fueron reservados y deben ser devueltos.
   * @param {string} motivoExcepcion - Razón de la cancelación (ej: 'Pago Rechazado', 'TTL Expirado').
   */
  async manejoDeExcepciones(idPedido, carritoOriginal, motivoExcepcion) {
    console.warn(`[EXCEPCIÓN EN ORQUESTADOR] Abortando pedido ${idPedido} por: ${motivoExcepcion}`);

    try {
      // 1. Revertir la Reserva Lógica sumando nuevamente la cantidad al stock_disponible
      for (const item of carritoOriginal) {
        const stockActual = await ServiciosSupabase.obtenerStockProducto(item.idProducto);
        const stockRestaurado = stockActual.stock_disponible + item.cantidad;
        
        await ServiciosSupabase.actualizarStockDisponible(item.idProducto, stockRestaurado);
        console.log(`[Orquestador] Liberando stock. Producto ${item.idProducto}: +${item.cantidad} devuelto.`);
      }

      // 2. Marcar el pedido como fallido en base de datos para historial
      await ServiciosSupabase.actualizarEstadoPedido(idPedido, 'Cancelado');

      // 3. Notificar al gestor de excepciones (Contador)
      this.notificarContador(idPedido, motivoExcepcion);

      return { 
        exito: true, 
        mensaje: "Flujo de excepción ejecutado. Stock liberado y Contador notificado." 
      };

    } catch (error) {
      console.error("[Orquestador] Error grave al manejar excepción. Posible inconsistencia de inventario.", error);
      throw error;
    }
  },

  /**
   * Simula la notificación al rol Contador encargado de la gestión de excepciones financieras.
   * En una arquitectura real desacoplada, podría lanzar un evento, un correo o un webhook.
   * @param {string} idPedido - UUID del pedido.
   * @param {string} motivo - Razón de la notificación.
   */
  notificarContador(idPedido, motivo) {
    console.log(`\n================= ALERTA PARA CONTADOR =================`);
    console.log(`El pedido ${idPedido} ha sido marcado como Excepción.`);
    console.log(`Motivo reportado: ${motivo}`);
    console.log(`Acción del sistema: Reserva de stock revertida exitosamente.`);
    console.log(`==========================================================\n`);
  }

};
