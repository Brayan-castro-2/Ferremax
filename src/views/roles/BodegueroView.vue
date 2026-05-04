<template>
  <main class="page-wrapper">
    <div class="container">
      <div class="dashboard-header">
        <div>
          <h1>Panel <span class="text-primary">Bodeguero</span></h1>
          <p class="text-muted">Control de inventario — Única Fuente de Verdad</p>
        </div>
        <span class="badge badge-primary" style="font-size: 0.85rem; padding: 0.5rem 1rem;">📦 Bodeguero</span>
      </div>

      <!-- Stock crítico -->
      <div class="alert alert-warning" id="alert-stock-critico" style="margin-bottom: var(--space-6)">
        ⚠️ <strong>2 productos</strong> con stock crítico (menos de 5 unidades). Requieren reposición inmediata.
      </div>

      <div class="card" id="tabla-inventario">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-4)">
          <h3>Inventario General</h3>
          <button class="btn btn-primary btn-sm" id="btn-ajustar-stock">Ajustar Stock</button>
        </div>
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Stock Físico</th>
                <th>Reservas</th>
                <th>Stock Disponible</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in inventario" :key="p.sku" :class="{ 'row-critical': p.stockDisponible < 5 }">
                <td class="text-muted" style="font-family: monospace">{{ p.sku }}</td>
                <td>{{ p.nombre }}</td>
                <td style="font-weight:600">{{ p.stockFisico }}</td>
                <td class="text-warning">{{ p.reservas }}</td>
                <td :class="['stock-cell', p.stockDisponible < 5 ? 'text-danger' : 'text-success']" style="font-weight:700">
                  {{ p.stockDisponible }}
                </td>
                <td>
                  <span v-if="p.stockDisponible === 0" class="badge badge-danger">Sin Stock</span>
                  <span v-else-if="p.stockDisponible < 5" class="badge badge-warning">Crítico</span>
                  <span v-else class="badge badge-success">OK</span>
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
const inventario = [
  { sku: 'SKU-001', nombre: 'Taladro Percutor 700W',   stockFisico: 15, reservas: 3, stockDisponible: 12 },
  { sku: 'SKU-002', nombre: 'Sierra Circular 1400W',    stockFisico: 10, reservas: 2, stockDisponible: 8  },
  { sku: 'SKU-003', nombre: 'Destornillador Eléctrico', stockFisico: 28, reservas: 3, stockDisponible: 25 },
  { sku: 'SKU-006', nombre: 'Set Brocas HSS 19 piezas', stockFisico: 5,  reservas: 2, stockDisponible: 3  },
  { sku: 'SKU-011', nombre: 'Casco de Seguridad HDPE',  stockFisico: 2,  reservas: 2, stockDisponible: 0  },
  { sku: 'SKU-012', nombre: 'Guantes de Cuero Trabajo', stockFisico: 55, reservas: 5, stockDisponible: 50 },
]
</script>

<style scoped>
.dashboard-header { display:flex; align-items:center; justify-content:space-between; margin-bottom: var(--space-8); }
.dashboard-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }
.card h3 { font-size: var(--font-size-xl); font-weight: 700; }
.row-critical td { background: rgba(239,68,68,0.04); }
</style>
