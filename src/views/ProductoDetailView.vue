<template>
  <main class="page-wrapper bg-surface font-inter text-on-surface">
    <section class="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <RouterLink to="/catalogo" class="mb-8 inline-flex font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant hover:text-primary">
        ← Catálogo
      </RouterLink>      <p v-if="error" class="mb-6 rounded-md border border-error/30 bg-error-container px-4 py-3 text-on-error-container" role="alert">
        {{ error }}
      </p>

      <div v-if="loading" class="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div class="h-[520px] animate-pulse bg-surface-container-low md:col-span-7" />
        <div class="h-[520px] animate-pulse bg-surface-container-low md:col-span-5" />
      </div>

      <article v-else-if="product" class="grid grid-cols-1 items-start gap-gutter md:grid-cols-12">
        <div class="overflow-hidden bg-surface-container-lowest shadow-ambient md:col-span-7">
          <img :src="activeImage" :alt="product.nombre" class="h-[560px] w-full object-contain p-12" />
        </div>

        <aside class="flex flex-col gap-6 md:col-span-5">
          <span class="w-fit bg-tertiary-fixed-dim/20 px-3 py-1 font-label-sm text-label-sm uppercase tracking-widest text-on-tertiary-container">Nuevo</span>
          <h1 class="font-headline-xl text-headline-xl text-primary">{{ product.nombre }}</h1>
          <p class="font-body-lg text-on-surface-variant">{{ product.descripcion || 'Sin descripción disponible.' }}</p>

          <div class="flex items-center gap-4">
            <strong class="font-headline-xl text-headline-xl">${{ formatPrice(product.precio) }}</strong>
            <span :class="stockClass" class="font-label-sm text-label-sm uppercase tracking-widest">{{ stockLabel }}</span>
          </div>

          <div class="h-px w-full bg-outline-variant" />

          <div class="flex flex-col gap-3">
            <label for="qty" class="font-label-sm text-label-sm uppercase tracking-widest text-outline">Cantidad</label>
            <div class="flex w-32 items-center border border-outline-variant">
              <button class="h-10 w-10 hover:bg-surface-container" @click="cantidad = Math.max(1, cantidad - 1)" aria-label="Disminuir cantidad">-</button>
              <input id="qty" v-model.number="cantidad" min="1" :max="maxQty" type="number" class="w-full border-0 bg-transparent text-center focus:outline-none" />
              <button class="h-10 w-10 hover:bg-surface-container" @click="cantidad = Math.min(maxQty, cantidad + 1)" aria-label="Aumentar cantidad">+</button>
            </div>
          </div>

          <div class="mt-4 flex flex-col gap-4">
            <button class="w-full rounded-lg bg-primary py-5 font-label-sm text-label-sm uppercase tracking-[0.2em] text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50" :disabled="product.stock <= 0" @click="addToCart">
              Agregar al carrito
            </button>
            <RouterLink to="/carrito" class="w-full rounded-lg bg-surface-container-low py-5 text-center font-label-sm text-label-sm uppercase tracking-[0.2em] text-primary transition hover:bg-surface-container">
              Ver carrito
            </RouterLink>
          </div>
        </aside>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCarritoStore } from '@/stores/carrito.js'
import { isMockup } from '@/lib/supabase.js'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'

const MOCK_PRODUCTS = [
  { id: 1, nombre: 'Taladro Percutor 700W', descripcion: 'Taladro con percusión para mampostería', precio: 79990, stock: 12, categoria: 'Herramientas Eléctricas' },
  { id: 2, nombre: 'Sierra Circular 1400W', descripcion: 'Sierra de alta potencia para maderas', precio: 124990, stock: 8, categoria: 'Herramientas Eléctricas' },
  { id: 3, nombre: 'Destornillador Eléctrico', descripcion: 'Batería de larga duración 18V', precio: 34990, stock: 25, categoria: 'Herramientas Eléctricas' },
  { id: 4, nombre: 'Martillo 500g Mango Fibra', descripcion: 'Mango ergonómico antideslizante', precio: 12990, stock: 40, categoria: 'Herramientas Manuales' },
  { id: 5, nombre: 'Llave Inglesa 10"', descripcion: 'Acero forjado resistente', precio: 8990, stock: 30, categoria: 'Herramientas Manuales' },
  { id: 6, nombre: 'Set Brocas HSS 19 piezas', descripcion: 'Para metal, madera y plástico', precio: 19990, stock: 3, categoria: 'Herramientas Manuales' },
  { id: 7, nombre: 'Cemento 25kg Portland', descripcion: 'Alta resistencia, uso general', precio: 7490, stock: 60, categoria: 'Construcción' },
  { id: 8, nombre: 'Pintura Látex Blanca 4L', descripcion: 'Interior/exterior, lavable', precio: 18990, stock: 18, categoria: 'Pintura' },
  { id: 9, nombre: 'Rodillo 22cm Lana', descripcion: 'Para superficies lisas y semilisas', precio: 4990, stock: 35, categoria: 'Pintura' },
  { id: 10, nombre: 'Extensión 10m 3 Enchufes', descripcion: 'Cable 2.5mm², uso industrial', precio: 14990, stock: 22, categoria: 'Electricidad' },
  { id: 11, nombre: 'Casco de Seguridad HDPE', descripcion: 'Certificado ANSI Z89.1', precio: 9990, stock: 0, categoria: 'Seguridad' },
  { id: 12, nombre: 'Guantes de Cuero Trabajo', descripcion: 'Talla M/L/XL disponible', precio: 5990, stock: 50, categoria: 'Seguridad' },
]

const route = useRoute()
const carrito = useCarritoStore()

const loading = ref(true)
const error = ref('')
const product = ref(null)
const cantidad = ref(1)

const gallery = ref([
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1611996575749-79a3a250f948?auto=format&fit=crop&w=1200&q=80',
])
const activeImage = ref(gallery.value[0])

const maxQty = computed(() => Math.max(1, Number(product.value?.stock || 1)))
const stockClass = computed(() => (Number(product.value?.stock || 0) > 0 ? 'text-emerald-700' : 'text-error'))
const stockLabel = computed(() => (Number(product.value?.stock || 0) > 0 ? `Stock: ${product.value.stock}` : 'Sin stock'))

function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-CL')
}

async function loadProduct() {
  loading.value = true
  error.value = ''
  const id = Number(route.params.id) || 1
  try {
    if (isMockup) {
      await new Promise((r) => setTimeout(r, 200))
      const found = MOCK_PRODUCTS.find((p) => p.id === id)
      if (!found) throw new Error('Producto no encontrado')
      product.value = found
      activeImage.value = gallery.value[0]
      return
    }
    const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
    const response = await fetch(`${base || ''}/api/products/${id}`)
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new Error(body.error || `No se pudo cargar el producto ${id}`)
    }
    product.value = await response.json()
    if (product.value?.imagen_url) {
      activeImage.value = product.value.imagen_url
    }
  } catch (err) {
    if (!isMockup) {
      try {
        const list = await ServiciosSupabase.obtenerProductos()
        const found = list.find((p) => Number(p.id) === id)
        if (found) {
          product.value = found
          if (found.imagen_url) {
            activeImage.value = found.imagen_url
          }
          error.value = ''
          return
        }
      } catch {
        /* fall through */
      }
    }
    error.value = err.message
  } finally {
    loading.value = false
  }
}
function addToCart() {
  if (!product.value) return
  const base = {
    id: product.value.id,
    nombre: product.value.nombre,
    precio: product.value.precio,
    categoria: product.value.categoria,
  }
  for (let i = 0; i < cantidad.value; i += 1) {
    carrito.agregar(base)
  }
}
onMounted(loadProduct)
</script>
