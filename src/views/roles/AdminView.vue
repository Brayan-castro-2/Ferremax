<template>
  <DashboardShell title="Administración" :links="shellLinks">
    <div class="mx-auto max-w-6xl">

      <!-- Header -->
      <header class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">Panel</p>
          <h1 class="mt-2 font-sora text-4xl font-semibold tracking-tight text-primary">Administración</h1>
          <p class="mt-2 text-on-surface-variant">Vista global del sistema FERREMAS — KPIs, clientes, reportes.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 font-geist text-xs font-semibold uppercase tracking-wider text-on-primary">
          Administrador
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
      <div v-else-if="errorMsg" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700" role="alert">
        <p class="font-semibold">No pude cargar el panel.</p>
        <p class="mt-1 text-sm">{{ errorMsg }}</p>
        <button class="mt-4 rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-red-500/20" @click="cargarTodo">Reintentar</button>
      </div>

      <template v-else>
        <!-- KPIs -->
        <div class="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div v-for="k in kpis" :key="k.label" class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 transition hover:border-primary/30 hover:shadow-ambient">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">{{ k.label }}</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ k.value }}</p>
            <p v-if="k.hint" class="mt-2 text-xs text-on-surface-variant">{{ k.hint }}</p>
          </div>
        </div>

        <!-- Tabla clientes -->
        <section class="mb-10 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/40 px-6 py-4">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Tabla independiente</p>
              <h2 class="mt-1 font-sora text-xl font-semibold text-primary">Clientes registrados</h2>
            </div>
            <span class="rounded-full bg-primary/10 px-3 py-1 font-geist text-xs font-semibold text-primary">
              {{ clientes.length }} clientes
            </span>
          </div>

          <div v-if="clientes.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
            No hay clientes registrados aún. Los nuevos clientes aparecen aquí al registrarse.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th class="px-6 py-3">Nombre</th>
                  <th class="px-6 py-3">Email</th>
                  <th class="px-6 py-3">Dirección</th>
                  <th class="px-6 py-3">Teléfono</th>
                  <th class="px-6 py-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/30">
                <tr v-for="c in clientes" :key="c.id" class="transition hover:bg-surface-container-low/50">
                  <td class="px-6 py-4 font-medium text-on-surface">{{ c.nombre }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ c.email }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ c.direccion || '—' }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ c.telefono || '—' }}</td>
                  <td class="px-6 py-4 text-right">
                    <span :class="c.activo ? 'bg-emerald-500/15 text-emerald-700' : 'bg-red-500/15 text-red-700'" class="inline-flex rounded-full px-3 py-1 font-geist text-[10px] font-semibold uppercase tracking-wider">
                      {{ c.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Sucursales overview -->
        <section class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-sora text-xl font-semibold text-primary">Red de sucursales</h2>
            <RouterLink to="/sucursales" class="font-geist text-xs uppercase tracking-wider text-primary hover:underline">Ver todas →</RouterLink>
          </div>
          <div class="grid grid-cols-2 gap-3 md:grid-cols-4">
            <RouterLink
              v-for="s in sucursales"
              :key="s.id"
              :to="`/sucursales/${s.id}/stock`"
              class="rounded-xl border border-outline-variant/40 bg-surface-container-low p-4 transition hover:border-primary/30"
            >
              <p class="font-geist text-[10px] font-semibold uppercase tracking-wider text-tertiary">{{ s.region }}</p>
              <p class="mt-1 font-sora text-sm font-semibold">{{ s.nombre }}</p>
              <p class="text-xs text-on-surface-variant">{{ s.ciudad }}</p>
            </RouterLink>
          </div>
        </section>
      </template>
    </div>
  </DashboardShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import DashboardShell from '@/components/layout/DashboardShell.vue'
import { api } from '@/lib/api.js'

const shellLinks = [
  { label: 'Administración', to: '/admin' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Sucursales', to: '/sucursales' }
]

const cargando = ref(true)
const errorMsg = ref('')
const clientes = ref([])
const sucursales = ref([])
const ventasMes = ref(0)
const stockBajo = ref(0)
const pedidosActivos = ref(0)

const kpis = computed(() => [
  { label: 'Ventas del mes', value: `$${ventasMes.value.toLocaleString('es-CL')}`, hint: 'Todos los pedidos no cancelados' },
  { label: 'Pedidos activos', value: String(pedidosActivos.value), hint: 'En proceso' },
  { label: 'Clientes registrados', value: String(clientes.value.length), hint: 'Tabla clientes' },
  { label: 'Productos stock bajo', value: String(stockBajo.value), hint: 'Menos de 5 uds.' }
])

async function cargarTodo() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const [clientesData, sucursalesData, ventasData, stockBajoData, pedidosData] = await Promise.all([
      api.clientes.listar().catch(() => ({ clientes: [] })),
      api.sucursales.listar({ activa: true }).catch(() => ({ sucursales: [] })),
      api.reportes.ventasMes().catch(() => ({ totalFacturado: 0 })),
      api.reportes.stockBajo(5).catch(() => ({ totalProductos: 0 })),
      api.pedidos.listarTodos().catch(() => ({ pedidos: [] }))
    ])

    clientes.value = clientesData.clientes || []
    sucursales.value = sucursalesData.sucursales || []
    ventasMes.value = ventasData.totalFacturado || 0
    stockBajo.value = stockBajoData.totalProductos || 0
    pedidosActivos.value = (pedidosData.pedidos || []).filter(p =>
      !['cancelado', 'entregado'].includes(p.estado)
    ).length
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargarTodo)
</script>
