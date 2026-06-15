<template>
  <main class="page-wrapper">
    <div class="container">
      <h1 style="font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-8)">
        Mi <span class="text-primary">Carrito</span>
      </h1>

      <!-- Carrito vacío -->
      <div v-if="carrito.items.length === 0" class="empty-cart" id="empty-cart">
        <span>🛒</span>
        <h2>Tu carrito está vacío</h2>
        <p class="text-muted">Agrega productos desde el catálogo para comenzar</p>
        <router-link to="/catalogo" class="btn btn-primary btn-lg" id="btn-ir-catalogo">Ver Catálogo</router-link>
      </div>

      <!-- Carrito con items -->
      <div v-else class="cart-layout">
        <!-- Lista de items -->
        <div class="cart-items" id="cart-items-list">
          <div v-for="item in carrito.items" :key="item.id" class="cart-item" :id="`cart-item-${item.id}`">
            <div class="item-emoji">{{ emojiCategoria(item.categoria) }}</div>
            <div class="item-info">
              <p class="item-name">{{ item.nombre }}</p>
              <p class="text-muted" style="font-size: var(--font-size-xs)">{{ item.categoria }}</p>
            </div>
            <div class="item-controls">
              <button class="qty-btn" @click="carrito.quitar(item.id)" :id="`btn-menos-${item.id}`">−</button>
              <span class="qty-display">{{ item.cantidad }}</span>
              <button class="qty-btn" @click="carrito.agregar(item)" :id="`btn-mas-${item.id}`">+</button>
            </div>
            <div class="item-price">${{ formatPrice(item.precio * item.cantidad) }}</div>
            <button class="btn-remove" @click="carrito.eliminar(item.id)" :id="`btn-eliminar-${item.id}`" title="Eliminar">✕</button>
          </div>
        </div>

        <!-- Resumen del pedido -->
        <div class="cart-summary card" id="cart-summary">
          <h3>Resumen del Pedido</h3>

          <div class="summary-row">
            <span class="text-muted">Subtotal ({{ carrito.totalItems }} artículos)</span>
            <span>${{ formatPrice(carrito.subtotal) }}</span>
          </div>

          <div v-if="carrito.aplicaDescuento" class="summary-row discount-row" id="descuento-aplicado">
            <span>🎉 Descuento volumen (10%) <span class="badge badge-success">+4 artículos</span></span>
            <span class="text-success">−${{ formatPrice(carrito.descuento) }}</span>
          </div>

          <div class="summary-divider"></div>

          <div class="summary-row total-row">
            <span>Total a pagar</span>
            <span class="text-primary" style="font-size: var(--font-size-2xl); font-weight: 800">
              ${{ formatPrice(carrito.total) }}
            </span>
          </div>

          <!-- Hint de descuento si no aplica aún -->
          <div v-if="!carrito.aplicaDescuento" class="discount-hint" id="hint-descuento">
            💡 Agrega <strong>{{ 5 - carrito.totalItems }}</strong> artículo{{ (5 - carrito.totalItems) !== 1 ? 's' : '' }} más y obtén 10% de descuento
          </div>

          <!-- Error al confirmar -->
          <div v-if="errorPedido" class="alert alert-danger" id="error-pedido">{{ errorPedido }}</div>

          <!-- Botón confirmar -->
          <button
            class="btn btn-primary btn-full btn-lg"
            id="btn-confirmar-pedido"
            @click="procederAlCheckout"
          >
            <span>Ir al Checkout / Pagar</span>
          </button>

          <button class="btn btn-ghost btn-full btn-sm" id="btn-vaciar-carrito" @click="carrito.vaciar()">
            Vaciar carrito
          </button>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCarritoStore } from '@/stores/carrito.js'

const router  = useRouter()
const auth    = useAuthStore()
const carrito = useCarritoStore()

const errorPedido = ref('')

const EMOJIS_CATEGORIA = {
  'Herramientas Eléctricas': '⚡',
  'Herramientas Manuales':   '🔧',
  'Construcción':            '🏗️',
  'Pintura':                 '🖌️',
  'Electricidad':            '🔌',
  'Seguridad':               '⛑️',
}
function emojiCategoria(cat) { return EMOJIS_CATEGORIA[cat] || '🔧' }
function formatPrice(val)    { return Number(val).toLocaleString('es-CL') }

function procederAlCheckout() {
  if (!auth.isAuthenticated) {
    errorPedido.value = 'Debes iniciar sesión para proceder al pago.'
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }
  router.push('/checkout')
}
</script>

<style scoped>
.empty-cart {
  text-align: center; padding: var(--space-16);
  display: flex; flex-direction: column; align-items: center; gap: var(--space-4);
}
.empty-cart span { font-size: 5rem; }
.empty-cart h2   { font-size: var(--font-size-2xl); font-weight: 700; }

.cart-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--space-8);
  align-items: start;
}

.cart-items { display: flex; flex-direction: column; gap: var(--space-3); }

.cart-item {
  display: flex; align-items: center; gap: var(--space-4);
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
}
.item-emoji { font-size: 2rem; min-width: 2.5rem; text-align: center; }
.item-info  { flex: 1; }
.item-name  { font-weight: 600; }

.item-controls { display: flex; align-items: center; gap: var(--space-2); }
.qty-btn {
  width: 2rem; height: 2rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text); font-size: 1.2rem;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; transition: background var(--transition-fast);
}
.qty-btn:hover { background: var(--color-primary); border-color: var(--color-primary); color: #071A14; }
.qty-display { font-weight: 700; min-width: 24px; text-align: center; }

.item-price { font-weight: 700; min-width: 90px; text-align: right; }
.btn-remove {
  color: var(--color-text-subtle); font-size: 1rem;
  padding: var(--space-2); border-radius: var(--radius-sm);
  cursor: pointer; transition: color var(--transition-fast), background var(--transition-fast);
}
.btn-remove:hover { color: var(--color-danger); background: rgba(239,68,68,0.1); }

.cart-summary {
  position: sticky; top: calc(var(--navbar-height) + var(--space-4));
  display: flex; flex-direction: column; gap: var(--space-4);
}
.cart-summary h3 { font-size: var(--font-size-xl); font-weight: 700; margin-bottom: var(--space-2); }

.summary-row { display: flex; justify-content: space-between; align-items: center; font-size: var(--font-size-sm); }
.discount-row { color: var(--color-success); }
.total-row { font-weight: 700; font-size: var(--font-size-md); }
.summary-divider { border-top: 1px solid var(--color-border); margin: var(--space-2) 0; }

.discount-hint {
  background: rgba(45,212,191,0.06);
  border: 1px solid rgba(45,212,191,0.18);
  border-radius: var(--radius-md);
  padding: var(--space-3); font-size: var(--font-size-xs);
  color: var(--color-text-muted);
}

/* Modal de éxito */
.success-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(7, 13, 20, 0.85);
  display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(6px);
  animation: fadeIn 0.3s ease;
}
.success-card {
  background: var(--color-surface-card);
  border: 1px solid rgba(45,212,191,0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  max-width: 440px; width: 90%;
  text-align: center;
  box-shadow: var(--shadow-lg), var(--shadow-glow);
}
.success-icon { font-size: 4rem; display: block; margin-bottom: var(--space-4); }
.success-card h2 { font-size: var(--font-size-2xl); font-weight: 800; margin-bottom: var(--space-2); }

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

@media (max-width: 768px) { .cart-layout { grid-template-columns: 1fr; } }
</style>
