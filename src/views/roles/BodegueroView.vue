<template>
  <DashboardShell title="Bodega" :links="shellLinks">
    <div class="mx-auto max-w-6xl">

      <header class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-tertiary">Panel</p>
          <h1 class="mt-2 font-sora text-4xl font-semibold tracking-tight text-primary">Bodega</h1>
          <p class="mt-2 text-on-surface-variant">Control de inventario por sucursal.</p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-blue-600 px-4 py-2 font-geist text-xs font-semibold uppercase tracking-wider text-white">
          Bodeguero
        </span>
      </header>

      <!-- Selector sucursal -->
      <div class="mb-8 flex flex-wrap items-center gap-3">
        <label class="font-geist text-xs uppercase tracking-wider text-on-surface-variant">Filtrar por sucursal:</label>
        <select
          v-model="sucursalSeleccionada"
          class="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-sm focus:border-primary focus:outline-none"
          @change="cargarInventario"
        >
          <option value="">Todas las sucursales</option>
          <option v-for="s in sucursales" :key="s.id" :value="s.id">{{ s.nombre }} — {{ s.ciudad }}</option>
        </select>
      </div>

      <!-- Loading -->
      <div v-if="cargando" class="space-y-3">
        <div v-for="n in 3" :key="n" class="h-20 animate-pulse rounded-xl bg-surface-container-low" />
      </div>

      <!-- Error -->
      <div v-else-if="errorMsg" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">{{ errorMsg }}</p>
        <button class="mt-3 rounded-full border border-red-500/40 px-4 py-1.5 text-xs uppercase tracking-wider transition hover:bg-red-500/20" @click="cargarInventario">Reintentar</button>
      </div>

      <template v-else>
        <!-- KPIs -->
        <div class="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Registros</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ inventario.length }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Unidades totales</p>
            <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ unidadesTotales }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Stock crítico (<5)</p>
            <p class="mt-2 font-sora text-3xl font-semibold" :class="stockCriticoCount > 0 ? 'text-yellow-700' : 'text-primary'">
              {{ stockCriticoCount }}
            </p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Sin stock (0)</p>
            <p class="mt-2 font-sora text-3xl font-semibold" :class="sinStockCount > 0 ? 'text-red-700' : 'text-primary'">
              {{ sinStockCount }}
            </p>
          </div>
        </div>

        <!-- Tabla inventario -->
        <section class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest overflow-hidden">
          <div class="border-b border-outline-variant/40 px-6 py-4">
            <h2 class="font-sora text-xl font-semibold text-primary">
              {{ sucursalSeleccionada ? sucursalNombre : 'Inventario completo (todas las sucursales)' }}
            </h2>
          </div>

          <div v-if="inventario.length === 0" class="px-6 py-10 text-center text-sm text-on-surface-variant">
            Sin registros en esta sucursal.
          </div>

          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
                <tr>
                  <th class="px-6 py-3">Producto</th>
                  <th class="px-6 py-3">Categoría</th>
                  <th v-if="!sucursalSeleccionada" class="px-6 py-3">Sucursal</th>
                  <th class="px-6 py-3">Ubicación</th>
                  <th class="px-6 py-3 text-right">Cantidad</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/30">
                <tr v-for="item in inventario" :key="item.id" class="transition hover:bg-surface-container-low/50">
                  <td class="px-6 py-4">
                    <p class="font-medium text-on-surface">{{ item.productos?.nombre || '—' }}</p>
                    <p class="text-xs text-on-surface-variant">SKU #{{ item.producto_id }}</p>
                  </td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ item.productos?.categoria || '—' }}</td>
                  <td v-if="!sucursalSeleccionada" class="px-6 py-4 text-on-surface-variant">{{ item.sucursales?.nombre || '—' }}</td>
                  <td class="px-6 py-4 text-on-surface-variant">{{ item.ubicacion || '—' }}</td>
                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center rounded-full px-3 py-1 font-geist text-xs font-semibold" :class="badgeColor(item.cantidad)">
                      {{ item.cantidad }}
                    </span>
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
  { label: 'Bodega', to: '/bodeguero' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
  { label: 'Sucursales', to: '/sucursales' }
]

const sucursales = ref([])
const sucursalSeleccionada = ref('')
const inventario = ref([])
const cargando = ref(true)
const errorMsg = ref('')

const unidadesTotales = computed(() => inventario.value.reduce((acc, i) => acc + (i.cantidad || 0), 0))
const stockCriticoCount = computed(() => inventario.value.filter(i => i.cantidad > 0 && i.cantidad < 5).length)
const sinStockCount = computed(() => inventario.value.filter(i => i.cantidad === 0).length)
const sucursalNombre = computed(() => {
  const s = sucursales.value.find(x => x.id == sucursalSeleccionada.value)
  return s ? `${s.nombre} — ${s.ciudad}` : ''
})

function badgeColor(cantidad) {
  if (cantidad === 0) return 'bg-red-500/15 text-red-700'
  if (cantidad < 5) return 'bg-yellow-500/15 text-yellow-700'
  return 'bg-emerald-500/15 text-emerald-700'
}

async function cargarSucursales() {
  try {
    const data = await api.sucursales.listar({ activa: true })
    sucursales.value = data.sucursales || []
  } catch {
    sucursales.value = []
  }
}

async function cargarInventario() {
  cargando.value = true
  errorMsg.value = ''
  try {
    if (sucursalSeleccionada.value) {
      const data = await api.inventario.porSucursal(sucursalSeleccionada.value)
      inventario.value = data.inventario || []
    } else {
      const data = await api.inventario.listar()
      inventario.value = data.inventario || []
    }
  } catch (err) {
    errorMsg.value = err.message
    inventario.value = []
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargarSucursales()
  await cargarInventario()
})
</script>
