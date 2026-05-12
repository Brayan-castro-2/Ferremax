<template>
  <main class="page-wrapper bg-surface font-inter">
    <div class="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <RouterLink to="/mis-pedidos" class="mb-8 inline-flex items-center gap-2 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant transition hover:text-primary">
        ← Volver a pedidos
      </RouterLink>

      <div v-if="cargando" class="flex flex-col items-center gap-4 py-20">
        <div class="h-10 w-10 animate-spin rounded-full border-2 border-outline-variant border-t-primary" />
        <p class="text-sm text-on-surface-variant">Cargando pedido…</p>
      </div>

      <p v-else-if="error" class="alert alert-danger" role="alert">{{ error }}</p>

      <template v-else-if="pedido">
        <header class="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Pedido</p>
            <h1 class="font-sora text-3xl font-semibold tracking-tight text-primary">#{{ pedido.id }}</h1>
            <p class="mt-1 text-sm text-on-surface-variant">{{ formatFecha(pedido.creado_en) }}</p>
          </div>
          <FmBadge :tone="estadoTone(pedido.estado)">{{ pedido.estado }}</FmBadge>
        </header>

        <FmCard title="Líneas" eyebrow="Detalle" class="mb-6">
          <ul class="divide-y divide-outline-variant/50">
            <li v-for="d in pedido.detalle_pedido || []" :key="d.id" class="flex flex-wrap items-center justify-between gap-4 py-4">
              <span class="font-medium text-on-surface">{{ d.productos?.nombre || 'Producto' }}</span>
              <span class="font-geist text-[11px] uppercase tracking-wider text-on-surface-variant">×{{ d.cantidad }}</span>
              <span class="font-semibold text-primary">${{ formatPrice((d.precio_unitario || 0) * (d.cantidad || 0)) }}</span>
            </li>
          </ul>
        </FmCard>

        <FmCard title="Totales" eyebrow="Resumen">
          <div class="flex items-center justify-between text-lg">
            <span class="text-on-surface-variant">Total</span>
            <span class="font-sora text-2xl font-semibold text-primary">${{ formatPrice(pedido.total) }}</span>
          </div>
          <p v-if="pedido.tipo_entrega === 'despacho' && pedido.direccion" class="mt-4 text-sm text-on-surface-variant">
            {{ pedido.direccion }}
          </p>
        </FmCard>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { isMockup } from '@/lib/supabase.js'
import FmCard from '@/components/ui/FmCard.vue'
import FmBadge from '@/components/ui/FmBadge.vue'

const route = useRoute()
const auth = useAuthStore()
const pedido = ref(null)
const cargando = ref(true)
const error = ref('')

const PEDIDOS_MOCKUP = [
  {
    id: 1,
    estado: 'despachado',
    tipo_entrega: 'despacho',
    total: 189970,
    creado_en: new Date().toISOString(),
    direccion: 'Av. Providencia 1234',
    detalle_pedido: [
      { id: 1, cantidad: 1, precio_unitario: 79990, productos: { nombre: 'Taladro Percutor 700W' } },
    ],
  },
]

function formatPrice(v) {
  return Number(v || 0).toLocaleString('es-CL')
}
function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function estadoTone(e) {
  if (e === 'despachado' || e === 'entregado') return 'success'
  if (e === 'cancelado') return 'danger'
  if (e === 'pendiente') return 'warning'
  return 'info'
}

async function cargar() {
  cargando.value = true
  error.value = ''
  const id = Number(route.params.id)
  try {
    if (isMockup) {
      pedido.value = PEDIDOS_MOCKUP.find((p) => p.id === id) || null
      if (!pedido.value) error.value = 'Pedido no encontrado.'
      return
    }
    const lista = await ServiciosSupabase.obtenerPedidosUsuario(auth.user.id)
    pedido.value = lista.find((p) => Number(p.id) === id) || null
    if (!pedido.value) error.value = 'Pedido no encontrado.'
  } catch (e) {
    error.value = e.message || 'Error al cargar'
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)
</script>
