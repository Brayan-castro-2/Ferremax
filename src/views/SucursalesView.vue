<template>
  <main class="bg-surface font-inter text-on-surface">
    <!-- Hero -->
    <section class="border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-lowest/80 to-surface pb-12 pt-12 md:pb-16 md:pt-16">
      <div class="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary">Red FERREMAS</p>
        <h1 class="mt-4 font-sora text-4xl font-semibold leading-[1.05] tracking-tight text-primary md:text-5xl lg:text-6xl">
          7 sucursales para construir cerca tuyo.
        </h1>
        <p class="mt-5 max-w-2xl text-base leading-relaxed text-on-surface-variant md:text-lg">
          4 tiendas en la Región Metropolitana y 3 en regiones —
          consulta el stock real de cada sucursal en un click.
        </p>
      </div>
    </section>

    <!-- Filtros -->
    <section class="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="reg in regionesDisponibles"
          :key="reg"
          type="button"
          class="rounded-full border px-4 py-2 font-geist text-[10px] font-semibold uppercase tracking-[0.14em] transition"
          :class="regionActiva === reg
            ? 'border-primary bg-primary text-on-primary shadow-ambient'
            : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:border-primary/25 hover:text-primary'"
          @click="regionActiva = reg"
        >
          {{ reg }}
        </button>
      </div>
    </section>

    <!-- Loading -->
    <section v-if="cargando" class="mx-auto max-w-container-max px-margin-mobile py-8 md:px-margin-desktop">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="n in 6" :key="n" class="h-[200px] animate-pulse rounded-2xl bg-surface-container-low" />
      </div>
    </section>

    <!-- Error -->
    <section v-else-if="errorMsg" class="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <div class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">No pude cargar las sucursales.</p>
        <p class="mt-1 text-sm">{{ errorMsg }}</p>
        <button class="mt-4 rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-red-500/20" @click="cargar">
          Reintentar
        </button>
      </div>
    </section>

    <!-- Grid sucursales -->
    <section v-else class="mx-auto max-w-container-max px-margin-mobile pb-20 md:px-margin-desktop">
      <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="s in sucursalesFiltradas"
          :key="s.id"
          :to="`/sucursales/${s.id}/stock`"
          class="group relative flex flex-col gap-4 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-ambient"
        >
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">{{ s.region }}</p>
              <h3 class="mt-1 font-sora text-xl font-semibold text-primary">{{ s.nombre }}</h3>
            </div>
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary transition group-hover:bg-primary group-hover:text-on-primary"
              aria-hidden="true"
            >
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
            </span>
          </div>

          <div class="space-y-2 text-sm text-on-surface-variant">
            <p class="flex items-start gap-2">
              <svg class="mt-0.5 h-4 w-4 shrink-0 text-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s-7-7.58-7-13a7 7 0 0 1 14 0c0 5.42-7 13-7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
              <span>{{ s.direccion }}</span>
            </p>
            <p class="flex items-center gap-2">
              <svg class="h-4 w-4 text-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 5a2 2 0 0 1 2-2h2l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v2a2 2 0 0 1-2 2A18 18 0 0 1 3 5z" /></svg>
              <span>{{ s.telefono || 'Sin teléfono' }}</span>
            </p>
            <p class="flex items-center gap-2">
              <svg class="h-4 w-4 text-outline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>
              <span>{{ s.ciudad }}</span>
            </p>
          </div>

          <p class="mt-2 font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-primary opacity-0 transition group-hover:opacity-100">
            Ver stock real →
          </p>
        </RouterLink>
      </div>

      <p v-if="sucursalesFiltradas.length === 0" class="mt-16 text-center text-on-surface-variant">
        Ninguna sucursal en esta región.
      </p>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/lib/api.js'

const sucursales = ref([])
const cargando = ref(true)
const errorMsg = ref('')
const regionActiva = ref('Todas')

const regionesDisponibles = computed(() => {
  const regs = [...new Set(sucursales.value.map((s) => s.region).filter(Boolean))]
  return ['Todas', ...regs.sort()]
})

const sucursalesFiltradas = computed(() => {
  if (regionActiva.value === 'Todas') return sucursales.value
  return sucursales.value.filter((s) => s.region === regionActiva.value)
})

async function cargar() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const data = await api.sucursales.listar({ activa: true })
    sucursales.value = data.sucursales || []
  } catch (err) {
    errorMsg.value = err.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>
