<template>
  <DashboardShell title="Administración" :links="shellLinks">
    <div class="mx-auto max-w-6xl px-margin-mobile md:px-0">

      <!-- ── HEADER ── -->
      <div class="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 class="font-sora text-headline-xl-mobile text-on-surface md:text-headline-xl">
            Panel <span class="text-primary">Administrador</span>
          </h1>
          <p class="mt-1 font-inter text-body-md text-on-surface-variant">
            Gestión global del sistema FERREMAS
          </p>
        </div>
        <span class="inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 font-geist text-label-sm uppercase tracking-widest text-on-primary">
          👑 Administrador
        </span>
      </div>

      <!-- ── LOADING skeleton ── -->
      <template v-if="cargando">
        <div class="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div v-for="n in 4" :key="n" class="h-28 animate-pulse rounded-xl bg-surface-container-high" />
        </div>
        <div class="h-64 animate-pulse rounded-xl bg-surface-container-high" />
      </template>

      <!-- ── ERROR ── -->
      <div
        v-else-if="errorMsg"
        class="rounded-xl border border-error/25 bg-error-container/60 px-5 py-4 font-inter text-body-md text-on-error-container"
        role="alert"
      >
        {{ errorMsg }}
      </div>

      <!-- ── CONTENIDO PRINCIPAL ── -->
      <template v-else>

        <!-- KPIs -->
        <div class="mb-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
          <div
            v-for="k in kpis"
            :key="k.label"
            :id="`kpi-${k.id}`"
            class="group flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-6 shadow-ambient transition hover:ring-1 hover:ring-primary/20"
          >
            <div class="flex items-start justify-between">
              <span class="text-4xl leading-none">{{ k.icon }}</span>
              <span
                :class="[
                  'font-geist text-[11px] font-semibold',
                  k.trend > 0 ? 'text-emerald-600' : 'text-error'
                ]"
              >
                {{ k.trend > 0 ? '▲' : '▼' }} {{ Math.abs(k.trend) }}%
              </span>
            </div>
            <div>
              <p class="font-sora text-3xl font-semibold text-primary">{{ k.value }}</p>
              <p class="mt-1 font-geist text-[10px] uppercase tracking-[0.18em] text-on-surface-variant">
                {{ k.label }}
              </p>
            </div>
          </div>
        </div>

        <!-- Tabla usuarios -->
        <div id="table-usuarios" class="overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient">
          <div class="border-b border-outline-variant/40 px-6 py-5">
            <h2 class="font-sora text-headline-xl-mobile font-semibold text-on-surface">
              Usuarios del Sistema
            </h2>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full">
              <thead>
                <tr class="border-b border-outline-variant/40 bg-surface-container-low">
                  <th class="px-6 py-3 text-left font-geist text-[10px] uppercase tracking-widest text-on-surface-variant">Nombre</th>
                  <th class="px-6 py-3 text-left font-geist text-[10px] uppercase tracking-widest text-on-surface-variant">Email</th>
                  <th class="px-6 py-3 text-left font-geist text-[10px] uppercase tracking-widest text-on-surface-variant">Rol</th>
                  <th class="px-6 py-3 text-left font-geist text-[10px] uppercase tracking-widest text-on-surface-variant">Estado</th>
                  <th class="px-6 py-3 text-left font-geist text-[10px] uppercase tracking-widest text-on-surface-variant">Acción</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="u in usuarios"
                  :key="u.id"
                  class="border-b border-outline-variant/40 transition last:border-0 hover:bg-surface-container"
                >
                  <td class="px-6 py-4 font-inter text-body-md font-medium text-on-surface">
                    {{ u.nombre }}
                  </td>
                  <td class="px-6 py-4 font-inter text-body-md text-on-surface-variant">
                    {{ u.email }}
                  </td>
                  <td class="px-6 py-4">
                    <span class="rounded-full bg-primary/10 px-3 py-1 font-geist text-xs font-medium text-primary">
                      {{ u.rol_nombre || '—' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <span
                      :class="[
                        'rounded-full px-3 py-1 font-geist text-xs font-medium',
                        u.activo
                          ? 'bg-tertiary/10 text-tertiary'
                          : 'bg-error/10 text-error'
                      ]"
                    >
                      {{ u.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td class="px-6 py-4">
                    <button
                      type="button"
                      class="rounded-lg border border-outline-variant px-3 py-1 font-geist text-xs uppercase tracking-wider text-on-surface-variant transition hover:border-primary hover:text-primary"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </template>
    </div>
  </DashboardShell>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardShell from '@/components/layout/DashboardShell.vue'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { supabase, isMockup } from '@/lib/supabase.js'

const shellLinks = [
  { label: 'Administración', to: '/admin' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
]

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


