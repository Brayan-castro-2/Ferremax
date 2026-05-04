<template>
  <main class="page-wrapper">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Panel <span class="text-primary">Vendedor</span></h1>
          <p class="text-muted">Gestión de pedidos y ventas</p>
        </div>
        <span class="badge badge-info" style="font-size: 0.85rem; padding: 0.5rem 1rem;">💼 Vendedor</span>
      </div>

      <div v-if="cargando" class="loading-center"><div class="spinner"></div></div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <div v-else class="card" id="tabla-pedidos-vendedor">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4)">
          <h3>Pedidos ({{ pedidos.length }} total)</h3>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Entrega</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Cambiar Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pedidos" :key="p.id">
                <td class="text-muted" style="font-family:monospace">{{ p.id }}</td>
                <td>
                  <div>{{ p.cliente_nombre || '—' }}</div>
                  <div class="text-muted" style="font-size:0.7rem">{{ p.cliente_email }}</div>
                </td>
                <td style="font-weight:600">${{ formatPrice(p.total) }}</td>
                <td>{{ p.tipo_entrega === 'despacho' ? '🚚 Despacho' : '🏪 Retiro' }}</td>
                <td><span :class="['badge', estadoBadge(p.estado)]">{{ p.estado }}</span></td>
                <td class="text-muted" style="font-size:0.75rem">{{ formatFecha(p.creado_en) }}</td>
                <td>
                  <select
                    class="form-input btn-sm"
                    style="width:auto; padding: 0.3rem 0.5rem"
                    :value="p.estado"
                    @change="cambiarEstado(p, $event)"
                    :id="`select-estado-${p.id}`"
                  >
                    <option v-for="e in estados" :key="e" :value="e">{{ e }}</option>
                  </select>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { OrquestadorDePedidos } from '@/orquestadores/OrquestadorDePedidos.js'
import { isMockup } from '@/lib/supabase.js'

const estados  = ['pendiente', 'pagado', 'preparado', 'despachado', 'cancelado']
const pedidos  = ref([])
const cargando = ref(true)
const errorMsg = ref('')

const PEDIDOS_MOCKUP = [
  { id: 1, cliente_nombre: 'Pedro García',   cliente_email: 'pedro@mail.cl',  total: 189970, tipo_entrega: 'despacho', estado: 'pendiente',  creado_en: new Date().toISOString() },
  { id: 2, cliente_nombre: 'María López',    cliente_email: 'maria@mail.cl',  total: 79990,  tipo_entrega: 'retiro',   estado: 'pagado',     creado_en: new Date().toISOString() },
  { id: 3, cliente_nombre: 'Juan Pérez',     cliente_email: 'juan@mail.cl',   total: 245000, tipo_entrega: 'despacho', estado: 'preparado',  creado_en: new Date().toISOString() },
  { id: 4, cliente_nombre: 'Sofía Rojas',    cliente_email: 'sofia@mail.cl',  total: 34990,  tipo_entrega: 'retiro',   estado: 'despachado', creado_en: new Date().toISOString() },
]

async function cargarPedidos() {
  cargando.value = true
  try {
    if (isMockup) {
      await new Promise(r => setTimeout(r, 500))
      pedidos.value = PEDIDOS_MOCKUP
    } else {
      pedidos.value = await ServiciosSupabase.obtenerTodosPedidos()
    }
  } catch (err) {
    errorMsg.value = `Error: ${err.message}`
  } finally {
    cargando.value = false
  }
}

async function cambiarEstado(pedido, event) {
  const nuevoEstado = event.target.value
  try {
    if (!isMockup) {
      await OrquestadorDePedidos.gestionarEstado(pedido.id, nuevoEstado)
    }
    pedido.estado = nuevoEstado
  } catch (err) {
    alert(`Error al cambiar estado: ${err.message}`)
    event.target.value = pedido.estado
  }
}

function formatPrice(val)   { return Number(val).toLocaleString('es-CL') }
function formatFecha(fecha) { return fecha ? new Date(fecha).toLocaleDateString('es-CL') : '—' }
function estadoBadge(e)     {
  return { pendiente: 'badge-warning', pagado: 'badge-info', preparado: 'badge-primary', despachado: 'badge-success', cancelado: 'badge-danger' }[e] || 'badge-primary'
}

onMounted(cargarPedidos)
</script>

<style scoped>
.dashboard-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-8); }
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }
.loading-center { display:flex; justify-content:center; padding: var(--space-12); }
.card h3 { font-size: var(--font-size-xl); font-weight: 700; }
</style>
