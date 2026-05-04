<template>
  <main class="page-wrapper">
    <div class="container">
      <h1 style="font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-8)">
        Mis <span class="text-primary">Pedidos</span>
      </h1>

      <div v-if="pedidos.length === 0" class="empty-state">
        <span>📦</span>
        <p>No tienes pedidos aún. ¡Visita el catálogo!</p>
        <router-link to="/catalogo" class="btn btn-primary">Ver Catálogo</router-link>
      </div>

      <div v-else class="pedidos-list" id="mis-pedidos-list">
        <div v-for="p in pedidos" :key="p.id" class="pedido-card card" :id="`pedido-${p.id}`">
          <div class="pedido-header">
            <div>
              <p class="pedido-id">Pedido <strong>{{ p.id }}</strong></p>
              <p class="text-muted" style="font-size: var(--font-size-xs)">{{ p.fecha }}</p>
            </div>
            <span :class="['badge', estadoBadge(p.estado)]">{{ p.estado }}</span>
          </div>

          <div class="pedido-items">
            <span v-for="item in p.items" :key="item" class="item-pill">{{ item }}</span>
          </div>

          <div class="pedido-footer">
            <span v-if="p.descuento" class="badge badge-success">Descuento 10% aplicado</span>
            <span class="pedido-total">${{ formatPrice(p.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
const pedidos = [
  { id: 'PED-001', fecha: '04/05/2026 13:00', estado: 'Despachado', total: 189970, descuento: true,  items: ['Taladro 700W', 'Sierra Circular', 'Martillo 500g', 'Brocas HSS', 'Extensión 10m'] },
  { id: 'PED-002', fecha: '02/05/2026 10:30', estado: 'Entregado',  total: 79990,  descuento: false, items: ['Taladro Percutor'] },
]

function formatPrice(val) { return Number(val).toLocaleString('es-CL') }
function estadoBadge(e) {
  return { Pendiente: 'badge-warning', Pagado: 'badge-info', Preparado: 'badge-primary', Despachado: 'badge-success', Entregado: 'badge-success', Cancelado: 'badge-danger' }[e] || 'badge-primary'
}
</script>

<style scoped>
.empty-state { text-align:center; padding: var(--space-16); display:flex; flex-direction:column; align-items:center; gap: var(--space-4); }
.empty-state span { font-size: 4rem; }

.pedidos-list { display:flex; flex-direction:column; gap: var(--space-4); }
.pedido-card { display:flex; flex-direction:column; gap: var(--space-4); }
.pedido-header { display:flex; justify-content:space-between; align-items:flex-start; }
.pedido-id { font-weight: 600; }
.pedido-items { display:flex; flex-wrap:wrap; gap: var(--space-2); }
.item-pill {
  padding: 4px 10px;
  background: var(--color-surface-2);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}
.pedido-footer { display:flex; justify-content:space-between; align-items:center; }
.pedido-total { font-size: var(--font-size-xl); font-weight: 800; color: var(--color-primary); }
</style>
