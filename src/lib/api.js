// src/lib/api.js
// Cliente HTTP centralizado para el backend de FERREMAS.
// Todos los endpoints del backend Express viven aquí.
//
// Uso desde una vista:
//   import { api } from '@/lib/api'
//   const { sucursales } = await api.sucursales.listar()
//
// El token se inyecta automáticamente desde localStorage si existe.

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
  constructor(message, status, body) {
    super(message)
    this.status = status
    this.body = body
  }
}

function getToken() {
  try {
    return localStorage.getItem('ferremas_token')
  } catch {
    return null
  }
}

async function request(path, { method = 'GET', body, headers = {}, auth = 'auto' } = {}) {
  const url = `${BASE_URL}${path}`
  const finalHeaders = { Accept: 'application/json', ...headers }

  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json'
  }

  const token = getToken()
  if ((auth === 'auto' && token) || auth === 'required') {
    if (!token && auth === 'required') {
      throw new ApiError('No autenticado.', 401, null)
    }
    if (token) finalHeaders['Authorization'] = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body !== undefined
        ? (body instanceof FormData ? body : JSON.stringify(body))
        : undefined
    })
  } catch (networkErr) {
    throw new ApiError('No se pudo contactar al servidor.', 0, null)
  }

  const text = await response.text()
  let data = null
  if (text) {
    try { data = JSON.parse(text) } catch { data = text }
  }

  if (!response.ok) {
    const message = (data && data.error) || `Error HTTP ${response.status}`
    throw new ApiError(message, response.status, data)
  }

  return data
}

const get   = (path, opts)        => request(path, { ...opts, method: 'GET' })
const post  = (path, body, opts)  => request(path, { ...opts, method: 'POST',   body })
const put   = (path, body, opts)  => request(path, { ...opts, method: 'PUT',    body })
const patch = (path, body, opts)  => request(path, { ...opts, method: 'PATCH',  body })
const del   = (path, opts)        => request(path, { ...opts, method: 'DELETE' })

export const api = {
  // ── Auth ────────────────────────────────────────────────
  auth: {
    login:          (email, password) => post('/auth/login', { email, password }),
    me:             ()                => get('/auth/me', { auth: 'required' }),
    changePassword: (passwordActual, passwordNuevo) =>
      post('/auth/change-password', { passwordActual, passwordNuevo }, { auth: 'required' })
  },

  // ── Productos ───────────────────────────────────────────
  productos: {
    listar:     (filtros = {}) => {
      const qs = new URLSearchParams()
      if (filtros.categoria) qs.set('categoria', filtros.categoria)
      const suffix = qs.toString() ? `?${qs}` : ''
      return get(`/products${suffix}`)
    },
    categorias: ()             => get('/products/categorias'),
    obtener:    (id)           => get(`/products/${id}`),
    crear:      (payload)      => post('/products', payload, { auth: 'required' }),
    actualizar: (id, payload)  => put(`/products/${id}`, payload, { auth: 'required' }),
    eliminar:   (id)           => del(`/products/${id}`, { auth: 'required' })
  },

  // ── Sucursales ──────────────────────────────────────────
  sucursales: {
    listar:     (filtros = {}) => {
      const qs = new URLSearchParams()
      if (filtros.activa !== undefined) qs.set('activa', filtros.activa)
      if (filtros.region) qs.set('region', filtros.region)
      const suffix = qs.toString() ? `?${qs}` : ''
      return get(`/sucursales${suffix}`)
    },
    obtener:    (id)          => get(`/sucursales/${id}`),
    crear:      (payload)     => post('/sucursales', payload, { auth: 'required' }),
    actualizar: (id, payload) => put(`/sucursales/${id}`, payload, { auth: 'required' }),
    eliminar:   (id)          => del(`/sucursales/${id}`, { auth: 'required' })
  },

  // ── Clientes ────────────────────────────────────────────
  clientes: {
    registrar:  (payload)      => post('/clientes/registro', payload),
    miPerfil:   ()             => get('/clientes/mi-perfil', { auth: 'required' }),
    listar:     ()             => get('/clientes', { auth: 'required' }),
    obtener:    (id)           => get(`/clientes/${id}`, { auth: 'required' }),
    actualizar: (id, payload)  => put(`/clientes/${id}`, payload, { auth: 'required' }),
    eliminar:   (id)           => del(`/clientes/${id}`, { auth: 'required' })
  },

  // ── Inventario ──────────────────────────────────────────
  inventario: {
    listar:        ()              => get('/inventory'),
    porSucursal:   (sucursalId)    => get(`/inventory/sucursal/${sucursalId}`),
    porProducto:   (productoId)    => get(`/inventory/producto/${productoId}`),
    actualizar:    (id, cantidad)  => patch(`/inventory/${id}`, { cantidad }, { auth: 'required' }),
    crear:         (payload)       => post('/inventory', payload, { auth: 'required' })
  },

  // ── Pedidos ─────────────────────────────────────────────
  pedidos: {
    crear:           (payload)        => post('/orders', payload, { auth: 'required' }),
    misPedidos:      ()               => get('/orders/mis-pedidos', { auth: 'required' }),
    listarTodos:     ()               => get('/orders', { auth: 'required' }),
    cambiarEstado:   (id, estado)     => patch(`/orders/${id}/estado`, { estado }, { auth: 'required' }),
    registrarEntrega:(id)             => patch(`/orders/${id}/entregar`, {}, { auth: 'required' }),
    cancelarMio:     (id, motivo)     => patch(`/orders/${id}/cancelar`, { motivo }, { auth: 'required' })
  },

  // ── Devoluciones (gestión de riesgos) ───────────────────
  devoluciones: {
    solicitar:        (pedidoId, motivo)  => post('/devoluciones', { pedido_id: pedidoId, motivo }, { auth: 'required' }),
    misDevoluciones:  ()                  => get('/devoluciones/mis-devoluciones', { auth: 'required' }),
    listar:           (filtros = {})      => {
      const qs = new URLSearchParams()
      if (filtros.estado) qs.set('estado', filtros.estado)
      const suffix = qs.toString() ? `?${qs}` : ''
      return get(`/devoluciones${suffix}`, { auth: 'required' })
    },
    obtener:          (id)                => get(`/devoluciones/${id}`, { auth: 'required' }),
    aprobar:          (id, payload = {})  => patch(`/devoluciones/${id}/aprobar`, payload, { auth: 'required' }),
    rechazar:         (id, payload = {})  => patch(`/devoluciones/${id}/rechazar`, payload, { auth: 'required' }),
    procesar:         (id, payload = {})  => patch(`/devoluciones/${id}/procesar`, payload, { auth: 'required' })
  },

  // ── Pagos ───────────────────────────────────────────────
  pagos: {
    listar:        (filtros = {})   => {
      const qs = new URLSearchParams()
      if (filtros.estado) qs.set('estado', filtros.estado)
      if (filtros.metodo) qs.set('metodo', filtros.metodo)
      const suffix = qs.toString() ? `?${qs}` : ''
      return get(`/pagos${suffix}`, { auth: 'required' })
    },
    pendientes:    ()                  => get('/pagos/pendientes', { auth: 'required' }),
    obtener:       (id)                => get(`/pagos/${id}`, { auth: 'required' }),
    crear:         (pedidoId, metodo)  => post('/pagos', { pedido_id: pedidoId, metodo }, { auth: 'required' }),
    confirmar:     (id)                => patch(`/pagos/${id}/confirmar`, {}, { auth: 'required' }),
    rechazar:      (id)                => patch(`/pagos/${id}/rechazar`, {}, { auth: 'required' })
  },

  // ── Boletas ─────────────────────────────────────────────
  boletas: {
    listar:        ()         => get('/boletas', { auth: 'required' }),
    obtener:       (id)       => get(`/boletas/${id}`, { auth: 'required' }),
    porPedido:     (pedidoId) => get(`/boletas/pedido/${pedidoId}`, { auth: 'required' }),
    emitir:        (pedidoId) => post('/boletas', { pedido_id: pedidoId }, { auth: 'required' })
  },

  // ── Reportes ────────────────────────────────────────────
  reportes: {
    ventasMes:            (anio, mes) => {
      const qs = new URLSearchParams()
      if (anio) qs.set('anio', anio)
      if (mes)  qs.set('mes', mes)
      const suffix = qs.toString() ? `?${qs}` : ''
      return get(`/reportes/ventas-mes${suffix}`, { auth: 'required' })
    },
    ventasPorSucursal:    () => get('/reportes/ventas-por-sucursal', { auth: 'required' }),
    productosMasVendidos: (limite = 10) => get(`/reportes/productos-mas-vendidos?limite=${limite}`, { auth: 'required' }),
    stockBajo:            (umbral = 5) => get(`/reportes/stock-bajo?umbral=${umbral}`, { auth: 'required' })
  },

  // ── Currency (API externa) ──────────────────────────────
  currency: {
    dolar: () => get('/currency/dolar')
  },

  // ── Payment (Transbank) ─────────────────────────────────
  payment: {
    create:  (payload) => post('/payment/create', payload, { auth: 'required' }),
    commit:  (token)   => post('/payment/commit', { token_ws: token })
  }
}

export { ApiError, BASE_URL }
