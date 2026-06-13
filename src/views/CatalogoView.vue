<template>
  <main class="page-wrapper bg-surface font-inter text-on-surface">
    <section class="border-b border-outline-variant/40 bg-gradient-to-b from-surface-container-lowest/80 to-surface pb-16 pt-10 md:pb-20 md:pt-14">
      <div class="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div class="max-w-3xl">
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary">Catálogo editorial</p>
          <h1 class="mt-4 font-sora text-4xl font-semibold leading-[1.05] tracking-tight text-primary md:text-5xl lg:text-6xl">Herramientas y materiales, sin ruido.</h1>
          <p class="mt-5 max-w-xl text-base leading-relaxed text-on-surface-variant md:text-lg">
            {{ cargando ? 'Sincronizando inventario…' : `${productosFiltrados.length} referencias listas para despacho o retiro.` }}
          </p>
        </div>

        <div class="mt-10 flex max-w-xl items-center gap-3 rounded-2xl border border-outline-variant/50 bg-surface-container-lowest/90 px-4 py-3 shadow-inner backdrop-blur-sm md:px-5">
          <span class="text-on-surface-variant" aria-hidden="true">
            <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
          </span>
          <input
            id="input-buscar-producto"
            v-model="busqueda"
            type="search"
            class="min-w-0 flex-1 border-0 bg-transparent font-inter text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-0"
            placeholder="Buscar por nombre, categoría o uso…"
            autocomplete="off"
          />
        </div>

        <p v-if="badgeDolarTexto" id="badge-dolar-clp" class="mt-4 inline-flex rounded-full border border-outline-variant/50 bg-surface-container-low px-4 py-1.5 font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant" role="status">
          {{ badgeDolarTexto }}
        </p>
      </div>
    </section>

    <div class="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <div v-if="errorMsg" id="catalogo-error" class="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-5 py-4 text-sm text-yellow-700" role="alert">
        <div>
          <strong class="font-bold text-yellow-800">Mostrando datos de demostración. Error:</strong>
          {{ errorMsg }}
        </div>
        <button type="button" class="shrink-0 rounded-full border border-yellow-500/40 px-4 py-1.5 font-geist text-[10px] font-semibold uppercase tracking-wider text-yellow-800 transition hover:bg-yellow-500/20" @click="cargarProductos">
          Reintentar
        </button>
      </div>

      <div v-if="!cargando" id="filtros-categoria" class="mb-10 flex flex-wrap gap-2" role="tablist" aria-label="Categorías">
        <button
          v-for="cat in categorias"
          :key="cat"
          type="button"
          role="tab"
          :aria-selected="categoriaActiva === cat"
          class="rounded-full border px-4 py-2 font-geist text-[10px] font-semibold uppercase tracking-[0.14em] transition"
          :class="
            categoriaActiva === cat
              ? 'border-primary bg-primary text-on-primary shadow-ambient'
              : 'border-outline-variant/60 bg-surface-container-lowest text-on-surface-variant hover:border-primary/25 hover:text-primary'
          "
          :id="`filter-cat-${cat === 'Todos' ? 'todos' : cat.toLowerCase().replace(/\s+/g, '-')}`"
          @click="categoriaActiva = cat"
        >
          {{ cat }}
        </button>
      </div>

      <div v-if="cargando" class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div v-for="n in 8" :key="n" class="h-[380px] animate-pulse rounded-2xl bg-surface-container-low" />
      </div>

      <div v-else id="products-grid" class="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <transition-group name="slide-up">
          <ProductCard v-for="p in productosFiltrados" :key="p.id" :producto="p" :valor-dolar-clp="valorDolarClp" />
        </transition-group>
      </div>

      <div v-if="!cargando && productosFiltrados.length === 0 && !errorMsg" id="empty-catalogo" class="mt-20 text-center">
        <p class="font-sora text-2xl font-semibold text-primary">Sin coincidencias</p>
        <p class="mt-2 text-on-surface-variant">
          Prueba otra búsqueda<span v-if="busqueda"> para «{{ busqueda }}»</span>.
        </p>
      </div>

      <aside id="banner-descuento-volumen" class="mt-20 rounded-2xl border border-outline-variant/40 bg-surface-container-lowest p-8 shadow-ambient md:flex md:items-center md:justify-between md:gap-8 md:p-10">
        <div>
          <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.2em] text-tertiary">Volumen</p>
          <h2 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary">10% al superar 4 ítems</h2>
          <p class="mt-2 max-w-lg text-sm text-on-surface-variant">El descuento se aplica automáticamente en carrito y checkout según la lógica existente del store.</p>
        </div>
        <div class="mt-6 shrink-0 md:mt-0 md:self-center">
          <FmButton to="/carrito" variant="secondary">Ver carrito</FmButton>
        </div>
      </aside>
    </div>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ProductCard from '@/components/ProductCard.vue'
import FmButton from '@/components/ui/FmButton.vue'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { supabase, isMockup } from '@/lib/supabase.js'

const busqueda = ref('')
const categoriaActiva = ref('Todos')
const productos = ref([])
const cargando = ref(true)
const errorMsg = ref('')
const valorDolarClp = ref(null)

const PRODUCTOS_MOCKUP = [
  { id: 1, nombre: 'Taladro Percutor 700W', descripcion: 'Taladro con percusión para mampostería', precio: 79990, stock: 12, categoria: 'Herramientas Eléctricas', activo: true },
  { id: 2, nombre: 'Sierra Circular 1400W', descripcion: 'Sierra de alta potencia para maderas', precio: 124990, stock: 8, categoria: 'Herramientas Eléctricas', activo: true },
  { id: 3, nombre: 'Destornillador Eléctrico', descripcion: 'Batería de larga duración 18V', precio: 34990, stock: 25, categoria: 'Herramientas Eléctricas', activo: true },
  { id: 4, nombre: 'Martillo 500g Mango Fibra', descripcion: 'Mango ergonómico antideslizante', precio: 12990, stock: 40, categoria: 'Herramientas Manuales', activo: true },
  { id: 5, nombre: 'Llave Inglesa 10"', descripcion: 'Acero forjado resistente', precio: 8990, stock: 30, categoria: 'Herramientas Manuales', activo: true },
  { id: 6, nombre: 'Set Brocas HSS 19 piezas', descripcion: 'Para metal, madera y plástico', precio: 19990, stock: 3, categoria: 'Herramientas Manuales', activo: true },
  { id: 7, nombre: 'Cemento 25kg Portland', descripcion: 'Alta resistencia, uso general', precio: 7490, stock: 60, categoria: 'Construcción', activo: true },
  { id: 8, nombre: 'Pintura Látex Blanca 4L', descripcion: 'Interior/exterior, lavable', precio: 18990, stock: 18, categoria: 'Pintura', activo: true },
  { id: 9, nombre: 'Rodillo 22cm Lana', descripcion: 'Para superficies lisas y semilisas', precio: 4990, stock: 35, categoria: 'Pintura', activo: true },
  { id: 10, nombre: 'Extensión 10m 3 Enchufes', descripcion: 'Cable 2.5mm², uso industrial', precio: 14990, stock: 22, categoria: 'Electricidad', activo: true },
  { id: 11, nombre: 'Casco de Seguridad HDPE', descripcion: 'Certificado ANSI Z89.1', precio: 9990, stock: 0, categoria: 'Seguridad', activo: true },
  { id: 12, nombre: 'Guantes de Cuero Trabajo', descripcion: 'Talla M/L/XL disponible', precio: 5990, stock: 50, categoria: 'Seguridad', activo: true },
]

async function cargarProductos() {
  console.log('🔍 Iniciando carga de productos...')
  console.log('🔍 isMockup:', isMockup)
  console.log('🔍 supabase disponible:', !!supabase)

  cargando.value = true
  errorMsg.value = ''
  try {
    if (isMockup) {
      await new Promise((r) => setTimeout(r, 400))
      productos.value = PRODUCTOS_MOCKUP
    } else {
      productos.value = await ServiciosSupabase.obtenerProductos()
    }
  } catch (err) {
    errorMsg.value = err.message
    productos.value = PRODUCTOS_MOCKUP
  } finally {
    cargando.value = false
  }
}

const categorias = computed(() => {
  const cats = [...new Set(productos.value.map((p) => p.categoria).filter(Boolean))]
  return ['Todos', ...cats.sort()]
})

const badgeDolarTexto = computed(() => {
  const v = valorDolarClp.value
  if (v == null || !Number.isFinite(v) || v <= 0) return ''
  const fmt = Number(v).toLocaleString('es-CL', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
  return `1 USD = $${fmt} CLP`
})

async function cargarValorDolar() {
  try {
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const url = base ? `${base}/api/currency/dolar` : '/api/currency/dolar'
    const res = await fetch(url)
    if (!res.ok) return
    const data = await res.json()
    if (typeof data.valorDolar === 'number' && data.valorDolar > 0) {
      valorDolarClp.value = data.valorDolar
    }
  } catch {
    /* silencioso */
  }
}

const productosFiltrados = computed(() => {
  let lista = productos.value
  if (categoriaActiva.value !== 'Todos') {
    lista = lista.filter((p) => p.categoria === categoriaActiva.value)
  }
  if (busqueda.value.trim()) {
    const q = busqueda.value.toLowerCase()
    lista = lista.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.categoria?.toLowerCase().includes(q) ||
        p.descripcion?.toLowerCase().includes(q),
    )
  }
  return lista
})

onMounted(() => {
  cargarProductos()
  cargarValorDolar()
})
</script>
