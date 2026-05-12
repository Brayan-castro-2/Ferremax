<template>
  <DashboardShell title="Bodega" :links="shellLinks">
    <div class="container mx-auto max-w-6xl">
      <div class="dashboard-header">
        <div>
          <h1>Panel <span class="text-primary">Bodeguero</span></h1>
          <p class="text-muted">Control de inventario — stock de la tabla <code>productos</code></p>
        </div>
        <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">📦 Bodeguero</span>
      </div>

      <div v-if="cargando" class="loading-center"><div class="spinner"></div></div>
      <div v-else-if="errorMsg" class="alert alert-danger">{{ errorMsg }}</div>

      <template v-else>
        <!-- Alerta stock crítico -->
        <div v-if="criticos.length > 0" class="alert alert-warning" style="margin-bottom: var(--space-6)">
          ⚠️ <strong>{{ criticos.length }} producto{{ criticos.length > 1 ? 's' : '' }}</strong>
          con stock crítico (≤5 unidades). Requieren reposición.
        </div>

        <div class="card" id="tabla-inventario">
          <h3 style="margin-bottom: var(--space-4)">Inventario de Productos</h3>
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Producto</th>
                  <th>Categoría</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="p in productos" :key="p.id" :class="{ 'row-critical': p.stock <= 5 }">
                  <td class="text-muted" style="font-family:monospace">{{ p.id }}</td>
                  <td style="font-weight:600">{{ p.nombre }}</td>
                  <td class="text-muted">{{ p.categoria }}</td>
                  <td>${{ formatPrice(p.precio) }}</td>
                  <td :class="['stock-cell', p.stock === 0 ? 'text-danger' : p.stock <= 5 ? 'text-warning' : 'text-success']" style="font-weight:700">
                    {{ p.stock }}
                  </td>
                  <td>
                    <span v-if="p.stock === 0"  class="badge badge-danger">Sin Stock</span>
                    <span v-else-if="p.stock <= 5" class="badge badge-warning">Crítico</span>
                    <span v-else                class="badge badge-success">OK</span>
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
import { isMockup } from '@/lib/supabase.js'

const shellLinks = [
  { label: 'Bodega', to: '/bodeguero' },
  { label: 'Resumen', to: '/dashboard' },
  { label: 'Catálogo', to: '/catalogo' },
]

const productos = ref([])
const cargando  = ref(true)
const errorMsg  = ref('')

const criticos  = computed(() => productos.value.filter(p => p.stock <= 5))

async function cargarProductos() {
  cargando.value = true
  try {
    if (isMockup) {
      await new Promise(r => setTimeout(r, 400))
      productos.value = [
        { id: 1, nombre: 'Taladro Percutor 700W',     categoria: 'Herramientas Eléctricas', precio: 79990,  stock: 12 },
        { id: 2, nombre: 'Sierra Circular 1400W',      categoria: 'Herramientas Eléctricas', precio: 124990, stock: 8  },
        { id: 6, nombre: 'Set Brocas HSS 19 piezas',   categoria: 'Herramientas Manuales',   precio: 19990,  stock: 3  },
        { id: 11, nombre: 'Casco de Seguridad HDPE',   categoria: 'Seguridad',               precio: 9990,   stock: 0  },
        { id: 12, nombre: 'Guantes de Cuero Trabajo',  categoria: 'Seguridad',               precio: 5990,   stock: 50 },
      ]
    } else {
      // Trae todos los productos (activos e inactivos) para el bodeguero
      const { data, error } = await (await import('@/lib/supabase.js')).supabase
        .from('productos')
        .select('id, nombre, categoria, precio, stock, activo')
        .order('stock', { ascending: true })

      if (error) throw error
      productos.value = data
    }
  } catch (err) {
    errorMsg.value = `Error al cargar inventario: ${err.message}`
  } finally {
    cargando.value = false
  }
}

function formatPrice(val) { return Number(val).toLocaleString('es-CL') }
onMounted(cargarProductos)
</script>

<style scoped>
.dashboard-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-8); }
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }
.loading-center { display:flex; justify-content:center; padding: var(--space-12); }
.row-critical td { background: rgba(239,68,68,0.04); }
code { background: var(--color-surface-2); padding: 2px 6px; border-radius: 4px; font-size: 0.85em; }
</style>
