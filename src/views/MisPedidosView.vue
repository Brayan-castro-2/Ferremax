<template>
  <main class="page-wrapper">
    <div class="container">
      <h1 style="font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-8)">
        Mis <span class="text-primary">Pedidos</span>
      </h1>

      <div v-if="cargando" class="loading-center">
        <div class="spinner"></div>
        <p class="text-muted">Cargando pedidos...</p>
      </div>

      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else-if="pedidos.length === 0" class="empty-state">
        <span>📦</span>
        <p>No tienes pedidos aún. ¡Visita el catálogo!</p>
        <router-link to="/catalogo" class="btn btn-primary" id="btn-ir-catalogo-pedidos">Ver Catálogo</router-link>
      </div>

      <div v-else class="flex flex-col gap-5" id="mis-pedidos-list">
        <RouterLink
          v-for="p in pedidos"
          :key="p.id"
          :to="`/pedido/${p.id}`"
          class="pedido-card card block transition hover:border-primary/20 hover:shadow-md"
          :id="`pedido-${p.id}`"
        >
          <div class="pedido-header">
            <div>
              <p class="pedido-id">Pedido <strong>#{{ p.id }}</strong></p>
              <p class="text-muted" style="font-size: var(--font-size-xs)">
                {{ formatFecha(p.creado_en) }} · {{ p.tipo_entrega === 'despacho' ? '🚚 Despacho' : '🏪 Retiro' }}
              </p>
            </div>
            <span :class="['badge', estadoBadge(p.estado)]">{{ p.estado }}</span>
          </div>

          <div v-if="p.detalle_pedido?.length" class="pedido-items">
            <span v-for="d in p.detalle_pedido" :key="d.id" class="item-pill">
              {{ d.productos?.nombre }} ×{{ d.cantidad }}
            </span>
          </div>

          <div class="pedido-footer">
            <span class="text-muted" style="font-size: var(--font-size-xs)">
              {{ p.tipo_entrega === 'despacho' ? `📍 ${p.direccion}` : '' }}
            </span>
            <span class="pedido-total">${{ formatPrice(p.total) }}</span>
          </div>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { isMockup } from '@/lib/supabase.js'

const auth     = useAuthStore()
const pedidos  = ref([])
const cargando = ref(true)
const errorMsg = ref('')

const PEDIDOS_MOCKUP = [
  {
    id: 1, estado: 'despachado', tipo_entrega: 'despacho', total: 189970,
    creado_en: new Date().toISOString(), direccion: 'Av. Providencia 1234',
    detalle_pedido: [
      { id: 1, cantidad: 1, productos: { nombre: 'Taladro Percutor 700W' } },
      { id: 2, cantidad: 2, productos: { nombre: 'Martillo 500g'         } },
    ]
  },
  {
    id: 2, estado: 'pendiente', tipo_entrega: 'retiro', total: 34990,
    creado_en: new Date(Date.now() - 86400000).toISOString(), direccion: '',
    detalle_pedido: [
      { id: 3, cantidad: 1, productos: { nombre: 'Destornillador Eléctrico' } }
    ]
  }
]

async function cargarPedidos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    if (isMockup) {
      await new Promise(r => setTimeout(r, 500))
      pedidos.value = PEDIDOS_MOCKUP
    } else {
      pedidos.value = await ServiciosSupabase.obtenerPedidosUsuario(auth.user.id)
    }
  } catch (err) {
    errorMsg.value = `Error al cargar pedidos: ${err.message}`
  } finally {
    cargando.value = false
  }
}

function formatPrice(val)  { return Number(val).toLocaleString('es-CL') }
function formatFecha(fecha) {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function estadoBadge(e) {
  const map = { pendiente: 'badge-warning', pagado: 'badge-info', preparado: 'badge-primary', despachado: 'badge-success', cancelado: 'badge-danger' }
  return map[e] || 'badge-primary'
}

onMounted(cargarPedidos)
</script>

<style scoped>
.loading-center { display: flex; flex-direction: column; align-items: center; gap: var(--space-4); padding: var(--space-16); }
.empty-state    { text-align: center; padding: var(--space-16); display: flex; flex-direction: column; align-items: center; gap: var(--space-4); }
.empty-state span { font-size: 4rem; }

.pedidos-list { display: flex; flex-direction: column; gap: var(--space-4); }
.pedido-card  { display: flex; flex-direction: column; gap: var(--space-4); }
.pedido-header { display: flex; justify-content: space-between; align-items: flex-start; }
.pedido-id    { font-weight: 600; }
.pedido-items { display: flex; flex-wrap: wrap; gap: var(--space-2); }
.item-pill    {
  padding: 4px 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.pedido-footer { display: flex; justify-content: space-between; align-items: center; }
.pedido-total  { font-size: var(--font-size-xl); font-weight: 800; color: var(--color-primary); }
</style>
