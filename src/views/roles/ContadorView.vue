<template>
  <DashboardShell title="Finanzas" :links="shellLinks">
    <div class="container mx-auto max-w-6xl">
      <div class="dashboard-header">
        <div>
          <h1>Panel <span class="text-primary">Contador</span></h1>
          <p class="text-muted">Gestión de excepciones financieras y reportes</p>
        </div>
        <span class="badge badge-success" style="font-size: 0.85rem; padding: 0.5rem 1rem;">💰 Contador</span>
      </div>

      <!-- KPIs financieros -->
      <div class="kpi-grid" style="margin-bottom: var(--space-8)">
        <div class="kpi-card" v-for="k in kpis" :key="k.id" :id="`kpi-${k.id}`">
          <span class="kpi-icon">{{ k.icon }}</span>
          <div>
            <p class="kpi-value">{{ k.value }}</p>
            <p class="kpi-label">{{ k.label }}</p>
          </div>
        </div>
      </div>

      <!-- Excepciones financieras -->
      <div class="card" id="tabla-excepciones">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-4)">
          <h3>⚠️ Excepciones Financieras</h3>
          <span class="badge badge-danger">{{ excepcionesMockup.length }} pendientes</span>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Motivo</th>
                <th>Monto</th>
                <th>Stock Liberado</th>
                <th>Fecha</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="e in excepcionesMockup" :key="e.id">
                <td class="text-muted" style="font-family:monospace">{{ e.id }}</td>
                <td><span class="badge badge-danger">{{ e.motivo }}</span></td>
                <td style="font-weight:600">${{ formatPrice(e.monto) }}</td>
                <td class="text-success">✓ Revertido</td>
                <td class="text-muted">{{ e.fecha }}</td>
                <td><button class="btn btn-ghost btn-sm">Revisar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </DashboardShell>
</template>

<script setup>
import DashboardShell from '@/components/layout/DashboardShell.vue'

const shellLinks = [
  { label: 'Finanzas', to: '/contador' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
]
const kpis = [
  { id: 'ingresos', icon: '💵', label: 'Ingresos Mes',          value: '$4.280.000' },
  { id: 'descuentos', icon: '🎁', label: 'Descuentos Aplicados', value: '$182.000'   },
  { id: 'cancelados', icon: '❌', label: 'Pedidos Cancelados',   value: '7'          },
  { id: 'recuperados', icon: '🔁', label: 'Stock Recuperado',    value: '23 uds.'    },
]

const excepcionesMockup = [
  { id: 'PED-006', motivo: 'Pago Rechazado', monto: 79990,  fecha: '04/05/2026 10:22' },
  { id: 'PED-007', motivo: 'TTL Expirado',   monto: 124990, fecha: '04/05/2026 11:45' },
  { id: 'PED-008', motivo: 'Pago Rechazado', monto: 34990,  fecha: '03/05/2026 16:30' },
]

function formatPrice(val) { return Number(val).toLocaleString('es-CL') }
</script>

<style scoped>
.dashboard-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-8); }
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }

.kpi-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: var(--space-4); }
.kpi-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex; align-items: center; gap: var(--space-4);
}
.kpi-icon { font-size: 2rem; }
.kpi-value { font-size: var(--font-size-2xl); font-weight: 800; }
.kpi-label { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.card h3 { font-size: var(--font-size-xl); font-weight: 700; }
</style>
