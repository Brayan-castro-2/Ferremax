<template>
  <main class="bg-background font-body-md text-on-surface">
    <section class="mx-auto max-w-container-max px-margin-mobile py-section-gap md:px-margin-desktop">
      <header class="mb-12 text-center">
        <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-on-primary">
          <span class="text-2xl">✓</span>
        </div>
        <h1 class="font-display-lg text-headline-xl-mobile md:text-display-lg">Your order is secured</h1>
        <p class="mx-auto mt-4 max-w-3xl font-body-lg text-on-surface-variant">
          Gracias por elegir FERREMAS. Tu pedido
          <strong class="text-primary">#{{ orderNumber }}</strong>
          ya está en preparación.
        </p>
      </header>

      <p v-if="error" class="mb-6 rounded-md border border-error/30 bg-error-container px-4 py-3 text-on-error-container" role="alert">
        {{ error }}
      </p>

      <div class="grid grid-cols-1 gap-gutter lg:grid-cols-12">
        <section class="space-y-gutter lg:col-span-8">
          <article class="rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
            <h2 class="mb-6 font-label-sm text-label-sm uppercase tracking-widest text-outline">Estimated delivery</h2>
            <p class="font-headline-xl text-headline-xl-mobile text-primary md:text-headline-xl">{{ etaText }}</p>
            <p class="mt-2 font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Despacho estándar</p>
          </article>

          <article class="overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient">
            <header class="flex items-center justify-between border-b border-surface-variant px-8 py-6">
              <h2 class="font-label-sm text-label-sm uppercase tracking-widest text-primary">Order items ({{ items.length }})</h2>
            </header>
            <ul class="divide-y divide-surface-variant">
              <li v-for="item in items" :key="item.id || item.producto_id" class="flex items-center justify-between gap-gutter p-8">
                <div>
                  <p class="font-headline-xl text-headline-xl-mobile text-primary">{{ item.nombre || `Producto ${item.producto_id}` }}</p>
                  <p class="font-label-sm text-label-sm text-outline">Cantidad: {{ item.cantidad }}</p>
                </div>
                <strong>${{ formatPrice((item.precio_unitario || 0) * (item.cantidad || 1)) }}</strong>
              </li>
            </ul>
          </article>
        </section>

        <aside class="lg:col-span-4">
          <article class="sticky top-24 rounded-xl bg-surface-container-low p-8">
            <h2 class="mb-8 font-label-sm text-label-sm uppercase tracking-widest text-primary">Payment summary</h2>
            <div class="space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant">Subtotal</span>
                <span>${{ formatPrice(summary.subtotal) }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-on-surface-variant">Descuento</span>
                <span>${{ formatPrice(summary.descuento) }}</span>
              </div>
              <div class="flex items-center justify-between border-t border-outline-variant pt-4">
                <strong class="uppercase tracking-widest text-primary">Total</strong>
                <strong class="font-display-lg text-3xl text-primary">${{ formatPrice(summary.total) }}</strong>
              </div>
            </div>

            <div class="mt-8 flex flex-col gap-4">
              <RouterLink to="/catalogo" class="rounded-lg bg-primary py-4 text-center font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-primary transition hover:opacity-90">
                Continue shopping
              </RouterLink>
              <RouterLink to="/mis-pedidos" class="rounded-lg border-2 border-primary py-4 text-center font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary transition hover:bg-primary hover:text-on-primary">
                View my orders
              </RouterLink>
            </div>
          </article>
        </aside>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const route = useRoute()
const auth = useAuthStore()

const loading = ref(false)
const error = ref('')
const order = ref(null)
const items = ref([])

const orderNumber = computed(() => order.value?.id || route.query.id || 'PENDIENTE')
const etaText = computed(() => {
  const d = new Date()
  d.setDate(d.getDate() + 3)
  return d.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'short' })
})

const summary = computed(() => {
  const subtotal = items.value.reduce((acc, item) => acc + (item.precio_unitario || 0) * (item.cantidad || 0), 0)
  const descuento = Number(order.value?.descuentoMonto || 0)
  return { subtotal, descuento, total: Number(order.value?.total || subtotal - descuento) }
})

function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-CL')
}

async function fetchOrderDetails() {
  if (!route.query.id) return
  loading.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('ferremas_api_token') || auth.session?.access_token || ''
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const response = await fetch(`${base || ''}/api/orders/mis-pedidos`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!response.ok) return
    const data = await response.json()
    const found = (data.pedidos || []).find((p) => String(p.id) === String(route.query.id))
    if (found) {
      order.value = found
      items.value = found.items || found.detalle || found.detalle_pedido || []
    }
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchOrderDetails)
</script>
