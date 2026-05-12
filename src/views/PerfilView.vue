<template>
  <main class="page-wrapper bg-surface font-inter">
    <div class="mx-auto max-w-3xl px-margin-mobile py-12 md:px-margin-desktop md:py-16">
      <header class="mb-10">
        <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Cuenta</p>
        <h1 class="mt-2 font-sora text-3xl font-semibold tracking-tight text-primary">Perfil</h1>
      </header>

      <FmCard v-if="auth.user" title="Datos del usuario" eyebrow="Identidad">
        <dl class="grid gap-6 sm:grid-cols-2">
          <div>
            <dt class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Nombre</dt>
            <dd class="mt-1 font-inter text-lg text-on-surface">{{ auth.user.nombre }}</dd>
          </div>
          <div>
            <dt class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Correo</dt>
            <dd class="mt-1 font-inter text-lg text-on-surface">{{ auth.user.email }}</dd>
          </div>
          <div>
            <dt class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Rol</dt>
            <dd class="mt-1"><FmBadge tone="accent">{{ auth.userRole }}</FmBadge></dd>
          </div>
        </dl>
      </FmCard>

      <div class="mt-8 flex flex-wrap gap-3">
        <FmButton v-if="auth.userRole === 'Cliente'" to="/mis-pedidos" variant="secondary">Mis pedidos</FmButton>
        <FmButton to="/dashboard" variant="ghost">Panel</FmButton>
        <FmButton to="/catalogo" variant="ghost">Catálogo</FmButton>
      </div>
    </div>
  </main>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.js'
import FmCard from '@/components/ui/FmCard.vue'
import FmBadge from '@/components/ui/FmBadge.vue'
import FmButton from '@/components/ui/FmButton.vue'

const auth = useAuthStore()
</script>
