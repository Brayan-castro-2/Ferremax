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

      <div v-if="cargando" class="loading-center"><div class="spinner"></div></div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <template v-else>
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
                <tr v-for="u in usuarios" :key="u.id">
                  <td>{{ u.nombre }}</td>
                  <td class="text-muted">{{ u.email }}</td>
                  <td>
                    <span :class="['badge', `badge-${rolBadgeClass(u.rol_nombre)}`]">
                      {{ u.rol_nombre || '—' }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge', u.activo ? 'badge-success' : 'badge-danger']">
                      {{ u.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td><button type="button" class="btn btn-ghost btn-sm">Editar</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { supabase, isMockup } from '@/lib/supabase.js'

const usuarios  = ref([])
const cargando  = ref(true)
const errorMsg  = ref('')

// KPIs reales desde BD
const kpiVentasMes = ref(0)
const kpiPedidosActivos = ref(0)
const kpiUsuariosActivos = ref(0)
const kpiProductosStock = ref(0)

/** Mock alineado con formas reales de Supabase */
const USUARIOS_MOCKUP = [
  { id: 'm1', nombre: 'Carlos Admin',    email: 'admin@ferremas.cl',     rol_nombre: 'Administrador', activo: true },
  { id: 'm2', nombre: 'Ana Vendedora',   email: 'vendedor@ferremas.cl',  rol_nombre: 'Vendedor',      activo: true },
  { id: 'm3', nombre: 'Luis Bodeguero',  email: 'bodeguero@ferremas.cl', rol_nombre: 'Bodeguero',     activo: true },
  { id: 'm4', nombre: 'María Contadora', email: 'contador@ferremas.cl',  rol_nombre: 'Contador',      activo: false },
]

const kpis = computed(() => {
  return [
    {
      id: 'ventas',
      icon: '💰',
      label: 'Ventas del Mes',
      value: `$${kpiVentasMes.value.toLocaleString('es-CL')}`,
      trend: 12
    },
    {
      id: 'pedidos',
      icon: '📦',
      label: 'Pedidos Activos',
      value: String(kpiPedidosActivos.value),
      trend: 8
    },
    {
      id: 'usuarios',
      icon: '👥',
      label: 'Usuarios Activos',
      value: String(kpiUsuariosActivos.value),
      trend: 3
    },
    {
      id: 'stock',
      icon: '🏭',
      label: 'Productos en Stock',
      value: String(kpiProductosStock.value),
      trend: -2
    }
  ]
})

function rolBadgeClass(rolNombre) {
  const map = {
    Administrador: 'warning',
    Vendedor: 'info',
    Bodeguero: 'primary',
    Contador: 'success',
    Cliente: 'primary'
  }
  return map[rolNombre] || 'primary'
}

async function cargarDatos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    if (isMockup) {
      await new Promise((r) => setTimeout(r, 500))
      usuarios.value = USUARIOS_MOCKUP
      // Datos fijos para mockup
      kpiVentasMes.value = 4280000
      kpiPedidosActivos.value = 34
      kpiUsuariosActivos.value = 128
      kpiProductosStock.value = 312
    } else {
      // 1. Obtener listado de usuarios (para la tabla)
      usuarios.value = await ServiciosSupabase.obtenerUsuarios()

      // 2. Obtener KPIs usando supabase db calls directas
      
      const ahora = new Date()
      const mesActual = ahora.getMonth() + 1 // en Postgres los meses son 1-12
      const anioActual = ahora.getFullYear()

      // 2.1 Ventas del mes (para simular el sumatorio que pediste, obtenemos los pedidos del mes)
      const inicioMes = new Date(anioActual, mesActual - 1, 1).toISOString()
      const finMes = new Date(anioActual, mesActual, 0, 23, 59, 59, 999).toISOString()
      
      const { data: pedidosMes, error: errVentas } = await supabase
        .from('pedidos')
        .select('total')
        .gte('creado_en', inicioMes)
        .lte('creado_en', finMes)

      if (errVentas) throw errVentas
      kpiVentasMes.value = pedidosMes.reduce((acc, p) => acc + (Number(p.total) || 0), 0)

      // 2.2 Pedidos activos
      const { count: pedidosActivos, error: errPedidos } = await supabase
        .from('pedidos')
        .select('*', { count: 'exact', head: true })
        .not('estado', 'in', '("cancelado","entregado")')
      
      if (errPedidos) throw errPedidos
      kpiPedidosActivos.value = pedidosActivos || 0

      // 2.3 Usuarios activos
      const { count: usuariosActivos, error: errUsuarios } = await supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)

      if (errUsuarios) throw errUsuarios
      kpiUsuariosActivos.value = usuariosActivos || 0

      // 2.4 Productos en stock
      const { count: productosStock, error: errProductos } = await supabase
        .from('productos')
        .select('*', { count: 'exact', head: true })
        .gt('stock', 0)
        .eq('activo', true)

      if (errProductos) throw errProductos
      kpiProductosStock.value = productosStock || 0
    }
  } catch (err) {
    errorMsg.value = `Error: ${err.message}`
    console.error('Error cargando AdminView:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(cargarDatos)
</script>

<style scoped>
.dashboard-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: var(--space-8);
}
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }

.loading-center { display: flex; justify-content: center; padding: var(--space-12); }

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
