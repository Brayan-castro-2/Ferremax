<template>
  <main class="page-wrapper">
    <div class="container">
      <!-- Header -->
      <section class="catalogo-header">
        <div>
          <h1>Catálogo de <span class="text-primary">Productos</span></h1>
          <p class="text-muted">{{ productosFiltrados.length }} productos disponibles</p>
        </div>
        <!-- Buscador -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            id="input-buscar-producto"
            v-model="busqueda"
            type="text"
            class="form-input"
            placeholder="Buscar herramientas, materiales..."
          />
        </div>
      </section>

      <!-- Filtros por categoría -->
      <div class="categoria-filters" id="filtros-categoria">
        <button
          v-for="cat in categorias"
          :key="cat"
          class="cat-btn"
          :class="{ active: categoriaActiva === cat }"
          :id="`filter-${cat.toLowerCase().replace(' ', '-')}`"
          @click="categoriaActiva = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Grid de productos -->
      <div class="products-grid" id="products-grid">
        <transition-group name="slide-up">
          <ProductCard
            v-for="p in productosFiltrados"
            :key="p.id"
            :producto="p"
          />
        </transition-group>
      </div>

      <!-- Sin resultados -->
      <div v-if="productosFiltrados.length === 0" class="empty-state" id="empty-catalogo">
        <span>🔍</span>
        <p>No se encontraron productos para "<strong>{{ busqueda }}</strong>"</p>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import ProductCard from '@/components/ProductCard.vue'

const busqueda = ref('')
const categoriaActiva = ref('Todos')

// Datos mockup de productos FERREMAS
const productos = [
  { id: 'P001', sku: 'SKU-001', nombre: 'Taladro Percutor 700W',     categoria: 'Herramientas Eléctricas', precio: 79990,  stock: 12, emoji: '🔨' },
  { id: 'P002', sku: 'SKU-002', nombre: 'Sierra Circular 1400W',      categoria: 'Herramientas Eléctricas', precio: 124990, stock: 8,  emoji: '⚙️', descuento: 10, precioOriginal: 138900 },
  { id: 'P003', sku: 'SKU-003', nombre: 'Destornillador Eléctrico',   categoria: 'Herramientas Eléctricas', precio: 34990,  stock: 25, emoji: '🪛' },
  { id: 'P004', sku: 'SKU-004', nombre: 'Martillo 500g Mango Fibra',  categoria: 'Herramientas Manuales',   precio: 12990,  stock: 40, emoji: '🔨' },
  { id: 'P005', sku: 'SKU-005', nombre: 'Llave Inglesa 10"',          categoria: 'Herramientas Manuales',   precio: 8990,   stock: 30, emoji: '🔧' },
  { id: 'P006', sku: 'SKU-006', nombre: 'Set Brocas HSS 19 piezas',   categoria: 'Herramientas Manuales',   precio: 19990,  stock: 3,  emoji: '🪛' },
  { id: 'P007', sku: 'SKU-007', nombre: 'Cemento 25kg Portland',      categoria: 'Construcción',            precio: 7490,   stock: 60, emoji: '🏗️' },
  { id: 'P008', sku: 'SKU-008', nombre: 'Pintura Látex Blanca 4L',    categoria: 'Pintura',                 precio: 18990,  stock: 18, emoji: '🖌️' },
  { id: 'P009', sku: 'SKU-009', nombre: 'Rodillo 22cm Lana',          categoria: 'Pintura',                 precio: 4990,   stock: 35, emoji: '🖌️' },
  { id: 'P010', sku: 'SKU-010', nombre: 'Extensión 10m 3 Enchufes',   categoria: 'Electricidad',            precio: 14990,  stock: 22, emoji: '🔌' },
  { id: 'P011', sku: 'SKU-011', nombre: 'Casco de Seguridad HDPE',    categoria: 'Seguridad',               precio: 9990,   stock: 0,  emoji: '⛑️' },
  { id: 'P012', sku: 'SKU-012', nombre: 'Guantes de Cuero Trabajo',   categoria: 'Seguridad',               precio: 5990,   stock: 50, emoji: '🧤' },
]

const categorias = computed(() => {
  const cats = [...new Set(productos.map(p => p.categoria))]
  return ['Todos', ...cats]
})

const productosFiltrados = computed(() => {
  let lista = productos
  if (categoriaActiva.value !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoriaActiva.value)
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(p => p.nombre.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q))
  }
  return lista
})
</script>

<style scoped>
.catalogo-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-6);
  margin-bottom: var(--space-6);
  flex-wrap: wrap;
}
.catalogo-header h1 { font-size: var(--font-size-3xl); font-weight: 800; }

.search-box {
  position: relative;
  flex: 1;
  min-width: 260px;
  max-width: 400px;
}
.search-icon {
  position: absolute;
  left: var(--space-4);
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  pointer-events: none;
}
.search-box .form-input { padding-left: 3rem; }

.categoria-filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}
.cat-btn {
  padding: 0.4rem var(--space-4);
  border-radius: var(--radius-full);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.cat-btn:hover { background: var(--color-surface-3); color: var(--color-text); }
.cat-btn.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-12);
}

.empty-state {
  text-align: center;
  padding: var(--space-16);
  color: var(--color-text-muted);
  font-size: var(--font-size-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
}
.empty-state span { font-size: 4rem; }
</style>
