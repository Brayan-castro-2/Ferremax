<template>
  <main class="bg-surface text-on-surface font-body-md">
    <section class="mx-auto grid max-w-container-max grid-cols-1 gap-gutter px-margin-mobile py-section-gap lg:grid-cols-12 lg:px-margin-desktop">
      <div class="lg:col-span-7">
        <h1 class="mb-8 font-headline-xl text-headline-xl">Checkout</h1>
        <p v-if="error" class="mb-6 rounded-md border border-error/30 bg-error-container px-4 py-3 text-on-error-container" role="alert">
          {{ error }}
        </p>

        <form class="space-y-8" @submit.prevent="submitOrder" novalidate>
          <div class="grid grid-cols-1 gap-gutter md:grid-cols-2">
            <div class="flex flex-col gap-2">
              <label for="firstName" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">First name</label>
              <input id="firstName" v-model.trim="form.firstName" required class="input-minimal" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="lastName" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Last name</label>
              <input id="lastName" v-model.trim="form.lastName" required class="input-minimal" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="address" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Street address</label>
            <input id="address" v-model.trim="form.address" required class="input-minimal" />
          </div>

          <div class="grid grid-cols-1 gap-gutter md:grid-cols-3">
            <div class="flex flex-col gap-2">
              <label for="city" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">City</label>
              <input id="city" v-model.trim="form.city" required class="input-minimal" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="region" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Region</label>
              <input id="region" v-model.trim="form.region" required class="input-minimal" />
            </div>
            <div class="flex flex-col gap-2">
              <label for="zip" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Postal code</label>
              <input id="zip" v-model.trim="form.zip" required class="input-minimal" />
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <label for="email" class="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant">Email</label>
            <input id="email" v-model.trim="form.email" required type="email" class="input-minimal" />
          </div>

          <button :disabled="submitting || !isValid || carrito.items.length === 0" class="inline-flex items-center gap-3 rounded-lg bg-primary px-12 py-4 font-label-sm text-label-sm uppercase tracking-widest text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50">
            <span>{{ submitting ? 'Processing...' : 'Complete Purchase' }}</span>
          </button>
        </form>
      </div>

      <aside class="space-y-gutter lg:sticky lg:top-24 lg:col-span-5">
        <div class="rounded-xl bg-surface-container-low p-8 shadow-ambient">
          <h2 class="mb-8 font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-surface-variant">Order summary</h2>
          <ul class="mb-8 space-y-4 border-b border-outline-variant pb-8">
            <li v-for="item in carrito.items" :key="item.id" class="flex items-center justify-between gap-4">
              <span>{{ item.nombre }} x{{ item.cantidad }}</span>
              <span>${{ formatPrice(item.precio * item.cantidad) }}</span>
            </li>
          </ul>

          <div class="space-y-3">
            <div class="flex justify-between font-label-sm text-label-sm tracking-widest text-on-surface-variant">
              <span>Subtotal</span>
              <span>${{ formatPrice(carrito.subtotal) }}</span>
            </div>
            <div class="flex justify-between font-label-sm text-label-sm tracking-widest text-on-surface-variant">
              <span>Discount</span>
              <span>${{ formatPrice(carrito.descuento) }}</span>
            </div>
            <div class="flex justify-between border-t border-outline-variant pt-4 font-body-lg text-body-lg font-semibold">
              <span>Total</span>
              <span>${{ formatPrice(carrito.total) }}</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  </main>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCarritoStore } from '@/stores/carrito.js'

const router = useRouter()
const auth = useAuthStore()
const carrito = useCarritoStore()

const submitting = ref(false)
const error = ref('')
const form = reactive({
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  region: '',
  zip: '',
  email: '',
})

const isValid = computed(() => Object.values(form).every((value) => String(value).trim().length > 0))

function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-CL')
}

async function submitOrder() {
  if (!isValid.value || carrito.items.length === 0) return
  submitting.value = true
  error.value = ''
  try {
    const token = localStorage.getItem('ferremas_api_token') || auth.session?.access_token || ''
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const payload = {
      tipo_entrega: 'despacho',
      direccion: `${form.address}, ${form.city}, ${form.region}, ${form.zip}`,
      items: carrito.items.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio,
      })),
    }
    const response = await fetch(`${base || ''}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || 'No se pudo crear el pedido')
    }

    const order = await response.json()
    carrito.vaciar()
    router.push({ path: '/pedido-confirmacion', query: { id: order.pedido?.id || order.id || '' } })
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.input-minimal {
  width: 100%;
  border: 0;
  border-bottom: 1px solid transparent;
  background: theme('colors.surface-container-low');
  padding: 12px 0;
  transition: border-color 150ms ease;
}

.input-minimal:focus {
  border-bottom-color: theme('colors.primary');
  outline: none;
}
</style>
