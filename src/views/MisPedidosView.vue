<template>
  <main class="bg-surface font-inter text-on-surface">
    <section class="border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-lowest/80 to-surface pb-12 pt-12 md:pt-14">
      <div class="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary">Cliente · {{ auth.user?.nombre }}</p>
        <h1 class="mt-4 font-sora text-4xl font-semibold leading-[1.05] tracking-tight text-primary md:text-5xl">
          Mis pedidos
        </h1>
        <p class="mt-3 text-on-surface-variant">
          Historial completo de tus compras en FERREMAS.
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <div v-if="cargando" class="grid grid-cols-1 gap-4">
        <div v-for="n in 3" :key="n" class="h-40 animate-pulse rounded-2xl bg-surface-container-low" />
      </div>

      <div v-else-if="errorMsg" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700">
        <p class="font-semibold">No pude cargar tus pedidos.</p>
        <p class="mt-1 text-sm">{{ errorMsg }}</p>
        <button class="mt-4 rounded-full border border-red-500/40 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition hover:bg-red-500/20" @click="cargarPedidos">Reintentar</button>
      </div>

      <div v-else-if="pedidos.length === 0" class="rounded-2xl border border-dashed border-outline-variant/60 p-12 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surface-container-low text-outline">
          <svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 7h15l-1.5 9H7.5L6 7z" /><path d="M6 7 5 3H2" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>
        </div>
        <p class="font-sora text-xl font-semibold text-primary">Aún no tienes pedidos</p>
        <p class="mt-2 text-sm text-on-surface-variant">¡Empieza explorando el catálogo!</p>
        <RouterLink to="/catalogo" class="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 font-geist text-xs uppercase tracking-widest text-on-primary transition hover:bg-primary/90">
          Ver catálogo
        </RouterLink>
      </div>

      <div v-else class="grid grid-cols-1 gap-5">
        <article
          v-for="p in pedidos"
          :key="p.id"
          class="overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest transition hover:border-primary/30 hover:shadow-ambient"
        >
          <!-- Cabecera -->
          <div class="flex flex-wrap items-start justify-between gap-3 border-b border-outline-variant/30 px-6 py-4">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Pedido #{{ p.id }}</p>
              <p class="mt-1 text-sm text-on-surface-variant">
                {{ formatFecha(p.creado_en) }} · {{ p.tipo_entrega === 'despacho' ? 'Despacho a domicilio' : 'Retiro en tienda' }}
              </p>
            </div>
            <span
              class="rounded-full px-3 py-1 font-geist text-[10px] font-semibold uppercase tracking-wider"
              :class="estadoBadge(p.estado)"
            >
              {{ p.estado }}
            </span>
          </div>

          <!-- Productos con foto -->
          <div class="px-6 py-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Productos</p>
            <ul class="mt-3 space-y-3">
              <li v-for="d in p.detalle_pedido || []" :key="d.id" class="flex items-center gap-4">
                <div class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low">
                  <img
                    v-if="d.productos?.imagen_url"
                    :src="d.productos.imagen_url"
                    :alt="d.productos?.nombre"
                    class="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <svg v-else class="h-8 w-8 text-outline opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 5 5 3-3 5 5" /><circle cx="9" cy="9" r="1.5" /></svg>
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-on-surface">{{ d.productos?.nombre || 'Producto' }}</p>
                  <p class="text-xs text-on-surface-variant">{{ d.productos?.categoria }} · {{ d.cantidad }} × ${{ formatPrice(d.precio_unitario) }}</p>
                </div>
                <p class="shrink-0 font-semibold text-primary">${{ formatPrice((d.precio_unitario || 0) * (d.cantidad || 0)) }}</p>
              </li>
              <li v-if="!p.detalle_pedido?.length" class="text-sm text-on-surface-variant">
                Sin detalle de productos.
              </li>
            </ul>
          </div>

          <!-- Footer -->
          <div class="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/40 bg-surface-container-low/30 px-6 py-4">
            <div class="flex flex-col gap-1">
              <p v-if="p.tipo_entrega === 'despacho' && p.direccion" class="flex items-center gap-1.5 text-xs text-on-surface-variant">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 22s-7-7.58-7-13a7 7 0 0 1 14 0c0 5.42-7 13-7 13z" /><circle cx="12" cy="9" r="2.5" /></svg>
                {{ p.direccion }}
              </p>
              <p v-if="p.boletas?.[0]" class="flex items-center gap-1.5 text-xs text-emerald-700">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                Boleta: {{ p.boletas[0].numero_boleta }}
              </p>
            </div>
            <p class="font-sora text-2xl font-semibold text-primary">${{ formatPrice(p.total) }}</p>
          </div>

          <RouterLink
            :to="`/pedido/${p.id}`"
            class="block border-t border-outline-variant/30 bg-surface-container-low/30 px-6 py-3 text-center font-geist text-[10px] font-semibold uppercase tracking-widest text-primary transition hover:bg-surface-container-low"
          >
            Ver detalle completo →
          </RouterLink>
        </article>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { api } from '@/lib/api.js'

const auth = useAuthStore()
const pedidos = ref([])
const cargando = ref(true)
const errorMsg = ref('')

async function cargarPedidos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    const data = await api.pedidos.misPedidos()
    pedidos.value = data.pedidos || []
  } catch (err) {
    errorMsg.value = err.message
    pedidos.value = []
  } finally {
    cargando.value = false
  }
}

function formatPrice(val) { return Number(val || 0).toLocaleString('es-CL') }
function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
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
