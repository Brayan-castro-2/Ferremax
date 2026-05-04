// modelos/TiposDeDatos.js

/**
 * Módulo: Modelos de Datos
 * Este archivo documenta las estructuras de datos esperadas para interactuar con la capa de servicios 
 * y los orquestadores. Sirve como referencia técnica para mantener la consistencia entre el Frontend y el Backend 
 * dentro de la arquitectura desacoplada de FERREMAS.
 */

/**
 * Representa a un usuario en el sistema (Autenticación y Autorización).
 * @typedef {Object} Usuario
 * @property {string} id - Identificador único del usuario (UUID de Supabase).
 * @property {string} email - Correo electrónico del usuario (login).
 * @property {string} rol - Rol asignado. Valores permitidos: 'Administrador' | 'Vendedor' | 'Bodeguero' | 'Contador' | 'Cliente'.
 * @property {boolean} cambio_password_obligatorio - Bandera para forzar cambio de contraseña en el primer inicio de sesión.
 */

/**
 * Representa un ítem del catálogo de ferretería.
 * @typedef {Object} Producto
 * @property {string} id - Código SKU o UUID del producto.
 * @property {string} nombre - Nombre descriptivo del producto.
 * @property {number} precio - Valor comercial unitario.
 * @property {number} stock_fisico - Cantidad real de productos almacenados en la bodega.
 * @property {number} stock_disponible - Cantidad disponible para la venta en tiempo real (stock_fisico menos las reservas lógicas vigentes).
 */

/**
 * Representa una transacción digital de compra.
 * @typedef {Object} Pedido
 * @property {string} id - Identificador único del pedido generado por la base de datos.
 * @property {string} id_usuario - Referencia al cliente que realiza la orden.
 * @property {number} total - Valor monetario total calculado tras posibles reglas de descuento.
 * @property {boolean} aplica_descuento - Indica si el pedido cumplió la regla de descuento (ej: >4 artículos).
 * @property {string} estado - Ciclo de vida: 'Pendiente' | 'Pagado' | 'Preparado' | 'Despachado' | 'Cancelado'.
 * @property {string} fecha_expiracion_reserva - Timestamp (ISO 8601) indicando el final del TTL de 15 minutos para la reserva.
 */

/**
 * Representa un artículo específico dentro de un pedido.
 * @typedef {Object} DetallePedido
 * @property {string} id_pedido - Referencia a la cabecera del pedido.
 * @property {string} id_producto - Referencia al producto comprado.
 * @property {number} cantidad - Unidades solicitadas en esta orden.
 * @property {number} precio_unitario - Precio congelado al momento de efectuar la compra (histórico).
 */

// Se exporta un objeto vacío ya que esto actúa como un archivo de definiciones de tipos/documentación 
// para JSDoc en un entorno JavaScript puro.
export default {};
