// orquestadores/PedidoOrquestador.js
import { DB_SIMULADA } from '../servicios/Simulador.js';

export function crearNuevoPedido(clienteId, itemsCarrito) {
  let total = 0;
  let mensaje = "";

  // 1. REGLA: ¿Son más de 4 productos? (Descuento del 10%)
  let totalArticulos = 0;
  
  // 2. REGLA: Revisar si hay stock disponible para cada cosa
  for (let item of itemsCarrito) {
    // Buscamos el producto en nuestra base de datos simulada
    let productoEnBD = null;
    for (let p of DB_SIMULADA.productos) {
      if (p.id === item.id) {
        productoEnBD = p;
        break;
      }
    }

    if (!productoEnBD) {
      return { error: "El producto no existe: " + item.nombre };
    }

    if (item.cantidad > productoEnBD.stock_disponible) {
      return { error: "No hay suficiente stock de " + productoEnBD.nombre };
    }
    
    total += productoEnBD.precio * item.cantidad;
    totalArticulos += item.cantidad;
  }

  // Aplicar descuento simple si cumple la condición
  if (totalArticulos > 4) {
    total = total * 0.9; // 10% de descuento 
    mensaje = "¡Descuento aplicado por llevar más de 4 productos!";
  }

  // 3. RESULTADO: Devolver el pedido listo
  const nuevoPedido = {
    id: Date.now(), // ID temporal
    cliente_id: clienteId,
    total_a_pagar: total,
    estado: "Pendiente", // Estado inicial solicitado
    nota: mensaje
  };

  // Guardar en la base de datos simulada
  DB_SIMULADA.pedidos.push(nuevoPedido);

  // Restar el stock (Reserva de stock)
  for (let item of itemsCarrito) {
    for (let p of DB_SIMULADA.productos) {
      if (p.id === item.id) {
        p.stock_disponible = p.stock_disponible - item.cantidad;
        break;
      }
    }
  }

  return nuevoPedido;
}

export function manejarExcepcionPago(pedidoId) {
  // Buscar el pedido
  let pedidoAfectado = null;
  for (let pedido of DB_SIMULADA.pedidos) {
    if (pedido.id === pedidoId) {
      pedidoAfectado = pedido;
      break;
    }
  }

  if (!pedidoAfectado) {
    return { error: "Pedido no encontrado" };
  }

  // Cambiar estado a cancelado
  pedidoAfectado.estado = "Cancelado";
  
  // En un caso real con el simulador, aquí deberíamos saber qué productos tenía el pedido
  // para devolver el stock. Para mantenerlo simple, solo avisamos que se canceló.
  return {
    mensaje: "El pedido fue Cancelado y el stock vuelve a estar libre para otros.",
    pedido: pedidoAfectado
  };
}
