<template>
  <main class="flex min-h-[80vh] flex-col items-center justify-center bg-surface px-margin-mobile py-24 font-inter text-center">
    <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.35em] text-tertiary">404</p>
    <h1 class="mt-4 max-w-lg font-sora text-4xl font-semibold tracking-tight text-primary md:text-5xl">Esta ruta no existe en el mapa.</h1>
    <p class="mt-4 max-w-md text-on-surface-variant">Revisa la URL o vuelve al catálogo — el resto del sistema sigue intacto.</p>
    <div class="mt-10 flex flex-wrap justify-center gap-3">
      <RouterLink to="/catalogo" class="rounded-full bg-primary px-8 py-3 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-primary shadow-ambient transition hover:-translate-y-0.5 hover:shadow-lg" id="btn-volver-inicio">
        Catálogo
      </RouterLink>
      <RouterLink to="/dashboard" class="rounded-full border border-outline-variant px-8 py-3 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface transition hover:border-primary/30">
        Panel
      </RouterLink>
    </div>
  </main>
</template>
