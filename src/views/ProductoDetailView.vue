<template>
  <main class="page-wrapper bg-surface font-inter text-on-surface">
    <section class="mx-auto max-w-container-max px-margin-mobile py-12 md:px-margin-desktop">
      <RouterLink to="/catalogo" class="mb-8 inline-flex font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant hover:text-primary">
        ← Catálogo
      </RouterLink>

      <div v-if="error" class="mb-6 rounded-md border border-error/30 bg-error-container px-4 py-3 text-on-error-container" role="alert">
        {{ error }}
      </div>

      <div v-if="loading" class="grid grid-cols-1 gap-gutter md:grid-cols-12">
        <div class="h-[520px] animate-pulse bg-surface-container-low md:col-span-7" />
        <div class="h-[520px] animate-pulse bg-surface-container-low md:col-span-5" />
      </div>

      <article v-else-if="product" class="grid grid-cols-1 items-start gap-gutter md:grid-cols-12">
        <div class="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-ambient md:col-span-7">
          <img v-if="activeImage" :src="activeImage" :alt="product.nombre" class="h-[560px] w-full object-contain p-12" />
          <div v-else class="flex h-[560px] items-center justify-center text-outline">
            <svg class="h-32 w-32 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 5 5 3-3 5 5" /><circle cx="9" cy="9" r="1.5" /></svg>
          </div>
        </div>

        <aside class="flex flex-col gap-6 md:col-span-5">
          <span class="w-fit rounded-full bg-tertiary/10 px-3 py-1 font-label-sm text-label-sm uppercase tracking-widest text-tertiary">
            {{ product.categoria || 'Sin categoría' }}
          </span>
          <h1 class="font-sora text-3xl font-semibold text-primary md:text-4xl">{{ product.nombre }}</h1>
          <p class="text-base leading-relaxed text-on-surface-variant">
            {{ product.descripcion || 'Sin descripción disponible.' }}
          </p>

          <div class="flex flex-wrap items-baseline gap-4">
            <strong class="font-sora text-4xl font-semibold text-primary">${{ formatPrice(product.precio) }}</strong>
            <span :class="stockClass" class="font-geist text-xs font-semibold uppercase tracking-widest">{{ stockLabel }}</span>
          </div>

          <!-- Stock por sucursal (★ feature nueva) -->
          <div v-if="distribucion?.distribucion?.length" class="rounded-xl border border-outline-variant/40 bg-surface-container-lowest p-4">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">Stock por sucursal</p>
            <ul class="mt-3 space-y-2">
              <li
                v-for="d in distribucion.distribucion"
                :key="d.id"
                class="flex items-center justify-between text-sm"
              >
                <span class="text-on-surface-variant">
                  {{ d.sucursales?.nombre || `Sucursal #${d.sucursal_id}` }}
                </span>
                <span
                  class="rounded-full px-2.5 py-0.5 font-geist text-[10px] font-semibold"
                  :class="d.cantidad === 0 ? 'bg-red-500/15 text-red-700' : d.cantidad < 5 ? 'bg-yellow-500/15 text-yellow-700' : 'bg-emerald-500/15 text-emerald-700'"
                >
                  {{ d.cantidad }} unidades
                </span>
              </li>
            </ul>
          </div>

          <div class="h-px w-full bg-outline-variant" />

          <div class="flex flex-col gap-3">
            <label for="qty" class="font-geist text-xs uppercase tracking-widest text-on-surface-variant">Cantidad</label>
            <div class="flex w-32 items-center rounded-lg border border-outline-variant">
              <button class="h-10 w-10 transition hover:bg-surface-container" @click="cantidad = Math.max(1, cantidad - 1)" aria-label="Disminuir">−</button>
              <input id="qty" v-model.number="cantidad" min="1" :max="maxQty" type="number" class="w-full border-0 bg-transparent text-center focus:outline-none" />
              <button class="h-10 w-10 transition hover:bg-surface-container" @click="cantidad = Math.min(maxQty, cantidad + 1)" aria-label="Aumentar">+</button>
            </div>
          </div>

          <div class="mt-2 flex flex-col gap-3">
            <button
              class="w-full rounded-lg bg-primary py-4 font-geist text-xs uppercase tracking-[0.2em] text-on-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="stockDisponibleTotal <= 0"
              @click="addToCart"
            >
              Agregar al carrito
            </button>
            <RouterLink
              to="/carrito"
              class="w-full rounded-lg bg-surface-container-low py-4 text-center font-geist text-xs uppercase tracking-[0.2em] text-primary transition hover:bg-surface-container"
            >
              Ver carrito
            </RouterLink>
          </div>
        </aside>
      </article>

      <div v-else class="rounded-2xl border border-dashed border-outline-variant/60 p-12 text-center">
        <p class="font-sora text-xl font-semibold text-primary">Producto no encontrado</p>
        <p class="mt-2 text-sm text-on-surface-variant">El ID solicitado no existe en el catálogo.</p>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useCarritoStore } from '@/stores/carrito.js'
import { api } from '@/lib/api.js'

const route = useRoute()
const carrito = useCarritoStore()

const loading = ref(true)
const error = ref('')
const product = ref(null)
const distribucion = ref(null)
const cantidad = ref(1)
const activeImage = ref(null)

const stockDisponibleTotal = computed(() => Number(product.value?.stock_disponible ?? product.value?.stock ?? 0))
const maxQty = computed(() => Math.max(1, stockDisponibleTotal.value || 1))
const stockClass = computed(() => stockDisponibleTotal.value > 0 ? 'text-emerald-700' : 'text-error')
const stockLabel = computed(() => stockDisponibleTotal.value > 0 ? `Stock disponible: ${stockDisponibleTotal.value}` : 'Sin stock')

function formatPrice(value) {
  return Number(value || 0).toLocaleString('es-CL')
}

async function loadProduct() {
  loading.value = true
  error.value = ''
  const id = Number(route.params.id)
  if (!id) {
    error.value = 'ID inválido.'
    loading.value = false
    return
  }
  try {
    product.value = await api.productos.obtener(id)
    activeImage.value = product.value?.imagen_url || null
    // Carga distribución por sucursal en paralelo (no bloquea si falla)
    api.inventario.porProducto(id)
      .then((d) => { distribucion.value = d })
      .catch(() => {})
  } catch (err) {
    error.value = err.message
    product.value = null
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
    imagen_url: product.value.imagen_url
  }
  for (let i = 0; i < cantidad.value; i += 1) {
    carrito.agregar(base)
  }
}

watch(() => route.params.id, (id) => { if (id) loadProduct() })
onMounted(loadProduct)
</script>
