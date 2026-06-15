// backend/src/services/reportes.service.js
// Vista Administrador y Contador del caso FERREMAS:
//   • Administrador: informes de venta mensual y desempeño de tienda
//   • Contador:      balances y reportes financieros

const { supabaseAdmin } = require('../lib/supabase')

// "Venta" = todo pedido que no esté cancelado.
// Incluye 'pendiente' porque es una venta hecha aunque aún no se procese.
const ESTADOS_VALIDOS_VENTA = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado']

/**
 * Ventas del mes en curso — total facturado y cantidad de pedidos.
 * Vista Administrador: "Generar informes de venta mensual".
 */
const ventasDelMes = async (anio, mes) => {
  const ahora = new Date()
  const y = anio ? Number(anio) : ahora.getFullYear()
  const m = mes ? Number(mes) - 1 : ahora.getMonth()

  const desde = new Date(y, m, 1).toISOString()
  const hasta = new Date(y, m + 1, 1).toISOString()

  const { data, error } = await supabaseAdmin
    .from('pedidos')
    .select('id, total, estado, creado_en')
    .gte('creado_en', desde)
    .lt('creado_en', hasta)
    .in('estado', ESTADOS_VALIDOS_VENTA)

  if (error) {
    const err = new Error(`Error al obtener ventas del mes: ${error.message}`)
    err.status = 500
    throw err
  }

  const totalFacturado = (data || []).reduce((acc, p) => acc + Number(p.total), 0)
  return {
    periodo: { anio: y, mes: m + 1, desde, hasta },
    totalPedidos: (data || []).length,
    totalFacturado,
    promedioPorPedido: data?.length ? +(totalFacturado / data.length).toFixed(2) : 0
  }
}

/**
 * Ventas agrupadas por sucursal — caso del profe: "comparar performance entre sucursales".
 */
const ventasPorSucursal = async () => {
  const { data: sucursales } = await supabaseAdmin
    .from('sucursales')
    .select('id, nombre, ciudad, region')
    .order('id')

  const { data: pedidos, error } = await supabaseAdmin
    .from('pedidos')
    .select('id, total, estado, sucursal_id')
    .in('estado', ESTADOS_VALIDOS_VENTA)

  if (error) {
    const err = new Error(`Error al obtener ventas por sucursal: ${error.message}`)
    err.status = 500
    throw err
  }

  const acumulado = new Map()
  for (const p of pedidos || []) {
    if (p.sucursal_id == null) continue
    const actual = acumulado.get(p.sucursal_id) || { cantidad: 0, total: 0 }
    actual.cantidad += 1
    actual.total += Number(p.total)
    acumulado.set(p.sucursal_id, actual)
  }

  const resumen = (sucursales || []).map(s => {
    const datos = acumulado.get(s.id) || { cantidad: 0, total: 0 }
    return {
      sucursal: { id: s.id, nombre: s.nombre, ciudad: s.ciudad, region: s.region },
      cantidadPedidos: datos.cantidad,
      totalFacturado: datos.total
    }
  })

  const granTotal = resumen.reduce((acc, r) => acc + r.totalFacturado, 0)
  return {
    granTotal,
    totalPedidosConSucursal: resumen.reduce((acc, r) => acc + r.cantidadPedidos, 0),
    pedidosSinSucursal: (pedidos || []).filter(p => p.sucursal_id == null).length,
    sucursales: resumen.sort((a, b) => b.totalFacturado - a.totalFacturado)
  }
}

/**
 * Top productos más vendidos — Vista Administrador: "desempeño de tienda".
 */
const productosMasVendidos = async (limite = 10) => {
  const { data, error } = await supabaseAdmin
    .from('detalle_pedido')
    .select(`
      cantidad, precio_unitario, producto_id,
      productos:producto_id ( id, nombre, categoria ),
      pedidos:pedido_id ( estado )
    `)

  if (error) {
    const err = new Error(`Error al obtener productos más vendidos: ${error.message}`)
    err.status = 500
    throw err
  }

  const ranking = new Map()
  for (const d of data || []) {
    if (!d.pedidos || !ESTADOS_VALIDOS_VENTA.includes(d.pedidos.estado)) continue
    const key = d.producto_id
    const actual = ranking.get(key) || {
      producto_id: key,
      nombre: d.productos?.nombre || 'Desconocido',
      categoria: d.productos?.categoria || null,
      unidadesVendidas: 0,
      ingresoTotal: 0
    }
    actual.unidadesVendidas += Number(d.cantidad)
    actual.ingresoTotal += Number(d.cantidad) * Number(d.precio_unitario)
    ranking.set(key, actual)
  }

  const ordenado = [...ranking.values()]
    .sort((a, b) => b.unidadesVendidas - a.unidadesVendidas)
    .slice(0, Number(limite))

  return { limite: Number(limite), productos: ordenado }
}

/**
 * Productos con stock bajo el umbral — alerta de reposición.
 */
const stockBajo = async (umbral = 5) => {
  const u = Number(umbral)
  const { data, error } = await supabaseAdmin
    .from('productos')
    .select('id, nombre, stock, categoria, precio')
    .eq('activo', true)
    .lt('stock', u)
    .order('stock')

  if (error) {
    const err = new Error(`Error al obtener stock bajo: ${error.message}`)
    err.status = 500
    throw err
  }

  return {
    umbral: u,
    totalProductos: (data || []).length,
    productos: data || []
  }
}

module.exports = {
  ventasDelMes,
  ventasPorSucursal,
  productosMasVendidos,
  stockBajo
}
