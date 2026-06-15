<template>
  <main class="bg-surface font-inter text-on-surface">
    <section class="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">

      <header class="mb-10 text-center">
        <div class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          :class="estadoConfirmacion === 'ok' ? 'bg-emerald-500/15 text-emerald-700' : estadoConfirmacion === 'pending' ? 'bg-yellow-500/15 text-yellow-700' : 'bg-red-500/15 text-red-700'"
        >
          <svg v-if="estadoConfirmacion === 'ok'" class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
          <svg v-else-if="estadoConfirmacion === 'pending'" class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
          <svg v-else class="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
        </div>
        <h1 class="font-sora text-4xl font-semibold tracking-tight text-primary md:text-5xl">
          {{ tituloPorEstado }}
        </h1>
        <p class="mx-auto mt-4 max-w-2xl text-on-surface-variant">{{ descripcionPorEstado }}</p>
      </header>

      <p v-if="error" class="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-700" role="alert">
        {{ error }}
      </p>

      <!-- Detalles del pedido -->
      <div v-if="loading" class="flex flex-col items-center gap-4 py-12">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <p class="text-sm text-on-surface-variant">Cargando detalles…</p>
      </div>

      <template v-else-if="order">
        <section class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Pedido</p>
            <p class="mt-2 font-sora text-2xl font-semibold text-primary">#{{ order.id }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Estado</p>
            <p class="mt-2 font-sora text-lg font-semibold capitalize" :class="estadoColor(order.estado)">{{ order.estado }}</p>
          </div>
          <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-5">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Total</p>
            <p class="mt-2 font-sora text-2xl font-semibold text-primary">${{ formatPrice(order.total) }}</p>
          </div>
        </section>

        <!-- Productos comprados con foto -->
        <section class="mb-6 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
          <div class="border-b border-outline-variant/40 bg-surface-container-low px-6 py-3">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Productos comprados</p>
          </div>
          <ul class="divide-y divide-outline-variant/30">
            <li v-for="d in order.detalle_pedido || []" :key="d.id" class="flex items-center gap-4 px-6 py-4">
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
                <p class="font-medium text-on-surface">{{ d.productos?.nombre || `Producto ${d.producto_id}` }}</p>
                <p class="text-xs text-on-surface-variant">{{ d.cantidad }} × ${{ formatPrice(d.precio_unitario) }}</p>
              </div>
              <p class="shrink-0 font-semibold text-primary">${{ formatPrice((d.precio_unitario || 0) * (d.cantidad || 0)) }}</p>
            </li>
            <li v-if="!order.detalle_pedido?.length" class="px-6 py-6 text-center text-sm text-on-surface-variant">
              Sin detalle de productos.
            </li>
          </ul>
        </section>

        <!-- Boleta -->
        <section v-if="boleta" class="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Boleta emitida</p>
              <p class="mt-1 font-mono text-lg font-semibold text-emerald-800">{{ boleta.numero_boleta }}</p>
            </div>
            <p class="font-sora text-xl font-semibold text-emerald-800">${{ formatPrice(boleta.total) }}</p>
          </div>
        </section>
      </template>

      <!-- Acciones -->
      <div class="mt-8 flex flex-col gap-3 sm:flex-row">
        <RouterLink to="/catalogo" class="flex-1 rounded-xl bg-primary py-4 text-center font-geist text-xs uppercase tracking-[0.18em] text-on-primary transition hover:opacity-90">
          Seguir comprando
        </RouterLink>
        <RouterLink to="/mis-pedidos" class="flex-1 rounded-xl border-2 border-primary py-4 text-center font-geist text-xs uppercase tracking-[0.18em] text-primary transition hover:bg-primary hover:text-on-primary">
          Ver mis pedidos
        </RouterLink>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/lib/api.js'

const route = useRoute()
const loading = ref(false)
const error = ref('')
const order = ref(null)

const boleta = computed(() => order.value?.boletas?.[0] || null)

// La URL puede traer status=failed o status=ok desde el backend de Transbank
const estadoConfirmacion = computed(() => {
  const s = route.query.status
  if (s === 'failed' || s === 'rejected') return 'error'
  if (!order.value) return 'pending'
  if (order.value.estado === 'cancelado') return 'error'
  if (order.value.estado === 'pendiente') return 'pending'
  return 'ok'
})

const tituloPorEstado = computed(() => {
  if (estadoConfirmacion.value === 'error') return 'No pudimos procesar el pago'
  if (estadoConfirmacion.value === 'pending') return '¡Pedido recibido!'
  return '¡Pedido confirmado!'
})

const descripcionPorEstado = computed(() => {
  if (estadoConfirmacion.value === 'error') {
    return `Tu pago fue rechazado o cancelado${route.query.error ? `: ${route.query.error}` : '.'} Puedes intentarlo de nuevo o elegir otro método.`
  }
  if (estadoConfirmacion.value === 'pending') {
    return 'Tu pedido está registrado en estado pendiente. El vendedor lo confirmará y un contador validará tu pago si elegiste transferencia.'
  }
  return 'Gracias por elegir FERREMAS. Tu pedido ya está en preparación.'
})

function formatPrice(v) { return Number(v || 0).toLocaleString('es-CL') }
function estadoColor(e) {
  if (['confirmado', 'en_proceso', 'enviado', 'entregado'].includes(e)) return 'text-emerald-700'
  if (e === 'cancelado') return 'text-red-700'
  return 'text-yellow-700'
}

async function cargar() {
  const id = route.query.id || route.query.orderId
  if (!id) return
  loading.value = true
  try {
    const data = await api.pedidos.misPedidos()
    order.value = (data.pedidos || []).find((p) => String(p.id) === String(id)) || null
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
</script>
