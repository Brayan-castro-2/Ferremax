<template>
  <DashboardShell title="Finanzas" :links="shellLinks">
    <div class="mx-auto max-w-6xl">

      <header class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">Panel</p>
          <h1 class="mt-2 font-sora text-4xl font-semibold tracking-tight text-primary">Finanzas</h1>
          <p class="mt-2 text-on-surface-variant">Confirma pagos por transferencia · Registra entregas · Reportes.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 font-geist text-xs font-semibold uppercase tracking-wider text-white">
          Contador
        </span>
      </header>

      <!-- Loading -->
      <template v-if="cargando">
        <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded-2xl bg-surface-container-low" />
        </div>
        <div class="h-64 animate-pulse rounded-2xl bg-surface-container-low" />
      </template>

      <!-- Error -->
      <div v-else-if="errorMsg" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">{{ errorMsg }}</p>
        <button class="mt-3 rounded-full border border-red-500/40 px-4 py-1.5 text-xs uppercase tracking-wider transition hover:bg-red-500/20" @click="cargarTodo">Reintentar</button>
      </div>

      <template v-else>
        <!-- KPIs -->
        <div class="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Ventas del mes</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">${{ ventasMes.toLocaleString('es-CL') }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Pagos por confirmar</p>
            <p class="mt-2 font-sora text-3xl font-semibold" :class="pagosPendientes.length > 0 ? 'text-yellow-700' : 'text-primary'">
              {{ pagosPendientes.length }}
            </p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Pedidos por entregar</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ pedidosPorEntregar.length }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Total pedidos mes</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ pedidosMes }}</p>
          </div>
        </div>

        <!-- Pagos pendientes (Vista Contador caso profe) -->
        <section class="mb-8 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-6 py-4">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Caso de uso ★</p>
              <h2 class="mt-1 font-sora text-xl font-semibold text-primary">Confirmar pagos por transferencia</h2>
            </div>
            <span class="rounded-full bg-yellow-500/15 px-3 py-1 font-geist text-xs font-semibold text-yellow-700">
              {{ pagosPendientes.length }} pendientes
            </span>
          </div>

          <div v-if="pagosPendientes.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
            No hay pagos pendientes de confirmación.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th class="px-6 py-3">Pago #</th>
                  <th class="px-6 py-3">Pedido</th>
                  <th class="px-6 py-3">Método</th>
                  <th class="px-6 py-3">Fecha</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/30">
                <tr v-for="p in pagosPendientes" :key="p.id" class="transition hover:bg-surface-container-low/50">
                  <td class="px-6 py-4 font-mono text-xs text-on-surface-variant">#{{ p.id }}</td>
                  <td class="px-6 py-4">
                    <p class="font-medium text-on-surface">#{{ p.pedido_id }}</p>
                    <p class="text-xs text-on-surface-variant">${{ formatPrice(p.pedidos?.total) }}</p>
                  </td>
                  <td class="px-6 py-4 text-on-surface-variant capitalize">{{ p.metodo }}</td>
                  <td class="px-6 py-4 text-xs text-on-surface-variant">{{ formatFecha(p.fecha) }}</td>
                  <td class="px-6 py-4">
                    <div class="flex justify-end gap-2">
                      <button
                        class="rounded-lg bg-emerald-600 px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        :disabled="procesando === p.id"
                        @click="confirmar(p)"
                      >
                        Confirmar
                      </button>
                      <button
                        class="rounded-lg border border-red-500/40 px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-red-700 transition hover:bg-red-500/10 disabled:opacity-50"
                        :disabled="procesando === p.id"
                        @click="rechazar(p)"
                      >
                        Rechazar
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
        <!-- Pedidos por entregar (Vista Contador caso profe) -->
        <section class="mb-8 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
          <div class="border-b border-outline-variant/40 px-6 py-4">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Caso de uso ★</p>
            <h2 class="mt-1 font-sora text-xl font-semibold text-primary">Registrar entrega de pedidos</h2>
          </div>

          <div v-if="pedidosPorEntregar.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
            No hay pedidos en estado "enviado" pendientes de entrega.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th class="px-6 py-3">Pedido #</th>
                  <th class="px-6 py-3">Cliente</th>
                  <th class="px-6 py-3">Total</th>
                  <th class="px-6 py-3">Tipo</th>
                  <th class="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/30">
                <tr v-for="p in pedidosPorEntregar" :key="p.id" class="transition hover:bg-surface-container-low/50">
                  <td class="px-6 py-4 font-mono text-xs">#{{ p.id }}</td>
                  <td class="px-6 py-4">
                    <p class="font-medium">{{ p.cliente_nombre || p.usuarios?.nombre || '—' }}</p>
                  </td>
                  <td class="px-6 py-4 font-semibold text-primary">${{ formatPrice(p.total) }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ p.tipo_entrega }}</td>
                  <td class="px-6 py-4 text-right">
                    <button
                      class="rounded-lg bg-primary px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-on-primary transition hover:opacity-90 disabled:opacity-50"
                      :disabled="procesando === p.id"
                      @click="registrarEntrega(p)"
                    >
                      Registrar entrega
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Devoluciones (gestión de riesgos) -->
        <section class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-6 py-4">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Gestión de riesgos</p>
              <h2 class="mt-1 font-sora text-xl font-semibold text-primary">Devoluciones / Reembolsos</h2>
            </div>
            <span class="rounded-full bg-tertiary/15 px-3 py-1 font-geist text-xs font-semibold text-tertiary">
              {{ devolucionesPendientes.length }} solicitudes activas
            </span>
          </div>

          <div v-if="devoluciones.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
            No hay solicitudes de devolución registradas.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th class="px-6 py-3">#</th>
                  <th class="px-6 py-3">Pedido</th>
                  <th class="px-6 py-3">Motivo</th>
                  <th class="px-6 py-3">Fecha</th>
                  <th class="px-6 py-3">Estado</th>
                  <th class="px-6 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/30">
                <tr v-for="d in devoluciones" :key="d.id" class="transition hover:bg-surface-container-low/50">
                  <td class="px-6 py-4 font-mono text-xs">#{{ d.id }}</td>
                  <td class="px-6 py-4">
                    <p class="font-medium">#{{ d.pedido_id }}</p>
                    <p class="text-xs text-on-surface-variant">${{ formatPrice(d.pedidos?.total) }}</p>
                  </td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ truncate(d.motivo, 50) }}</td>
                  <td class="px-6 py-4 text-xs text-on-surface-variant">{{ formatFecha(d.fecha_solicitud) }}</td>
                  <td class="px-6 py-4">
                    <span class="rounded-full px-3 py-1 font-geist text-[10px] font-semibold uppercase tracking-wider" :class="devBadge(d.estado)">
                      {{ d.estado }}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-right">
                    <div v-if="d.estado === 'solicitada'" class="flex justify-end gap-2">
                      <button
                        class="rounded-lg bg-emerald-600 px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-white transition hover:bg-emerald-700 disabled:opacity-50"
                        :disabled="procesandoDev === d.id"
                        @click="aprobarDevolucion(d)"
                      >
                        Aprobar
                      </button>
                      <button
                        class="rounded-lg border border-red-500/40 px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-red-700 transition hover:bg-red-500/10 disabled:opacity-50"
                        :disabled="procesandoDev === d.id"
                        @click="rechazarDevolucion(d)"
                      >
                        Rechazar
                      </button>
                    </div>
                    <button
                      v-else-if="d.estado === 'aprobada'"
                      class="rounded-lg bg-primary px-3 py-1.5 font-geist text-xs uppercase tracking-wider text-on-primary transition hover:opacity-90 disabled:opacity-50"
                      :disabled="procesandoDev === d.id"
                      @click="procesarDevolucion(d)"
                    >
                      Procesar reembolso
                    </button>
                    <span v-else class="text-xs text-on-surface-variant">Cerrada</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </div>
  </DashboardShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardShell from '@/components/layout/DashboardShell.vue'
import { api } from '@/lib/api.js'

const shellLinks = [
  { label: 'Finanzas', to: '/contador' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Sucursales', to: '/sucursales' }
]

const cargando = ref(true)
const errorMsg = ref('')
const procesando = ref(null)

const pagosPendientes = ref([])
const todosPedidos = ref([])
const ventasMes = ref(0)
const devoluciones = ref([])
const procesandoDev = ref(null)

const devolucionesPendientes = computed(() =>
  devoluciones.value.filter(d => ['solicitada', 'aprobada'].includes(d.estado))
)

const pedidosPorEntregar = computed(() =>
  todosPedidos.value.filter(p => p.estado === 'enviado' && !p.fecha_entrega)
)

const pedidosMes = computed(() => {
  const ahora = new Date()
  const mes = ahora.getMonth()
  const anio = ahora.getFullYear()
  return todosPedidos.value.filter(p => {
    if (!p.creado_en) return false
    const d = new Date(p.creado_en)
    return d.getMonth() === mes && d.getFullYear() === anio
  }).length
})

function formatPrice(val) { return Number(val || 0).toLocaleString('es-CL') }
function formatFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
}

async function cargarTodo() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const [pagosData, pedidosData, ventasData, devolucionesData] = await Promise.all([
      api.pagos.pendientes().catch(() => ({ pagos: [] })),
      api.pedidos.listarTodos().catch(() => ({ pedidos: [] })),
      api.reportes.ventasMes().catch(() => ({ totalFacturado: 0 })),
      api.devoluciones.listar().catch(() => ({ devoluciones: [] }))
    ])
    pagosPendientes.value = pagosData.pagos || []
    todosPedidos.value = pedidosData.pedidos || []
    ventasMes.value = ventasData.totalFacturado || 0
    devoluciones.value = devolucionesData.devoluciones || []
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}

function devBadge(e) {
  const map = {
    solicitada: 'bg-yellow-500/15 text-yellow-700',
    aprobada:   'bg-blue-500/15 text-blue-700',
    rechazada:  'bg-red-500/15 text-red-700',
    procesada:  'bg-emerald-500/15 text-emerald-700'
  }
  return map[e] || 'bg-surface-container-low text-on-surface-variant'
}

function truncate(s, n) {
  if (!s) return ''
  return s.length > n ? s.slice(0, n) + '…' : s
}

async function aprobarDevolucion(d) {
  procesandoDev.value = d.id
  try {
    const res = await api.devoluciones.aprobar(d.id)
    Object.assign(d, res.devolucion)
  } catch (err) {
    alert(`Error al aprobar: ${err.message}`)
  } finally {
    procesandoDev.value = null
  }
}

async function rechazarDevolucion(d) {
  const notas = prompt('Notas internas del rechazo (opcional):') || undefined
  procesandoDev.value = d.id
  try {
    const res = await api.devoluciones.rechazar(d.id, { notas_internas: notas })
    Object.assign(d, res.devolucion)
  } catch (err) {
    alert(`Error al rechazar: ${err.message}`)
  } finally {
    procesandoDev.value = null
  }
}

async function procesarDevolucion(d) {
  const montoStr = prompt(`Monto a reembolsar (CLP). Total del pedido: $${formatPrice(d.pedidos?.total)}`)
  if (montoStr === null) return
  const monto = Number(montoStr)
  if (isNaN(monto) || monto < 0) {
    alert('Ingresa un monto válido.')
    return
  }
  procesandoDev.value = d.id
  try {
    const res = await api.devoluciones.procesar(d.id, { monto_devuelto: monto })
    Object.assign(d, res.devolucion)
  } catch (err) {
    alert(`Error al procesar: ${err.message}`)
  } finally {
    procesandoDev.value = null
  }
}

async function confirmar(pago) {
  procesando.value = pago.id
  try {
    await api.pagos.confirmar(pago.id)
    pagosPendientes.value = pagosPendientes.value.filter(p => p.id !== pago.id)
  } catch (err) {
    alert(`Error al confirmar: ${err.message}`)
  } finally {
    procesando.value = null
  }
}

async function rechazar(pago) {
  if (!confirm(`¿Rechazar el pago #${pago.id}?`)) return
  procesando.value = pago.id
  try {
    await api.pagos.rechazar(pago.id)
    pagosPendientes.value = pagosPendientes.value.filter(p => p.id !== pago.id)
  } catch (err) {
    alert(`Error al rechazar: ${err.message}`)
  } finally {
    procesando.value = null
  }
}

async function registrarEntrega(pedido) {
  procesando.value = pedido.id
  try {
    await api.pedidos.registrarEntrega(pedido.id)
    const p = todosPedidos.value.find(x => x.id === pedido.id)
    if (p) { p.estado = 'entregado'; p.fecha_entrega = new Date().toISOString() }
  } catch (err) {
    alert(`Error al registrar entrega: ${err.message}`)
  } finally {
    procesando.value = null
  }
}

onMounted(cargarTodo)
</script>
