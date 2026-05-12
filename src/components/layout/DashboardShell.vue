<template>
  <div class="min-h-screen bg-surface font-inter text-on-surface">
    <div class="flex min-h-screen">
      <aside class="hidden w-64 shrink-0 border-r border-outline-variant/60 bg-surface-container-lowest px-4 py-8 lg:block">
        <RouterLink to="/dashboard" class="mb-10 block font-sora text-lg font-bold tracking-tight text-primary">FERREMAS</RouterLink>
        <nav class="flex flex-col gap-1" aria-label="Panel lateral">
          <RouterLink
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="rounded-xl px-3 py-2.5 font-geist text-[11px] font-medium uppercase tracking-[0.12em] text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
            active-class="bg-primary text-on-primary shadow-ambient hover:bg-primary hover:text-on-primary"
          >
            {{ link.label }}
          </RouterLink>
        </nav>
      </aside>

      <div class="flex min-w-0 flex-1 flex-col">
        <header class="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-outline-variant/50 bg-surface/90 px-4 py-4 backdrop-blur-xl md:px-8">
          <div>
            <p class="font-geist text-[10px] font-medium uppercase tracking-[0.2em] text-on-surface-variant">Panel</p>
            <h1 class="font-sora text-xl font-semibold tracking-tight text-primary">{{ title }}</h1>
          </div>
          <div class="flex items-center gap-3">
            <span class="hidden rounded-full bg-surface-container-high px-3 py-1 font-geist text-[10px] uppercase tracking-wider text-on-surface-variant md:inline">{{ roleLabel }}</span>
            <RouterLink to="/catalogo" class="rounded-xl border border-outline-variant px-3 py-2 font-geist text-[10px] font-semibold uppercase tracking-wider text-on-surface transition hover:border-primary/40">
              Tienda
            </RouterLink>
          </div>
        </header>
        <main class="flex-1 px-4 py-8 md:px-8">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.js'

const props = defineProps({
  title: { type: String, required: true },
  links: { type: Array, default: () => [] },
})

const auth = useAuthStore()
const roleLabel = computed(() => auth.userRole || 'Invitado')
</script>
