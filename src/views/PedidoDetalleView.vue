<template>
  <main class="bg-surface font-inter text-on-surface">
    <div class="mx-auto max-w-4xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <RouterLink to="/mis-pedidos" class="mb-8 inline-flex items-center gap-2 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition hover:text-primary">
        ← Volver a pedidos
      </RouterLink>

      <div v-if="cargando" class="flex flex-col items-center gap-4 py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <p class="text-sm text-on-surface-variant">Cargando pedido…</p>
      </div>

      <div v-else-if="error" class="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-700" role="alert">
        <p class="font-semibold">No pude cargar el pedido.</p>
        <p class="mt-1 text-sm">{{ error }}</p>
      </div>

      <template v-else-if="pedido">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Pedido</p>
            <h1 class="font-sora text-4xl font-semibold tracking-tight text-primary">#{{ pedido.id }}</h1>
            <p class="mt-1 text-sm text-on-surface-variant">{{ formatFecha(pedido.creado_en) }}</p>
          </div>
          <span
            class="rounded-full px-4 py-1.5 font-geist text-xs font-semibold uppercase tracking-wider"
            :class="estadoBadge(pedido.estado)"
          >
            {{ pedido.estado }}
          </span>
        </header>

        <!-- Boleta -->
        <section v-if="boleta" class="mb-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <div class="flex items-start justify-between gap-3">
            <div>
              <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Boleta emitida</p>
              <p class="mt-1 font-mono text-lg font-semibold text-emerald-800">{{ boleta.numero_boleta }}</p>
              <p class="mt-1 text-xs text-on-surface-variant">Emitida el {{ formatFecha(boleta.fecha_emision) }}</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-on-surface-variant">Total</p>
              <p class="font-sora text-2xl font-semibold text-emerald-800">${{ formatPrice(boleta.total) }}</p>
            </div>
          </div>
        </section>

        <section v-else-if="puedeEmitirBoleta" class="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Boleta no emitida</p>
          <p class="mt-2 text-sm text-on-surface-variant">
            Tu pedido aún no tiene boleta emitida. El vendedor emitirá una vez confirmado el pago.
          </p>
        </section>

        <!-- Entrega -->
        <section class="mb-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Entrega</p>
          <p class="mt-2 font-sora text-lg font-semibold text-primary">
            {{ pedido.tipo_entrega === 'despacho' ? 'Despacho a domicilio' : 'Retiro en tienda' }}
          </p>
          <p v-if="pedido.tipo_entrega === 'despacho' && pedido.direccion" class="mt-2 text-sm text-on-surface-variant">
            {{ pedido.direccion }}
          </p>
          <p v-if="pedido.fecha_entrega" class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-700">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12" /></svg>
            Entregado el {{ formatFecha(pedido.fecha_entrega) }}
          </p>
        </section>

        <!-- Productos con foto -->
        <section class="mb-6 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest">
          <div class="border-b border-outline-variant/40 bg-surface-container-low px-6 py-3">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">Productos comprados</p>
          </div>
          <ul class="divide-y divide-outline-variant/30">
            <li v-for="d in pedido.detalle_pedido || []" :key="d.id" class="flex items-center gap-4 px-6 py-4">
              <div class="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/40 bg-surface-container-low">
                <img
                  v-if="d.productos?.imagen_url"
                  :src="d.productos.imagen_url"
                  :alt="d.productos?.nombre"
                  class="h-full w-full object-cover"
                  loading="lazy"
                />
                <svg v-else class="h-10 w-10 text-outline opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 5 5 3-3 5 5" /><circle cx="9" cy="9" r="1.5" /></svg>
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-medium text-on-surface">{{ d.productos?.nombre || `Producto ${d.producto_id}` }}</p>
                <p class="text-xs text-on-surface-variant">{{ d.productos?.categoria }} · {{ d.cantidad }} × ${{ formatPrice(d.precio_unitario) }}</p>
              </div>
              <p class="shrink-0 font-semibold text-primary">${{ formatPrice((d.precio_unitario || 0) * (d.cantidad || 0)) }}</p>
            </li>
          </ul>
        </section>

        <!-- Total -->
        <section class="rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <div class="flex items-center justify-between">
            <span class="font-geist text-xs uppercase tracking-widest text-on-surface-variant">Total</span>
            <span class="font-sora text-3xl font-semibold text-primary">${{ formatPrice(pedido.total) }}</span>
          </div>
          <p v-if="pedido.notas_cliente" class="mt-4 rounded-lg bg-surface-container-low p-3 text-sm text-on-surface-variant">
            <span class="font-geist text-[10px] font-semibold uppercase tracking-wider text-tertiary">Nota tuya:</span>
            {{ pedido.notas_cliente }}
          </p>
          <p v-if="pedido.estado === 'cancelado' && pedido.motivo_cancelacion" class="mt-4 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">
            <span class="font-geist text-[10px] font-semibold uppercase tracking-wider">Motivo de cancelación:</span>
            {{ pedido.motivo_cancelacion }}
          </p>
        </section>

        <!-- Acciones de cliente (cancelar / solicitar devolución) -->
        <section v-if="puedeCancelar || puedeSolicitarDevolucion" class="mt-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">¿Hay algún problema?</p>
          <p class="mt-2 text-sm text-on-surface-variant">
            {{ puedeCancelar ? 'Puedes cancelar este pedido mientras esté en estado pendiente. El stock se devolverá automáticamente.' : 'Si recibiste el producto con algún defecto, puedes solicitar una devolución.' }}
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <button
              v-if="puedeCancelar"
              class="rounded-lg border-2 border-red-500/40 px-4 py-2 font-geist text-xs uppercase tracking-wider text-red-700 transition hover:bg-red-500/10 disabled:opacity-50"
              :disabled="procesando"
              @click="cancelarPedido"
            >
              Cancelar pedido
            </button>
            <button
              v-if="puedeSolicitarDevolucion"
              class="rounded-lg border-2 border-tertiary px-4 py-2 font-geist text-xs uppercase tracking-wider text-tertiary transition hover:bg-tertiary hover:text-on-tertiary disabled:opacity-50"
              :disabled="procesando"
              @click="solicitarDevolucion"
            >
              Solicitar devolución
            </button>
          </div>
          <p v-if="accionMsg" class="mt-3 rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-700">{{ accionMsg }}</p>
          <p v-if="accionError" class="mt-3 rounded-lg bg-red-500/10 p-3 text-sm text-red-700">{{ accionError }}</p>
        </section>

        <!-- Devolución (si existe) -->
        <section v-if="miDevolucion" class="mt-6 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-6">
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Solicitud de devolución</p>
          <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p class="font-sora text-lg font-semibold text-primary">Devolución #{{ miDevolucion.id }}</p>
            <span class="rounded-full px-3 py-1 font-geist text-[10px] font-semibold uppercase tracking-wider" :class="devBadge(miDevolucion.estado)">
              {{ miDevolucion.estado }}
            </span>
          </div>
          <p class="mt-3 text-sm text-on-surface-variant"><strong>Motivo:</strong> {{ miDevolucion.motivo }}</p>
          <p v-if="miDevolucion.monto_devuelto" class="mt-1 text-sm text-emerald-700"><strong>Monto reembolsado:</strong> ${{ formatPrice(miDevolucion.monto_devuelto) }}</p>
        </section>
      </template>

      <div v-else class="rounded-2xl border border-dashed border-outline-variant/60 p-12 text-center">
        <p class="font-sora text-xl font-semibold text-primary">Pedido no encontrado</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { api } from '@/lib/api.js'

const route = useRoute()
const pedido = ref(null)
const cargando = ref(true)
const error = ref('')

const procesando = ref(false)
const accionMsg = ref('')
const accionError = ref('')
const miDevolucion = ref(null)

const boleta = computed(() => pedido.value?.boletas?.[0] || null)
const puedeEmitirBoleta = computed(() => pedido.value && pedido.value.estado !== 'cancelado' && !boleta.value)
const puedeCancelar = computed(() => pedido.value?.estado === 'pendiente')
const puedeSolicitarDevolucion = computed(() =>
  pedido.value && ['entregado', 'enviado', 'en_proceso'].includes(pedido.value.estado) && !miDevolucion.value
)

function devBadge(e) {
  const map = {
    solicitada: 'bg-yellow-500/15 text-yellow-700',
    aprobada:   'bg-blue-500/15 text-blue-700',
    rechazada:  'bg-red-500/15 text-red-700',
    procesada:  'bg-emerald-500/15 text-emerald-700'
  }
  return map[e] || 'bg-surface-container-low text-on-surface-variant'
}

async function cancelarPedido() {
  if (!confirm('¿Cancelar este pedido? El stock se devolverá automáticamente.')) return
  const motivo = prompt('Motivo de la cancelación (opcional):') || ''
  procesando.value = true
  accionMsg.value = ''
  accionError.value = ''
  try {
    const res = await api.pedidos.cancelarMio(pedido.value.id, motivo || undefined)
    accionMsg.value = res.mensaje || 'Pedido cancelado.'
    await cargar()
  } catch (err) {
    accionError.value = err.message
  } finally {
    procesando.value = false
  }
}

async function solicitarDevolucion() {
  const motivo = prompt('Describe el motivo de la devolución (mínimo 5 caracteres):')
  if (!motivo || motivo.trim().length < 5) {
    if (motivo !== null) accionError.value = 'El motivo debe tener al menos 5 caracteres.'
    return
  }
  procesando.value = true
  accionMsg.value = ''
  accionError.value = ''
  try {
    const res = await api.devoluciones.solicitar(pedido.value.id, motivo.trim())
    accionMsg.value = res.mensaje || 'Solicitud creada.'
    miDevolucion.value = res.devolucion
  } catch (err) {
    accionError.value = err.message
  } finally {
    procesando.value = false
  }
}

async function cargarMiDevolucion() {
  try {
    const data = await api.devoluciones.misDevoluciones()
    const pedidoId = Number(route.params.id)
    miDevolucion.value = (data.devoluciones || []).find(d => Number(d.pedido_id) === pedidoId) || null
  } catch {
    miDevolucion.value = null
  }
}

function formatPrice(v) { return Number(v || 0).toLocaleString('es-CL') }
function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', {
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

async function cargar() {
  cargando.value = true
  error.value = ''
  const id = Number(route.params.id)
  try {
    const data = await api.pedidos.misPedidos()
    pedido.value = (data.pedidos || []).find((p) => Number(p.id) === id) || null
    if (!pedido.value) error.value = 'Pedido no encontrado.'
  } catch (e) {
    error.value = e.message || 'Error al cargar'
  } finally {
    cargando.value = false
  }
}

onMounted(async () => {
  await cargar()
  await cargarMiDevolucion()
})
</script>
