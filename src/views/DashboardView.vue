<template>
  <main class="page-wrapper bg-surface font-inter">
    <div class="mx-auto max-w-container-max px-margin-mobile py-16 md:px-margin-desktop md:py-24">
      <header class="mb-12 max-w-2xl">
        <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-tertiary">Panel</p>
        <h1 class="mt-3 font-sora text-4xl font-semibold tracking-tight text-primary md:text-5xl">Hola, {{ auth.user?.nombre?.split(' ')[0] || 'equipo' }}.</h1>
        <p class="mt-4 text-lg text-on-surface-variant">Elige un espacio de trabajo. Los permisos siguen el rol de tu cuenta.</p>
      </header>

      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <RouterLink
          v-for="card in cards"
          :key="card.to"
          :to="card.to"
          class="group flex flex-col rounded-2xl border border-outline-variant/50 bg-surface-container-lowest p-6 shadow-ambient transition hover:-translate-y-0.5 hover:border-primary/20 hover:shadow-lg"
        >
          <span class="font-geist text-[10px] font-semibold uppercase tracking-[0.2em] text-on-surface-variant">{{ card.kicker }}</span>
          <h2 class="mt-3 font-sora text-xl font-semibold text-primary group-hover:text-tertiary">{{ card.title }}</h2>
          <p class="mt-2 flex-1 text-sm text-on-surface-variant">{{ card.desc }}</p>
          <span class="mt-6 font-geist text-[10px] font-semibold uppercase tracking-[0.2em] text-tertiary">Abrir →</span>
        </RouterLink>
      </div>
    </div>
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const auth = useAuthStore()

const cards = computed(() => {
  const r = auth.userRole
  const all = []
  all.push({ kicker: 'Tienda', title: 'Catálogo', desc: 'Experiencia de compra renovada.', to: '/catalogo' })
  if (r === 'Cliente') {
    all.push({ kicker: 'Cliente', title: 'Carrito', desc: 'Revisa líneas y totales.', to: '/carrito' })
    all.push({ kicker: 'Cliente', title: 'Mis pedidos', desc: 'Historial y estados.', to: '/mis-pedidos' })
  }
  if (r === 'Administrador') {
    all.push({ kicker: 'Admin', title: 'Administración', desc: 'Usuarios y KPIs.', to: '/admin' })
  }
  if (['Vendedor', 'Administrador'].includes(r)) {
    all.push({ kicker: 'Ventas', title: 'Vendedor', desc: 'Pedidos y estados.', to: '/vendedor' })
  }
  if (['Bodeguero', 'Administrador'].includes(r)) {
    all.push({ kicker: 'Operaciones', title: 'Bodega', desc: 'Movimientos y stock.', to: '/bodeguero' })
  }
  if (['Contador', 'Administrador'].includes(r)) {
    all.push({ kicker: 'Finanzas', title: 'Contador', desc: 'Auditoría y cierres.', to: '/contador' })
  }
  return all
})
</script>
