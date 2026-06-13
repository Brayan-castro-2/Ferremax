<template>
  <header
    class="fixed inset-x-0 top-0 z-[100] border-b border-outline-variant/40 bg-surface-container-lowest/85 backdrop-blur-xl transition-shadow duration-300"
    :class="{ 'shadow-ambient': isScrolled }"
  >
    <div class="mx-auto flex h-16 max-w-container-max items-center justify-between gap-4 px-margin-mobile md:h-[4.25rem] md:px-margin-desktop">
      <RouterLink
        to="/"
        class="group flex shrink-0 items-baseline gap-1 font-sora text-lg font-bold tracking-tight text-primary md:text-xl"
        id="nav-logo"
      >
        <span>FERRE</span>
        <span class="text-tertiary transition group-hover:text-primary">MAS</span>
      </RouterLink>

      <nav class="hidden items-center gap-1 md:flex" aria-label="Principal">
        <RouterLink
          v-for="link in desktopLinks"
          :key="link.to"
          :to="link.to"
          class="rounded-full px-4 py-2 font-geist text-[11px] font-medium uppercase tracking-[0.14em] text-on-surface-variant transition hover:bg-surface-container-low hover:text-primary"
          active-class="bg-surface-container-low text-primary ring-1 ring-outline-variant/60"
        >
          {{ link.label }}
        </RouterLink>
      </nav>

      <div class="flex items-center gap-2 md:gap-3">
        <RouterLink
          v-if="!auth.isAuthenticated || auth.userRole === 'Cliente'"
          to="/carrito"
          class="relative flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/60 text-on-surface transition hover:border-primary/30 hover:bg-surface-container-low"
          id="btn-carrito"
          title="Carrito"
        >
          <svg class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            <path d="M6 7h15l-1.5 9H7.5L6 7z" />
            <path d="M6 7 5 3H2" />
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
          </svg>
          <span
            v-if="carrito.totalItems > 0"
            class="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-tertiary px-1 font-geist text-[9px] font-bold text-on-tertiary"
          >
            {{ carrito.totalItems > 99 ? '99+' : carrito.totalItems }}
          </span>
        </RouterLink>

        <template v-if="auth.isAuthenticated">
          <RouterLink
            to="/cuenta"
            class="hidden h-10 items-center rounded-full border border-outline-variant/60 px-3 font-geist text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant transition hover:border-primary/30 hover:text-primary sm:flex"
          >
            Cuenta
          </RouterLink>
          <div class="relative">
            <button
              type="button"
              id="user-menu-btn"
              class="flex max-w-[200px] items-center gap-2 rounded-full border border-outline-variant/70 bg-surface-container-lowest py-1 pl-1 pr-3 transition hover:border-primary/25"
              aria-haspopup="true"
              :aria-expanded="menuOpen"
              @click="menuOpen = !menuOpen"
            >
              <span class="flex h-8 w-8 items-center justify-center rounded-full bg-primary font-geist text-xs font-bold text-on-primary">{{ initials }}</span>
              <span class="hidden min-w-0 truncate text-left font-inter text-sm font-medium text-on-surface lg:inline">{{ auth.user?.nombre }}</span>
            </button>
            <div
              v-if="menuOpen"
              id="user-dropdown"
              class="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-outline-variant/60 bg-surface-container-lowest py-1 shadow-lg"
              role="menu"
            >
              <p class="border-b border-outline-variant/40 px-4 py-2 font-geist text-[10px] uppercase tracking-wider text-on-surface-variant">
                {{ auth.userRole }}
              </p>
              <RouterLink to="/cuenta" class="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low" role="menuitem" @click="menuOpen = false">
                Perfil
              </RouterLink>
              <RouterLink
                v-if="auth.userRole === 'Cliente'"
                to="/mis-pedidos"
                class="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low"
                role="menuitem"
                @click="menuOpen = false"
              >
                Mis pedidos
              </RouterLink>
              <RouterLink to="/dashboard" class="block px-4 py-2.5 text-sm text-on-surface hover:bg-surface-container-low" role="menuitem" @click="menuOpen = false">
                Panel
              </RouterLink>
              <button type="button" class="w-full px-4 py-2.5 text-left text-sm text-error hover:bg-error-container/40" role="menuitem" @click="handleLogout">
                Cerrar sesión
              </button>
            </div>
          </div>
        </template>

        <template v-else>
          <RouterLink
            to="/login"
            class="hidden rounded-full border border-outline-variant px-4 py-2 font-geist text-[11px] font-semibold uppercase tracking-[0.12em] text-on-surface transition hover:border-primary/40 sm:inline-flex"
            id="btn-login-nav"
          >
            Entrar
          </RouterLink>
        </template>

        <button
          type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-full border border-outline-variant/60 md:hidden"
          :aria-expanded="mobileOpen"
          aria-controls="mobile-nav"
          aria-label="Abrir menú"
          @click="mobileOpen = !mobileOpen"
        >
          <span class="font-geist text-xs font-bold">{{ mobileOpen ? '✕' : '≡' }}</span>
        </button>
      </div>
    </div>

    <Transition name="fade">
      <div
        v-if="mobileOpen"
        id="mobile-nav"
        class="border-t border-outline-variant/50 bg-surface-container-lowest px-margin-mobile py-4 md:hidden"
      >
        <nav class="flex flex-col gap-1" aria-label="Móvil">
          <RouterLink
            v-for="link in mobileLinks"
            :key="link.to + link.label"
            :to="link.to"
            class="rounded-xl px-4 py-3 font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-surface hover:bg-surface-container-low"
            @click="mobileOpen = false"
          >
            {{ link.label }}
          </RouterLink>
          <template v-if="!auth.isAuthenticated">
            <RouterLink to="/login" class="mt-2 rounded-xl bg-primary py-3 text-center font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-on-primary" @click="mobileOpen = false">
              Entrar
            </RouterLink>
            <RouterLink to="/registro" class="rounded-xl py-3 text-center font-geist text-[11px] font-semibold uppercase tracking-[0.14em] text-tertiary" @click="mobileOpen = false">
              Crear cuenta
            </RouterLink>
          </template>
        </nav>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useCarritoStore } from '@/stores/carrito.js'

const auth = useAuthStore()
const carrito = useCarritoStore()
const router = useRouter()

const isScrolled = ref(false)
const menuOpen = ref(false)
const mobileOpen = ref(false)

const initials = computed(() => {
  if (!auth.user?.nombre) return '?'
  return auth.user.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

const desktopLinks = computed(() => {
  if (!auth.isAuthenticated) {
    return [
      { label: 'Catálogo', to: '/catalogo' },
      { label: 'Carrito', to: '/carrito' },
      { label: 'Registro', to: '/registro' },
      { label: 'Acceso', to: '/login' },
    ]
  }
  const role = auth.userRole
  const links = [{ label: 'Catálogo', to: '/catalogo' }]
  if (role === 'Cliente') {
    links.push({ label: 'Carrito', to: '/carrito' }, { label: 'Checkout', to: '/checkout' }, { label: 'Pedidos', to: '/mis-pedidos' })
  }
  links.push({ label: 'Panel', to: '/dashboard' })
  if (role === 'Administrador') links.push({ label: 'Admin', to: '/admin' })
  if (['Vendedor', 'Administrador'].includes(role)) links.push({ label: 'Ventas', to: '/vendedor' })
  if (['Bodeguero', 'Administrador'].includes(role)) links.push({ label: 'Bodega', to: '/bodeguero' })
  if (['Contador', 'Administrador'].includes(role)) links.push({ label: 'Finanzas', to: '/contador' })
  return links
})

const mobileLinks = computed(() => {
  const extra = [{ label: 'Recuperar acceso', to: '/recuperar' }]
  return [...desktopLinks.value, ...extra]
})

function onScroll() {
  isScrolled.value = window.scrollY > 8
}

onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

async function handleLogout() {
  menuOpen.value = false
  mobileOpen.value = false
  await auth.logout()
  router.push('/login')
}
</script>
