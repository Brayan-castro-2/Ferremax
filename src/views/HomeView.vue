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
        <h1 class="font-sora font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-8 max-w-2xl">
          HERRAMIENTAS PARA EL CONSTRUCTOR MODERNO
        </h1>
        <RouterLink to="/catalogo" class="inline-flex items-center bg-primary text-on-primary px-10 py-5 rounded-lg font-bold hover:bg-primary/90 transition-colors">
          EXPLORAR CATÁLOGO <span class="ml-2">→</span>
        </RouterLink>
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
        <!-- Herramientas Eléctricas -->
        <RouterLink :to="{ path: '/catalogo', query: { categoria: 'Herramientas Eléctricas' } }" class="md:col-span-7 relative group rounded-lg overflow-hidden bg-tertiary h-[300px] md:h-full">
          <img src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?q=80&w=1000&auto=format&fit=crop" alt="Eléctricas" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
          <div class="absolute bottom-0 left-0 p-8 z-20 transform transition-transform duration-300">
            <h3 class="font-sora text-white text-2xl font-bold">Herramientas Eléctricas</h3>
          </div>
        </RouterLink>
        
        <div class="md:col-span-5 grid grid-rows-2 gap-gutter h-[600px] md:h-full">
          <!-- Manuales -->
          <RouterLink :to="{ path: '/catalogo', query: { categoria: 'Herramientas Manuales' } }" class="relative group rounded-lg overflow-hidden bg-secondary">
            <img src="https://images.unsplash.com/photo-1530124566582-a618bc2615dc?q=80&w=800&auto=format&fit=crop" alt="Manuales" class="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10"></div>
            <div class="absolute bottom-0 left-0 p-6 z-20">
              <h3 class="font-sora text-white text-xl font-bold">Herramientas Manuales</h3>
            </div>
          </RouterLink>

          <!-- Materiales -->
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

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-gutter">
        <div v-for="producto in productosDestacados" :key="producto.id" class="group bg-surface-container-low rounded-lg overflow-hidden flex flex-col">
          <div class="aspect-[4/5] bg-surface-container flex items-center justify-center p-4 relative">
            <img v-if="producto.imagen_url" :src="producto.imagen_url" :alt="producto.nombre" class="max-h-full object-contain">
            <div v-else class="w-full h-full bg-surface-container-highest opacity-50"></div>
            <button @click.prevent="agregarAlCarrito(producto)" class="absolute bottom-4 right-4 bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary/90">
              +
            </button>
          </div>
          <div class="p-4 flex-1 flex flex-col">
            <p class="font-geist text-xs text-outline mb-1">{{ producto.categoria }}</p>
            <h3 class="font-sora font-semibold text-on-surface mb-2 flex-1">{{ producto.nombre }}</h3>
            <p class="font-bold text-lg text-primary">{{ formatPrice(producto.precio) }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SPLIT SECTION -->
    <section class="grid grid-cols-1 md:grid-cols-2">
      <div class="bg-surface-container-high relative min-h-[400px] overflow-hidden">
        <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop" alt="Construcción" class="absolute inset-0 w-full h-full object-cover" />
      </div>
      <div class="w-full md:w-full bg-surface-container py-16 px-margin-mobile md:px-12 flex flex-col justify-center">
        <p class="font-geist text-sm text-on-tertiary-container uppercase tracking-widest mb-2">SOBRE NOSOTROS</p>
        <h2 class="font-sora text-3xl font-bold mb-4">FERREMAS PREMIUM HARDWARE</h2>
        <p class="font-inter text-on-surface-variant mb-8 max-w-md">
          En FERREMAS nos dedicamos a entregar las mejores herramientas para el constructor moderno. 
          Calidad, durabilidad y un diseño excepcional son nuestros pilares fundamentales. 
          Descubre nuestra amplia gama de productos diseñados para resistir las condiciones más exigentes.
        </p>
        <RouterLink to="/catalogo" class="self-start border-2 border-primary text-primary px-8 py-3 rounded hover:bg-primary hover:text-on-primary transition-colors font-bold">
          CONOCE FERREMAS
        </RouterLink>
      </div>
    </section>

    <!-- SERVICIOS -->
    <section class="bg-surface-container py-section-gap px-margin-mobile md:px-margin-desktop">
      <div class="max-w-container-max mx-auto grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div class="bg-surface-container-lowest p-12 rounded-lg text-center hover:shadow-lg transition-shadow">
          <h3 class="font-sora text-2xl font-bold mb-4">ASESORÍA TÉCNICA</h3>
          <p class="font-inter text-on-surface-variant">
            Nuestro equipo de expertos te ayudará a elegir las herramientas correctas para tu proyecto. 
            No dejes nada al azar.
          </p>
        </div>
        <div class="bg-surface-container-lowest p-12 rounded-lg text-center hover:shadow-lg transition-shadow">
          <h3 class="font-sora text-2xl font-bold mb-4">INSTALACIÓN PROFESIONAL</h3>
          <p class="font-inter text-on-surface-variant">
            Contamos con técnicos certificados para asegurar que tus herramientas y equipos funcionen perfectamente desde el primer día.
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

    <!-- El Footer AppFooter será agregado en el Layout o App.vue posteriormente -->
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import { ServiciosSupabase } from '@/servicios/ServiciosSupabase.js'
import { isMockup } from '@/lib/supabase.js'
import { useCarritoStore } from '@/stores/carrito.js'

const heroImages = [
  'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2000&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop'
]
const currentHeroIndex = ref(0)
let heroInterval

const productosDestacados = ref([])
const carritoStore = useCarritoStore()

// Mockup data
const PRODUCTOS_MOCKUP = [
  { id: 1, nombre: 'Taladro Percutor 20V', categoria: 'Herramientas Eléctricas', precio: 89990, stock: 15 },
  { id: 2, nombre: 'Set Llaves Punta Corona 12pz', categoria: 'Herramientas Manuales', precio: 24990, stock: 30 },
  { id: 3, nombre: 'Sierra Circular 7-1/4"', categoria: 'Herramientas Eléctricas', precio: 75000, stock: 10 },
  { id: 4, nombre: 'Nivel Laser Autonivelante', categoria: 'Herramientas de Medición', precio: 45990, stock: 8 },
]

onMounted(async () => {
  heroInterval = setInterval(() => {
    currentHeroIndex.value = (currentHeroIndex.value + 1) % heroImages.length
  }, 4000)

  if (isMockup) {
    productosDestacados.value = PRODUCTOS_MOCKUP.slice(0, 4)
  } else {
    try {
      const response = await ServiciosSupabase.obtenerProductos({ page: 1, limit: 4 })
      productosDestacados.value = response.productos || []
    } catch (e) {
      console.error('Error cargando productos destacados:', e)
      productosDestacados.value = PRODUCTOS_MOCKUP.slice(0, 4)
    }
  }
})

const formatPrice = (value) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
  }).format(value)
}

const agregarAlCarrito = (producto) => {
  carritoStore.agregar({
    producto_id: producto.id,
    nombre: producto.nombre,
    precio: producto.precio,
    cantidad: 1
  })
}

onUnmounted(() => {
  clearInterval(heroInterval)
})
</script>
