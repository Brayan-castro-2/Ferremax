<template>
  <main class="bg-surface text-on-surface font-inter">
    <section class="mx-auto grid max-w-container-max grid-cols-1 gap-gutter px-margin-mobile py-12 lg:grid-cols-12 lg:px-margin-desktop lg:py-16">

      <div class="lg:col-span-7">
        <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.22em] text-tertiary">Finalizar compra</p>
        <h1 class="mt-2 mb-8 font-sora text-4xl font-semibold tracking-tight text-primary">Checkout</h1>

        <p v-if="error" class="mb-6 rounded-xl border border-error/30 bg-error-container px-4 py-3 text-sm text-on-error-container" role="alert">
          {{ error }}
        </p>

        <form class="space-y-6" @submit.prevent="submitOrder" novalidate>
          <!-- Tipo de entrega -->
          <fieldset class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <legend class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Tipo de entrega</legend>
            <div class="mt-4 grid grid-cols-2 gap-3">
              <label
                class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
                :class="form.tipo_entrega === 'retiro' ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/30'"
              >
                <input v-model="form.tipo_entrega" type="radio" value="retiro" class="mt-1 accent-primary" />
                <div>
                  <p class="font-sora font-semibold text-on-surface">Retiro en tienda</p>
                  <p class="text-xs text-on-surface-variant">Sin costo · Elige una sucursal</p>
                </div>
              </label>
              <label
                class="flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition"
                :class="form.tipo_entrega === 'despacho' ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/30'"
              >
                <input v-model="form.tipo_entrega" type="radio" value="despacho" class="mt-1 accent-primary" />
                <div>
                  <p class="font-sora font-semibold text-on-surface">Despacho a domicilio</p>
                  <p class="text-xs text-on-surface-variant">Envío coordinado por bodeguero</p>
                </div>
              </label>
            </div>
          </fieldset>

          <!-- Dirección (solo si despacho) -->
          <fieldset v-if="form.tipo_entrega === 'despacho'" class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <legend class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Dirección de despacho</legend>
            <div class="mt-4 space-y-4">
              <FmInput id="ck-direccion" v-model="form.direccion" label="Dirección *" placeholder="Calle, número, depto" />
              <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FmInput id="ck-comuna" v-model="form.comuna" label="Comuna" placeholder="Ej: Providencia" />
                <FmInput id="ck-ciudad" v-model="form.ciudad" label="Ciudad" placeholder="Ej: Santiago" />
              </div>
            </div>
          </fieldset>

          <!-- Notas para el pedido -->
          <fieldset class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <legend class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Notas (opcional)</legend>
            <textarea
              v-model="form.notas"
              rows="3"
              maxlength="500"
              class="mt-3 w-full rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm focus:border-primary focus:outline-none"
              placeholder="Ej: 'Dejar en conserjería', 'Llamar al timbre 2B', 'Producto frágil'…"
            />
            <p class="mt-1 text-xs text-on-surface-variant">{{ form.notas.length }}/500</p>
          </fieldset>

          <!-- Método de pago -->
          <fieldset class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
            <legend class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Método de pago</legend>
            <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <label
                v-for="m in metodosPago"
                :key="m.value"
                class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition"
                :class="form.metodo === m.value ? 'border-primary bg-primary/5' : 'border-outline-variant/40 hover:border-primary/30'"
              >
                <input v-model="form.metodo" type="radio" :value="m.value" class="sr-only" />
                <span class="text-2xl">{{ m.icon }}</span>
                <span class="font-geist text-xs font-semibold uppercase tracking-wider">{{ m.label }}</span>
              </label>
            </div>
            <p v-if="form.metodo === 'webpay'" class="mt-4 rounded-lg bg-surface-container-low p-3 text-xs text-on-surface-variant">
              Serás redirigido a Webpay Plus de Transbank para completar el pago.
            </p>
            <p v-else-if="form.metodo === 'transferencia'" class="mt-4 rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-800">
              Una vez confirmado el pedido, el contador debe verificar tu transferencia antes de despachar.
            </p>
          </fieldset>

          <button
            :disabled="submitting || !isValid || carrito.items.length === 0"
            class="inline-flex w-full items-center justify-center gap-3 rounded-xl bg-primary px-12 py-4 font-geist text-xs uppercase tracking-[0.18em] text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {{ submitting ? 'Procesando…' : `Confirmar pedido — $${formatPrice(carrito.total)}` }}
          </button>
        </form>
      </div>

      <!-- Resumen -->
      <aside class="lg:sticky lg:top-24 lg:col-span-5">
        <div class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-ambient">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Resumen del pedido</p>
          <h2 class="mt-1 font-sora text-xl font-semibold text-primary">Tu compra</h2>

          <ul class="mt-6 space-y-3 border-b border-outline-variant/40 pb-4">
            <li v-for="item in carrito.items" :key="item.id" class="flex items-center justify-between gap-4 text-sm">
              <span class="text-on-surface">{{ item.nombre }} ×{{ item.cantidad }}</span>
              <span class="font-semibold">${{ formatPrice(item.precio * item.cantidad) }}</span>
            </li>
            <li v-if="carrito.items.length === 0" class="text-center text-on-surface-variant">
              Tu carrito está vacío.
            </li>
          </ul>

          <div class="mt-4 space-y-2 text-sm">
            <div class="flex justify-between text-on-surface-variant">
              <span>Subtotal</span>
              <span>${{ formatPrice(carrito.subtotal) }}</span>
            </div>
            <div v-if="carrito.aplicaDescuento" class="flex justify-between text-emerald-700">
              <span>Descuento volumen (10%)</span>
              <span>−${{ formatPrice(carrito.descuento) }}</span>
            </div>
            <div class="flex justify-between border-t border-outline-variant/40 pt-3 font-sora text-lg font-semibold text-primary">
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
import { computed, reactive, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCarritoStore } from '@/stores/carrito.js'
import { api, BASE_URL } from '@/lib/api.js'
import FmInput from '@/components/ui/FmInput.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()
const carrito = useCarritoStore()

const submitting = ref(false)
const error = ref('')

const metodosPago = [
  { value: 'webpay',        label: 'Webpay',        icon: '💳' },
  { value: 'transferencia', label: 'Transferencia', icon: '🏦' },
  { value: 'efectivo',      label: 'Efectivo',      icon: '💵' }
]

const form = reactive({
  tipo_entrega: 'retiro',
  direccion: '',
  comuna: '',
  ciudad: '',
  metodo: 'webpay',
  notas: ''
})

const isValid = computed(() => {
  if (form.tipo_entrega === 'despacho' && form.direccion.trim().length < 5) return false
  return !!form.metodo
})

onMounted(() => {
  if (route.query.status === 'failed') {
    error.value = `El pago fue rechazado o cancelado. ${route.query.error || ''}`
  }
})

function formatPrice(v) { return Number(v || 0).toLocaleString('es-CL') }

async function submitOrder() {
  if (!isValid.value || carrito.items.length === 0) return
  if (!auth.isAuthenticated) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const direccionStr = form.tipo_entrega === 'despacho'
      ? `${form.direccion}${form.comuna ? ', ' + form.comuna : ''}${form.ciudad ? ', ' + form.ciudad : ''}`
      : null

    const orderRes = await api.pedidos.crear({
      tipo_entrega: form.tipo_entrega,
      direccion: direccionStr,
      notas: form.notas || undefined,
      items: carrito.items.map((item) => ({
        producto_id: item.id,
        cantidad: item.cantidad,
        precio_unitario: item.precio
      }))
    })

    const order = orderRes.pedido || orderRes

    if (form.metodo === 'webpay') {
      // Inicia Transbank. La returnUrl DEBE apuntar al backend para que valide
      // el response_code de Transbank antes de marcar el pedido como confirmado.
      // El backend después redirige al frontend con el resultado real.
      const backendOrigin = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
      const paymentRes = await api.payment.create({
        buyOrder: `ORDEN-${order.id}`,
        sessionId: `SES-${auth.user?.id || 'demo'}`,
        amount: Math.round(order.total),
        returnUrl: `${backendOrigin}/api/payment/commit`
      })
      carrito.vaciar()
      // Webpay requiere POST
      const formEl = document.createElement('form')
      formEl.method = 'POST'
      formEl.action = paymentRes.url
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = 'token_ws'
      input.value = paymentRes.token
      formEl.appendChild(input)
      document.body.appendChild(formEl)
      formEl.submit()
      return
    }

    // Para efectivo / transferencia: registramos pago pendiente y redirigimos a confirmación
    try {
      await api.pagos.crear(order.id, form.metodo)
    } catch { /* el vendedor lo puede crear después */ }

    carrito.vaciar()
    router.push({ path: '/pedido-confirmacion', query: { orderId: order.id, metodo: form.metodo } })
  } catch (err) {
    error.value = err.message
  } finally {
    submitting.value = false
  }
}
</script>
