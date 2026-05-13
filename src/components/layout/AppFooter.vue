<template>
  <footer class="bg-surface-container-low border-t border-outline-variant">
    <div class="py-section-gap px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between gap-12">
      
      <!-- Columna izquierda -->
      <div class="flex flex-col">
        <h2 class="font-sora text-headline-xl font-bold mb-4">
          <span class="text-primary">FERRE</span><span class="text-tertiary">MAS</span>
        </h2>
        <p class="font-geist font-label-sm tracking-widest text-on-surface-variant opacity-60 uppercase">
          © 2026 FERREMAS. CONSTRUYENDO CHILE.
        </p>
      </div>

      <!-- Columnas derechas -->
      <div class="flex flex-col md:flex-row gap-8 md:gap-16">
        <!-- NAVEGACIÓN -->
        <div class="flex flex-col gap-4">
          <h3 class="font-geist font-bold text-sm text-on-surface uppercase tracking-widest mb-2">Navegación</h3>
          <RouterLink to="/catalogo" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Catálogo
          </RouterLink>
          <RouterLink to="/cuenta" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Mi Cuenta
          </RouterLink>
          <RouterLink to="/mis-pedidos" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Mis Pedidos
          </RouterLink>
        </div>

        <!-- LEGAL -->
        <div class="flex flex-col gap-4">
          <h3 class="font-geist font-bold text-sm text-on-surface uppercase tracking-widest mb-2">Legal</h3>
          <a href="#" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Política de privacidad
          </a>
          <a href="#" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Términos de servicio
          </a>
          <a href="#" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Despacho y devoluciones
          </a>
        </div>

        <!-- SOPORTE -->
        <div class="flex flex-col gap-4">
          <h3 class="font-geist font-bold text-sm text-on-surface uppercase tracking-widest mb-2">Soporte</h3>
          <a href="#" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Contacto
          </a>
          <a href="#" class="font-geist font-label-sm text-label-sm tracking-widest text-on-surface-variant opacity-60 hover:opacity-100 hover:text-primary transition-all uppercase">
            Preguntas frecuentes
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>
