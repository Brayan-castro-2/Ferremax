<template>
  <main class="page-wrapper">
    <div class="container">
      <!-- Header -->
      <section class="catalogo-header">
        <div>
          <h1>Catálogo de <span class="text-primary">Productos</span></h1>
          <p class="text-muted">
            <span v-if="cargando">Cargando productos...</span>
            <span v-else>{{ productosFiltrados.length }} productos disponibles</span>
          </p>
        </div>
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

      <!-- Error de conexión -->
      <div v-if="errorMsg" class="alert alert-danger" id="catalogo-error">
        ⚠️ {{ errorMsg }}
        <button class="btn btn-sm btn-ghost" style="margin-left: var(--space-4)" @click="cargarProductos">Reintentar</button>
      </div>

      <!-- Filtros por categoría -->
      <div v-if="!cargando" class="categoria-filters" id="filtros-categoria">
        <button
          v-for="cat in categorias"
          :key="cat"
          class="cat-btn"
          :class="{ active: categoriaActiva === cat }"
          :id="`filter-cat-${cat === 'Todos' ? 'todos' : cat.toLowerCase().replace(/\s+/g, '-')}`"
          @click="categoriaActiva = cat"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Skeleton loader -->
      <div v-if="cargando" class="products-grid">
        <div v-for="n in 8" :key="n" class="skeleton-card"></div>
      </div>

      <!-- Grid de productos -->
      <div v-else class="products-grid" id="products-grid">
        <transition-group name="slide-up">
          <ProductCard
            v-for="p in productosFiltrados"
            :key="p.id"
            :producto="p"
          />
        </transition-group>
      </div>

      <!-- Sin resultados -->
      <div v-if="!cargando && productosFiltrados.length === 0 && !errorMsg" class="empty-state" id="empty-catalogo">
        <span>🔍</span>
        <p>No se encontraron productos<span v-if="busqueda"> para "<strong>{{ busqueda }}</strong>"</span></p>
      </div>

      <!-- Banner de descuento por volumen -->
      <div class="descuento-banner" id="banner-descuento-volumen">
        <span class="banner-icon">🎉</span>
        <div>
          <strong>¡Descuento automático del 10%!</strong>
          <p>Aplica cuando tu carrito tiene más de 4 artículos. ¡Aprovecha!</p>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { isMockup } from '@/lib/supabase.js'

const busqueda        = ref('')
const categoriaActiva = ref('Todos')
const productos       = ref([])
const cargando        = ref(true)
const errorMsg        = ref('')

// Datos de fallback para modo mockup
const PRODUCTOS_MOCKUP = [
  { id: 1,  nombre: 'Taladro Percutor 700W',     descripcion: 'Taladro con percusión para mampostería',   precio: 79990,  stock: 12, categoria: 'Herramientas Eléctricas', activo: true },
  { id: 2,  nombre: 'Sierra Circular 1400W',      descripcion: 'Sierra de alta potencia para maderas',     precio: 124990, stock: 8,  categoria: 'Herramientas Eléctricas', activo: true },
  { id: 3,  nombre: 'Destornillador Eléctrico',   descripcion: 'Batería de larga duración 18V',            precio: 34990,  stock: 25, categoria: 'Herramientas Eléctricas', activo: true },
  { id: 4,  nombre: 'Martillo 500g Mango Fibra',  descripcion: 'Mango ergonómico antideslizante',          precio: 12990,  stock: 40, categoria: 'Herramientas Manuales',   activo: true },
  { id: 5,  nombre: 'Llave Inglesa 10"',           descripcion: 'Acero forjado resistente',                precio: 8990,   stock: 30, categoria: 'Herramientas Manuales',   activo: true },
  { id: 6,  nombre: 'Set Brocas HSS 19 piezas',   descripcion: 'Para metal, madera y plástico',            precio: 19990,  stock: 3,  categoria: 'Herramientas Manuales',   activo: true },
  { id: 7,  nombre: 'Cemento 25kg Portland',       descripcion: 'Alta resistencia, uso general',           precio: 7490,   stock: 60, categoria: 'Construcción',            activo: true },
  { id: 8,  nombre: 'Pintura Látex Blanca 4L',    descripcion: 'Interior/exterior, lavable',               precio: 18990,  stock: 18, categoria: 'Pintura',                 activo: true },
  { id: 9,  nombre: 'Rodillo 22cm Lana',           descripcion: 'Para superficies lisas y semilisas',      precio: 4990,   stock: 35, categoria: 'Pintura',                 activo: true },
  { id: 10, nombre: 'Extensión 10m 3 Enchufes',   descripcion: 'Cable 2.5mm², uso industrial',             precio: 14990,  stock: 22, categoria: 'Electricidad',            activo: true },
  { id: 11, nombre: 'Casco de Seguridad HDPE',    descripcion: 'Certificado ANSI Z89.1',                   precio: 9990,   stock: 0,  categoria: 'Seguridad',               activo: true },
  { id: 12, nombre: 'Guantes de Cuero Trabajo',   descripcion: 'Talla M/L/XL disponible',                  precio: 5990,   stock: 50, categoria: 'Seguridad',               activo: true },
]

async function cargarProductos() {
  cargando.value = true
  errorMsg.value = ''
  try {
    if (isMockup) {
      await new Promise(r => setTimeout(r, 400))
      productos.value = PRODUCTOS_MOCKUP
    } else {
      productos.value = await ServiciosSupabase.obtenerProductos()
    }
  } catch (err) {
    errorMsg.value = `No se pudieron cargar los productos: ${err.message}`
    productos.value = PRODUCTOS_MOCKUP  // fallback
  } finally {
    cargando.value = false
  }
}

const categorias = computed(() => {
  const cats = [...new Set(productos.value.map(p => p.categoria).filter(Boolean))]
  return ['Todos', ...cats.sort()]
})

const productosFiltrados = computed(() => {
  let lista = productos.value
  if (categoriaActiva.value !== 'Todos') {
    lista = lista.filter(p => p.categoria === categoriaActiva.value)
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(p =>
      p.nombre.toLowerCase().includes(q) ||
      p.categoria?.toLowerCase().includes(q) ||
      p.descripcion?.toLowerCase().includes(q)
    )
  }
  return lista
})

onMounted(cargarProductos)
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
  color: #071A14;
  font-weight: 700;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--space-6);
  margin-bottom: var(--space-10);
}

/* Skeleton */
.skeleton-card {
  background: var(--color-surface-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  height: 320px;
  animation: shimmer 1.5s infinite;
}
@keyframes shimmer {
  0%, 100% { opacity: 0.4; }
  50%       { opacity: 0.8; }
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

.descuento-banner {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  background: linear-gradient(135deg, rgba(45,212,191,0.08), rgba(56,189,248,0.06));
  border: 1px solid rgba(45,212,191,0.2);
  border-radius: var(--radius-xl);
  padding: var(--space-5) var(--space-6);
  margin-bottom: var(--space-8);
}
.banner-icon { font-size: 2rem; }
.descuento-banner strong { color: var(--color-primary); }
.descuento-banner p { color: var(--color-text-muted); font-size: var(--font-size-sm); margin-top: 2px; }
</style>
