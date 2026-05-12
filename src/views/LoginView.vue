<template>
  <main class="relative min-h-screen overflow-hidden bg-surface font-inter text-on-surface">
    <div class="pointer-events-none absolute inset-0">
      <div class="absolute -left-1/4 top-0 h-[70vh] w-[70vw] rounded-full bg-gradient-to-br from-tertiary-fixed-dim/25 via-transparent to-transparent blur-3xl" />
      <div class="absolute -right-1/4 bottom-0 h-[60vh] w-[60vw] rounded-full bg-gradient-to-tl from-primary/5 via-transparent to-transparent blur-3xl" />
    </div>

    <div class="relative z-10 mx-auto grid min-h-screen max-w-[1200px] lg:grid-cols-2">
      <section class="hidden flex-col justify-between px-margin-desktop py-16 lg:flex lg:py-24">
        <div>
          <p class="font-geist text-[11px] font-semibold uppercase tracking-[0.28em] text-on-surface-variant">FERREMAS / 2026</p>
          <h1 class="mt-8 max-w-md font-sora text-4xl font-semibold leading-[1.08] tracking-tight text-primary xl:text-5xl">
            Comercio industrial con calma absoluta.
          </h1>
          <p class="mt-6 max-w-sm font-inter text-base leading-relaxed text-on-surface-variant">
            Herramientas, stock y pedidos en una sola plataforma — diseñada como una vitrina, no como un panel genérico.
          </p>
        </div>
        <ul class="space-y-3 font-geist text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
          <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-tertiary" /> Stock y precios en tiempo real</li>
          <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-tertiary" /> Roles: cliente, ventas, bodega, finanzas</li>
          <li class="flex items-center gap-2"><span class="h-1 w-1 rounded-full bg-tertiary" /> Supabase + API Express</li>
        </ul>
      </section>

      <section class="flex flex-col justify-center px-margin-mobile py-16 sm:px-10 lg:px-margin-desktop lg:py-24">
        <div class="mx-auto w-full max-w-md rounded-2xl border border-outline-variant/50 bg-surface-container-lowest/95 p-8 shadow-ambient backdrop-blur-md sm:p-10">
          <header class="mb-8">
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.22em] text-tertiary">Acceso seguro</p>
            <h2 class="mt-2 font-sora text-2xl font-semibold tracking-tight text-primary sm:text-3xl">Ingresa a tu cuenta</h2>
          </header>

          <div
            v-if="mockupHint"
            class="mb-6 rounded-xl border border-outline-variant/60 bg-surface-container-low p-4"
          >
            <p class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Demo rápida</p>
            <p class="mt-1 text-sm text-on-surface-variant">Contraseña mock: <strong class="text-primary">12345</strong></p>
            <div class="mt-3 flex flex-wrap gap-2" role="group" aria-label="Cuentas de prueba">
              <button
                v-for="u in mockupUsers"
                :key="u.email"
                type="button"
                class="rounded-full border border-outline-variant/70 bg-surface-container-lowest px-3 py-1.5 font-geist text-[10px] font-medium uppercase tracking-wider text-on-surface transition hover:border-primary/40 hover:shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                @click="fillUser(u)"
              >
                {{ u.emoji }} {{ u.rol }}
              </button>
            </div>
          </div>

          <p v-if="error" class="mb-5 rounded-xl border border-error/25 bg-error-container/80 px-4 py-3 text-sm text-on-error-container" role="alert">
            {{ error }}
          </p>

          <form class="space-y-6" @submit.prevent="handleLogin">
            <FmInput id="login-email" v-model="email" label="Correo" type="email" autocomplete="email" placeholder="tu@ferremas.cl" />
            <div>
              <div class="mb-2 flex items-end justify-between gap-2">
                <label for="login-password" class="font-geist text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Contraseña</label>
                <RouterLink to="/recuperar" class="font-geist text-[10px] uppercase tracking-wider text-tertiary underline-offset-4 hover:underline">
                  ¿Olvidaste?
                </RouterLink>
              </div>
              <input
                id="login-password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                required
                class="w-full rounded-xl border border-outline-variant/80 bg-surface-container-low px-4 py-3 font-inter text-sm text-on-surface shadow-inner transition placeholder:text-outline focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/10"
                placeholder="••••••••"
              />
              <button type="button" class="mt-2 font-geist text-[10px] uppercase tracking-wider text-on-surface-variant hover:text-primary" @click="showPassword = !showPassword">
                {{ showPassword ? 'Ocultar' : 'Mostrar' }} contraseña
              </button>
            </div>

            <FmButton type="submit" native-type="submit" variant="primary" size="lg" block :loading="loading" :disabled="!isValid">
              Entrar
            </FmButton>
          </form>

          <p class="mt-8 text-center font-inter text-sm text-on-surface-variant">
            ¿Sin cuenta?
            <RouterLink to="/registro" class="font-semibold text-primary underline-offset-4 hover:underline">Crear cuenta</RouterLink>
          </p>
        </div>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { isMockup } from '@/lib/supabase.js'
import FmInput from '@/components/ui/FmInput.vue'
import FmButton from '@/components/ui/FmButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const showPassword = ref(false)

const mockupHint = computed(() => isMockup)

const mockupUsers = [
  { email: 'admin@ferremas.cl', rol: 'Admin', emoji: '◆' },
  { email: 'vendedor@ferremas.cl', rol: 'Ventas', emoji: '◇' },
  { email: 'bodeguero@ferremas.cl', rol: 'Bodega', emoji: '▣' },
  { email: 'contador@ferremas.cl', rol: 'Finanzas', emoji: '◎' },
  { email: 'cliente@ferremas.cl', rol: 'Cliente', emoji: '○' },
]

const isValid = computed(() => email.value.includes('@') && password.value.length >= 4)

function fillUser(u) {
  email.value = u.email
  password.value = '12345'
}

async function loginApiJwt() {
  const base = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
  const endpoint = `${base || ''}/api/auth/login`
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.value.trim(), password: password.value }),
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new Error(body.error || 'API /api/auth/login no disponible')
  }
  const data = await response.json()
  if (data.token) {
    localStorage.setItem('ferremas_api_token', data.token)
  }
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    try {
      await loginApiJwt()
    } catch {
      /* JWT opcional: la sesión principal sigue siendo Supabase / mockup */
    }
    await auth.login(email.value, password.value)
    const redirect = route.query.redirect || getDashboardRoute(auth.userRole)
    router.push(redirect)
  } catch (e) {
    error.value = e.message || 'No se pudo iniciar sesión'
  } finally {
    loading.value = false
  }
}

function getDashboardRoute(rol) {
  const map = {
    Administrador: '/admin',
    Vendedor: '/vendedor',
    Bodeguero: '/bodeguero',
    Contador: '/contador',
    Cliente: '/catalogo',
  }
  return map[rol] || '/catalogo'
}
</script>
