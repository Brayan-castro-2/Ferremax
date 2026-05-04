<template>
  <main class="page-wrapper">
    <div class="container">
      <h1 style="font-size: var(--font-size-3xl); font-weight: 800; margin-bottom: var(--space-8)">
        Panel <span class="text-primary">Principal</span>
      </h1>
      <p class="text-muted">Bienvenido, {{ auth.user?.nombre }}. Selecciona tu panel desde la barra de navegación.</p>
    </div>
  </main>
</template>
<script setup>
import { useAuthStore } from '@/stores/auth.js'
const auth = useAuthStore()
</script>
