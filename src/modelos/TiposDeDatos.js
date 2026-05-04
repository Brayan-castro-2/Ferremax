// src/modelos/TiposDeDatos.js
// Tipos de datos que reflejan el schema real de Supabase FERREMAS

/**
 * @typedef {Object} Rol
 * @property {number} id
 * @property {string} nombre - 'Administrador' | 'Vendedor' | 'Bodeguero' | 'Contador' | 'Cliente'
 */

/**
 * @typedef {Object} Usuario
 * @property {string}  id          - UUID (gen_random_uuid)
 * @property {string}  nombre
 * @property {string}  email       - único
 * @property {string}  password_hash
 * @property {number}  rol_id      - FK → roles.id
 * @property {boolean} activo
 * @property {string}  creado_en
 * @property {string}  [rol_nombre] - JOIN desde roles.nombre (calculado)
 */

/**
 * @typedef {Object} Producto
 * @property {number}  id
 * @property {string}  nombre
 * @property {string}  descripcion
 * @property {number}  precio
 * @property {number}  stock       - stock disponible directo en la tabla
 * @property {string}  categoria
 * @property {boolean} activo
 */

/**
 * @typedef {Object} Inventario
 * @property {number} id
 * @property {number} producto_id  - FK → productos.id
 * @property {number} cantidad
 * @property {string} ubicacion
 */

/**
 * @typedef {Object} Pedido
 * @property {number} id
 * @property {string} usuario_id   - UUID FK → usuarios.id
 * @property {string} estado       - 'pendiente' | 'pagado' | 'preparado' | 'despachado' | 'cancelado'
 * @property {string} tipo_entrega - 'retiro' | 'despacho'
 * @property {string} direccion
 * @property {number} total
 * @property {string} creado_en
 */

/**
 * @typedef {Object} DetallePedido
 * @property {number} id
 * @property {number} pedido_id    - FK → pedidos.id
 * @property {number} producto_id  - FK → productos.id
 * @property {number} cantidad
 * @property {number} precio_unitario
 */

/**
 * @typedef {Object} Pago
 * @property {number} id
 * @property {number} pedido_id    - FK → pedidos.id
 * @property {string} metodo       - 'transferencia' | 'tarjeta' | 'efectivo'
 * @property {string} estado       - 'pendiente' | 'aprobado' | 'rechazado'
 * @property {string} fecha
 */

/**
 * @typedef {Object} Promocion
 * @property {number}  id
 * @property {string}  nombre
 * @property {number}  descuento_porcentaje
 * @property {string}  fecha_inicio
 * @property {string}  fecha_fin
 * @property {boolean} activa
 */

/**
 * @typedef {Object} HistorialPedido
 * @property {number} id
 * @property {number} pedido_id
 * @property {string} estado
 * @property {string} fecha
 */

export default {}
