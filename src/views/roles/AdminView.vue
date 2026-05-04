<template>
  <main class="page-wrapper">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Panel <span class="text-primary">Administrador</span></h1>
          <p class="text-muted">Gestión global del sistema FERREMAS</p>
        </div>
        <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">👑 Administrador</span>
      </div>

      <!-- KPIs -->
      <div class="kpi-grid">
        <div class="kpi-card" v-for="k in kpis" :key="k.label" :id="`kpi-${k.id}`">
          <span class="kpi-icon">{{ k.icon }}</span>
          <div>
            <p class="kpi-value">{{ k.value }}</p>
            <p class="kpi-label">{{ k.label }}</p>
          </div>
          <span :class="['kpi-trend', k.trend > 0 ? 'trend-up' : 'trend-down']">
            {{ k.trend > 0 ? '▲' : '▼' }} {{ Math.abs(k.trend) }}%
          </span>
        </div>
      </div>

      <!-- Usuarios del sistema -->
      <div class="card" id="table-usuarios">
        <h3>Usuarios del Sistema</h3>
        <div class="table-wrapper" style="margin-top: var(--space-4)">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="u in usuariosMockup" :key="u.email">
                <td>{{ u.nombre }}</td>
                <td class="text-muted">{{ u.email }}</td>
                <td><span :class="['badge', `badge-${u.color}`]">{{ u.rol }}</span></td>
                <td><span class="badge badge-success">Activo</span></td>
                <td><button class="btn btn-ghost btn-sm">Editar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const kpis = [
  { id: 'ventas', icon: '💰', label: 'Ventas del Mes',     value: '$4.280.000', trend: 12 },
  { id: 'pedidos', icon: '📦', label: 'Pedidos Activos',   value: '34',          trend: 8  },
  { id: 'usuarios', icon: '👥', label: 'Usuarios Activos', value: '128',         trend: 3  },
  { id: 'stock', icon: '🏭', label: 'Productos en Stock',  value: '312',         trend: -2 },
]

const usuariosMockup = [
  { nombre: 'Carlos Admin',    email: 'admin@ferremas.cl',     rol: 'Administrador', color: 'warning' },
  { nombre: 'Ana Vendedora',   email: 'vendedor@ferremas.cl',  rol: 'Vendedor',      color: 'info'    },
  { nombre: 'Luis Bodeguero',  email: 'bodeguero@ferremas.cl', rol: 'Bodeguero',     color: 'primary' },
  { nombre: 'María Contadora', email: 'contador@ferremas.cl',  rol: 'Contador',      color: 'success' },
]
</script>

<style scoped>
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-8);
}
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}
.kpi-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  display: flex; align-items: center; gap: var(--space-4);
  transition: border-color var(--transition-fast);
}
.kpi-card:hover { border-color: var(--color-primary); }
.kpi-icon { font-size: 2.5rem; }
.kpi-value { font-size: var(--font-size-2xl); font-weight: 800; }
.kpi-label { font-size: var(--font-size-xs); color: var(--color-text-muted); }
.kpi-trend { margin-left: auto; font-size: var(--font-size-xs); font-weight: 600; }
.trend-up   { color: var(--color-success); }
.trend-down { color: var(--color-danger);  }

.card h3 { font-size: var(--font-size-xl); font-weight: 700; }
</style>
