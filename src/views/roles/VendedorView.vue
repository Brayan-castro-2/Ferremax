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

      <!-- Tabla de pedidos -->
      <div class="card" id="tabla-pedidos-vendedor">
        <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4)">
          <h3>Pedidos Recientes</h3>
          <button class="btn btn-primary btn-sm" id="btn-nuevo-pedido">+ Nuevo Pedido</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Descuento</th>
                <th>Estado</th>
                <th>Expira</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in pedidosMockup" :key="p.id">
                <td class="text-muted" style="font-family: monospace">{{ p.id }}</td>
                <td>{{ p.cliente }}</td>
                <td style="font-weight:600">${{ formatPrice(p.total) }}</td>
                <td>
                  <span v-if="p.descuento" class="badge badge-success">Sí 10%</span>
                  <span v-else class="text-muted">No</span>
                </td>
                <td><span :class="['badge', estadoBadge(p.estado)]">{{ p.estado }}</span></td>
                <td class="text-muted" style="font-size:0.75rem">{{ p.expira }}</td>
                <td>
                  <select class="form-input btn-sm" style="width:auto; padding: 0.3rem 0.5rem" @change="cambiarEstado(p, $event)">
                    <option v-for="e in estados" :key="e" :value="e" :selected="p.estado === e">{{ e }}</option>
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
import { ref } from 'vue'

const estados = ['Pendiente', 'Pagado', 'Preparado', 'Despachado', 'Cancelado']

const pedidosMockup = ref([
  { id: 'PED-001', cliente: 'Pedro García',   total: 189970, descuento: true,  estado: 'Pendiente',  expira: '14:32' },
  { id: 'PED-002', cliente: 'María López',    total: 79990,  descuento: false, estado: 'Pagado',     expira: '—'     },
  { id: 'PED-003', cliente: 'Juan Pérez',     total: 245000, descuento: true,  estado: 'Preparado',  expira: '—'     },
  { id: 'PED-004', cliente: 'Sofía Rojas',    total: 34990,  descuento: false, estado: 'Despachado', expira: '—'     },
  { id: 'PED-005', cliente: 'Diego Muñoz',    total: 124990, descuento: false, estado: 'Pendiente',  expira: '15:00' },
])

function formatPrice(val) { return Number(val).toLocaleString('es-CL') }

function estadoBadge(estado) {
  const map = { Pendiente: 'badge-warning', Pagado: 'badge-info', Preparado: 'badge-primary', Despachado: 'badge-success', Cancelado: 'badge-danger' }
  return map[estado] || 'badge-primary'
}

function cambiarEstado(pedido, event) {
  pedido.estado = event.target.value
}
</script>

<style scoped>
.dashboard-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-8); }
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }
.card h3 { font-size: var(--font-size-xl); font-weight: 700; }
</style>
