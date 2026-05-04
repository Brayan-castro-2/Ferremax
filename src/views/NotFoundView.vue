<template>
  <main class="page-wrapper">
    <div class="container not-found-page">
      <span>404</span>
      <h1>Página no encontrada</h1>
      <p class="text-muted">La ruta que buscas no existe en el sistema FERREMAS</p>
      <router-link to="/" class="btn btn-primary btn-lg" id="btn-volver-inicio">Volver al Inicio</router-link>
    </div>
  </main>
</template>
<style scoped>
.not-found-page {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  min-height: 70vh; text-align: center; gap: var(--space-4);
}
.not-found-page > span {
  font-size: 8rem; font-weight: 900; line-height: 1;
  background: linear-gradient(135deg, var(--color-primary), #EC4899);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.not-found-page h1 { font-size: var(--font-size-3xl); font-weight: 800; }
</style>
