// backend/src/services/reservation.service.js
// ============================================================
// SISTEMA DE RESERVA LÓGICA (Soft-Reservation) — TTL 15 min
// ============================================================
//
// Propósito: evitar overselling entre ventas online y presenciales
// en las 7 sucursales. La reserva descuenta stock_disponible
// sin tocar stock_fisico hasta confirmar el pago.
//
// ⚠️ REQUISITO: Crear la tabla `reservas` en Supabase con el
// siguiente SQL (ejecutar en SQL Editor del dashboard):
//
// CREATE TABLE public.reservas (
//   id          SERIAL PRIMARY KEY,
//   producto_id INTEGER NOT NULL REFERENCES productos(id),
//   pedido_id   INTEGER REFERENCES pedidos(id),
//   usuario_id  UUID    REFERENCES usuarios(id),
//   cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
//   estado      VARCHAR DEFAULT 'activa',  -- 'activa' | 'confirmada' | 'expirada'
//   creada_en   TIMESTAMP DEFAULT now(),
//   expira_en   TIMESTAMP NOT NULL,        -- creada_en + 15 minutos
//   CONSTRAINT ck_estado CHECK (estado IN ('activa','confirmada','expirada'))
// );
// CREATE INDEX idx_reservas_producto ON reservas(producto_id, estado, expira_en);
// ============================================================

const { supabaseAdmin } = require('../lib/supabase')

const TTL_MINUTOS = 15

/**
 * crearReserva — descuenta stock de forma temporal (TTL 15 min).
 *
 * Flujo:
 * 1. Verifica stock disponible (stock - reservas activas vigentes)
 * 2. Valida que haya suficiente
 * 3. Crea registro en tabla `reservas` con expira_en = now() + 15 min
 *
 * @param {number} productoId
 * @param {number} cantidad
 * @param {string} usuarioId   - UUID
 * @returns {Promise<Object>}  - La reserva creada
 */
const crearReserva = async (productoId, cantidad, usuarioId) => {
  // 1. Stock físico actual
  const { data: producto, error: errProd } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, stock')
    .eq('id', productoId)
    .eq('activo', true)
    .single()

  if (errProd || !producto) {
    const err = new Error(`Producto ${productoId} no encontrado.`)
    err.status = 404
    throw err
  }

  // 2. Suma de reservas activas vigentes para ese producto
  const ahora = new Date().toISOString()
  const { data: reservasActivas } = await supabaseAdmin
    .from('reservas')
    .select('cantidad')
    .eq('producto_id', productoId)
    .eq('estado', 'activa')
    .gt('expira_en', ahora)

  const cantidadReservada = (reservasActivas || []).reduce((acc, r) => acc + r.cantidad, 0)
  const stockDisponible   = producto.stock - cantidadReservada

  // 3. Validar disponibilidad
  if (stockDisponible < cantidad) {
    const err = new Error(
      `Stock insuficiente para "${producto.nombre}". ` +
      `Disponible: ${stockDisponible}, solicitado: ${cantidad}.`
    )
    err.status = 409  // Conflict
    throw err
  }

  // 4. Calcular TTL
  const expiraEn = new Date(Date.now() + TTL_MINUTOS * 60 * 1000).toISOString()

  // 5. Crear reserva en Supabase
  const { data: reserva, error: errReserva } = await supabaseAdmin
    .from('reservas')
    .insert([{
      producto_id: productoId,
      usuario_id:  usuarioId,
      cantidad,
      estado:      'activa',
      expira_en:   expiraEn
    }])
    .select()
    .single()

  if (errReserva) {
    const err = new Error(`Error al crear reserva: ${errReserva.message}`)
    err.status = 500
    throw err
  }

  return {
    reserva,
    stockDisponible: stockDisponible - cantidad,
    expiraEn,
    mensaje: `Reserva creada. Tienes ${TTL_MINUTOS} minutos para completar el pago.`
  }
}

/**
 * confirmarReserva — convierte la reserva en venta definitiva.
 * Llama internamente desde el módulo de pagos al aprobar el pago.
 *
 * @param {number} reservaId
 * @param {number} pedidoId
 */
const confirmarReserva = async (reservaId, pedidoId) => {
  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'confirmada', pedido_id: pedidoId })
    .eq('id', reservaId)
    .eq('estado', 'activa')
    .select()
    .single()

  if (error || !data) {
    throw new Error(`No se pudo confirmar la reserva ${reservaId}. Puede haber expirado.`)
  }
  return data
}

/**
 * limpiarReservasExpiradas — libera reservas cuyo TTL venció.
 * Ejecutar periódicamente (ej: cada 5 min via setInterval o cron).
 *
 * @returns {number} Cantidad de reservas liberadas
 */
const limpiarReservasExpiradas = async () => {
  const ahora = new Date().toISOString()

  const { data, error } = await supabaseAdmin
    .from('reservas')
    .update({ estado: 'expirada' })
    .eq('estado', 'activa')
    .lt('expira_en', ahora)
    .select()

  if (error) {
    console.error('[Reservas] Error al limpiar expiradas:', error.message)
    return 0
  }

  if (data?.length > 0) {
    console.log(`[Reservas] ${data.length} reservas expiradas liberadas.`)
  }

  return data?.length || 0
}

// Iniciar limpieza automática cada 5 minutos
setInterval(limpiarReservasExpiradas, 5 * 60 * 1000)

module.exports = { crearReserva, confirmarReserva, limpiarReservasExpiradas }
