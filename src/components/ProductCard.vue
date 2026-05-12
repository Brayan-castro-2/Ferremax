<template>
  <div class="product-card" :class="{ 'out-of-stock': producto.stock <= 0 }" :id="`product-${producto.id}`">
    <div class="product-image-wrap">
      <span class="product-emoji">{{ producto.emoji || '🔧' }}</span>
      <div v-if="producto.stock <= 0" class="out-of-stock-overlay">Sin Stock</div>
      <span v-if="producto.descuento" class="product-discount-badge">-{{ producto.descuento }}%</span>
    </div>

    <div class="product-body">
      <span class="product-category">{{ producto.categoria }}</span>
      <h3 class="product-name">{{ producto.nombre }}</h3>
      <p class="product-sku text-muted">SKU: {{ producto.sku }}</p>

      <div class="product-footer">
        <div class="product-price">
          <div class="price-clp-block">
            <span class="price-current">${{ formatPrice(producto.precio) }}</span>
            <span v-if="producto.precioOriginal" class="price-original">${{ formatPrice(producto.precioOriginal) }}</span>
          </div>
          <span v-if="precioEnUsd != null" class="price-usd text-muted">≈ USD {{ precioEnUsd }}</span>
        </div>
        <button
          class="btn btn-primary btn-sm"
          :id="`btn-agregar-${producto.id}`"
          :disabled="producto.stock <= 0"
          @click="agregarAlCarrito"
        >
          <span v-if="!agregado">+ Añadir</span>
          <span v-else>✓ Añadido</span>
        </button>
      </div>

      <div class="product-stock-bar">
        <div class="stock-label">
          <span class="text-muted" style="font-size: 0.7rem;">Stock: {{ producto.stock }} uds.</span>
        </div>
        <div class="stock-bar">
          <div class="stock-bar-fill" :style="{ width: stockPercent + '%' }" :class="stockClass"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCarritoStore } from '@/stores/carrito.js'

const props = defineProps({
  producto: { type: Object, required: true },
  /** CLP por 1 USD; si no hay tipo de cambio, no se muestra USD */
  valorDolarClp: { type: Number, default: null }
})

const carrito = useCarritoStore()
const agregado = ref(false)

const stockPercent = computed(() => Math.min((props.producto.stock / 50) * 100, 100))

const precioEnUsd = computed(() => {
  const tipo = props.valorDolarClp
  if (tipo == null || !Number.isFinite(tipo) || tipo <= 0) return null
  const usd = Number(props.producto.precio) / tipo
  if (!Number.isFinite(usd)) return null
  return usd.toFixed(2)
})

const stockClass = computed(() => {
  if (stockPercent.value > 60) return 'stock-high'
  if (stockPercent.value > 25) return 'stock-mid'
  return 'stock-low'
})

function formatPrice(val) {
  return Number(val).toLocaleString('es-CL')
}

function agregarAlCarrito() {
  carrito.agregar(props.producto)
  agregado.value = true
  setTimeout(() => { agregado.value = false }, 1500)
}
</script>

<style scoped>
.product-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-normal), border-color var(--transition-normal), box-shadow var(--transition-normal);
}
.product-card:hover {
  transform: translateY(-4px);
  border-color: rgba(45,212,191,0.25);
  box-shadow: 0 12px 24px rgba(0,0,0,0.4), var(--shadow-glow);
}
.product-card.out-of-stock {
  opacity: 0.6;
}

.product-image-wrap {
  position: relative;
  background: var(--color-surface-2);
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-emoji { font-size: 4rem; }
.out-of-stock-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center;
  font-weight: 700;
  color: var(--color-danger);
  letter-spacing: 1px;
}
.product-discount-badge {
  position: absolute;
  top: 8px; right: 8px;
  background: var(--color-danger);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

.product-body {
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
}
.product-category {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--color-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.product-name {
  font-size: var(--font-size-md);
  font-weight: 600;
  line-height: 1.3;
}
.product-sku {
  font-size: var(--font-size-xs);
}

.product-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: var(--space-2);
}
.product-price {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  min-width: 0;
}
.price-clp-block {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: var(--space-1);
}
.price-usd {
  font-size: var(--font-size-xs);
  font-weight: 500;
}
.price-current {
  font-size: var(--font-size-lg);
  font-weight: 700;
  color: var(--color-primary);
}
.price-original {
  font-size: var(--font-size-xs);
  color: var(--color-text-subtle);
  text-decoration: line-through;
  margin-left: var(--space-2);
}

.product-stock-bar { margin-top: var(--space-2); }
.stock-label { margin-bottom: 4px; }
.stock-bar {
  height: 4px;
  background: var(--color-surface-3);
  border-radius: var(--radius-full);
  overflow: hidden;
}
.stock-bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: width 0.6s ease;
}
.stock-high  { background: var(--color-success); }
.stock-mid   { background: var(--color-warning); }
.stock-low   { background: var(--color-danger); }
</style>
