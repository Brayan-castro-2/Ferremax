<template>
  <article
    class="group relative flex flex-col overflow-hidden rounded-2xl border border-outline-variant/50 bg-surface-container-lowest shadow-ambient transition duration-300 hover:-translate-y-1 hover:border-primary/15 hover:shadow-lg"
    :class="{ 'opacity-[0.55]': producto.stock <= 0 }"
    :id="`product-${producto.id}`"
  >
    <RouterLink :to="`/producto/${producto.id}`" class="relative block aspect-[4/3] overflow-hidden bg-surface-container-low">
      <div class="flex h-full w-full items-center justify-center transition duration-500 group-hover:scale-[1.03]">
        <img 
          v-if="producto.imagen_url" 
          :src="producto.imagen_url" 
          :alt="producto.nombre"
          class="w-full h-full object-cover"
        />
        <span v-else class="select-none font-sora text-5xl font-semibold text-outline-variant/40 transition group-hover:text-tertiary/50" aria-hidden="true">
          {{ producto.emoji || '◈' }}
        </span>
      </div>
      <div v-if="producto.stock <= 0" class="absolute inset-0 flex items-center justify-center bg-primary/55 backdrop-blur-[2px]">
        <span class="rounded-full bg-surface-container-lowest px-4 py-1.5 font-geist text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Agotado</span>
      </div>
      <span
        v-if="producto.descuento"
        class="absolute right-3 top-3 rounded-full bg-tertiary px-2.5 py-0.5 font-geist text-[10px] font-bold uppercase tracking-wider text-on-tertiary"
      >
        −{{ producto.descuento }}%
      </span>
    </RouterLink>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div>
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.18em] text-tertiary">{{ producto.categoria }}</p>
        <RouterLink :to="`/producto/${producto.id}`" class="mt-1 block font-sora text-lg font-semibold leading-snug tracking-tight text-primary transition hover:text-tertiary">
          {{ producto.nombre }}
        </RouterLink>
        <p v-if="producto.sku" class="mt-1 font-geist text-[10px] uppercase tracking-wider text-on-surface-variant">SKU {{ producto.sku }}</p>
      </div>

      <p v-if="producto.descripcion" class="line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
        {{ producto.descripcion }}
      </p>

      <div class="mt-auto flex flex-wrap items-end justify-between gap-3 border-t border-outline-variant/40 pt-4">
        <div>
          <div class="flex flex-wrap items-baseline gap-2">
            <span class="font-sora text-xl font-semibold text-primary">${{ formatPrice(producto.precio) }}</span>
            <span v-if="producto.precioOriginal" class="text-sm text-on-surface-variant line-through">${{ formatPrice(producto.precioOriginal) }}</span>
          </div>
          <p v-if="precioEnUsd != null" class="mt-0.5 font-geist text-[10px] uppercase tracking-wider text-on-surface-variant">≈ USD {{ precioEnUsd }}</p>
        </div>
        <button
          type="button"
          class="rounded-full bg-primary px-5 py-2.5 font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-primary shadow-sm transition hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
          :id="`btn-agregar-${producto.id}`"
          :disabled="producto.stock <= 0"
          @click.prevent="agregarAlCarrito"
        >
          <span v-if="!agregado">Añadir</span>
          <span v-else>Listo</span>
        </button>
      </div>

      <div class="h-1 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div class="h-full rounded-full bg-tertiary/80 transition-all duration-500" :style="{ width: stockPercent + '%' }" />
      </div>
      <p class="font-geist text-[10px] uppercase tracking-wider text-on-surface-variant">Stock {{ producto.stock }}</p>
    </div>
  </article>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useCarritoStore } from '@/stores/carrito.js'

const props = defineProps({
  producto: { type: Object, required: true },
  valorDolarClp: { type: Number, default: null },
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

function formatPrice(val) {
  return Number(val).toLocaleString('es-CL')
}

function agregarAlCarrito() {
  carrito.agregar(props.producto)
  agregado.value = true
  setTimeout(() => {
    agregado.value = false
  }, 1400)
}
</script>
