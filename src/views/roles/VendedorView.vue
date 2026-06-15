<template>
  <DashboardShell title="Ventas" :links="shellLinks">
    <div class="mx-auto max-w-6xl">

      <!-- Header -->
      <header class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">Panel</p>
          <h1 class="mt-2 font-sora text-4xl font-semibold tracking-tight text-primary">Ventas</h1>
          <p class="mt-2 text-on-surface-variant">Aprueba o rechaza pedidos · Gestiona facturación.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-tertiary px-4 py-2 font-geist text-xs font-semibold uppercase tracking-wider text-on-tertiary">
          Vendedor
        </span>
      </header>

      <!-- Loading / Error -->
      <div v-if="cargando" class="space-y-3">
        <div v-for="n in 4" :key="n" class="h-20 animate-pulse rounded-xl bg-surface-container-low" />
      </div>

      <div v-else-if="errorMsg" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">{{ errorMsg }}</p>
        <button class="mt-3 rounded-full border border-red-500/40 px-4 py-1.5 text-xs uppercase tracking-wider transition hover:bg-red-500/20" @click="cargarPedidos">Reintentar</button>
      </div>

      <!-- Tabla pedidos -->
      <section v-else class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-6 py-4">
          <h2 class="font-sora text-xl font-semibold text-primary">Pedidos ({{ pedidos.length }})</h2>
          <button class="rounded-full border border-outline-variant px-4 py-1.5 font-geist text-xs uppercase tracking-wider transition hover:border-primary hover:text-primary" @click="cargarPedidos">
            Refrescar
          </button>
        </div>

        <div v-if="pedidos.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
          No hay pedidos registrados.
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
              <tr>
                <th class="px-6 py-3">#</th>
                <th class="px-6 py-3">Cliente</th>
                <th class="px-6 py-3">Total</th>
                <th class="px-6 py-3">Entrega</th>
                <th class="px-6 py-3">Estado</th>
                <th class="px-6 py-3">Fecha</th>
                <th class="px-6 py-3">Cambiar estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-outline-variant/30">
              <tr v-for="p in pedidos" :key="p.id" class="transition hover:bg-surface-container-low/50">
                <td class="px-6 py-4 font-mono text-xs text-on-surface-variant">#{{ p.id }}</td>
                <td class="px-6 py-4">
                  <p class="font-medium text-on-surface">{{ p.cliente_nombre || p.usuarios?.nombre || '—' }}</p>
                  <p class="text-xs text-on-surface-variant">{{ p.cliente_email || p.usuarios?.email || '' }}</p>
                </td>
                <td class="px-6 py-4 font-semibold text-primary">${{ formatPrice(p.total) }}</td>
                <td class="px-6 py-4 text-on-surface-variant">{{ p.tipo_entrega === 'despacho' ? 'Despacho' : 'Retiro' }}</td>
                <td class="px-6 py-4">
                  <span :class="estadoBadge(p.estado)" class="rounded-full px-3 py-1 font-geist text-[10px] font-semibold uppercase tracking-wider">
                    {{ p.estado }}
                  </span>
                </td>
                <td class="px-6 py-4 text-xs text-on-surface-variant">{{ formatFecha(p.creado_en) }}</td>
                <td class="px-6 py-4">
                  <select
                    :value="p.estado"
                    @change="cambiarEstado(p, $event)"
                    class="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-1.5 text-xs focus:border-primary focus:outline-none"
                  >
                    <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </DashboardShell>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DashboardShell from '@/components/layout/DashboardShell.vue'
import { api } from '@/lib/api.js'

const shellLinks = [
  { label: 'Ventas', to: '/vendedor' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Sucursales', to: '/sucursales' }
]

const estados = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado']
const pedidos = ref([])
const cargando = ref(true)
const errorMsg = ref('')

async function cargarPedidos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const data = await api.pedidos.listarTodos()
    pedidos.value = data.pedidos || []
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(pedido, event) {
  const nuevoEstado = event.target.value
  const estadoAnterior = pedido.estado
  try {
    await api.pedidos.cambiarEstado(pedido.id, nuevoEstado)
    pedido.estado = nuevoEstado
  } catch (err) {
    alert(`Error al cambiar estado: ${err.message}`)
    event.target.value = estadoAnterior
  }
}

function formatPrice(val) { return Number(val || 0).toLocaleString('es-CL') }
function formatFecha(fecha) {
  return fecha ? new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
function estadoBadge(e) {
  const map = {
    pendiente:  'bg-yellow-500/15 text-yellow-700',
    confirmado: 'bg-blue-500/15 text-blue-700',
    en_proceso: 'bg-blue-500/15 text-blue-700',
    enviado:    'bg-indigo-500/15 text-indigo-700',
    entregado:  'bg-emerald-500/15 text-emerald-700',
    cancelado:  'bg-red-500/15 text-red-700'
  }
  return map[e] || 'bg-surface-container-low text-on-surface-variant'
}

onMounted(cargarPedidos)
</script>
