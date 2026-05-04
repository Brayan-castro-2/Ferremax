<template>
  <div class="login-page">
    <!-- Fondo decorativo -->
    <div class="login-bg">
      <div class="bg-orb orb-1"></div>
      <div class="bg-orb orb-2"></div>
    </div>

    <div class="login-card" id="login-form-card">
      <!-- Logo -->
      <div class="login-logo">
        <span>⚙️</span>
        <h1>FERRE<span class="text-primary">MAS</span></h1>
      </div>
      <p class="login-subtitle">Sistema de Gestión E-Commerce</p>

      <!-- Alert de error -->
      <div v-if="error" class="alert alert-danger" id="login-error-msg">
        {{ error }}
      </div>

      <!-- Mockup hint -->
      <div class="mockup-hint">
        <strong>Modo Mockup</strong> — usa contraseña <code>12345</code>
        <div class="mockup-users">
          <button v-for="u in mockupUsers" :key="u.email" class="user-chip" @click="fillUser(u)" :id="`chip-${u.rol.toLowerCase()}`">
            {{ u.emoji }} {{ u.rol }}
          </button>
        </div>
      </div>

      <!-- Formulario -->
      <form @submit.prevent="handleLogin" id="login-form">
        <div class="form-group">
          <label class="form-label" for="input-email">Correo Electrónico</label>
          <input
            id="input-email"
            v-model="email"
            type="email"
            class="form-input"
            placeholder="usuario@ferremas.cl"
            required
            autocomplete="email"
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="input-password">Contraseña</label>
          <input
            id="input-password"
            v-model="password"
            type="password"
            class="form-input"
            placeholder="••••••••"
            required
            autocomplete="current-password"
          />
        </div>

        <button
          type="submit"
          class="btn btn-primary btn-full btn-lg"
          id="btn-login-submit"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner" style="width:1rem;height:1rem;border-width:2px"></span>
          <span v-else>Ingresar al Sistema</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const auth   = useAuthStore()
const router = useRouter()
const route  = useRoute()

const email    = ref('')
const password = ref('')
const loading  = ref(false)
const error    = ref('')

const mockupUsers = [
  { email: 'admin@ferremas.cl',     rol: 'Admin',      emoji: '👑' },
  { email: 'vendedor@ferremas.cl',  rol: 'Vendedor',   emoji: '💼' },
  { email: 'bodeguero@ferremas.cl', rol: 'Bodeguero',  emoji: '📦' },
  { email: 'contador@ferremas.cl',  rol: 'Contador',   emoji: '💰' },
  { email: 'cliente@ferremas.cl',   rol: 'Cliente',    emoji: '🛒' },
]

function fillUser(u) {
  email.value    = u.email
  password.value = '12345'
}

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect || getDashboardRoute(auth.userRole)
    router.push(redirect)
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
}

function getDashboardRoute(rol) {
  const map = {
    Administrador: '/admin',
    Vendedor:      '/vendedor',
    Bodeguero:     '/bodeguero',
    Contador:      '/contador',
    Cliente:       '/catalogo',
  }
  return map[rol] || '/catalogo'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

.login-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; }
.bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.12;
}
.orb-1 {
  width: 600px; height: 600px;
  background: conic-gradient(from 180deg, #0D9488, #0891B2, #1D4ED8);
  top: -150px; left: -150px;
  animation: float 8s ease-in-out infinite;
}
.orb-2 {
  width: 400px; height: 400px;
  background: conic-gradient(from 0deg, #14B8A6, #0EA5E9, #6366F1);
  bottom: -100px; right: -100px;
  animation: float 10s ease-in-out infinite reverse;
}
@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 20px); }
}

.login-card {
  position: relative;
  z-index: 1;
  background: rgba(13, 26, 38, 0.85);
  border: 1px solid rgba(45,212,191,0.12);
  border-radius: var(--radius-xl);
  padding: var(--space-10) var(--space-8);
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  box-shadow: var(--shadow-lg), 0 0 40px rgba(20,184,166,0.06);
  backdrop-filter: blur(24px);
}

.login-logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -1px;
}
.login-logo span:first-child { font-size: 2.5rem; }

.login-subtitle {
  margin-top: calc(-1 * var(--space-4));
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.mockup-hint {
  background: rgba(45,212,191,0.06);
  border: 1px solid rgba(45,212,191,0.18);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
.mockup-hint code {
  background: rgba(45,212,191,0.15);
  color: var(--color-primary);
  padding: 0 6px;
  border-radius: 4px;
  font-size: 0.85em;
}
.mockup-users {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-top: var(--space-3);
}
.user-chip {
  padding: 4px 10px;
  border-radius: var(--radius-full);
  background: var(--color-surface-2);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text);
  cursor: pointer;
  transition: all var(--transition-fast);
}
.user-chip:hover {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: #fff;
}

form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
</style>
