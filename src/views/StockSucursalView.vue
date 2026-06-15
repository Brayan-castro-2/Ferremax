<template>
  <main class="bg-surface font-inter text-on-surface">
    <!-- Header de sucursal -->
    <section class="border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-lowest/80 to-surface pb-10 pt-10 md:pb-14 md:pt-14">
      <div class="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <RouterLink
          to="/sucursales"
          class="inline-flex items-center gap-1.5 font-geist text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant transition hover:text-primary"
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
          Volver a sucursales
        </RouterLink>

        <div v-if="cargando" class="mt-6">
          <div class="h-10 w-2/3 animate-pulse rounded-md bg-surface-container-low" />
          <div class="mt-3 h-5 w-1/2 animate-pulse rounded-md bg-surface-container-low" />
        </div>

        <div v-else-if="data?.sucursal" class="mt-6">
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary">{{ data.sucursal.region }}</p>
          <h1 class="mt-3 font-sora text-3xl font-semibold leading-[1.1] tracking-tight text-primary md:text-4xl lg:text-5xl">
            {{ data.sucursal.nombre }}
          </h1>
          <p class="mt-2 text-sm text-on-surface-variant md:text-base">{{ data.sucursal.ciudad }}</p>
        </div>
      </div>
    </section>

    <!-- KPIs -->
    <section v-if="!cargando && data" class="mx-auto max-w-container-max px-margin-mobile pt-10 md:px-margin-desktop">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Productos en bodega</p>
          <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ data.totalRegistros }}</p>
        </div>
        <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Unidades totales</p>
          <p class="mt-2 font-sora text-3xl font-semibold text-primary">{{ data.cantidadTotal }}</p>
        </div>
        <div class="col-span-2 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5 md:col-span-1">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Promedio por SKU</p>
          <p class="mt-2 font-sora text-3xl font-semibold text-primary">
            {{ data.totalRegistros > 0 ? Math.round(data.cantidadTotal / data.totalRegistros) : 0 }}
          </p>
        </div>
      </div>
    </section>

    <!-- Tabla de inventario -->
    <section class="mx-auto max-w-container-max px-margin-mobile py-10 md:px-margin-desktop md:py-12">
      <h2 class="font-sora text-2xl font-semibold text-primary">Inventario detallado</h2>

      <div v-if="cargando" class="mt-6">
        <div v-for="n in 6" :key="n" class="mb-3 h-16 animate-pulse rounded-xl bg-surface-container-low" />
      </div>

      <div v-else-if="errorMsg" class="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">No pude cargar el inventario.</p>
        <p class="mt-1 text-sm">{{ errorMsg }}</p>
        <button class="mt-4 rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-red-500/20" @click="cargar">
          Reintentar
        </button>
      </div>

      <div v-else-if="data?.inventario?.length === 0" class="mt-12 rounded-2xl border border-dashed border-outline-variant/60 p-10 text-center">
        <p class="font-sora text-xl font-semibold text-primary">Sin stock registrado</p>
        <p class="mt-2 text-sm text-on-surface-variant">
          Esta sucursal aún no tiene productos asignados.
        </p>
      </div>

      <div v-else class="mt-6 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
        <table class="w-full text-sm">
          <thead class="bg-surface-container-low text-left font-geist text-[10px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            <tr>
              <th class="px-5 py-3">Producto</th>
              <th class="px-5 py-3">Categoría</th>
              <th class="px-5 py-3">Ubicación</th>
              <th class="px-5 py-3 text-right">Cantidad</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-outline-variant/30">
            <tr v-for="item in data.inventario" :key="item.id" class="transition hover:bg-surface-container-low/50">
              <td class="px-5 py-4">
                <p class="font-inter font-medium text-on-surface">{{ item.productos?.nombre || '—' }}</p>
                <p class="text-xs text-on-surface-variant">SKU #{{ item.producto_id }}</p>
              </td>
              <td class="px-5 py-4 text-on-surface-variant">{{ item.productos?.categoria || '—' }}</td>
              <td class="px-5 py-4 text-on-surface-variant">{{ item.ubicacion || '—' }}</td>
              <td class="px-5 py-4 text-right">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 font-geist text-xs font-semibold"
                  :class="badgeColor(item.cantidad)"
                >
                  {{ item.cantidad }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/lib/api.js'

const route = useRoute()
const data = ref(null)
const cargando = ref(true)
const errorMsg = ref('')

function badgeColor(cantidad) {
  if (cantidad === 0) return 'bg-red-500/15 text-red-700'
  if (cantidad < 5)   return 'bg-yellow-500/15 text-yellow-700'
  return 'bg-emerald-500/15 text-emerald-700'
}

async function cargar() {
  cargando.value = true
  errorMsg.value = ''
  try {
    data.value = await api.inventario.porSucursal(route.params.id)
  } catch (err) {
    errorMsg.value = err.message
    data.value = null
  } finally {
    cargando.value = false
  }
}

watch(() => route.params.id, (newId) => { if (newId) cargar() })
onMounted(cargar)
</script>
