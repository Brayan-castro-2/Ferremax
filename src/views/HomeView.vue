<template>
  <div class="home-view">
    <!-- HERO -->
    <section class="relative w-full h-[600px] flex items-center bg-surface-container-high overflow-hidden">
      <div
        v-for="(img, idx) in heroImages"
        :key="img"
        class="absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out"
        :class="idx === currentHeroIndex ? 'opacity-100' : 'opacity-0'"
      >
        <img :src="img" alt="Hero background" class="w-full h-full object-cover" />
      </div>
      <div class="absolute inset-0 bg-black/40 z-0"></div>
      <div class="relative z-10 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary mb-4">
          DESDE LOS 80'S · 7 SUCURSALES EN CHILE
        </p>
        <h1 class="font-sora font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-8 max-w-2xl">
          HERRAMIENTAS PARA EL CONSTRUCTOR MODERNO
        </h1>
        <div class="flex flex-wrap gap-4">
          <RouterLink to="/catalogo" class="inline-flex items-center bg-primary text-on-primary px-8 py-4 rounded-lg font-bold hover:bg-primary/90 transition-colors">
            EXPLORAR CATÁLOGO <span class="ml-2">→</span>
          </RouterLink>
          <RouterLink to="/sucursales" class="inline-flex items-center border-2 border-white text-white px-8 py-4 rounded-lg font-bold hover:bg-white hover:text-on-primary transition-colors">
            VER SUCURSALES
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- FILOSOFÍA -->
    <section class="bg-surface-container-low py-section-gap text-center px-margin-mobile md:px-margin-desktop">
      <p class="font-geist font-label-sm text-on-tertiary-container uppercase tracking-[0.3em] mb-4">
        NUESTRO COMPROMISO
      </p>
      <h2 class="font-sora font-display-lg text-headline-xl-mobile md:text-headline-xl italic max-w-4xl mx-auto">
        CREEMOS EN LA BELLEZA DE LO FUNCIONAL.
      </h2>
    </section>

    <!-- CATEGORÍAS -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
      <div class="grid grid-cols-1 md:grid-cols-12 gap-gutter h-auto md:h-[600px]">
        <RouterLink :to="{ path: '/catalogo', query: { categoria: 'Herramientas Eléctricas' } }" class="md:col-span-7 relative group rounded-lg overflow-hidden bg-tertiary h-[300px] md:h-full">
          <img src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1000&auto=format&fit=crop" alt="Eléctricas" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <div class="absolute bottom-0 left-0 p-8 z-20">
            <p class="font-geist text-white/70 text-xs uppercase tracking-widest mb-2">Categoría</p>
            <h3 class="font-sora text-white text-2xl font-bold">Herramientas Eléctricas</h3>
          </div>
        </RouterLink>

        <div class="md:col-span-5 grid grid-rows-2 gap-gutter h-[600px] md:h-full">
          <RouterLink :to="{ path: '/catalogo', query: { categoria: 'Herramientas Manuales' } }" class="relative group rounded-lg overflow-hidden bg-secondary">
            <img src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop" alt="Manuales" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            <div class="absolute bottom-0 left-0 p-6 z-20">
              <h3 class="font-sora text-white text-xl font-bold">Herramientas Manuales</h3>
            </div>
          </RouterLink>

          <RouterLink :to="{ path: '/catalogo', query: { categoria: 'Construcción' } }" class="relative group rounded-lg overflow-hidden bg-primary">
            <img src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?q=80&w=800&auto=format&fit=crop" alt="Materiales" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            <div class="absolute bottom-0 left-0 p-6 z-20">
              <h3 class="font-sora text-white text-xl font-bold">Construcción</h3>
            </div>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS DESTACADOS -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
      <div class="flex flex-col md:flex-row md:items-end justify-between mb-8">
        <div>
          <p class="font-geist text-sm text-on-tertiary-container uppercase tracking-widest mb-2">LO MEJOR DEL CATÁLOGO</p>
          <h2 class="font-sora text-3xl font-bold">ARTÍCULOS DESTACADOS</h2>
        </div>
        <RouterLink to="/catalogo" class="text-primary font-bold hover:underline mt-4 md:mt-0">
          VER TODOS LOS PRODUCTOS →
        </RouterLink>
      </div>

      <div v-if="cargando" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
        <div v-for="n in 4" :key="n" class="h-[380px] animate-pulse rounded-lg bg-surface-container-low" />
      </div>

      <div v-else-if="productosDestacados.length === 0" class="rounded-2xl border border-dashed border-outline-variant/60 p-10 text-center">
        <p class="font-sora text-xl font-semibold text-primary">Sin productos disponibles</p>
        <p class="mt-2 text-sm text-on-surface-variant">Asegúrate que el backend esté corriendo y la BD tenga productos.</p>
      </div>

      <div v-else class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
        <RouterLink
          v-for="producto in productosDestacados"
          :key="producto.id"
          :to="`/producto/${producto.id}`"
          class="group bg-surface-container-low rounded-lg overflow-hidden flex flex-col transition hover:-translate-y-1 hover:shadow-ambient"
        >
          <div class="aspect-[4/5] bg-surface-container flex items-center justify-center p-4 relative">
            <img v-if="producto.imagen_url" :src="producto.imagen_url" :alt="producto.nombre" class="max-h-full object-contain" loading="lazy" />
            <div v-else class="flex h-full w-full items-center justify-center text-outline">
              <svg class="h-16 w-16 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="m3 16 5-5 5 5 3-3 5 5" /><circle cx="9" cy="9" r="1.5" /></svg>
            </div>
            <button
              type="button"
              class="absolute bottom-4 right-4 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90"
              @click.prevent="agregarAlCarrito(producto)"
              :aria-label="`Agregar ${producto.nombre} al carrito`"
            >+</button>
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <p class="font-geist text-xs text-outline mb-1 uppercase tracking-wider">{{ producto.categoria }}</p>
            <h3 class="font-sora font-semibold text-on-surface mb-2 flex-1">{{ producto.nombre }}</h3>
            <p class="font-bold text-lg text-primary">{{ formatPrice(producto.precio) }}</p>
          </div>
        </RouterLink>
      </div>
    </section>

    <!-- SECCIÓN: 7 SUCURSALES ★ -->
    <section class="bg-surface-container py-section-gap px-margin-mobile md:px-margin-desktop">
      <div class="max-w-container-max mx-auto">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <p class="font-geist text-sm text-on-tertiary-container uppercase tracking-widest mb-2">DISPONIBILIDAD EN TIEMPO REAL</p>
            <h2 class="font-sora text-3xl font-bold">7 SUCURSALES EN CHILE</h2>
            <p class="font-inter text-on-surface-variant mt-3 max-w-xl">
              Consulta el stock real de cada tienda en línea. Si un producto no está
              en tu sucursal más cercana, sabrás de inmediato dónde encontrarlo.
            </p>
          </div>
          <RouterLink to="/sucursales" class="text-primary font-bold hover:underline mt-4 md:mt-0">
            VER MAPA COMPLETO →
          </RouterLink>
        </div>

        <div v-if="cargandoSucursales" class="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <div v-for="n in 4" :key="n" class="h-32 animate-pulse rounded-lg bg-surface-container-low" />
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-gutter">
          <RouterLink
            v-for="s in sucursalesPreview"
            :key="s.id"
            :to="`/sucursales/${s.id}/stock`"
            class="group rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-5 transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-ambient"
          >
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-tertiary">{{ s.region }}</p>
            <h3 class="font-sora text-lg font-semibold mt-1">{{ s.nombre }}</h3>
            <p class="text-xs text-on-surface-variant mt-1">{{ s.ciudad }}</p>
            <p class="mt-3 font-geist text-[10px] font-semibold uppercase tracking-wider text-primary opacity-60 group-hover:opacity-100 transition">
              Ver stock →
            </p>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- SPLIT SECTION -->
    <section class="grid grid-cols-1 md:grid-cols-2">
      <div class="bg-surface-container-high relative min-h-[400px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop" alt="Construcción" class="absolute inset-0 w-full h-full object-cover" loading="lazy" />
      </div>
      <div class="bg-surface-container py-16 px-margin-mobile md:px-12 flex flex-col justify-center">
        <p class="font-geist text-sm text-on-tertiary-container uppercase tracking-widest mb-2">SOBRE NOSOTROS</p>
        <h2 class="font-sora text-3xl font-bold mb-4">FERREMAS PREMIUM HARDWARE</h2>
        <p class="font-inter text-on-surface-variant mb-8 max-w-md">
          Distribuidores de herramientas y materiales de construcción desde los 80's.
          Trabajamos con Bosch, Makita, Stanley y Sika para entregar calidad y durabilidad.
        </p>
        <RouterLink to="/catalogo" class="self-start border-2 border-primary text-primary px-8 py-3 rounded hover:bg-primary hover:text-on-primary transition-colors font-bold">
          CONOCE EL CATÁLOGO
        </RouterLink>
      </div>
    </section>

    <!-- SERVICIOS -->
    <section class="bg-surface-container py-section-gap px-margin-mobile md:px-margin-desktop">
      <div class="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="bg-surface-container-lowest p-10 rounded-lg text-center hover:shadow-lg transition-shadow">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M3 7l9-4 9 4-9 4-9-4z" /><path d="M3 17l9 4 9-4M3 12l9 4 9-4" /></svg>
          </div>
          <h3 class="font-sora text-xl font-bold mb-3">RETIRO EN TIENDA</h3>
          <p class="font-inter text-sm text-on-surface-variant">
            Compra online y retira en cualquiera de nuestras 7 sucursales sin costo de despacho.
          </p>
        </div>
        <div class="bg-surface-container-lowest p-10 rounded-lg text-center hover:shadow-lg transition-shadow">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="14" rx="2" /><circle cx="8" cy="20" r="2" /><circle cx="18" cy="20" r="2" /><path d="M3 14h18" /></svg>
          </div>
          <h3 class="font-sora text-xl font-bold mb-3">DESPACHO A DOMICILIO</h3>
          <p class="font-inter text-sm text-on-surface-variant">
            Envío a todo Chile. Despacho coordinado con bodegueros locales.
          </p>
        </div>
        <div class="bg-surface-container-lowest p-10 rounded-lg text-center hover:shadow-lg transition-shadow">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-tertiary/10 text-tertiary">
            <svg class="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M19 5l-4 4M9 15l-4 4" /></svg>
          </div>
          <h3 class="font-sora text-xl font-bold mb-3">DESCUENTO 10%</h3>
          <p class="font-inter text-sm text-on-surface-variant">
            Compras de más de 4 artículos reciben descuento automático del 10% en el checkout.
          </p>
        </div>
      </div>
    </section>

    <!-- TESTIMONIOS -->
    <section class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-section-gap">
      <h2 class="font-sora text-center text-3xl font-bold mb-12">LO QUE DICEN NUESTROS CLIENTES</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <div class="text-center">
          <p class="font-body-lg italic text-primary mb-4">"Las mejores herramientas del mercado. El servicio de asesoría me salvó en mi último proyecto."</p>
          <p class="font-bold text-sm">— Juan Pérez, Santiago</p>
        </div>
        <div class="text-center">
          <p class="font-body-lg italic text-primary mb-4">"El despacho llegó al día siguiente a la obra. Excelente presentación y calidad insuperable."</p>
          <p class="font-bold text-sm">— María González, Valparaíso</p>
        </div>
        <div class="text-center">
          <p class="font-body-lg italic text-primary mb-4">"La durabilidad de las herramientas eléctricas es impresionante. Cliente de por vida."</p>
          <p class="font-bold text-sm">— Carlos Soto, Concepción</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/lib/api.js'
import { useCarritoStore } from '@/stores/carrito.js'

const heroImages = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop'
]
const currentHeroIndex = ref(0)
let heroInterval

const productosDestacados = ref([])
const sucursalesPreview = ref([])
const cargando = ref(true)
const cargandoSucursales = ref(true)
const carritoStore = useCarritoStore()

onMounted(async () => {
  heroInterval = setInterval(() => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroImages.length
  }, 4000)

  try {
    const data = await api.productos.listar()
    productosDestacados.value = (data.productos || []).slice(0, 4)
  } catch (e) {
    console.error('Error cargando productos destacados:', e.message)
    productosDestacados.value = []
  } finally {
    cargando.value = false
  }

  try {
    const data = await api.sucursales.listar({ activa: true })
    sucursalesPreview.value = (data.sucursales || []).slice(0, 4)
  } catch (e) {
    sucursalesPreview.value = []
  } finally {
    cargandoSucursales.value = false
  }
})

const formatPrice = (value) => new Intl.NumberFormat('es-CL', {
  style: 'currency', currency: 'CLP'
}).format(value)

const agregarAlCarrito = (producto) => {
  carritoStore.agregar({
    id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    categoria: producto.categoria,
    imagen_url: producto.imagen_url
  })
}

onUnmounted(() => clearInterval(heroInterval))
</script>
